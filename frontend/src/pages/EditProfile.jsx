import axios from "axios";
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast";



function EditProfile() {
   const dispatch = useDispatch();
   const {token , id : userId , name ,email , username , profilePic , bio} = useSelector((state) => state.user);
   const [userData , setUserData] = useState({
        profilePic : profilePic,
        username : username,
        name : name,
        bio : bio,
   })

   const [initialData , setInitialData] = useState({
        profilePic ,
        username ,
        name ,
        bio ,
   });

   const [isButtonDisabled , setIsButtonDisabled] = useState(true);

   function handleChange(e){
        const {value , name , files} = e.target;
        if(files){
            setUserData((prevData) => ({...prevData , [name] : files[0]}))
        }
        else setUserData((prevData) => ({...prevData , [name] : value}))
   }


   async function handleUpdateProfile(){
        try {
            setIsButtonDisabled(true);
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("username", userData.username);
        if(userData.profilePic){
            formData.append("profilePic", userData.profilePic);
        }
        formData.append("bio" , userData.bio);

        
        const res = await axios.patch(
            `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                }
            }
        );
        toast.success(res.data.message);
        console.log(res.data.user);
        dispatch(login({...res.data.user, token}));
        console.log("Redux store after login dispatch:", JSON.parse(localStorage.getItem("user")));
        navigate("/");
        console.log(res);
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
        finally{
            
        }

   }


   useEffect(() => {
        if(initialData){
            const isEqual =  JSON.stringify(userData) ==  JSON.stringify(initialData);
            setIsButtonDisabled(isEqual);
        }
   } , [userData , initialData]);

  return (
    <div className="w-full">
        <div className="w-[35%] mx-auto my-10 px-10">
            <h1 className="text-center text-4xl my-4">Edit Profile</h1>
            <div>
            <div className="">
                <label htmlFor="image" className="block  text-lg font-semibold text-gray-700 mb-2 cursor-pointer">
                Photo
                <div className="mt-2  bg-blue-200 w-[150px] h-[150px] aspect-square  border-2 border-dashed border-blue-400 rounded-full flex justify-center items-center text-2xl text-blue-300 hover:bg-blue-100 transition cursor-pointer overflow-hidden">
                    { userData?.profilePic
                    ? (typeof userData.image === "string"
                        ? <img src={userData.profilePic} alt="" className="object-cover w-[150px] h-[150px] aspect-square rounded-full" />
                        : <img src={URL.createObjectURL(userData.profilePic)} alt="" className="w-full h-full object-cover" />)
                    : <span>Select Image</span>
                    }
                </div>   
                </label>
                <input
                    className="hidden"
                    id="image"
                    name="profilePic"
                    accept=".png, .jpeg, .jpg"
                    type="file"
                    onChange={handleChange}
                />
          </div>
            <div className="my-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2">Name</label>
                <input
                name="name"
                default={userData.name}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
                type="text"
                placeholder="name"
                onChange={handleChange}
                required
                />
            </div>
             <div className="my-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2">Username</label>
                <input
                name="username"
                default={userData.username}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
                type="text"
                placeholder="username"
                onChange={handleChange}
                required
                />
            </div>
             <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                name="bio"
                default={userData.bio}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg min-h-[120px] resize-none"
                placeholder="bio..."
                onChange={handleChange}
                required
                />
                </div>
                <button 
                    disabled={isButtonDisabled}
                    onClick={handleUpdateProfile}
                    className={` px-8 py-3 rounded-full text-white my-3 ${isButtonDisabled ? "bg-green-200" : "bg-green-700"}`}>Update
                </button>
            </div>
        </div>
    </div>
  )
}

export default EditProfile
