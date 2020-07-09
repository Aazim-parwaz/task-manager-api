const express=require('express');
const app=express();
const jwt=require('jsonwebtoken');
const users=require('../modals/users');

const auth=async (req,res,next)=>{
    try {
        const token=req.header('Authorization').replace('Bearer ','');

    const decode= jwt.verify(token,process.env.JWT_SECRET);
    const user=await users.findOne({_id:decode._id,'tokens.token':token});
    if(!user){
        throw new Error(); 
    }
    req.token=token;
    req._id=decode._id;
    
     req.user=user;
     next();


    } catch (er) {
        res.status(401).send({error:'not authorized '})
    }
    
    
}
module.exports=auth;