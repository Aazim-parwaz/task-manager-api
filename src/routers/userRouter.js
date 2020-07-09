const express=require('express');
const bcrypt=require('bcryptjs');
const users=require('../modals/users');
const jwt=require('jsonwebtoken');
const router=new express.Router();
const authentication=require('../middleware/auth');
const tasks=require('../modals/tasks')
const multer=require('multer');
const sharp=require('sharp');
const { welcomeEmailNote,cancellationEmailNote }=require('../emails/account')

const upload=multer({
    
    limits:{
     fileSize:1000000
    },
    fileFilter(req,file,cb){
        
        if(!(file.originalname.endsWith('.jpg')||file.originalname.endsWith('.jpeg')||file.originalname.endsWith('.png'))){
           return cb(new Error('file not supported'))
        }
        cb(undefined,true);
    }
});

router.post('/users/me/avatar',authentication,upload.single('avatar'),async (req,res)=>{
    const editFile= await sharp(req.file.buffer).resize({width:500,height:300}).png().toBuffer()
    console.log(editFile);
    
    req.user.avatar=editFile
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


router.delete('/users/me/avatar',authentication,upload.single(''),upload.none(),async (req,res)=>{
    req.user.avatar=undefined;
    await req.user.save()
    res.send()
}
)


router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user= await users.findById(req.params.id);
     if(!user || !user.avatar){
         throw new Error()
     }
     res.set('Content-Type','image/png')
     res.send(user.avatar);
        
    } catch (error) {
        res.status(404).send()
    }
    
})



router.post('/users',async (req,res)=>{
   
    const user=new users(req.body);
    try {
      
        welcomeEmailNote(user.email,user.name);
        const token= await user.generateAuthToken();
        user.tokens=user.tokens.concat({token});
        await user.save()
        res.status(200).send({user,token})
    } catch (error) {
        console.log('error : ',error);
res.status(500).send(error)

    }
    
})

router.post('/users/login',async (req,res)=>{
    try {
        const user=await users.findByCredentials(req.body.email,req.body.password);
        const token=await user.generateAuthToken();
        user.tokens=user.tokens.concat({token})
         await user.save()
         res.send({user,token});

    } catch (er) {
        res.status(400).send();
    }
   
    
})

router.post('/users/logout',authentication,async (req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((tokenObj)=>{
            return tokenObj.token!==req.token
        })
        await req.user.save()
        res.send({message:'logged out successfully'});
    } catch (er) {
        res.status(500).send();
    }
})


router.post('/users/logoutAll',authentication,async(req,res)=>{
    try {
        req.user.tokens=[];
        await req.user.save();
        res.send({message:'logged out successfully'});
    } catch (er) {
        res.status(500).send();
    }
})



router.patch('/users/me',authentication,async (req,res)=>{
    const _id=req.user._id;
    const updates=Object.keys(req.body);
    const allowedUpdates=['name','age','email','password'];
    const isValidUpdate= updates.every((update)=>{
        return allowedUpdates.includes(update);
    })
    
   


    if(!isValidUpdate){
        res.status(404).send('Not a valid update')
    }
    
  
  try {
    
   const newUser=await users.findById(_id);
   updates.forEach(update=>newUser[update]=req.body[update])
   
  await newUser.save()
console.log(newUser);
res.status(200).send(newUser);

  } catch (err) {
      console.log(err);
      res.status(400).send(err);
      
  }
  
})





router.get('/users/me',authentication,async(req,res)=>{
res.send(req.user);
    
    

})




// router.get('/users/:id',async (req,res)=>{
//     const _id=req.params.id;


//     try {
//         const user=await  users.findById(_id);
//         if(!user){
//             return res.status(404).send('Not found')
//          }
//          console.log(user);
//          res.status(200).send(user);
//     } catch (err) {
//         console.log(err);
//         res.status(400).send(err);
//     }
   
// })

router.delete('/users/me',authentication,async(req,res)=>{
    try {
   await req.user.remove();
   await tasks.deleteMany({owner: req.user._id })
   cancellationEmailNote(req.user.email,req.user.name)
    res.send(req.user);
   
    } catch (err) {
        res.status(500).send('error occured');
    }
})














module.exports=router;