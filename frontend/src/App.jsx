
import {Route,Routes} from "react-router-dom";
import AuthForm from "./pages/AuthForm";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AddBlog from "./pages/AddBlog";
import BlogPage from "./pages/BlogPage";
import VerifyUser from "./components/VerifyUser";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import SearchBlogs from "./components/SearchBlogs";
import Setting from "./components/Setting";


function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="add-blog" element={<AddBlog />} />
          <Route path="blog/:id" element={<BlogPage />} />
          <Route path="edit/:id" element={<AddBlog />} />
          <Route path="/:username" element={<ProfilePage/>} />
          <Route path="/edit-profile" element={<EditProfile/>} />
          <Route path="/search" element={<SearchBlogs/>} />
        </Route>
        <Route path="/signin" element={<AuthForm type={"signin"} />} />
        <Route path="/signup" element={<AuthForm type={"signup"} />} />
        <Route path="/verify-email/:verificationToken" element={<VerifyUser/>} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </div>
  );
}

export default App;
