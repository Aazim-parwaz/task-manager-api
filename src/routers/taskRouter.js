const express= require('express');
const router=new express.Router();
const tasks=require('../modals/tasks');
const authentication=require('../middleware/auth')
const users=require('../modals/users')


router.post('/tasks',authentication,async (req,res)=>{
    
    // const task=new tasks(req.body);
    // task.owner=req.user.id;
    const task=new tasks({
        ...req.body,
        owner:req.user._id,
    })
    
    try {
        await task.save();
        
        console.log(task);
        
        
        
        res.status(201).send(task);

    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
    
})

// Get /tasks?completed=true

router.get('/tasks',authentication,async (req,res)=>{
   const match={};
   const sort={};
   if(req.query.completed){
       match.completed=req.query.completed
   }
  if(req.query.sortBy){
      const parts=req.query.sortBy.split(':');
       sort[parts[0]]=parts[1]==='dec'?-1 : 1
  }


    try {
        // const foundTasks=await tasks.find({owner:req.user._id});

        // const user=await users.findById(req.user._id);
        await req.user.populate({
           path: 'tasks',
           match,
           options:{
               limit:parseInt(req.query.limit),
               skip:parseInt(req.query.skip),
               sort
                
           }
        }).execPopulate();
        console.log(req.user.tasks);
        res.status(200).send(req.user.tasks);
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
    
})

router.get('/tasks/:id',authentication,async (req,res)=>{
    const _id=req.params.id;
    try {
        const task=await tasks.findOne({_id,owner:req.user._id});
        if(!task){
            return  res.status(404).send('Not found!')
          }
          console.log(task);
          res.status(200).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
    
})



router.patch('/tasks/:id',authentication,async (req,res)=>{
    const _id=req.params.id;
   const updates=Object.keys(req.body);
   const allowedUpdates=['description','completed'];
   const isValidUpdate=updates.every(update=> allowedUpdates.includes(update))
   if(!isValidUpdate){
       return res.status(404).send({error:"not found!"});
   }
   try {
      
    const task=await tasks.findOne({_id,owner:req.user._id});
    

    if(!task){
        return res.status(404).send("not found");
    }
    updates.forEach(update=>task[update]=req.body[update]);
    await task.save();
    res.status(200).send(task);


   } catch (er) {
       res.status(400).send(er);
   }
})




router.delete('/tasks/:id',authentication,async (req,res)=>{
    try {
        const _id=req.params.id
        const task=await tasks.findOneAndDelete({_id,owner:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err);
        
    }
})


module.exports=router;