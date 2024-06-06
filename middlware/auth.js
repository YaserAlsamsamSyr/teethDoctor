const jwt=require('jsonwebtoken');

const doctor=(req,res,next)=>{
   if(!req.get('Authorization')){
      const err=new Error('your are not authorized');
      err.statusCode=401;
      throw err;
   }
   const token=req.get('Authorization');
   let decodToken;
   try{
      decodToken=jwt.verify(token,'doctor');
      if(!decodToken){
         const err=new Error('your are not authorized');
         err.statusCode=401;
         throw err;
      }
      req.doctorId=decodToken.doctorId;
      req.scrtiraId=decodToken.scrtiraId;
      next();
   }catch(err){
      if(!err.statusCode){
         err.statusCode=500;
      }
      next(err);
   }
};

const scrtira=(req,res,next)=>{
   if(!req.get('Authorization')){
      const err=new Error('your are not authorized');
      err.statusCode=401;
      throw err;
   }
   const token=req.get('Authorization');
   let decodToken;
   try{
      decodToken=jwt.verify(token,'scrtira');
      if(!decodToken){
         const err=new Error('your are not authorized');
         err.statusCode=401;
         throw err;
      }
      req.scrtiraId=decodToken.scrtiraId;
      req.doctorId=decodToken.doctorId;
      next();
   }catch(err){
      if(!err.statusCode){
         err.statusCode=500;
      }
      next(err);
   }
};

const patientMobile=(req,res,next)=>{
   if(!req.get('Authorization')){
      const err=new Error('your are not authorized');
      err.statusCode=401;
      throw err;
   }
   const token=req.get('Authorization');
   let decodToken;
   try{
      decodToken=jwt.verify(token,'patientMobile');
      if(!decodToken){
         const err=new Error('your are not authorized');
         err.statusCode=401;
         throw err;
      }
      req.patientId=decodToken.patientId;
      next();
   }catch(err){
      if(!err.statusCode){
         err.statusCode=500;
      }
      next(err);
   }
};

const patientWeb=(req,res,next)=>{
   if(!req.get('Authorization')){
      const err=new Error('your are not authorized');
      err.statusCode=401;
      throw err;
   }
   const token=req.get('Authorization');
   let decodToken;
   try{
      decodToken=jwt.verify(token,'patientWeb');
      if(!decodToken){
         const err=new Error('your are not authorized');
         err.statusCode=401;
         throw err;
      }
      req.patientId=decodToken.patientId;
      next();
   }catch(err){
      if(!err.statusCode){
         err.statusCode=500;
      }
      next(err);
   }
};

module.exports={
   doctor,
   scrtira,
   patientMobile,
   patientWeb
};