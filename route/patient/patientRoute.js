const express=require('express');
const modileRoute=require('./mobile/mobileRoute');
const webRoute=require('./web/webRoute');
const route=express.Router();

route.use('/mobile',modileRoute);
route.use('/web',webRoute);

module.exports=route;