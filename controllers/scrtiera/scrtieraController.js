const scrtieraValidation=require('../../validation/validationMethods');
const checkDate=require('../../middlware/checkDate');
const models=require('../../models');
const deleteImage=require('../../middlware/image').deleteImage;
const {Op}=require('sequelize');

const login=async(req,res,next)=>{
    try{
        await scrtieraValidation.login({userName:req.body.userName,password:req.body.password});
        const userName=req.body.userName;
        const password=req.body.password;
        let scrtiraPromise=await models.scrtiera.findOne({
            where:{userName:userName,password:password},
            attributes:{exclude:['password','createdAt','updatedAt']}
        });
        if(!scrtiraPromise){
            const err=new Error('invalid username or password');
            err.statusCode=401;
            throw err;
        }
        let doctorPromise=await scrtiraPromise.getDoctor({
            attributes:{exclude:['password','createdAt','updatedAt']},
            include:[models.time]
        });
        const token=require('../../middlware/token').scrtira(scrtiraPromise.id,doctorPromise.id);
        let times=doctorPromise.times.map(i=>{
              return {from:i.from,to:i.to};
           });
        let doctor={
                   "fName":doctorPromise.fName,
                   "lName":doctorPromise.lName,
                   "mobileNumber":doctorPromise.mobileNumber,
                   "landNumber":doctorPromise.landNumber,
                   "clinicAddress":doctorPromise.clinicAddress,
                   "workTime":times
           };
        let scrtira={
                    "fName":scrtiraPromise.fName, 
                    "lName":scrtiraPromise.lName, 
                    "userName":scrtiraPromise.userName,
                    "birthDate":scrtiraPromise.birthDate,
                    "mobileNumber":scrtiraPromise.mobileNumber,
                    "landNumber":scrtiraPromise.landNumber,
                    "image":scrtiraPromise.image
        };
        res.status(200).json({
            token:token,
            doctor:doctor,
            scrtiera:scrtira
        });
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const bookedMeeting=async(req,res,next)=>{
          try{
            const doctorId=req.doctorId;
            let patients=await models.patient.findAll({where:{doctorId:doctorId},
                attributes:[
                    'fName','lName','mobileNumber','landNumber'
                ],include:{
                    model:models.meeting,
                    attributes:{exclude:['isBooked','createdAt','updatedAt']},
                    include: {
                        model:models.treatment,as:'followUpTreatment',
                        attributes:{exclude:[ 'createdAt','updatedAt']}
                    }
                  }
            });
            ///////////////// Take all meeting biger than now (active meeting)/////////////////
            let newMeeting=[];let newMeetingIndex=0;
            let allAvailabelPatients=[];let allAvailabelPatientsIndex=0;
            let checkDateHelp=false;
            let checkNewPatient=false;
            for(i=0;i<patients.length;i++){
                    for(j=0;j<patients[i].meetings.length;j++){
                            for(y=0;y<patients[i].meetings[j].followUpTreatment.length;y++)
                                    if(checkDate.availabelDate(patients[i].meetings[j].followUpTreatment[y].nextMeetingDate)){
                                       checkDateHelp=true;
                                       break;  
                                    }
                            if(checkDateHelp){   
                                newMeeting[newMeetingIndex]=patients[i].meetings[j];
                                newMeetingIndex++;
                                checkNewPatient=true;
                                checkDateHelp=false;
                            }
                    }
                    if(checkNewPatient){
                        allAvailabelPatients[allAvailabelPatientsIndex]={};
                        allAvailabelPatients[allAvailabelPatientsIndex].fName=patients[i].fName;
                        allAvailabelPatients[allAvailabelPatientsIndex].lName=patients[i].lName;
                        allAvailabelPatients[allAvailabelPatientsIndex].mobileNumber=patients[i].mobileNumber;
                        allAvailabelPatients[allAvailabelPatientsIndex].landNumber=patients[i].landNumber;
                        allAvailabelPatients[allAvailabelPatientsIndex].meetings=newMeeting;
                        checkNewPatient=false;
                        newMeeting=[];
                        newMeetingIndex=0;
                        allAvailabelPatientsIndex++;
                    }
            } 
            if(allAvailabelPatients.length==0){
                const err=new Error('no meeting availabel');
                err.statusCode=404;
                throw err;
            }
            /////////////////////////////////////       
            res.status(200).json({patients:allAvailabelPatients});
          }catch(err){
            if(!err.statusCode)
                err.statusCode=500;
            next(err);
          }
};

const bookedMeetingThisDay=async(req,res,next)=>{
    try{
        const doctorId=req.doctorId;
        let patients=await models.patient.findAll({where:{doctorId:doctorId},
            attributes:[
                'fName','lName','mobileNumber','landNumber'
            ],include:{
                model:models.meeting,
                attributes:{exclude:['isBooked','createdAt','updatedAt']},
                include: {
                    model:models.treatment,as:'followUpTreatment',
                    attributes:{exclude:[ 'createdAt','updatedAt']}
                }
              }
        });
        ///////////////// Take all today meeting /////////////////
        let newMeeting=[];let newMeetingIndex=0;
        let allAvailabelPatients=[];let allAvailabelPatientsIndex=0;
        let checkDateHelp=false;
        let checkNewPatient=false;
        for(i=0;i<patients.length;i++){
                for(j=0;j<patients[i].meetings.length;j++){
                        for(y=0;y<patients[i].meetings[j].followUpTreatment.length;y++)
                                if(checkDate.checkToday(patients[i].meetings[j].followUpTreatment[y].nextMeetingDate)){
                                   checkDateHelp=true;
                                   break;  
                                }
                        if(checkDateHelp){   
                            newMeeting[newMeetingIndex]=patients[i].meetings[j];
                            newMeetingIndex++;
                            checkNewPatient=true;
                            checkDateHelp=false;
                        }
                }
                if(checkNewPatient){
                    allAvailabelPatients[allAvailabelPatientsIndex]={};
                    allAvailabelPatients[allAvailabelPatientsIndex].fName=patients[i].fName;
                    allAvailabelPatients[allAvailabelPatientsIndex].lName=patients[i].lName;
                    allAvailabelPatients[allAvailabelPatientsIndex].mobileNumber=patients[i].mobileNumber;
                    allAvailabelPatients[allAvailabelPatientsIndex].landNumber=patients[i].landNumber;
                    allAvailabelPatients[allAvailabelPatientsIndex].meetings=newMeeting;
                    checkNewPatient=false;
                    newMeeting=[];
                    newMeetingIndex=0;
                    allAvailabelPatientsIndex++;
                }
        }
        if(allAvailabelPatients.length==0){
            const err=new Error('no meeting availabel');
            err.statusCode=404;
            throw err;
        }   
        /////////////////////////////////////       
        res.status(200).json({patients:allAvailabelPatients});
      }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
      }
};

const oldBookedMeeting=async(req,res,next)=>{
    try{
        const doctorId=req.doctorId;
        let patients=await models.patient.findAll({where:{doctorId:doctorId},
            attributes:[
                'fName','lName','mobileNumber','landNumber'
            ],include:{
                model:models.meeting,
                attributes:{exclude:['isBooked','createdAt','updatedAt']},
                include: {
                    model:models.treatment,as:'followUpTreatment',
                    attributes:{exclude:[ 'createdAt','updatedAt']}
                }
              }
        });
        ///////////////// Take all meeting biger than now (active meeting)/////////////////
        let newMeeting=[];let newMeetingIndex=0;
        let allAvailabelPatients=[];let allAvailabelPatientsIndex=0;
        let checkDateHelp=false;
        let checkNewPatient=false;
        for(i=0;i<patients.length;i++){
                for(j=0;j<patients[i].meetings.length;j++){
                        for(y=0;y<patients[i].meetings[j].followUpTreatment.length;y++)
                                if(!checkDate.oldDate(patients[i].meetings[j].followUpTreatment[y].nextMeetingDate)){
                                   checkDateHelp=true;
                                   break;  
                                }
                        if(!checkDateHelp){   
                            newMeeting[newMeetingIndex]=patients[i].meetings[j];
                            newMeetingIndex++;
                            checkNewPatient=true;
                        }
                        checkDateHelp=false;
                }
                if(checkNewPatient){
                    allAvailabelPatients[allAvailabelPatientsIndex]={};
                    allAvailabelPatients[allAvailabelPatientsIndex].fName=patients[i].fName;
                    allAvailabelPatients[allAvailabelPatientsIndex].lName=patients[i].lName;
                    allAvailabelPatients[allAvailabelPatientsIndex].mobileNumber=patients[i].mobileNumber;
                    allAvailabelPatients[allAvailabelPatientsIndex].landNumber=patients[i].landNumber;
                    allAvailabelPatients[allAvailabelPatientsIndex].meetings=newMeeting;
                    checkNewPatient=false;
                    newMeeting=[];
                    newMeetingIndex=0;
                    allAvailabelPatientsIndex++;
                }
        } 
        if(allAvailabelPatients.length==0){
            const err=new Error('no meeting availabel');
            err.statusCode=404;
            throw err;
        }
        /////////////////////////////////////       
        res.status(200).json({patients:allAvailabelPatients});
      }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
      }
};

