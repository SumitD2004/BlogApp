import { useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


function VerifyUser() {
    const {verificationToken} = useParams();
    // console.log(verificationToken);
    const navigate = useNavigate();
    useEffect(() =>{
        async function verifyUser(){
          try {
              const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/verify-email/${verificationToken}`);
              console.log(res)
              toast.success(res.data.message);
          } 
          catch (error) {
              toast.error(error?.response?.data?.message || "Something went wrong");
          }
          finally{
              navigate("/signin");
          }
            
        }

        verifyUser();

    } ,[verificationToken]);
  return (
    <div>
        Verify user
    </div>
  )
}

export default VerifyUser;
