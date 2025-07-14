
const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        trim : true,// removes the leading and trailing spaces
        required : true
    },

    description : {
        type : String,
        required : true
    },
    content : { // text editor content
        type : Object,
        required : true,
    },
    blogId :{
        type : String,
        required : true,
        unique : true,
    },
    image :{
        type : String,
        required : true,
    },
    imageId :{
        type : String,
        required : true,
    },

    draft : {
        type : Boolean,
        default : false // means blogs are public
    },
    creator :{
        type : mongoose.Schema.Types.ObjectId, //user Id who has created it.
        ref : "User", //*** using this we connected blogSchema to userSchema***
        required : true
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref :  "User"
        },
    ],
    comments :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    totalSaves :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        }
    ],
} , {timestamps : true});


const Blog = mongoose.model("Blog" , blogSchema);


module.exports = Blog;