const deletePatientMeeting=async(req,res,next)=>{
    const meetingId =req.params.meetingId;
    const patientId =req.params.patientId; 
    try{
        await scrtieraValidation.checkId(meetingId);
        await scrtieraValidation.checkId(patientId);
        let patientMeeting=await models.patient.findOne({where:{id:patientId},
            include:{
                model:models.meeting,
                where:{id:meetingId},
                include:{
                    model:models.treatment,as:'followUpTreatment',
                    where:{nextMeetingDate:{
                        [Op.gte]:new Date()
                    }}
                }
            }
        }); 
        if(patientMeeting){
            const err=new Error('delete faild');
            err.statusCode=422;
            throw err;
        }
        patientMeeting=await models.patient.findOne({where:{id:patientId},
            include:{
                model:models.meeting,
                where:{id:meetingId}
            }
        }); 
        await patientMeeting.meetings[0].destroy();
        res.status(200).json({message:'delete success'});
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const availabelMeeting=async(req,res,next)=>{
    try{
        let allMeeting=await models.meeting.findAll({
            where:{isBooked:false},
            include:{model:models.treatment,as:'followUpTreatment'}
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
     //// check if have a meeting active
     let allPatientHaveMeeting=await models.patient.findAll({
        attributes:['id','fName','lName','mobileNumber','landNumber'],
        include:{
            model:models.meeting,
            attributes:['id'],
            include:{
                 model:models.treatment,as:'followUpTreatment',
                 attributes:['id'],
                 where:{nextMeetingDate:{
                     [Op.gt]:new Date()
                     }
                 }
              }
            }
         });
         let patientIds=[];
         for(i=0;i<allPatientHaveMeeting.length;i++)
            if(allPatientHaveMeeting[i].meetings.length==0)
                patientIds.push({
                    id:allPatientHaveMeeting[i].id,
                    fName:allPatientHaveMeeting[i].fName,
                    lName:allPatientHaveMeeting[i].lName,
                    mobileNumber:allPatientHaveMeeting[i].mobileNumber,
                    landNumber:allPatientHaveMeeting[i].landNumber
                });
       res.status(200).json({
           meeting:allMeetings,
           allPatients:patientIds
       });
   }catch(err){
    if(!err.statusCode)
         err.statusCode=500;
    next(err);
   }
};

const deleteMeeting=async(req,res,next)=>{
    try{
        const meetingId=req.params.meetingId;
        await scrtieraValidation.checkId(meetingId);
        let deleted=await models.meeting.destroy({where:{id:meetingId,isBooked:false}});
        if(deleted)
            res.status(200).json({message:"delete success"});
        else
            res.status(200).json({message:"delete fail"});
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const bookInMeeting=async(req,res,next)=>{
    try{
        const meetingId=req.body.meetingId;
        const id=req.body.id;
        await scrtieraValidation.checkId(meetingId);
        await scrtieraValidation.checkId(id);
        let patient=await models.patient.findOne({where:{id:id}});
        if(!patient){
            const err=new Error('booking fail');
            err.statusCode=422;
            throw err;
        }
        let meeting=await models.meeting.findOne({where:{id:meetingId,isBooked:false}});
        if(!meeting){
            const err=new Error('booking fail');
            err.statusCode=422;
            throw err;
        }
        await meeting.update({isBooked:true});
        await patient.addMeetings([meeting]);
        res.status(200).json({message:"booking success"});
    }catch(err){
        if(!err.statusCode)
             err.statusCode=500;
        next(err);
    }
};

const bookNewPatientInMeeting=async(req,res,next)=>{
    try{
        const doctorId=req.doctorId;
        const scrtiraId=req.scrtiraId; 
        const meetingId=req.body.meetingId;
        let newPatient={};
        newPatient=req.body;
        delete newPatient.meetingId;
        await scrtieraValidation.checkId(meetingId);
        await scrtieraValidation.checkPatient(newPatient);
        let isBefore=await models.patient.findOne({where:{
            [Op.or]:{
            userName:newPatient.userName,
            mobileNumber:newPatient.mobileNumber,
            landNumber:newPatient.landNumber
            }
        }});
        if(isBefore){
            const err=new Error('mobile or land number or user name is using by another patient');
            err.statusCode=422;
            throw err;
        }
        let meeting=await models.meeting.findOne({where:{id:meetingId,isBooked:false}});
        if(!meeting){
            const err=new Error('booking fail');
            err.statusCode=422;
            throw err;
        }
        await meeting.update({isBooked:true});
        let patient=await models.patient.create(
            {...newPatient,doctorId:doctorId,scrtieraId:scrtiraId}
            );
        await patient.addMeetings([meeting]);
        res.status(201).json({message:'ptient added success and booking has been success'});
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const addNewMeeting=async(req,res,next)=>{
    try{
        const newMeetings=req.body.newMeeting;
        if(newMeetings.length==0){
            const err=new Error('there are no meetings to add');
            err.statusCode=404;
            throw err;
        }
        let meetingToAdd='';
        for(let i=0;i<newMeetings.length;i++){
            await scrtieraValidation.checkDate({date:newMeetings[i].date});
            meetingToAdd=await models.meeting.create();
            await meetingToAdd.createFollowUpTreatment({nextMeetingDate:newMeetings[i].date});
        }
        res.status(201).json({message:"all new meeting added succescc"});
    }catch(err){
        if(!err.statusCode)
           err.statusCode=500;
        next(err);
    }
};

const allPatients=async(req,res,next)=>{
    try{
         const doctorId=req.doctorId;
         const allPatients=await models.patient.findAll({
            where:{doctorId:doctorId},
            attributes:{
                exclude:['createdAt','updatedAt','doctorId','scrtieraId']
            }
        });
        res.status(200).json({allPatients});
    }catch(err){
        if(!err.statusCode)
          err.statusCode=500;
        next(err);
    }
};

const updatePatient=async(req,res,next)=>{
    try{
        let updatedPatient={};
        updatedPatient=req.body;
        let patientId=updatedPatient.id;
        delete updatedPatient.id;
        await scrtieraValidation.checkId(patientId);
        await scrtieraValidation.checkPatient(updatedPatient);
        await models.patient.update(updatedPatient,{where:{id:patientId}});
        res.status(200).json({message:"update success"});
    }catch(err){
        if(!err.statusCode)
           err.statusCode=500;
        next(err);
    }
};

const patientMeeting=async(req,res,next)=>{
   try{
      let patientId=req.params.patientId;
      await scrtieraValidation.checkId(patientId);
      let patientPromsis=await models.patient.findOne({where:{id:patientId}});
      let meetings=await patientPromsis.getMeetings({
        attributes:{exclude:['isBooked','createdAt','updatedAt']},
        include:{
            model:models.treatment,as:"followUpTreatment",
            attributes:{exclude:['createdAt','updatedAt',]}
        }
      });
      if(meetings.length==0){
        const err=new Error('no meetings found');
        err.statusCode=404;
        throw err;
      }
      res.status(200).json({meetings});
   }catch(err){
    if(!err.statusCode)
        err.statusCode=500;
    next(err);
   }
};

const deleteMeetingForPatient=async(req,res,next)=>{
    try{
        const meetingId=req.params.meetingId;
        const patientId=req.params.patientId;
        await scrtieraValidation.checkId(meetingId);
        await scrtieraValidation.checkId(patientId);
        let deletedMeeting=await models.patient.findOne({
            where:{id:patientId},
            include:{
                model:models.meeting,where:{id:meetingId}
            }
        });
        if(!deletedMeeting){
            const err=new Error('delete fail');
            err.statusCode=422;
            throw err;
        }
        if(!await deletedMeeting.meetings[0].destroy()){
            const err=new Error('delete fail');
            err.statusCode=422;
            throw err;
        }
        res.status(200).json({message:"delete success"});
    }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
    }
};

const myProfileUpdateImg=async(req,res,next)=>{
     deleteNewImageIfAnyErrorFound=req.file;
     try{
        const scrtiraId=req.scrtiraId;
        // for image
        let imageFile=req.file;
        if(!imageFile){
            const err=new Error('image invalid');
            err.statusCode=422;
            throw err;
        }
        //
        let updateScrtiera=await models.scrtiera.findOne({
            where:{id:scrtiraId},
            attributes:['id','image']
        });
        let oldImage=updateScrtiera.image;
        if(!await updateScrtiera.update({image:imageFile.path})){
            const err=new Error('update fail');
            err.status=422;
            throw err;
        }
        if(oldImage.toUpperCase()!="NO IMAGE"){
            deleteImage(oldImage);
        }
        res.status(200).json({message:"update successs"});
     }catch(err){
        if(deleteNewImageIfAnyErrorFound!=undefined)
            deleteImage(deleteNewImageIfAnyErrorFound.path);
        if(!err.statusCode)
           err.statusCode=500;
        next(err);
     }
};

const myProfileUpdateProfile=async(req,res,next)=>{
    deleteNewImageIfAnyErrorFound=req.file;
    try{
        const scrtiraId=req.scrtiraId;
        let updateScrtiera=req.body;
        // for image
        let imageFile=req.file;
         if(!imageFile &&updateScrtiera.image==undefined){
            const err=new Error('image invalid');
            err.statusCode=422;
            throw err;
        }
        let updateScrtieraWithSameImageOrNot={};let helpToDeleteOldImage=false;
        updateScrtieraWithSameImageOrNot={...updateScrtiera};
        updateScrtieraWithSameImageOrNot.image="IMAGE";// for validation
        if(updateScrtiera.image!=undefined){
            delete updateScrtiera.image;
        }else{
            updateScrtiera.image=imageFile.path;
            helpToDeleteOldImage=true;
        }
        //
        await scrtieraValidation.checkScrtiera(updateScrtieraWithSameImageOrNot);
        let scrtiera=await models.scrtiera.findOne({where:{id:scrtiraId}});
        let oldImage=scrtiera.image;
        if(!await scrtiera.update(updateScrtiera)){
            const err=new Error('update faild');
            err.statusCode=422;
            throw err;
        }
        // image continue
        if(helpToDeleteOldImage ){
            if(oldImage.toUpperCase()!="NO IMAGE")
                  deleteImage(oldImage);
        }//////
        res.status(200).json({message:"update success"});
    }catch(err){
        if(deleteNewImageIfAnyErrorFound!=undefined)
            deleteImage(deleteNewImageIfAnyErrorFound.path);
        if(!err.statusCode)
             err.statusCode=500;
        next(err);
    }
};

const delayMeeting=async(req,res,next)=>{
  try{
    const treatmentId    =req.body.treatmentId;
    const nextMeetingDate=req.body.nextMeetingDate;
    await scrtieraValidation.checkDate({nextMeetingDate});
    await scrtieraValidation.checkId(treatmentId);
    let updateTreatment=await models.treatment.findOne({where:{id:treatmentId}});
    if(!updateTreatment){
        const err=new Error('this treatment not found');
        err.statusCode=404;
        throw err;
    }
    if(!await updateTreatment.update({nextMeetingDate:nextMeetingDate})){
           const err=new Error('delay meeting fail');
           err.statusCode=422;
           throw err;
        }
        res.status(200).json({message:"delay meeting success"});
  }catch(err){
    if(!err.statusCode)
       err.statusCode=500;
    next(err);
  }
};

module.exports={
    delayMeeting,
    myProfileUpdateProfile,
    myProfileUpdateImg,
    deleteMeetingForPatient,
    patientMeeting,
    updatePatient,
    allPatients,
    addNewMeeting,
    login,
    bookedMeeting,
    bookedMeetingThisDay,
    oldBookedMeeting,
    deletePatientMeeting,
    availabelMeeting,
    deleteMeeting,
    bookInMeeting,
    bookNewPatientInMeeting
};