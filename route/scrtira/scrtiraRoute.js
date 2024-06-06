const express=require('express');
const auth=require('../../middlware/auth');
const scrtiraController=require('../../controllers/scrtiera/scrtieraController');
const uploadImage=require('../../middlware/image').uploadImage;
const route=express.Router();

route.post('/login',scrtiraController.login);
route.post('/bookInMeeting',auth.scrtira,scrtiraController.bookInMeeting);
route.post('/bookNewPatientInMeeting',auth.scrtira,scrtiraController.bookNewPatientInMeeting);
route.post('/addNewMeeting',auth.scrtira,scrtiraController.addNewMeeting);

route.put('/updatePatient',auth.scrtira,scrtiraController.updatePatient);
route.put('/myProfile/updateProfile',auth.scrtira,uploadImage('scrtira').single('image'),scrtiraController.myProfileUpdateProfile);

route.patch('/myProfile/updateImg',auth.scrtira,uploadImage('scrtira').single('image'),scrtiraController.myProfileUpdateImg);
route.patch('/delayMeeting',auth.scrtira,scrtiraController.delayMeeting);

route.get('/bookedMeeting',auth.scrtira,scrtiraController.bookedMeeting);
route.get('/bookedMeetingThisDay',auth.scrtira,scrtiraController.bookedMeetingThisDay);
route.get('/oldBookedMeeting',auth.scrtira,scrtiraController.oldBookedMeeting);
route.get('/patientMeeting/:patientId',auth.scrtira,scrtiraController.patientMeeting);
route.get('/allPatients',auth.scrtira,scrtiraController.allPatients);
route.get('/availabelMeeting',auth.scrtira,scrtiraController.availabelMeeting);

// route.delete('/removePatientMeeting',auth.scrtira,scrtiraController.removePatientMeeting);
route.delete('/deletePatientMeeting/:meetingId/:patientId',auth.scrtira,scrtiraController.deletePatientMeeting);
route.delete('/deleteMeetingForPatient/:patientId/:meetingId',auth.scrtira,scrtiraController.deleteMeetingForPatient);
route.delete('/deleteMeeting/:meetingId',auth.scrtira,scrtiraController.deleteMeeting);

module.exports=route;