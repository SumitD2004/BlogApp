
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const {generateJWT, verifyJWT} = require('../Utils/generateToken');
const  transporter  = require('../Utils/transporter');
const admin = require("firebase-admin");
const {getAuth} = require("firebase-admin/auth");
const ShortUniqueId = require('short-unique-id');
const {deleteImageFromCloudinary , uploadImage} =  require("../Utils/uploadImage");
const { FIREBASE_UNIVERSAL_DOMAIN, FIREBASE_CLIENT_X509_CERT_URL, FIREBASE_AUTH_PROVIDER_X509_CERT_URL, FIREBASE_TOKEN_URI, FIREBASE_AUTH_URI, FIREBASE_CLIENT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PROJECT_ID, FIREBASE_TYPE, EMAIL_USER, FRONTEND_URL } = require('../config/dotenv.config');
const {randomUUID} = new ShortUniqueId({length : 5}); 


admin.initializeApp({
  credential: admin.credential.cert(
        {
            "type": FIREBASE_TYPE,
            "project_id": FIREBASE_PROJECT_ID,
            "private_key_id": FIREBASE_PRIVATE_KEY_ID,
            "private_key": FIREBASE_PRIVATE_KEY,
            "client_email": FIREBASE_CLIENT_EMAIL,
            "client_id": FIREBASE_CLIENT_ID,
            "auth_uri": FIREBASE_AUTH_URI,
            "token_uri": FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            "client_x509_cert_url": FIREBASE_CLIENT_X509_CERT_URL,
            "universe_domain": FIREBASE_UNIVERSAL_DOMAIN,
        }
  )
});




