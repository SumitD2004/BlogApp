const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { verifyJWT, decodeJWT } = require("../Utils/generateToken");
const {uploadImage,deleteImageFromCloudinary} = require("../Utils/uploadImage");
const fs = require('fs');
const ShortUniqueId = require('short-unique-id');

const {randomUUID} = new ShortUniqueId({length : 10});  



async function createBlog(req, res){

    const creator = req.user;
   
    const {title , description , draft} = req.body;
    const {image,images} = req.files;
    const content = JSON.parse(req.body.content); 
    
    try {

        if(!title || !description || !content){ // validations 
            return res.status(400).json({
                message : "All fields are required!"
            })
        }


        const findUser = await User.findById(creator);

        if(!findUser){
            return res.status(500).json({
                message : "unknown user!!"
            })
        }
        // console.log(findUser);


        // cloudinary wali chiz start karo 

        let imageIdx = 0;

        for(let i=0;i<content.blocks.length;i++){
            const block = content.blocks[i];
            if(block.type == "image"){
                const {secure_url , public_id} = await uploadImage(
                    `data:image/jpeg;base64,${images[imageIdx].buffer.toString("base64")}`
                )
                block.data.file = {
                    url : secure_url, // updating the url
                    imageId : public_id,
                }
                
                imageIdx++;
            }
        }



        const {secure_url , public_id} = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`);

        // fs.unlinkSync(image.path); // taki cloudinary pe image upload hone ke baad delete ho jaye

        const blogId = title.toLowerCase().split(" ").join("-") + "-" + randomUUID();

        const blog = await Blog.create({
            title,
            description,
            draft,
            creator,
            image : secure_url,
            imageId : public_id, // iske through me delete karunga cloudinary pe image.
            blogId,
            content,
        })

        await User.findByIdAndUpdate(creator , { $push : { blogs : blog._id}}) // with help of push operator we push an element in blogs array field. 

        return res.status(200).json({
            message : "Blog created successfully",
            blog
        })
        
    } catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


async function getBlogs(req, res){ // retrieve all blogs
    
    try {
        
        // console.log(req.query);

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const skip = (page-1)*limit;

       // const blogs = await Blog.find({draft : false}).populate("creator");// creator field ko populate karega
        // or
         const blogs = await Blog.find({ draft: false })
        .populate({
        path: "creator",
        select: "-password",
        })
        .populate({
        path: "likes",
        select: "email name",
        }).sort({createdAt : -1}).skip(skip).limit(limit); // "sort" -> jo latest create hua vo pehle ayega

        const totalBlogs = await Blog.countDocuments({draft : false});
    

        return res.status(200).json({
            message : "Blogs retrieved successfully",
            blogs,
            hasMore : skip + limit < totalBlogs,
        })
    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


async function particularBlog(req, res){
    try {
        const {blogId} = req.params;
        const blog = await Blog.findOne({blogId}).populate({
            path : "comments",
            populate :{
                    path : "user",
                    select : "name email",
            },
        }).populate({
            path : "creator",
            select : "name email followers username",
        })
        ;

        async function populateReplies(comments){
            for(const comment of comments){
                let populatedComment = await Comment.findById(comment._id).populate({
                    path : "replies",
                    populate :{
                            path : "user",
                            select : "name email",
                    },
                }).lean();

                comment.replies = populatedComment.replies;

                if(comment.replies.length>0){
                    await populateReplies(comment.replies);
                }
            }
            return comments;
        }

        blog.comments = await populateReplies(blog.comments);

        if(!blog){
            return res.status(404).json({
                message : "Blog not found!",
                blog 
            })
        }

        return res.status(200).json({
            message : "Blog retrieved successfully",
            blog 
        })
    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


async function updateBlog(req, res){
    try {
        const id = req.params.id;
        const creator = req.user;
        const {title, description, draft} = req.body;
        // const {image,images} = req.files;
        const content = JSON.parse(req.body.content);
        const existingImages = JSON.parse(req.body.existingImages);

        // console.log(content);
        // console.log(image , existingfgImages);

        // Use MongoDB _id
        const blog = await Blog.findOne({blogId : id});
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }


        if (creator != blog.creator.toString()) {
            return res.status(403).json({
                message: "You are not authorized user for this action",
            });
        }

        // jo delete karni hai vo images aa jayegi
        let imagesToDelete = blog.content.blocks.filter((block) => block.type == "image").filter(
            (block)=> !existingImages.find(({url}) => url == block.data.file.url)
        ).map((block) => block.data.file.imageId)

        if(imagesToDelete.length>0){ // deletes from cloudinary
            await Promise.all(
                imagesToDelete.map((id) => deleteImageFromCloudinary(id))
            );
        }


        if(req.files.images){
            let imageIdx = 0;

            for(let i=0;i<content.blocks.length;i++){
                const block = content.blocks[i];
                if(block.type == "image" && block.data.file.image){
                    const {secure_url , public_id} = await uploadImage(
                        `data:image/jpeg;base64,${req.files.images[imageIdx].buffer.toString("base64")}`
                    )
                    block.data.file = {
                        url : secure_url, // updating the url
                        imageId : public_id,
                    }
                    
                    imageIdx++;
                }
            }
        }


        // console.log(imagesToDelete);

        if (req.files.image) {
            await deleteImageFromCloudinary(blog.imageId);
            const {secure_url, public_id} = await uploadImage(
                `data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`
            );
            blog.image = secure_url;
            blog.imageId = public_id;
        }

        blog.title = title || blog.title;
        blog.description = description || blog.description;
        blog.draft = draft || blog.draft;
        blog.content = content || blog.content;

        await blog.save();

        return res.status(200).json({
            message: "Blog updated successfully",
            blog
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }

}


async function deleteBlog(req, res){ 
    try {
        const {id} = req.params; // blog id which u want to delete
        const creator = req.user;

        const blog = await Blog.findById(id);

        if(!(creator == blog.creator)){
            return res.status(500).json({
                message : "You are not authorized user for this action",
            })
        }


        await deleteImageFromCloudinary(blog.imageId);


        const deletedBlog = await Blog.findOneAndDelete({_id : id}) // blogs me se delete kar diya
        await User.findByIdAndUpdate(creator , { $pull : {blogs : id} });

        if(!deletedBlog){
            return res.status(404).json({
                success : false,
                message : "User not found",
            })
        }

        return res.status(200).json({
            message : "Blog deleted successfully",
            deletedBlog 
        })
    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


async function likeBlog(req, res){ 
    try {
        const {id} = req.params; 
        const user = req.user;

        const blog = await Blog.findById(id);

        if(!blog){
            return res.status(404).json({
                success : false,
                message : "Blog not found",
            })
        }

        if(!blog.likes.includes(user)){
            
            await Blog.findByIdAndUpdate(id , {$push : {likes : user}});
            await User.findByIdAndUpdate(user , {$push : {likeBlogs : id}});
            return res.status(200).json({
                success : true,
                message : "Blog liked successfully",
                isLiked : true,
            })
        }
        else{
            await Blog.findByIdAndUpdate(id , {$pull : {likes : user}});
            await User.findByIdAndUpdate(user , {$pull : {likeBlogs : id}});
            return res.status(200).json({
                success : true,
                message : "Blog Disliked successfully",
                isLiked : false,
            })
        }

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}



async function saveBlog(req,res){
    try {
        const {id} = req.params; 
        const user = req.user;

        const blog = await Blog.findById(id);

        if(!blog){
            return res.status(404).json({
                success : false,
                message : "Blog not found",
            })
        }

        if(!blog.totalSaves.includes(user)){
            
            await Blog.findByIdAndUpdate(id , {$set : {totalSaves : user}});
            await User.findByIdAndUpdate(user , {$set : {saveBlogs : id}});
            return res.status(200).json({
                success : true,
                message : "Blog has been saved successfully",
                isLiked : true,
            })
        }
        else{
            await Blog.findByIdAndUpdate(id , {$unset : {totalSaves : user}});
            await User.findByIdAndUpdate(user , {$unset : {saveBlogs : id}});
            return res.status(200).json({
                success : true,
                message : "Blog unsaved ",
                isLiked : false,
            })
        }

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}



async function searchBlogs(req,res){
    try {
        const {search} = req.query;
        const query = {
            $or : [
                {title : {$regex : search , $options : "i"}},
                {description : {$regex : search , $options : "i"}},
            ],
        };

        const blogs = await Blog.find(query , {draft : false} ).sort({createdAt : -1}).skip(skip).limit(limit);

        if(blogs.length == 0){
            return res.status(400).json({
                success : false,
                message : "Make sure all words are spelled correctly"
            })
        }
        
        const totalBlogs = await Blog.countDocuments(query , {draft : false});

        return res.status(200).json({
            success : true,
            blogs,
            hasMore : skip + limit < totalBlogs,
        });

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}





module.exports = {createBlog,getBlogs,particularBlog,updateBlog,deleteBlog,likeBlog,saveBlog,searchBlogs};