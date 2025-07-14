import { Outlet, Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../utils/userSlice";

function Navbar() {

  const navigate = useNavigate();
  const { token, email , username , profilePic} = useSelector((state) => state.user);

  const [showPopup , setShowPopup] = useState(false);
  const dispatch = useDispatch();
  const [searchQuery , setSearchQuery] = useState(null);


  useEffect(() => {
  if (location.pathname === "/search") {
    setSearchQuery(null);
  }

  return () => {
    if (location.pathname !== "/") {
      setShowPopup(false);
    }
  };
}, [location.pathname]);



  function handleLogout(){
      dispatch(logout());
      setShowPopup(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <nav className=" relative top-0 z-50 w-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg py-3 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-wider drop-shadow-lg">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5V17a2.5 2.5 0 002.5 2.5h11A2.5 2.5 0 0020 17V6.5M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5M4 6.5h16M8 10h8m-8 4h5" />
            </svg>
          </span>
          BlogApp
        </Link>

        <div  className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1 shadow-inner">
          <input
            type="text"
            value={searchQuery ? searchQuery : null}
            onChange={(e )=> setSearchQuery(e.target.value)}
            onKeyDown={(e) => {if(e.code == "Enter"){
                if(searchQuery.trim()){
                    navigate(`/search?q=${searchQuery.trim()}`)
                }  
            }}}
            placeholder="Search blogs..."
            className="bg-transparent outline-none text-white placeholder-white/70 px-2 py-1 w-40 md:w-56"
          />
          <button type="submit" className="text-white hover:text-blue-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-white font-semibold hover:text-blue-200 transition">Home</Link>
          <Link to="/add-blog" className="text-white font-semibold hover:text-blue-200 transition">Add Blog</Link>
          <Link to={`/@${username}`} className="text-white font-semibold hover:text-blue-200 transition">Profile</Link>
          <Link to={"/edit-profile"} className="text-white font-semibold hover:text-blue-200 transition">Edit Profile</Link>

          {/* Auth section */}
          {token ? (

            <div onClick={() => setShowPopup(prev => !prev)} className="flex items-center gap-2 cursor-pointer">
              {
                profilePic ? <img src={profilePic} alt="user" className="w-9 h-9 rounded-full border-2 border-white shadow" />
                : <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email || 'User')}&background=0D8ABC&color=fff`} alt="user" className="w-9 h-9 rounded-full border-2 border-white shadow" />
              }
              
              <span className="text-white font-semibold text-sm hidden md:inline">{email}</span>
            </div>

          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signin" className="bg-amber-500 bg-gradient-to-r text-white font-semibold px-4 py-1 rounded-lg hover:bg-white/30 transition">Sign In</Link>
              <Link to="/signup" className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold px-4 py-1 rounded-lg hover:from-blue-500 hover:to-purple-600 transition">Sign Up</Link>
            </div>
          )}
        </div>

        {
          showPopup ? 
            <div className="w-[150px] bg-gray-50 border right-5 top-15 rounded-xl drop-shadow-xl absolute">
                <Link to={"/setting"}><p className="text-lg py-2 px-3 hover:bg-blue-500 hover:text-white rounded-t-xl cursor-pointer">Settings</p></Link>
                <p onClick={handleLogout} className="text-lg py-2 px-3 hover:bg-blue-500 hover:text-white rounded-b-xl cursor-pointer">Logout</p>
            </div> :
          null
        }

      </nav>
      <div className="flex-1 flex flex-col items-center">
        <Outlet />
      </div>
    </div>
  );
}
  
export default Navbar;
