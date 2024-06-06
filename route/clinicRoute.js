const express=require('express');
const doctor=require('./doctor/doctorRoute');
const scrtira=require('./scrtira/scrtiraRoute');
const patient=require('./patient/patientRoute');
const route=express.Router();
route.get('/',(req,res,next)=>{
    res.status(200).send('<h1 style="color:red;">Hellow</h1>');
});
route.use('/doctorUI',doctor);
route.use('/scrtiraUI',scrtira);
route.use('/patientUI',patient);
module.exports=route;