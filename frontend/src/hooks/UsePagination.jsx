import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


function UsePagination(path , queryParams = {} , limit = 1 , page = 1 ) {

    const [blogs, setBlogs] = useState([]);
    const [hasMore , setHasMore] = useState(true);

    useEffect(() => {
            async function fetchSearchBlogs(){
                try {
                    let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/${path}` , {
                       params:{ ...queryParams , limit, page} ,
                    });
                    // console.log(res.data);
                    toast.success(res.data.message);
                    setBlogs((prev) => [...prev , ...res.data.blogs])
                    setHasMore(res.data.hasMore);
                } 
                catch (error) {
                  setBlogs([])
                  console.log(error);
                }
            }
            fetchSearchBlogs();
    }, [page]);

    return {blogs,hasMore};
}

export default UsePagination
