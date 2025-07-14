const express = require('express');
// as createUser will be imported as an object so we destructure it to use as a function
const { createUser, getUsers, particularUser, updateUser, deleteUser , login, verifyEmail , googleAuth , followUser , changeSavedLikedBlog } = require('../controllers/userController');
const verifyUser = require('../middlewares/auth');
const upload = require('../Utils/multer');

const route = express.Router(); // creates router object


// console.log(createUser);
route.post('/signup' , createUser); // but muje har ek mai aisa nhi karna hum sirf index.js file me versioning karenge.

route.post('/signin' , login);


route.get('/users' , getUsers);



route.get('/users/:username' , particularUser);


route.patch('/users/:id' , verifyUser, upload.single("profilePic") , updateUser);


route.delete('/users/:id', verifyUser , deleteUser);


//verify email / token

route.get("/verify-email/:verificationToken" , verifyEmail);


// google auth  route
route.post("/google-auth" , googleAuth);


// follow / unfollow

route.patch("/follow/:id" , verifyUser , followUser);


route.patch("/change-saved-liked-blog-visibility" , verifyUser , changeSavedLikedBlog)




module.exports = route; // while importing isko as userName import karenge to avoid conflict