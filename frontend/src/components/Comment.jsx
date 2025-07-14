import { useDispatch, useSelector } from "react-redux";
import { setIsOpen } from "../utils/commentSlice";
import { useState } from "react";
import axios from "axios";
import { setCommentLikes, setComments, setReplies , deleteCommentAndReply, setUpdatedComments } from "../utils/selectedBlogSlice";
import {formatDate} from "../utils/formatDate"
import toast from "react-hot-toast";


function Comment() {

    const dispatch = useDispatch();
    const [comment , setComment] = useState("");
    const [currentEditComment , setCurrentEditComment] = useState(null);
    const [currentPopup , setCurrentPopup] = useState(null); // to open one popup at a time
    const {_id : blogId , comments , creator : {_id : creatorId}} = useSelector((state) => state.selectedBlog);
    const [activeReply , setActiveReply] = useState(null);
    const {token , id : userId} = useSelector((state) => state.user);

    async function handleComment() {
        try {
            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/comment/${blogId}` ,
                {
                    comment,
                },
                {
                    headers : {
                        "Authorization" : `Bearer ${token}`,
                    }
                }
            )
            dispatch(setComments(res.data.newComment));
            setComment("")
        } 
        catch (error) {
            toast.error(error.response.data.message);
            console.log(error)
        }
    }

    return (
        <div className="bg-gray-100 p-5 z-50 h-screen fixed top-0 right-0 w-[350px] border-l drop-shadow-xl overflow-y-scroll">
            <div className="flex justify-between">
                <h1 className="text-xl mt-1 font-medium">Comment ({comments.length})</h1>
                <i onClick={() => dispatch(setIsOpen(false))} className="fi fi-br-cross text-lg mt-1 cursor-pointer"></i>
            </div>

            <div className="my-4 ">
                <textarea type="text" placeholder="comment..." onChange={(e) => setComment(e.target.value)} className="h-[150px] resize-none text-lg p-4 transition drop-shadow-2xl shadow-lg focus:outline-none z-50 w-full"/>
                <button onClick={handleComment} className="bg-green-400 px-7 py-3 my-2 rounded-xl">Add</button>
            </div>
            <div className="mt-4">
                <DisplayComments 
                comments={comments}
                userId={userId} 
                blogId={blogId} 
                token={token} 
                activeReply={activeReply} 
                setActiveReply={setActiveReply}
                currentPopup={currentPopup}
                setCurrentPopup={setCurrentPopup}
                currentEditComment={currentEditComment}
                setCurrentEditComment={setCurrentEditComment}
                creatorId={creatorId}
                setUpdatedComments={setUpdatedComments}
                deleteCommentAndReply={deleteCommentAndReply}
                />
            </div>
        </div>
    )
}


function DisplayComments({comments , userId , blogId , token , setActiveReply , activeReply, currentPopup, setCurrentPopup, currentEditComment , setCurrentEditComment , creatorId , deleteCommentAndReply , setUpdatedComments}){

    const [reply , setReply] = useState("");
    const [updatedCommentContent , setUpdatedCommentContent] = useState("");
    const dispatch = useDispatch();

    async function handleReply(parentCommentId){
        try {
            let res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/comment/${parentCommentId}/${blogId}` ,
                {
                    reply, // ye req body me jayega
                },
                {
                    headers : {
                        "Authorization" : `Bearer ${token}`,
                    }
                }
            )
            setReply("");
            setActiveReply(null);
            dispatch(setReplies(res.data.newReply));
            console.log(res.data);
        } 
        catch (error) {
            // toast.error(error)
            console.log(error)
        }
    }

    async function handleCommentLike(commentId){
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/like-comment/${commentId}` ,
                {},
                {
                    headers :{
                        "Authorization" : `Bearer ${token}`,
                    }
                }
             )
             toast.success(res.data.message);
             dispatch(setCommentLikes({commentId,userId}));
        } catch (error) {
            console.log(error)
        }
    }

    async function handleActiveReply(id){
        setActiveReply((prev) => prev == id ? null : id);
    }


    async function handleCommentUpdate(id){ // comment id
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/edit-comment/${id}` ,
                {
                    updatedCommentContent,
                },
                {
                    headers :{
                        "Authorization" : `Bearer ${token}`,
                    }
                }
             )
            toast.success(res.data.message);
            dispatch(setUpdatedComments(res.data.updatedComment));
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message);
        }
        finally{
            setUpdatedCommentContent("");
            setCurrentEditComment("");
        }
    }


    async function handleCommentDelete(id){
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/comment/${id}` ,
                {
                    headers :{
                        "Authorization" : `Bearer ${token}`,
                    }
                }
             )
             toast.success(res.data.message);
             dispatch(deleteCommentAndReply(id));
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message);
        }
        finally{
            setUpdatedCommentContent("");
            setCurrentEditComment("");
        }
    }


    return (
        <>
            {
                comments.map((comment)=>(
                      <>
                        <hr className="font-bold my-2"/>
                        <div className="flex flex-col gap-3 my-4">


                        {   currentEditComment == comment._id  ? <div className="my-4 ">
                                        <textarea type="text" defaultValue={comment.comment} placeholder="reply..." onChange={(e) => setUpdatedCommentContent(e.target.value)} className="h-[100px] resize-none text-lg p-4 transition drop-shadow-2xl shadow-lg focus:outline-none z-50 w-full"/>
                                        <div className="flex gap-3">
                                            <button onClick={() => setCurrentEditComment(null)} className="bg-red-400 px-7 py-3 my-2 rounded-xl">Cancel</button>
                                            <button onClick={() => handleCommentUpdate(comment._id)} className="bg-green-400 px-10 py-3 my-2 rounded-xl">Edit</button>
                                        </div>
                                        
                                    </div>
                                    :
                            <>
                                <div className="flex w-full justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-10 h-10"><img className="rounded-full my-1" src={`https://api.dicebear.com/9.x/initials/svg?seed=${comment.user.name}`} alt="" /></div>
                                        <div>
                                            <p className="capitalize font-medium">{comment.user.name}</p>
                                            <p>{formatDate(comment.createdAt)}</p>
                                        </div>
                                    </div>


                                    {
                                        (comment.user._id === userId || userId === creatorId) ? (
                                            currentPopup === comment._id ? (
                                                <div className="bg-gray-200 w-[70px] rounded-lg">
                                                    <i 
                                                        onClick={() => setCurrentPopup((prev) => prev === comment._id ? null : comment._id)} 
                                                        className="fi fi-br-cross text-sm mt-1 relative left-12 cursor-pointer"
                                                    ></i>
                                                {   
                                                    comment.user._id === userId ? 
                                                    <p 
                                                        className="p-2 py-1 hover:bg-blue-500" 
                                                        onClick={() => {
                                                            setCurrentEditComment(comment._id);
                                                            setCurrentPopup(null);
                                                        }}
                                                    >
                                                        Edit
                                                    </p> : ""
                                                }

                                                    <p 
                                                        className="p-2 py-1 hover:bg-blue-500" 
                                                        onClick={() => {
                                                            handleCommentDelete(comment._id);
                                                            setCurrentPopup(null);
                                                        }}
                                                    >
                                                        Delete
                                                    </p>
                                                </div>
                                            ) : (
                                                <i 
                                                    className="fi fi-rs-menu-dots cursor-pointer" 
                                                    onClick={() => setCurrentPopup(comment._id)}
                                                ></i>
                                            )
                                        ) : (
                                            ""
                                        )
                                    }

                                    

                                </div>
                            
                                <p className="font-medium text-lg">{comment.comment}</p>

                                <div className="flex justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 cursor-pointer group select-none">
                                            {comment.likes.includes(userId) ? (
                                                <i onClick={() => handleCommentLike(comment._id)} className="fi fi-sr-thumbs-up  text-blue-600 text-lg group-hover:scale-110 transition-transform drop-shadow"></i>
                                            ) : (
                                                <i onClick={() => handleCommentLike(comment._id)} className="fi fi-rr-social-network  text-gray-400 text-lg group-hover:text-blue-400 group-hover:scale-110 transition-transform drop-shadow"></i>
                                            )}
                                            <span className="text-lg font-bold text-gray-700 group-hover:text-blue-600 mb-1.5">{comment.likes.length}</span>
                                        </div>
                                        <div className="flex gap-2 cursor-pointer">
                                            <i onClick={() => dispatch(setIsOpen())} className="fi fi-sr-comment-alt mt-1 text-purple-500 text-lg"></i>
                                            <p className="text-lg font-bold">{comment.replies.length}</p>
                                        </div>
                                    </div>
                                    <p onClick={() => handleActiveReply(comment._id)} className="text-lg hover:underline cursor-pointer">Reply</p>
                                </div>
                            </>
                        }

                                {
                                    activeReply == comment._id && <div className="my-4 ">
                                        <textarea type="text" placeholder="reply..." onChange={(e) => setReply(e.target.value)} className="h-[100px] resize-none text-lg p-4 transition drop-shadow-2xl shadow-lg focus:outline-none z-50 w-full"/>
                                        <button onClick={() => handleReply(comment._id)} className="bg-green-400 px-7 py-3 my-2 rounded-xl">Add</button>
                                    </div>
                                }

                                {
                                    comment.replies.length > 0 && 
                                    <div className="pl-6 border-l">
                                        <DisplayComments comments={comment.replies} userId={userId} blogId={blogId}
                                         token={token} activeReply={activeReply} setActiveReply={setActiveReply}
                                          setCurrentPopup={setCurrentPopup} currentPopup={currentPopup} 
                                          currentEditComment={currentEditComment} setCurrentEditComment={setCurrentEditComment}
                                         creatorId={creatorId}  setUpdatedComments={setUpdatedComments}
                                        deleteCommentAndReply={deleteCommentAndReply}/>
                                    </div>
                                    
                                }

                        </div>
                      </>
                    ))    
                }
        </>
    )
}


export default Comment;
