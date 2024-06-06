const express=require('express');
const auth=require('../../../middlware/auth');
const webController=require('../../../controllers/patient/web/webController');
const route=express.Router();

route.post('/login',webController.login);
route.post('/bookInMeeting',auth.patientWeb,webController.bookInMeeting);

route.get('/availabelMeeting',webController.availabelMeeting);

route.delete('/removePatientMeeting/:meetingID',auth.patientWeb,webController.removePatientMeeting);

module.exports=route;