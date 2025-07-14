import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {useDispatch} from "react-redux";
import { login } from "../utils/userSlice";
import { googleAuth } from "../utils/firebase";

function AuthForm({type}) { // receiving props
  const [userData , setUserData] = useState({name : "" , email : "" , password : ""});
  const navigate  = useNavigate();

  const dispatch = useDispatch();

      // console.log(type);
      async function handleAuthForm(e){
          e.preventDefault();
          try {
              // const data = await fetch(`http://localhost:3000/api/v1/${type}` , {
              //     method : "POST",
              //     body : JSON.stringify(userData),
              //     headers :{
              //         "Content-Type" : "application/json",
              //     }
              // })

              // const res = await data.json();
              // console.log(res)

              // or using axios

              const res = await axios.post(`http://localhost:3000/api/v1/${type}` , userData); // sends http post req and receive a response
              // console.log(res);

              if(type=="signup"){
                  toast.success(res.data.message);
                  navigate("/signin");
              }
              else{
                  dispatch(login(res.data.user));
                  toast.success(res.data.message);
                  navigate("/")
              }

          } 
          catch (error) {
            toast.error(error.response.data.message);
              console.log(error)
          }
          finally{
            setUserData({
              name : "",
              email : "",
              password : "",
            })
          }
      }


      async function handleGoogleAuth(){
          try {
              let data = await googleAuth();
              const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth` , {
                accessToken : data.accessToken,
              },
            );
            console.log(res);
            dispatch(login(res.data.user));
            toast.success(res.data.message);
            navigate('/');
          } 
          catch (error) {
              console.log(error);
              toast.error(error.response.data.message);
          }
      }
  


      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-2 md:px-0">
          <form className="bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-8 border border-blue-100 animate-fade-in flex flex-col items-center transition-all duration-300" onSubmit={handleAuthForm} autoComplete="off">
            <div className="flex flex-col items-center w-full mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mb-2 shadow-lg">
                <i className="fi fi-rr-user text-white text-3xl"></i>
              </div>
              <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-2 drop-shadow">{type === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
            </div>
            {type === "signup" && (
              <input
                onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                type="text"
                placeholder="Name"
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
                required
              />
            )}
            <input
              autoComplete="new-email"
              onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
              required
            />
            <input
              autoComplete="new-password"
              onChange={e => setUserData(prev => ({ ...prev, password: e.target.value }))}
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-lg"
              required
            />
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all text-xl mt-4">
              {type === 'signup' ? 'Register' : 'Login'}
            </button>



            <div className="w-full flex items-center my-2">
              <div className="flex-1 h-px bg-blue-200"></div>
              <span className="mx-3 text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-blue-200"></div>
            </div>



            <div onClick={handleGoogleAuth} className="bg-blue-50  w-full p-5 rounded-2xl gap-2 flex justify-center border hover:bg-blue-200 cursor-pointer">
                <p className="text-2xl font-semibold">Continue with </p>
                <div><img src="/googleIcon.svg" alt="" className="w-8 h-8 object-contain " /></div>
            </div>



            <div className="w-full text-center mt-2 text-gray-600">
              {type === "signin" ? (
                <span>Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link></span>
              ) : (
                <span>Already have an account? <Link to="/signin" className="text-blue-600 font-semibold hover:underline">Sign in</Link></span>
              )}
            </div>
          </form>
        </div>
      );
}

export default AuthForm;
