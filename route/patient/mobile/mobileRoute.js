const express=require('express');
const auth=require('../../../middlware/auth');
const mobileController=require('../../../controllers/patient/mobile/mobileController');
const route=express.Router();

route.post('/login',mobileController.login);
route.post('/bookInMeeting',auth.patientMobile,mobileController.bookInMeeting);

route.get('/availabelMeeting',mobileController.availabelMeeting);

route.delete('/removePatientMeeting',auth.patientMobile,mobileController.removePatientMeeting);

module.exports=route;