import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { addSelectedBlog, removeSelectedBlog , changeLikes} from "../utils/selectedBlogSlice";
import { setIsOpen } from "../utils/commentSlice";
import Comment from "../components/Comment";
import { formatDate } from "../utils/formatDate";




export async function handleSaveBlog(id , token){
    // console.log(id , token);
        try {
            let res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/save-blog/${id}`,
                {},
                {
                    headers : {
                        Authorization : `Bearer ${token}`,
                    },
                }
            );
            
            toast.success(res.data.message);
        } 
        catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
            // console.log(error);
        }       
}


export async function handleFollowCreator(id , token){
    try {
            let res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/follow/${id}`,
                {},
                {
                    headers : {
                        Authorization : `Bearer ${token}`,
                    },
                }
            );
            toast.success(res.data.message);
        } 
        catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
            // console.log(error);
        }  
}



function BlogPage() {

    const {id} =  useParams();
    // const location = useLocation();
    const dispatch = useDispatch();
    // console.log(id);
    const [blogData , setBlogData] = useState(null)
    const [isLike , setIsLike] = useState(false);
    const [isFollow , setIsFollow] = useState(false);
    // const user = JSON.parse(localStorage.getItem("user"));

    const {token , email , id : userId} = useSelector((state)=> state.user);
    const {likes , comments , content} = useSelector((state) => state.selectedBlog);
    const {isOpen} = useSelector((state) => state.comment)


    async function fetchBlogById(){

        try {
            let {data : {blog}} = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${id}`);
            // console.log(res);
            setBlogData(blog);
            if(blog.likes.includes(userId)){
                setIsLike((prev) => !prev);
            }
            dispatch(addSelectedBlog(blog));
        } 
        catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
            // console.log(error);
        }
           
    }

    async function handleLike(){
        
        if(token){
            setIsLike((prev) => !prev);
            let res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/like/${blogData._id}`,{},
                {
                    headers : {
                        Authorization : `Bearer ${token}`
                    }
                }
            );

            dispatch(changeLikes(userId));
            toast.success(res.data.message);
        }
        else{
            toast.error("Please signin for liking this post");
        }

    }


    useEffect(()=>{
        fetchBlogById();
        return ()=>{
            dispatch(setIsOpen(false)) // page leave karne par bhi comments off hona chahiye.

            // console.log(window.location.pathname);// current path    
            // console.log(location.pathname); // previous path
            if(window.location.pathname != `/edit/${id}`){
                dispatch(removeSelectedBlog());
            }
            
        }
    }, [id]);

   

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex justify-center items-start py-12 px-2 md:px-0">
            {blogData ? (
                <div className="w-full max-w-3xl bg-white/90 rounded-3xl shadow-2xl p-10 animate-fade-in border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div className="my-5">
                            <h1 className="font-extrabold text-5xl md:text-6xl text-gray-900 mb-3 leading-tight drop-shadow-xl tracking-tight">{blogData.title}</h1>
                            <div className="flex items-center gap-4 mt-3 my-5">
                               
                                <div>
                                    <div className="flex gap-3">
                                    <Link to={`/@${blogData.creator.username}`}><div className="flex gap-3">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(blogData.creator.name)}&background=0D8ABC&color=fff`} alt="avatar" className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-md" />
                                            <h2 className="text-xl mt-2 font-semibold hover:underline cursor-pointer text-blue-700">{blogData.creator.name}</h2>
                                        </div></Link>
                                        <p className="mt-2">.</p>
                                        <p onClick={() =>{ handleFollowCreator(blogData.creator._id , token) && setIsFollow(!isFollow)}} className=" text-xl mt-2 font-medium text-green-300 cursor-pointer">
                                            {   
                                                !isFollow && !blogData?.creator?.followers?.includes(userId) ? 
                                                "Follow" :
                                                "Following" 
                                            }
                                        </p>
                                    </div>
                                    <div className="">
                                        <span className=" ml-15">6 min read</span>
                                        <span className="mx-3">{formatDate(blogData.createdAt)}</span>  
                                    </div>
                                </div>
 
                            </div>
                        </div>

                        {token && email == blogData.creator.email && (
                            <Link to={"/edit/" + blogData.blogId}>
                                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl shadow-xl text-xl font-bold transition-all duration-200 mt-6 md:mt-0 border-2 border-blue-300 hover:border-purple-400">
                                    <span className="inline-flex items-center gap-2"><i className="fi fi-rr-edit text-lg"></i>Edit</span>
                                </button>
                            </Link>
                        )}
                    </div>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-10 border border-blue-200">
                        <img src={blogData.image} alt="Blog visual" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-800 mb-10 bg-blue-50/40 rounded-xl p-6 shadow-inner border border-blue-100">
                        <p className="text-lg leading-relaxed">{blogData.description}</p>
                    </div>
                    <div className="flex gap-12 items-center border-t pt-8 mt-8">
                        <div className="flex items-center gap-4 cursor-pointer group select-none">
                            {isLike ? (
                                <i onClick={handleLike} className="fi fi-sr-thumbs-up text-blue-600 text-4xl group-hover:scale-110 transition-transform drop-shadow"></i>
                            ) : (
                                <i onClick={handleLike} className="fi fi-rr-social-network text-gray-400 text-4xl group-hover:text-blue-400 group-hover:scale-110 transition-transform drop-shadow"></i>
                            )}
                            <span className="text-2xl font-bold text-gray-700 group-hover:text-blue-600">{likes.length}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <i onClick={() => dispatch(setIsOpen())} className="fi fi-sr-comment-alt text-purple-500 text-4xl"></i>
                            <span className="text-2xl font-bold text-gray-700">{comments.length}</span>
                            <div onClick={(e) => {
                                handleSaveBlog(blogData._id , token);
                                }}  
                                className="px-5 flex text-2xl font-bold items-center gap-1 cursor-pointer">
                                    {
                                        blogData?.totalSaves?.includes(userId) ?
                                            <i class="fi fi-sr-bookmark text-3xl"></i> :
                                            <i className="fi fi-rr-bookmark text-3xl" />
                                    }
                                
                                {comments.length}
                            </div>
                        </div>
                    </div>
                    {
                        isOpen && <Comment/>
                    }

                    <div className="my-10">
                        {
                            content.blocks.map((block) => {
                                if(block.type == "header"){
                                    if(block.data.level == 1){
                                        return <h1 className="font-bold text-5xl my-4 " dangerouslySetInnerHTML={{__html : block.data.text}}></h1>
                                    }
                                    else if(block.data.level == 2){
                                        return <h2 className="font-bold text-4xl my-4" dangerouslySetInnerHTML={{__html : block.data.text}}></h2>
                                    }
                                    else if(block.data.level == 3){
                                        return <h3 className="font-bold text-3xl my-4" dangerouslySetInnerHTML={{__html : block.data.text}}></h3>
                                    }
                                    else if(block.data.level == 4){
                                        return <h4 className="font-bold text-2xl my-4" dangerouslySetInnerHTML={{__html : block.data.text}}></h4>
                                    }
                                }
                                else if(block.type == "paragraph"){
                                    return <p className="text-xl my-4" dangerouslySetInnerHTML={{__html : block.data.text}}></p>
                                }
                                else if(block.type == "image"){
                                    return(
                                        <div className="my-4">
                                            <div className="flex justify-center items-center"><img className="" src={block.data.file.url} alt="" /></div>
                                            <p className="text-center my-2">{block.data.caption}</p>
                                        </div>
                                    ) 
                                    
                                }
                                else if(block.type === "List") {
                                    return (
                                        <ul className="list-disc pl-5">
                                        {block.data.items.map((item, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: item.content }} />
                                        ))}
                                        </ul>
                                    );
                                }
                            })
                        }
                    </div>
                    
                </div>
            ) : (
                <div className="w-full max-w-2xl flex justify-center items-center h-96">
                    <h1 className="text-4xl font-extrabold text-blue-300 animate-pulse tracking-wider">Loading...</h1>
                </div>
            )}
            
        </div>
    );
}

export default BlogPage;





