

const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        unique : true
    },
    username : {
        type :  String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        unique : true,
    },
    blogs : [ // number of blogs posted by user.
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Blog" , //*** using this we connected userSchema to blogSchema***
        }
    ],
    verify : {
        type : Boolean,
        default : false,
    },
    googleAuth :{
        type : Boolean,
        default : false,
    },
    profilePic :{
        type : String,
        default : null,
    },
    profilePicId :{
        type : String,
        default : null,
    },
    bio :{
        type : String,
    },
    followers :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        }
    ],
    following :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        }
    ],
    saveBlogs : [ // blogs which have been saved by user
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Blog" , 
        }
    ],
    likeBlogs :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Blog" , 
        }
    ],
    showLikeBLogs : {
        type : Boolean,
        default : true,
    },
    
} , {timestamps : true})

const User = mongoose.model("User" , userSchema);



module.exports = User;