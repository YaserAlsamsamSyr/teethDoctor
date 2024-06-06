const jwt=require('jsonwebtoken');

const patientWeb=(patientId)=>{
    let Token=jwt.sign({patientId:patientId},'patientWeb',{expiresIn:'672h'});
    return Token;
};
const patientMobile=(patientId)=>{
    let token=jwt.sign({patientId:patientId},'patientMobile',{expiresIn:'672h'});
    return token;
};
const scrtira=(scrtiraId,doctorId)=>{
    let token=jwt.sign({scrtiraId:scrtiraId,doctorId:doctorId},'scrtira',{expiresIn:'168h'});
    return token;
};
const doctor=(scrtiraId,doctorId)=>{
    let token=jwt.sign({scrtiraId:scrtiraId,doctorId:doctorId},'doctor',{expiresIn:'168h'});
    return token;
};

module.exports={
    patientWeb,
    patientMobile,
    scrtira,
    doctor
};