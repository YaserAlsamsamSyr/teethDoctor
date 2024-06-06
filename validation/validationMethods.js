const validationRule=require('./validationRule');

const login=(person)=>{
      return new Promise((resolve,reject)=>{
                let valid=validationRule.login.validate(
                    {userName:person.userName,password:person.password});
                if(valid.error){
                    const err=new Error(valid.error.details[0].message);
                    err.statusCode=422;
                    reject(err);
                } else {
                    resolve("ok");
                }
            });
};

const checkId=(id)=>{
    return new Promise((resolve,reject)=>{
        let valid=validationRule.checkId.validate({id:id});
        if(valid.error){
            const err=new Error(valid.error.details[0].message);
            err.statusCode=422;
            reject(err);
        } else {
            resolve("ok");
        }
    });
};

const checkMeeting=(meeting)=>{
       return new Promise((resolve,reject)=>{
        let valid=validationRule.checkMeeting.validate(meeting);
        if(valid.error){
           const err=new Error(valid.error.details[0].message);
           err.statusCode=422;
           reject(err); 
        }else{
           resolve('ok');
        }
       });
};

const checkPatient=(patient)=>{
  return new Promise((resolve,reject)=>{
    let valid=validationRule.checkPatient.validate(patient);
    if(valid.error){
        const err =new Error(valid.error.details[0].message);
        err.statusCode=422;
        reject(err);
    } else
       resolve('ok');
  });  
};

const checkDate=(date)=>{
    return new Promise((resolve,reject)=>{
        let valid=validationRule.checkDate.validate(date);
        if(valid.error){
            const err=new Error(valid.error.details[0].message);
            err.statusCode=422;
            reject(err);
        } else
          resolve('ok');
    });
};

const checkDoctor=(doctor)=>{
    return new Promise((resolve,reject)=>{
        let valid=validationRule.checkDoctor.validate(doctor);
        if(valid.error){
           const err=new Error(valid.error.details[0].message);
           err.statusCode=422;
           reject(err);
        }else{
            resolve('ok');
        }
    });
};

const checkWorkTime=(workTime)=>{
    return new Promise((resolve,reject)=>{
        let valid=validationRule.checkWorkTime.validate(workTime);
        if(valid.error){
            const err=new Error(valid.error.details[0].message);
            err.statusCode=422;
            reject(err);
        }else{
            resolve('ok');
        }
    });
};

const checkScrtiera=(scrtiera)=>{
    return new Promise((resolve,reject)=>{
    let valid=validationRule.checkScrtiera.validate(scrtiera);
    if(valid.error){
        const err=new Error(valid.error.details[0].message);
        err.statusCode=422;
        reject(err);
    } else {
        resolve('ok');
    }
});
};

const checkImage=(image)=>{
    return new Promise((resolve,reject)=>{
        let valid=validationRule.checkImage.validate({image});
        if(valid.error){
            const err=new Error(valid.error.details[0].message);
            err.statusCode=422;
            reject(err);
        } else {
            resolve("ok");
        }
    });
};

module.exports={
    checkImage,
    checkScrtiera,
    checkWorkTime,
    checkDoctor,
    login,
    checkId,
    checkMeeting,
    checkPatient,
    checkDate
};