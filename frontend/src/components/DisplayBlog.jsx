import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import { useSelector } from "react-redux";
import { handleSaveBlog } from "../pages/BlogPage";



function DisplayBlog({blogs}) {


   const {token , id : userId} = useSelector((state)=> state.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map(blog => (
          <Link to={"/blog/" + blog.blogId} key={blog.blogId} className="block group">
            <div className="bg-white/90 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow border border-blue-100 flex flex-col h-full min-h-[500px]">
              <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(blog.creator.name)}&background=0D8ABC&color=fff`} className="w-8 h-8 rounded-full border-2 border-blue-400 shadow" alt="avatar" />
                  <span className="text-sm text-blue-700 font-semibold">{blog.creator.name}</span>
                </div>
                <h2 className="font-bold text-2xl mb-1 text-gray-900 group-hover:text-blue-700 transition-colors">{blog.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{blog.description}</p>
                <div className="flex gap-4 text-gray-500 text-sm mt-auto">
                  <span className="flex items-center gap-1"><i className="fi fi-sr-calendar"></i>{formatDate(blog.createdAt)}</span>
                  <span className="flex items-center gap-1"><i className="fi fi-sr-thumbs-up"></i>{blog.likes.length}</span>
                  <span className="flex items-center gap-1"><i className="fi fi-sr-comment-alt"></i>{blog.comments.length}</span>
                  <div onClick={(e) => {
                                e.preventDefault();
                                handleSaveBlog(blog._id , token);
                                }}  
                                className="flex text-sm  items-center gap-1 cursor-pointer">
                                    {
                                        blog?.totalSaves?.includes(userId) ?
                                            <i className="fi fi-sr-bookmark text-sm"></i> :
                                            <i className="fi fi-rr-bookmark text-sm" />
                                    }
                                
                                {blog.comments.length}
                            </div>
                </div>
                <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition">Read More</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DisplayBlog
