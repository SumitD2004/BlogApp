import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DisplayBlog from "./DisplayBlog";
import toast from "react-hot-toast";
import UsePagination from "../hooks/UsePagination";



function SearchBlogs() {

  const [searchParams , setSearchParams] = useSearchParams();
  const [page , setPage] = useState(1);
  const q = searchParams.get("q");


  
  const {blogs , hasMore} = UsePagination("search-blogs" , {search : q} , 1 , page);
    


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-12 px-4">
        <h1 className="my-20 text-4xl text-gray-500 font-bold">Results for <span className="text-black">{q}</span></h1>
        {
           hasMore &&  <button onClick={() => setPage((prev)=> prev+1)} className="rounded-3xl bg-blue-500 text-white px-7 py-3  ml-100">Load more...</button>
        }
    </div>
  )
}

export default SearchBlogs;
