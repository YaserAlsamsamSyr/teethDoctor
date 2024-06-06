const doctorValidation=require('../../validation/validationMethods');
const checkDate=require('../../middlware/checkDate');
const models=require('../../models');
const deleteImage=require('../../middlware/image').deleteImage;
const {Op}=require('sequelize');

const login=async(req,res,next)=>{
    try{
        await doctorValidation.login({userName:req.body.userName,password:req.body.password});
        const userName=req.body.userName;
        const password=req.body.password;
        let doctorPromise=await models.doctor.findOne({
            where:{userName:userName,password:password},
            include:[models.time]
        });
        if(!doctorPromise){
            const err=new Error('invalid username or password');
            err.statusCode=401;
            throw err;
        }
        let scrtiraPromise=await doctorPromise.getScrtiera({attributes:{exclude:['password','createdAt','updatedAt','doctorId']}});
        const token=require('../../middlware/token').doctor(scrtiraPromise.id,doctorPromise.id);
        let times=doctorPromise.times.map(i=>{
              return {from:i.from,to:i.to};
           });
        let doctor={
                   "fName":doctorPromise.fName,
                   "lName":doctorPromise.lName,
                   "userName":doctorPromise.userName,
                   "birthDate":doctorPromise.birthDate,
                   "mobileNumber":doctorPromise.mobileNumber,
                   "landNumber":doctorPromise.landNumber,
                   "clinicAddress":doctorPromise.clinicAddress,
                   "image":doctorPromise.image,
                   "workTime":times
           };
        res.status(200).json({
            token:token,
            doctor:doctor,
            scrtiera:scrtiraPromise
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
        await doctorValidation.checkId(meetingId);
        await doctorValidation.checkId(patientId);
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

const updateMeeting=async(req,res,next)=>{
      let deleteNewImageIfAnyErrorFound=req.file;
      let updateMeeting={};
      updateMeeting.totalPrice         =req.body.totalPrice;
      updateMeeting.remainingPrice     =req.body.remainingPrice;
      updateMeeting.image              =req.file;
      let isSameImage                  =req.body.image;
      updateMeeting.notics             =req.body.notics;   
      updateMeeting.followUpTreatmentId=req.body.followUpTreatmentId;
      updateMeeting.meetingId          =req.body.meetingId;
      updateMeeting.nextMeetingDate    =req.body.nextMeetingDate;
      updateMeeting.diagnosis          =req.body.diagnosis;
      updateMeeting.pricePaid          =req.body.pricePaid;
      try{
            // for image
            if(!updateMeeting.image &&isSameImage==undefined){
                const err=new Error('image invalid');
                err.statusCode=422;
                throw err;
            }
            let updateMeetingWithSameImageOrNot={};let helpToDeleteOldImage=false;
            if(isSameImage!=undefined){
                updateMeetingWithSameImageOrNot={
                    'totalPrice':updateMeeting.totalPrice,
                    'remainingPrice':updateMeeting.remainingPrice,
                    'notics':updateMeeting.notics,
                };
                updateMeeting.image='no image';
            }else{
                updateMeeting.image=updateMeeting.image.path;
                updateMeetingWithSameImageOrNot={
                    'totalPrice':updateMeeting.totalPrice,
                    'remainingPrice':updateMeeting.remainingPrice,
                    'image':updateMeeting.image,
                    'notics':updateMeeting.notics,
                };
                helpToDeleteOldImage=true;
            }
            //
            let isNewDate=true;
            if(!updateMeeting.nextMeetingDate){
                updateMeeting.nextMeetingDate=new Date();
                isNewDate=false;
            }
            await doctorValidation.checkMeeting(updateMeeting);
            let meetingToUpdate=await models.meeting.findOne({
                where:{id:updateMeeting.meetingId}
                ,include:{
                    model:models.treatment,
                    as:"followUpTreatment",
                    where:{id:updateMeeting.followUpTreatmentId}
                }
            });
            if(!meetingToUpdate){
                const err=new Error('update faild,this meeting not found');
                err.statusCode=422;
                throw err;
           }
     
            await meetingToUpdate.followUpTreatment[0].update({
                'diagnosis':updateMeeting.diagnosis,
                'pricePaid':updateMeeting.pricePaid,
            });
            if(isNewDate){
                await meetingToUpdate.createFollowUpTreatment({
                    'nextMeetingDate':updateMeeting.nextMeetingDate                 
                });
            }
            let oldImage=meetingToUpdate.image;
            await meetingToUpdate.update(updateMeetingWithSameImageOrNot);
          
            // image continue
            if(helpToDeleteOldImage ){
                if(oldImage!="NO IMAGE")
                      deleteImage(oldImage);
            }
            //
            res.status(200).json({message:"mission complete"});
      }catch(err){
        if(deleteNewImageIfAnyErrorFound!=undefined)
            deleteImage(deleteNewImageIfAnyErrorFound.path);      
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
        await doctorValidation.checkId(meetingId);
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
        await doctorValidation.checkId(meetingId);
        await doctorValidation.checkId(id);
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
        await doctorValidation.checkId(meetingId);
        await doctorValidation.checkPatient(newPatient);
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
            await doctorValidation.checkDate({date:newMeetings[i].date});
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

const deletePatient=async(req,res,next)=>{
     try{
        const patientId=req.params.patientId;
        await doctorValidation.checkId(patientId);
        let patientToDelete=await models.patient.findOne({
            where:{id:patientId},
            include:{model:models.meeting,include:{model:models.treatment,as:'followUpTreatment'}}
        });
         for(let i=0;i<patientToDelete.meetings.length;i++){
            await patientToDelete.meetings[i].destroy();
        }
        await patientToDelete.destroy();
        if(!patientToDelete){
            const err=new Error('delete fail');
            err.statusCode=422;
            throw err;
        }
        res.status(200).json({message:'delete success'});
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
        await doctorValidation.checkId(patientId);
        await doctorValidation.checkPatient(updatedPatient);
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
      await doctorValidation.checkId(patientId);
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
        await doctorValidation.checkId(meetingId);
        await doctorValidation.checkId(patientId);
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
            const doctorId=req.doctorId;
            // for image
            let imageFile=req.file;
            if(!imageFile){
                const err=new Error('image invalid');
                err.statusCode=422;
                throw err;
            }
            //
            let updateDoctor=await models.doctor.findOne({
                where:{id:doctorId},
                attributes:['id','image']
            });
            let oldImage=updateDoctor.image;
            if(!await updateDoctor.update({image:imageFile.path})){
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
        const doctorId=req.doctorId;
        let updateDoctor={};
        updateDoctor=req.body;
        let workTime=[];
        workTime=updateDoctor.workTime;
        delete updateDoctor.workTime;
        // for image
        let imageFile=req.file;
         if(!imageFile &&updateDoctor.image==undefined){
            const err=new Error('image invalid');
            err.statusCode=422;
            throw err;
        }
        let updateDoctorWithSameImageOrNot={};let helpToDeleteOldImage=false;
        updateDoctorWithSameImageOrNot={...updateDoctor};
        updateDoctorWithSameImageOrNot.image="IMAGE";// for validation
        if(updateDoctor.image!=undefined){
            delete updateDoctor.image;
        }else{
            updateDoctor.image=imageFile.path;
            helpToDeleteOldImage=true;
        }
        //
        await doctorValidation.checkDoctor(updateDoctorWithSameImageOrNot);
        for(let i=0;i<workTime.length;i++){
            // to take data from json and form
                if(require('../../middlware/isJSON')(workTime[i]))
                    workTime[i]=JSON.parse(workTime[i]);
            // 
                await doctorValidation.checkWorkTime(workTime[i]);
        }
        const DOCTOR=await models.doctor.findOne({
            where:{id:doctorId},
            include:{
                model:models.time
            }
        });
        if(!DOCTOR){
            const err=new Error('this doctor not found');
            err.statusCode=404;
            throw err;
        }
        for(let i=0;i<DOCTOR.times.length;i++){
            await DOCTOR.times[i].destroy();
        }
        workTime=await models.time.bulkCreate(workTime);
        await DOCTOR.addTimes(workTime);
        let oldImage=DOCTOR.image;
        await DOCTOR.update(updateDoctor);
        // image continue
        if(helpToDeleteOldImage){
            if(oldImage.toUpperCase()!="NO IMAGE")
                deleteImage(oldImage);
        }//////
        res.status(200).json({message:"mission complete"});
    }catch(err){
        if(deleteNewImageIfAnyErrorFound!=undefined)
            deleteImage(deleteNewImageIfAnyErrorFound.path);
        if(!err.statusCode)
             err.statusCode=500;
        next(err);
    }
};

const scrtiraProfileUpdateImg=async(req,res,next)=>{
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

const scrtiraProfileUpdateProfile=async(req,res,next)=>{
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
        await doctorValidation.checkScrtiera(updateScrtieraWithSameImageOrNot);
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

const addDoctor=async(req,res,next)=>{
     try{
        let work=req.body.workTime;
        delete req.body.workTime;
        await doctorValidation.checkDoctor(req.body);
        for(let i=0;i<work.length;i++){
                await doctorValidation.checkWorkTime(work[i]);
        }
        let newDoctor=await models.doctor.create(req.body);
        if(!newDoctor){
            const err=new Error('create doctor fail');
            err.statusCode=422;
            throw err;
        }
        let workTime=await models.time.bulkCreate(work);
        if(!workTime){
            await models.doctor.destroy({where:{userName:req.body.userName}});
            const err=new Error('create work time fail recreate doctor');
            err.statusCode=422;
            throw err;
        }
        if(!await newDoctor.addTimes(workTime)){
            for(i=0;i<work.length;i++){
                await models.time.destroy({
                    where:{
                    "from":work[i].from,
                    "to":work[i].to
                }
                });
            }
            await models.doctor.destroy({where:{userName:req.body.userName}});
            const err=new Error('create scrtiera fail recreate doctor');
            err.statusCode=422;
            throw err;
        }
        if(!await newDoctor.createScrtiera()){
            let doc=await models.doctor.findOne({
                where:{userName:req.body.userName},
                include:[models.time]
            });
            for(i=0;i<doc.times.length;i++){
                   await doc.times[i].destroy();
            }
            await doc.destroy();
            const err=new Error('create scrtiera fail recreate doctor');
            err.statusCode=422;
            throw err;
        }
        res.status(201).json({message:"create success"});
     }catch(err){
        if(!err.statusCode)
            err.statusCode=500;
        next(err);
     }
};

module.exports={
    addDoctor,
    scrtiraProfileUpdateProfile,
    scrtiraProfileUpdateImg,
    myProfileUpdateProfile,
    myProfileUpdateImg,
    deleteMeetingForPatient,
    patientMeeting,
    updatePatient,
    deletePatient,
    allPatients,
    addNewMeeting,
    login,
    bookedMeeting,
    bookedMeetingThisDay,
    oldBookedMeeting,
    deletePatientMeeting,
    updateMeeting,
    availabelMeeting,
    deleteMeeting,
    bookInMeeting,
    bookNewPatientInMeeting
};