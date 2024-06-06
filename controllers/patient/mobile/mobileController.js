const webValidation=require('../../../validation/validationMethods');
const checkDate=require('../../../middlware/checkDate');
const db=require('../../../models');
const {Op}=require('sequelize');

const login=async(req,res,next)=>{
    try{
       await webValidation.login(req.body);
       const userName=req.body.userName;
       const password=req.body.password;
       let patient=await db.patient.findOne({
        where:{userName:userName,password:password},
        attributes:{exclude:[
            'createdAt','updatedAt','scrtieraId'
        ]}});
       if(!patient){
        const err=new Error('invalid username or password');
        err.statusCode=401;
        throw err;
       }
       let token=require('../../../middlware/token').patientWeb(patient.id);
       let doctor=await patient.getDoctor({
          attributes:{exclude:[
         'id','userName','password','birthDate','image','createdAt','updatedAt'
        ]},include:[db.time]
        });
        let times=doctor.times.map(i=>{
           return {from:i.from,to:i.to};
        });
        doctor={
                "fName":doctor.fName,
                "lName":doctor.lName,
                "mobileNumber":doctor.mobileNumber,
                "landNumber":doctor.landNumber,
                "clinicAddress":doctor.clinicAddress,
                "workTime":times
        };
        let allMeetings=await patient.getMeetings({include:{model:db.treatment,as:'followUpTreatment'}});
        allMeetings=allMeetings.map(i=>{
            return{
                "id":i.id,
                "totalPrice":i.totalPrice,
                "remainingPrice":i.remainingPrice,
                "image":i.image,
                "notics":i.notics,
                "followUpTreatment":i.followUpTreatment.map(j=>{
                    return{
                       "id":j.id,
                       "nextMeetingDate":j.nextMeetingDate,
                       "diagnosis":j.diagnosis,
                       "pricePaid":j.pricePaid,
                       "meetingId":j.meetingId
                };})
            };
        });
        let oldMeeting=[];oldIndex=0;
        let newMeeting=[];newIndex=0;
        let isnew=false;
        allMeetings.forEach(i=>{
            i.followUpTreatment.forEach(j=>{
                if(checkDate.availabelDate(j.nextMeetingDate))
                      isnew=true;  
            });
            if(isnew){
                newMeeting[newIndex]=i;
                newIndex++;
            } else{
                oldMeeting[oldIndex]=i;
                oldIndex++;
            }
            isnew=false;
        });
        res.status(200).json({
            token:token,
            patient:patient,
            doctor:doctor,
            oldMeeting:oldMeeting,
            newMeeting:newMeeting
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    }
};

const removePatientMeeting=async(req,res,next)=>{
    const patientId=req.patientId;
    const meetingId=req.params.meetingID;
    try{
        await webValidation.checkId(meetingId);
        let checkValidRemove=await db.meeting.findOne({
            where:{id:meetingId},
            include:{model:db.treatment,as:'followUpTreatment'}
        });
        if(checkValidRemove && checkValidRemove.followUpTreatment.length>1){
            const err=new Error('can`t remove this meeting');
            err.statusCode=401;
            throw err;
        }
        const patinet=await db.patient.findOne({where:{id:patientId}});
        let isForThisPatient=await patinet.getMeetings({where:{id:meetingId}});
        if(isForThisPatient.length==0){
            const err=new Error('no meetings found');
            err.statusCode=401;
            throw err;
        }
        await patinet.removeMeeting(isForThisPatient[0]);
        await db.meeting.update({isBooked:false},{where:{id:meetingId}});
        res.status(200).json({message:"remove success"});
    }catch(err){
        if(!err.statusCode)
               err.statusCode=500;
        next(err);
    }
};

const bookInMeeting=async(req,res,next)=>{
    const patientId=req.patientId;
    const meetingId=req.body.meetingID;
    try{
        //// check if have a meeting active
        let patient=await db.patient.findOne({where:{id:patientId}});
        let isAvailabelMeetingFound=await patient.getMeetings({
                include:{
                    model:db.treatment,as:'followUpTreatment',
                    where:{nextMeetingDate:{
                        [Op.gt]:new Date()
                        }
                    }
                }
            });
        if(isAvailabelMeetingFound.length>0){
            const err=new Error('you have a meeting');
            err.statusCode=401;
            throw err;
        }
        ////
        await webValidation.checkId(meetingId);
        let meeting=await db.meeting.findOne({where:{id:meetingId,isBooked:false}});
        if(!meeting){
            const err=new Error('some one booked in this meeting');
            err.statusCode=401;
            throw err;
        }
        await meeting.update({isBooked:true});
        await patient.addMeetings([meeting]);
        res.status(200).json({message:"booked success"});
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const availabelMeeting=async(req,res,next)=>{
           try{
                let allMeeting=await db.meeting.findAll({
                    where:{isBooked:false},
                    include:{model:db.treatment,as:'followUpTreatment'}
                });
                let allMeetings=[];let allMeetingsIndex=0;
                //take meetingID and nextMeetingDate keys and check date if after now not before
                allMeeting.forEach(i=>{
                    if(checkDate.availabelDate(i.followUpTreatment[0].nextMeetingDate)){
                    allMeetings[allMeetingsIndex]=
                    {
                        meetingID:i.followUpTreatment[0].meetingId,
                        nextMeetingDate:i.followUpTreatment[0].nextMeetingDate
                    }
                    allMeetingsIndex++;
                }
               });
               res.status(200).json({
                   meeting:allMeetings
               });
           }catch(err){
            if(!err.statusCode)
                 err.statusCode=500;
            next(err);
           }
};

module.exports={
    login,
    removePatientMeeting,
    bookInMeeting,
    availabelMeeting
};