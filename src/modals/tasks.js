
const mongoose=require('mongoose');
const validator=require('validator');
const { schema } = require('./users');
const taskSchema=new mongoose.Schema({
    description:{
        type:String,
        trim:true,
        required:true
    },
    completed:{
        type:Boolean,
        default:false,
        
    },
  owner:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:'users'
  }

},
{
    timestamps:true
}
);
// taskSchema.pre('save',async function(next){
// const task=this;
// task.completed=true;



// next();
// })




const  tasks=mongoose.model('tasks',taskSchema);
module.exports=tasks;