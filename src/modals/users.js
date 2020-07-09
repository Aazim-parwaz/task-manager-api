const mongoose=require('mongoose');
const validator=require('validator');
const jwt=require('jsonwebtoken')


const bcrypt=require('bcryptjs')
const tasks=require('./tasks');
const { Timestamp } = require('mongodb');


const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:3,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        
        max:[50,'way too old']
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:[7,'atleast 7 digits should be present'],
        validate(value){
            
            if(value.toLowerCase()==='password'){
                throw new Error('can\'t have password as a password')
            }
            
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }



},{
    timestamps:true
}
)

userSchema.virtual('tasks',{
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})



// Hiding private date
userSchema.methods.toJSON=function(){
    const user=this;
    const userObject=user.toObject();
    console.log(user);
    console.log(userObject);
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    
    return userObject;
    


}





    
// user method
userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
    return token;
}




 //login function  // model method 
userSchema.statics.findByCredentials=async (email,password)=>{
    
   
        const user=await users.findOne({email});
        if(!user){
            throw new Error('email does not match');
        }
       
     const isPassword= await bcrypt.compare(password,user.password);
     if(!isPassword){
         console.log('password not matching');
         
         throw new Error('password does not match');
        
     }
        console.log(user,isPassword);
     return user;


}






// hashing the password
userSchema.pre('save',async function(next){
    const user=this;
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8);
    
        
    }
    next();
})
// Delete userTasks when user is removed

// Check the below prefunction...it is not running

// userSchema.pre('remove',async function(next){
//     const user=this;
//     console.log(tasks);
    
//     await tasks.deleteMany({owner:user._id});
    
//      next();
// })



const users= mongoose.model('users',userSchema);
module.exports=users;