async function createUser(req, res){   // submit user details
    // console.log(req.body)
    const {name, email, password} = req.body;
    try{
        if(!name || !email || !password){ // validations
            return res.status(400).json({
                success : false,
                message : "Please fill all fields"
            });
        };
        // or
        // validation for checking email already exist or not
        const checkForExistingUser = await User.findOne({email}) // contains an object

        if(checkForExistingUser){
            if(checkForExistingUser.googleAuth){
                return res.status(400).json({
                    success : true, // flag
                    message : "This email already registered with google . Please try through continue with google",
                    
                })
            }

            if(checkForExistingUser.verify){
                return res.status(400).json({
                    success : false, // flag
                    message : "User already registered with this email!",
                })
            }  
            else{
                let verificationToken = await generateJWT({
                    email : checkForExistingUser.email,
                    id : checkForExistingUser._id,
                });

                // email logic
                const sendingEmail = transporter.sendMail({
                    from : EMAIL_USER,
                    to : email,
                    subject : "Email Verification",
                    text : "Please verify your email",
                    html : `<h1>Click on the link to verify your email</h1>
                        <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
                })

                return res.status(200).json({
                    success : true, // flag
                    message : "Please check your email to verify your account!",
                })
            }
            
        }

        // hashing the password
        const hashedPass = await bcrypt.hash(password , 10); // bcrypt.hash(dataToEncrypt , salt(any))
        const username = email.split("@")[0] + randomUUID(); 

        const newUser = await User.create({ // creating a user document
            name,
            email,
            password : hashedPass,
            username,
        })

        // creating token for an user
        let verificationToken = await generateJWT({email : newUser.email , id : newUser._id} );
        // console.log(token)

        // email logic
        const sendingEmail = transporter.sendMail({
            from : EMAIL_USER,
            to : email,
            subject : "Email Verification",
            text : "Please verify your email",
            html : `<h1>Click on the link to verify your email</h1>
                        <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
        })

        return res.status(200).json({
            success : true, // flag
            message : "Please check your email to verify your account!",
        })

    }
    catch(err){
        res.send({message : "Something went wrong!!",
            error : err.message
        })

    }
}


async function verifyEmail(req,res){
    try {
        const {verificationToken} = req.params;
        const verifyToken = await verifyJWT(verificationToken);

        if(!verifyToken){ // means false
            return res.status(400).json({
                success : false,
                message : "Invalid token / Email expired",
            })
        }

        const {id} = verifyToken;
        const user = await User.findByIdAndUpdate(id , {verify : true} , {new : true});

        if(!user){ 
            return res.status(400).json({
                 success : false, 
                 message : "User not found!",
            })
        }

        return res.status(200).json({
            success : true,
            message : "Email verified successfully",
        })

    } 
    catch (error) {
        return res.status(500).json({
            success : false,
            message : "Please try again!!",
            error : error.message,
        })
    }   
}


async function googleAuth(req,res){
    try {
        const {accessToken} = req.body;
        const response = await getAuth().verifyIdToken(accessToken);
        // console.log(response);
        const {name , email} = response;

        let user = await User.findOne({email});

        if(user){
            // already registered
            if(user.googleAuth){
                let token = await generateJWT({email : newUser.email , id : newUser._id} );

                return res.status(200).json({
                    success : true, // flag
                    message : "Logged in successfully!",
                    // checkForExistingUser
                    user : {
                        id : user._id,
                        name : user.name,
                        email : user.email,
                        blogs : user.blogs,
                        profilePic : user.profilePic,
                        username : user.username,
                        bio : user.bio,
                        following : user.following,
                        followers : user.followers,
                        token
                    },
                })
            }
            else{
                return res.status(400).json({
                    success : true, // flag
                    message : "This email already registered with google . Please try through login form",
                    
                })
            }
        }
        const username = email.split("@")[0] + randomUUID();

        let newUser = await User.create({
                name,
                email,
                googleAuth : true,
                verify : true,
                username,
            });
        

        let token = await generateJWT({email : newUser.email , id : newUser._id} );


        return res.status(200).json({
            success : true, // flag
            message : "Registered successfully!",
            // checkForExistingUser
            user : {
                id : newUser._id,
                name : newUser.name,
                email : newUser.email,
                blogs : newUser.blogs,
                showLikedBlogs: newUser.showLikeBLogs,
                showSavedBlogs : newUser.showSavedBlogs,
                following : newUser.following,
                followers : newUser.followers,
                bio : newUser.bio,
                username : newUser.username,
                profilePic : newUser.profilePic,
                token
            },
        })



    } 
    catch (error) {
        res.status(500).json({message : "Something went wrong!!",
            success : false,
            error : error.message
        })
    }
}



async function login(req,res){ // signin
    const {email, password} = req.body;

    try{
        if(!email || !password){ // validations
            return res.status(400).json({
                success : false,
                message : "Please fill all fields"
            });
        };
        
        const checkForExistingUser = await User.findOne({email}).select("password verify name email profilePic username bio following followers googleAuth showLikedBlogs showSavedBlogs"); // contains an object

        if(!checkForExistingUser){ // means no account exist so users needs to signup
            return res.status(400).json({
                 success : false, 
                 message : "User not found!",
            })
        }

        if(checkForExistingUser.googleAuth){
            return res.status(400).json({
                    success : true, // flag
                    message : "This email already registered with google . Please try through continue with google",
                    
            })
        }


        // check password
        let checkForPass = await bcrypt.compare(password , checkForExistingUser.password ) // return a boolean value

        if(!checkForPass){
            return res.status(400).json({
                success : false, // flag
                message : "Incorrect password",
            })
        }



        if (!checkForExistingUser.verify) {
            // send verification email
            let verificationToken = await generateJWT({
                email: checkForExistingUser.email,
                id: checkForExistingUser._id,
            });

            //email logic

            const sendingEmail = transporter.sendMail({
                from: EMAIL_USER,
                to: checkForExistingUser.email,
                subject: "Email Verification",
                text: "Please verify your email",
                html: `<h1>Click on the link to verify your email</h1>
                <a href="${FRONTEND_URL}/verify-email/${verificationToken}">Verify Email</a>`,
            });

            return res.status(400).json({
                success: false,
                message: "Please verify you email",
            });
        }

        let token = await generateJWT({email : checkForExistingUser.email , id : checkForExistingUser._id} );


        return res.status(200).json({
            success : true, // flag
            message : "Logged in successfully!",
            // checkForExistingUser
            user : {
                id : checkForExistingUser._id,
                name : checkForExistingUser.name,
                email : checkForExistingUser.email,
                blogs : checkForExistingUser.blogs,
                token,
                username : checkForExistingUser.username,
                bio : checkForExistingUser.bio,
                showLikeBLogs : checkForExistingUser.showLikeBLogs,
                showSavedBlogs : checkForExistingUser.showSavedBlogs,
                profilePic : checkForExistingUser.profilePic,
                followers : checkForExistingUser.followers,
                following : checkForExistingUser.following,
            },
        })
    }
    catch(err){
        res.send({message : "Something went wrong!!",
            error : err.message
        })

    }
}


async function getUsers(req, res){
    try{
        const users = await User.find({})

        return res.status(200).json({
            success : true,
            message : "Users fetched successfully",
            users
        })
    }
    catch(err){
        res.send({message : "Something went wrong!!"})
    }
}

async function particularUser(req, res){ // get a particular user
    try{
        const username  = req.params.username;
        // console.log(username)
        const user = await User.findOne({username}).populate(
            "blogs followers following likeBlogs saveBlogs").populate({
                path : "followers following",
                select : "name username",
            })
            .select("-password -verify -email -googleAuth");

        // console.log(user);

        
        if(!user){
            return res.status(200).json({
                success : "false",
                message : "User not found",
            })
        }

        return res.status(200).json({
            success : true,
            message : "Users fetched successfully",
            user
        })
    }
    catch(err){
        res.send({message : "Something went wrong!!"})
    }
}


async function updateUser(req, res){
    const {id} = req.params;
    const {name, username , bio} = req.body; // frontend se ayega updated data
    const image = req.file;


    // validations

    const user = await User.findById(id);


    if(req.body.profilePic){
        if(user.profilePicId){
            await deleteImageFromCloudinary(user.profilePicId);
        }
        user.profilePic = null;
        user.profilePicId = null;
    }

    if(image){

        const {secure_url , public_id} = await uploadImage(`data:image/jpeg;base64,${image.buffer.toString("base64")}`);

        user.profilePic = secure_url;
        user.profilePicId = public_id;
    }




    if(user.username != username){
        const findUser = await User.findOne({username});
        if(findUser){
            return res.status(400).json({        
                success : "false",
                message : "Username already taken",
            })
        }

    }

    user.username = username;
    user.bio = bio;
    user.name = name;

    await user.save();

    
    // const updatedUser = await User.findOneAndUpdate({_id : id} , {name,password,body}); // , {new : true} -> in case of findByIdAndUpdate()

    // if(!updatedUser){
    //         return res.status(200).json({
    //             success : "false",
    //             message : "User not found",
    //         })
    // }

    try{
        return res.status(200).json({
            success : true,
            message : "User updated successfully",
            user,
        })
    }
    catch(err){
        res.send({message : "Something went wrong!!"})
    }
}


async function deleteUser(req, res){ 
    const {id}= req.params;
    const deletedUser = await User.findOneAndDelete({_id : id});

    if(!deletedUser){
        return res.status(404).json({
            success : false,
            message : "User not found",
        })
    }

    try{
        
        return res.status(200).json({
            success : true,
            message : "User deleted successfully",
            deletedUser
        })
    }
    catch(err){
        res.send({message : "Something went wrong!!"})
    }
}


async function followUser(req,res){
    try {
        const {id} = req.params; // jisko follow karna hai
        const followerId = req.user; // jo follow kar rha hai

        const user = await User.findById(id);

        if(!user){
            return res.status(404).json({
                success : false,
                message : "user not found",
            })
        }

        if(!user.followers.includes(followerId)){
            
            await User.findByIdAndUpdate(id , {$set : {followers : followerId}});

            await User.findByIdAndUpdate(followerId , {$set : {following : id}});

            return res.status(200).json({
                success : true,
                message : "Followed user successfully",
            })
        }
        else{
            await User.findByIdAndUpdate(id , {$unset : {followers : followerId}});
            await User.findByIdAndUpdate(followerId , {$unset : {following : id}});

            return res.status(200).json({
                success : true,
                message : "Unfollowed user",
            })
        }

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}




async function changeSavedLikedBlog(req, res) {
  try {
    const userId = req.user;
    const { showLikedBlogs, showSavedBlogs } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({
        message: "User is not found",
      });
    }

    await User.findByIdAndUpdate(userId, { showSavedBlogs, showLikedBlogs });

    return res.status(200).json({
      success: true,
      message: "Visibilty updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}



module.exports = {createUser,getUsers,particularUser,updateUser,deleteUser,login,verifyEmail,googleAuth,followUser , changeSavedLikedBlog };