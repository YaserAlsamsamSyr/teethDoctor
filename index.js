'use strict';
const bodyParser=require('body-parser');
const DB=require('./models');
const ROUTES=require('./route/clinicRoute');
const express=require('express');
const path=require('path');
const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST,GET,DELETE,PUT,PATCH');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
    next();
});
// active images folder for image can see from client
app.use('/images',express.static(path.join(__dirname,'images')));
app.use(ROUTES);
app.use((error,req,res,next)=>{
    res.status(error.statusCode||500).json({message:error.message});
});
(
    async()=>{
        try{
        await DB.sequelize.sync();
        app.listen(9911,_=>{console.log('~~ server has been started successfuly ~~')});
    } catch(err){
        console.log("can't connect to database");
        console.log("err ==>>\n"+err);
    }
    }
)();