import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DisplayBlog from "./DisplayBlog";
import UsePagination from "../hooks/UsePagination";



function Home() {
  
  const {token , id : userId} = useSelector((state)=> state.user);
  const [page , setPage] = useState(1);

  const {blogs , hasMore} = UsePagination("blogs" , {} , 1 , page);

  // async function fetchBlogs() {
  //   const params = { page , limit : 1 }; // we are passing the parameters for **pagination**
  //   let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs` ,
  //     {
  //       params,
  //     }
  //   );
  //   setBlogs((prev) => [...prev , ...res.data.blogs]);
  //   setHasMore(res.data.hasMore);
  // }

  // useEffect(() => {
  //   fetchBlogs();
  // }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-12 px-4">
        {
          blogs.length > 0 &&   <DisplayBlog blogs={blogs}/>
        }
        {
           hasMore &&  <button onClick={() => setPage((prev)=> prev+1)} className="rounded-3xl bg-blue-500 text-white px-7 py-3  ml-100">Load more...</button>
        }
    </div>
  );
}

export default Home;
