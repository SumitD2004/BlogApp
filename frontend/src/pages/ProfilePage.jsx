import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDate } from "../utils/formatDate";
import { handleFollowCreator, handleSaveBlog } from "./BlogPage";


function ProfilePage() {
  const {username} = useParams();
  const [userData , setUserData] = useState(null);
  const {token , id : userId} = useSelector((state)=> state.user);
//   console.log(username);

  useEffect(() =>{
        async function fetchUserDetails(){
            try {
                let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/${username.split("@")[1]}` );
                // console.log(res)
                toast.success(res.data.message);
                setUserData(res.data.user);
            } catch (error) {
                console.log(error.message)
                toast.error(error?.response?.data?.message);
            }
        }
        fetchUserDetails();
  }, [username]);

  return (
    <div className="w-full flex justify-center">
        {
            userData ? (
            <div className="w-[80%] flex justify-evenly">
                <div className="w-[50%] ">
                    <div className="flex justify-between my-10">
                        <h1 className="text-4xl font-semibold">{userData.name}</h1>
                        <i className="fi fi-rs-menu-dots cursor-pointer"></i>
                    </div>
                    <div className="my-4 ">
                        <p className="mb-10">Home</p>
                        <div>
                            {userData.blogs.length > 0 ? (
                                userData.blogs.map((blog) => (
                                <Link key={blog._id} to={"/blog/" + blog.blogId}>
                                    <div key={blog._id} className="w-full my-10 flex justify-between max-xsm:flex-col ">
                                    <div className="w-[60%] flex flex-col gap-2 max-xsm:w-full">
                                        <div className="flex items-center gap-2">
                                        <Link to={`/@${blog.creator.username}`}>
                                          <div>
                                            <div className="w-6 h-6 cursor-pointer aspect-square rounded-full overflow-hidden">
                                                <img
                                                src={
                                                    blog?.creator?.profilePic
                                                    ? blog?.creator?.profilePic
                                                    : `https://api.dicebear.com/9.x/initials/svg?seed=${blog?.creator?.name}`
                                                }
                                                alt=""
                                                className="rounded-full w-full h-full object-cover"
                                                />
                                            </div>
                                          </div>
                                        </Link>
                                        <p className=" hover:underline ">{blog?.creator?.name}</p>
                                        </div>
                                        <h2 className="font-bold text-xl sm:text-2xl">{blog?.title}</h2>
                                        <h4 className="line-clamp-2">{blog?.description}</h4>
                                        <div className="flex gap-5">
                                        <p>{formatDate(blog?.createdAt)}</p>
                                        <div className="flex gap-7">
                                            <div className="cursor-pointer flex gap-2 ">
                                            <i className="fi fi-rr-social-network text-lg mt-1"></i>
                                            <p className="text-lg">{blog?.likes?.length}</p>
                                            </div>

                                            <div className="flex gap-2">
                                            <i className="fi fi-sr-comment-alt text-lg mt-1"></i>
                                            <p className="text-lg">{blog?.comments?.length}</p>
                                            </div>
                                            <div
                                            className="flex gap-2 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSaveBlog(blog?._id, token);
                                            }}
                                            >
                                            {blog?.totalSaves?.includes(userId) ? (
                                                <i className="fi fi-sr-bookmark text-lg mt-1"></i>
                                            ) : (
                                                <i className="fi fi-rr-bookmark text-lg mt-1"></i>
                                            )}
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="w-[40%] mt-5 sm:w-[30%] max-xsm:w-full">
                                        <img
                                        src={blog?.image}
                                        alt=""
                                        className="aspect-video object-cover w-full"
                                        />
                                    </div>
                                    </div>
                                    <hr className="opacity-15"/>
                                </Link>
                                ))
                            ) : (
                                <h1 className="my-10 text-2xl font-semibold ">No data found</h1>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-[20%] border-l pl-10 min-h-[calc(100vh_-_70px)] ">
                    <div className="mt-10">
                        {
                            !userData.profilePic ? <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`} 
                            className="w-20 h-20 rounded-full  border-blue-400 shadow" 
                            alt="avatar"
                            /> :        
                            <img src={userData.profilePic} 
                            className="w-20 h-20 rounded-full border-blue-400 shadow" 
                            alt="avatar"
                            />
                        } 
                    </div>
                    <p className="text-xl font-semibold my-3">{userData.name}</p>
                    <p className="text-slate-600">{userData.followers.length} Followers</p>
                    <p className="text-slate-600 text-sm my-5">{userData.bio}</p>
                    
                    {
                        userId == userData._id ? <button 
                         className="bg-green-700 px-8 py-3 rounded-full text-white my-3"> <Link to={"/edit-profile"}> Edit profile</Link>
                         </button> :
                         <button onClick={() => handleFollowCreator(userData._id , token)} 
                         className="bg-green-700 px-8 py-3 rounded-full text-white my-3">follow</button>
                    }                               
                    
                    <div className="my-6 w-full">
                        <h2 className="font-semibold">Following</h2>
                        <div className="my-5">

                            {
                                userData.following.map((user) => (
                                    <div className="flex justify-between items-center">
                                        <Link to={`/@${user.username}`}>
                                            <div className="flex gap-2 items-center hover:underline cursor-pointer">
                                                <div className="">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`} 
                                                    className="w-5 h-5 rounded-full  border-blue-400 shadow" 
                                                    alt="avatar"
                                                    />
                                                </div>
                                                <p className="text-base font-medium my-3">{userData.name}</p>
                                                
                                            </div>
                                        </Link>
                                        <i className="fi fi-rs-menu-dots cursor-pointer"></i>
                                    </div>
                                ))
                            }

                        </div>
                    </div>
                </div>
            </div>
            ) :( <h1>Loading...</h1>)
        }
        
    </div>
  )
}

export default ProfilePage;










