const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");





async function addComment(req, res){ 
    try {
        const {id} = req.params; // blog id
        const creator = req.user; // user id
        const {comment} = req.body;

        if(!comment){
            return res.status(404).json({
                success : false,
                message : "Please enter the comment",
            })
        }

        const blog = await Blog.findById(id);

        if(!blog){
            return res.status(404).json({
                success : false,
                message : "Blog not found",
            })
        }

        // create the comment ***imp***
        const commentDoc = await Comment.create({comment , blog : id , user : creator});
        const newComment = await commentDoc.populate({
            path : "user",
            select : "name email",
        })

        await Blog.findByIdAndUpdate(id, {
            $push : { comments : newComment._id},
        })

        return res.status(200).json({
            success : true,
            message : "Comment added successfully",
            newComment  
        });

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}



async function deleteComment(req, res){ // can be done by vo blog ka owner or jisne comment kiya hai 
    try {
        const {id} = req.params; // comment id
        const userId = req.user; // user ki id jo delete krna chahta hai

        
        const comment = await Comment.findById(id).populate({
            path : "blog",
            select : "creator",
        })
        // const blog = await Blog.findById(comment.blog);
        // const author = blog.creator;

        if(!comment){
            return res.status(500).json({
                success : false,
                message : "comment not found",
            })
        }


        if(userId != comment.user && comment.blog.creator != userId){
            return res.status(500).json({
                success : false,
                message : "Not authorized to do so!!",
            })
        }

        async function deleteCommentAndReplies(id){ //*** recursion to delete all nested comments***
            let comment = await Comment.findById(id);
            for(let replyId of comment.replies){
                await deleteCommentAndReplies(replyId);
            }

            if(comment.parentComment){
                await Comment.findByIdAndUpdate(comment.parentComment , {
                    $pull : {replies : id},
                })
            }
            await Comment.findByIdAndDelete(id);
        }

        await deleteCommentAndReplies(id);
        // await Comment.deleteMany({ _id : { $in : comment.replies } });

        await Blog.findByIdAndUpdate(comment.blog._id , {$pull : {comments : id}});

    
        return res.status(200).json({
            success : true,
            message : "Comment deleted successfully",
        });

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}




async function editComment(req, res){ // can only be done by person who has commented.
    try {
        const {id} = req.params; // comment id
        const userId = req.user; // user ki id 
        const {updatedCommentContent} = req.body;

        
        const comment = await Comment.findById(id);

        if(!comment){
            return res.status(500).json({
                success : false,
                message : "Comment not found",
            })
        }
        // console.log(comment.user , userId);
        if(comment.user != userId){
            return res.status(400).json({
                success : false,
                message : "You are not valid user to edit this comment",
            })
        }


        const updatedCommentDoc =  await Comment.findByIdAndUpdate(id , {comment : updatedCommentContent}, {new : true });
        const updatedComment = await updatedCommentDoc.populate({
            path : "user",
            select : "name email",
        })

    
        return res.status(200).json({
            success : true,
            message : "Comment updated successfully",
            updatedComment,
        });

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


async function likeComment(req, res){ 
    try {
        const {id} = req.params; 
        const userId = req.user;

        const comment = await Comment.findById(id);

        if(!comment){
            return res.status(404).json({
                success : false,
                message : "comment not found",
            })
        }

        if(!comment.likes.includes(userId)){
            
            await Comment.findByIdAndUpdate(id , {$push : {likes : userId}})
            return res.status(200).json({
                success : true,
                message : "Comment liked successfully"
            })
        }
        else{
            await Comment.findByIdAndUpdate(id , {$pull : {likes : userId}});
            return res.status(200).json({
                success : true,
                message : "Comment Disliked successfully"
            })
        }

    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}


// nested comments

async function addNestedComment(req,res){
    
        const {id : blogId , parentCommentId} = req.params; 
        const userId = req.user;
        const {reply} = req.body;
        try {
        const comment = await Comment.findById(parentCommentId);

        const blog = await Blog.findById(blogId);

        if(!comment){
            return res.status(404).json({
                success : false,
                message : "comment not found",
            })
        }

        if(!blog){
            return res.status(404).json({
                success : false,
                message : "blog not found",
            })
        }


        const replyDoc = await Comment.create({
            blog : blogId,
            comment : reply,
            parentComment : parentCommentId,
            user : userId,
        });
        const newReply = await replyDoc.populate({
            path : "user",
            select : "name email",
        })


        await Comment.findByIdAndUpdate(parentCommentId, {$push : {replies : newReply._id}});

    
        return res.status(200).json({
            success : true,
            message : "reply added successfully",
            newReply,
        })
        
    } 
    catch (error) {
        return res.status(500).json({
            message : error.message,
        })
    }
}




module.exports = {addComment,deleteComment,editComment,likeComment,addNestedComment};