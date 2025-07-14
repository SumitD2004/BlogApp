import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import EditorJS from '@editorjs/editorjs';
import Header from "@editorjs/header";
import List from "@editorjs/list";
import NestedList from "@editorjs/nested-list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";


function AddBlog() {

  const editorjsRef = useRef(null);

  const navigate = useNavigate();
  const {id} = useParams();
//   const token = JSON.parse(localStorage.getItem("token"));
  const [blogData , setBlogData] = useState({title : "" , description : "" , image : null , content : ""});

  const formData = new FormData();// we use this to send images and text together to backend

  const {token} = useSelector(slice => slice.user);
  const {title,description,image , content} = useSelector(slice => slice.selectedBlog);

  async function fetchBlogById(){

        // try {
        //     let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
        //     console.log(res);
        //     setBlogData({
        //         title : res.data.blog.title,
        //         description : res.data.blog.description,
        //         image : res.data.blog.image,
        //     });
        // } 
        // catch (error) {
        //     toast.error(error.response.data.message);
        //     console.log(error);
        // }

        setBlogData({
                title : title,
                description : description,
                image : image,
                content: content && typeof content === "object" && Array.isArray(content.blocks) ? content : { blocks: [] }
            });
           
    }


    useEffect(()=>{
        if(id){
            fetchBlogById();
        }
    }, []);


    async function handleUpdateBlog(){
      // console.log(blogData)
      try {
        const formData = new FormData();
        formData.append("title", blogData.title);
        formData.append("description", blogData.description);
        formData.append("image", blogData.image);
        formData.append("content" , JSON.stringify(blogData.content));

        let existingImages = [];
        blogData.content.blocks.forEach((block) =>{
            if(block.type=="image"){
                if(block.data.file.image){
                    formData.append("images", block.data.file.image);
                }
                else{
                    existingImages.push({
                        url : block.data.file.url,
                        imageId : block.data.file.imageId,
                    })
                }
                
            }
        })


        // for(let data of formData.values()){
        //     console.log(data);
        // }

        formData.append("existingImages" , JSON.stringify(existingImages));

  
        // Only append image if it's a File (not a string URL)
        // if (blogData.image && typeof blogData.image !== "string") {
        //     formData.append("image", blogData.image);
        // }
        const res = await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                }
            }
        );
        toast.success(res.data.message);
        navigate("/");
        console.log(res);
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        }
    }


    async function handlePostBlog(){
        // console.log(blogData)
        formData.append("title", blogData.title);
        formData.append("description", blogData.description);
        formData.append("image", blogData.image);
        formData.append("content", JSON.stringify(blogData.content));// converts object to string


        blogData.content.blocks.forEach((block) =>{
            if(block.type=="image"){
                formData.append("images", block.data.file.image);
            }
        })

        

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs` ,
                formData,
                {
                    headers : { // we added headers because we want to send token 
                        "Content-Type" : "multipart/form-data",
                        "Authorization" : `Bearer ${token}`,
                    }
                }
            );
            toast.success(res.data.message);
            navigate("/");
            console.log(res);
        } 
        catch (error) {
            // console.log(error);
            toast.error(error.response.data.message);
        }
        //URL.createObjectURL(blogData.image) -> is used to create an url of an image
  }


  function initializeEditorjs() {
  // Defensive: always provide a valid EditorJS data object
    // const initialData =
    //   blogData.content && typeof blogData.content === "object" && Array.isArray(blogData.content.blocks)
    //     ? blogData.content
    //     : { blocks: [] };

    const editorjs = new EditorJS({
      holder: "editorjs",
      placeholder: "write something..",
      data: content, // <-- always valid!
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a heading...",
            levels: [1, 2, 3, 4],
            defaultLevel: 3,
          }
        },
        List: {
          class: List,
          inlineToolbar : true,

        },
        code : {
            class : CodeTool,
        },
        marker : {
          class : Marker,
        },
        underline : {
          class : Underline,
        },
        embed : { // u can paste link of any video.
          class : Embed,
        },
        image :{
          class : ImageTool,
          config : {
            uploader : {
                uploadByFile : async (image) =>{
                  // console.log(image)
                    return {
                        success : 1,
                        file : {
                            url : URL.createObjectURL(image),
                            image,
                        },
                    }
                }
            }
          }
        }
      },
      onChange: async () => {
        let data = await editorjs.save();
        setBlogData((blogData) => ({ ...blogData, content: data }));
      }
    });
    editorjsRef.current = editorjs;
}
  //taking an instance of editor
   

  useEffect(()=>{
    if(editorjsRef.current == null){
        initializeEditorjs();
    }
    
    // return () =>{ // on leaving this component return will get executed
    //     if (editorjsRef.current && typeof editorjsRef.current.destroy === "function") {
    //         editorjsRef.current.destroy();
    //     }
    //     editorjsRef.current = null;
    // }
  } , []);
  


  return (
    <div className="min-h-screen w-[500px] flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-2 md:px-0">
      {token == null ? (
        <Navigate to={"/signin"} />
      ) : (
        <form className="bg-white/90 p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-8 border border-blue-100 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6 drop-shadow">{id ? "Update Blog" : "Create Blog"}</h2>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
            <input
              value={blogData.title}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
              type="text"
              placeholder="Title"
              onChange={e => setBlogData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={blogData.description}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg min-h-[120px] resize-none"
              placeholder="Description"
              onChange={e => setBlogData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-lg font-semibold text-gray-700 mb-2 cursor-pointer">
              Blog Image
              <div className="mt-2 aspect-video bg-blue-100 border-2 border-dashed border-blue-300 rounded-xl flex justify-center items-center text-2xl text-blue-400 hover:bg-blue-200 transition cursor-pointer overflow-hidden">
                {blogData.image
                  ? (typeof blogData.image === "string"
                    ? <img src={blogData.image} alt="" className="w-full h-full object-cover" />
                    : <img src={URL.createObjectURL(blogData.image)} alt="" className="w-full h-full object-cover" />)
                  : <span>Select Image</span>
                }
              </div>   
            </label>
            <input
              className="hidden"
              id="image"
              accept=".png, .jpeg, .jpg"
              type="file"
              onChange={e => setBlogData(prev => ({ ...prev, image: e.target.files[0] }))}
            />
          </div>
          <br />  

          <div id="editorjs"></div>

          <button
            type="button"
            onClick={id ? handleUpdateBlog : handlePostBlog}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all text-xl mt-4"
          >
            {id ? "Update Blog" : "Post Blog"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddBlog;













