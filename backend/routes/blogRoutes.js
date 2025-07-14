
const express = require('express');
const {createBlog, likeBlog, saveBlog} = require('../controllers/blogController');
const {getBlogs} = require('../controllers/blogController');
const {particularBlog} = require('../controllers/blogController');
const {updateBlog} = require('../controllers/blogController');
const {deleteBlog , searchBlogs} = require('../controllers/blogController');
const verifyUser = require('../middlewares/auth');
const { addComment, deleteComment, editComment, likeComment } = require('../controllers/commentController');
const {addNestedComment} = require("../controllers/commentController");
const upload = require('../Utils/multer');
const route = express.Router();



// blogs
route.post('/blogs', verifyUser , upload.fields([{ name : "image" , maxCount : 1} , { name : "images", maxCount : 3 }]) ,createBlog); // before entering to createBlog the req will go through verifyUser middleware.


route.get('/blogs' , getBlogs);


route.get('/blogs/:blogId', particularBlog);


route.patch('/blogs/:id', verifyUser,  upload.fields([{ name : "image" , maxCount : 1} , { name : "images", maxCount : 3 }]) ,updateBlog);


route.delete('/blogs/:id', verifyUser , deleteBlog);


// like
route.post('/blogs/like/:id', verifyUser , likeBlog);


// comment
route.post('/blogs/comment/:id', verifyUser , addComment);

route.delete('/blogs/comment/:id', verifyUser , deleteComment);

route.patch('/blogs/edit-comment/:id', verifyUser , editComment);

route.patch('/blogs/like-comment/:id', verifyUser , likeComment);


// for nested comment
route.post('/comment/:parentCommentId/:id' , verifyUser , addNestedComment);


// save blog / bookmark blog

route.patch("/save-blog/:id", verifyUser , saveBlog);


//search blog

route.get("/search-blogs" , searchBlogs);



module.exports = route; // while importing we will use blogRoute