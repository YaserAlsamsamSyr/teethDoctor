const express=require('express');
const auth=require('../../middlware/auth');
const doctorController=require('../../controllers/doctor/doctorController');
const uploadImage=require('../../middlware/image').uploadImage;
const route=express.Router();

route.post('/addNewDoctor',doctorController.addDoctor);
route.post('/login',doctorController.login);
route.post('/bookInMeeting',auth.doctor,doctorController.bookInMeeting);
route.post('/bookNewPatientInMeeting',auth.doctor,doctorController.bookNewPatientInMeeting);
route.post('/addNewMeeting',auth.doctor,doctorController.addNewMeeting);

route.put('/updateMeeting',auth.doctor,uploadImage('patient').single('image'),doctorController.updateMeeting);
route.put('/updatePatient',auth.doctor,doctorController.updatePatient);
route.put('/myProfile/updateProfile',auth.doctor,uploadImage('doctor').single('image'),doctorController.myProfileUpdateProfile);
route.put('/scrtiraProfile/updateProfile',auth.doctor,uploadImage('scrtira').single('image'),doctorController.scrtiraProfileUpdateProfile);

route.patch('/myProfile/updateImg',auth.doctor,uploadImage('doctor').single('image'),doctorController.myProfileUpdateImg);
route.patch('/scrtiraProfile/updateImg',auth.doctor,uploadImage('scrtira').single('image'),doctorController.scrtiraProfileUpdateImg);

route.get('/bookedMeeting',auth.doctor,doctorController.bookedMeeting);
route.get('/bookedMeetingThisDay',auth.doctor,doctorController.bookedMeetingThisDay);
route.get('/oldBookedMeeting',auth.doctor,doctorController.oldBookedMeeting);
route.get('/patientMeeting/:patientId',auth.doctor,doctorController.patientMeeting);
route.get('/allPatients',auth.doctor,doctorController.allPatients);
route.get('/availabelMeeting',auth.doctor,doctorController.availabelMeeting);

// route.delete('/removePatientMeeting',auth.doctor,doctorController.removePatientMeeting);
route.delete('/deletePatientMeeting/:meetingId/:patientId',auth.doctor,doctorController.deletePatientMeeting);
route.delete('/deleteMeetingForPatient/:patientId/:meetingId',auth.doctor,doctorController.deleteMeetingForPatient);
route.delete('/deletePatient/:patientId',auth.doctor,doctorController.deletePatient);
route.delete('/deleteMeeting/:meetingId',auth.doctor,doctorController.deleteMeeting);

module.exports=route;