//server file
// all files will be read
const express = require('express')
const cors = require('cors')
const dbConnect = require('./config/dbConnect');
const userRoute = require('./routes/userRoutes')
const blogRoute = require('./routes/blogRoutes');
const cloudinaryConfig = require('./config/cloudinaryConfig');
const { PORT, FRONTEND_URL } = require('./config/dotenv.config');
require("dotenv").config();


const port = PORT || 5000;


const app = express();


// middlewares
app.use(express.json());
app.use(cors({origin : FRONTEND_URL}));//It allows the frontend running at http://localhost:5173 to make HTTP requests (GET, POST, etc.) to this backend.



app.get('/' , (req,res)=>{
    res.send("Hello Guys!!");
})


// **connecting routes using middleware in main server file**
//it gets invoked when there will requests at root path . 
app.use('/api/v1' , userRoute); // mouting routes at root path "/" .-> api versioning all the routes by this.
app.use('/api/v1' , blogRoute);  // or   app.use(blogRoute);


app.listen(port , ()=>{
    console.log("server started...");
    dbConnect();
    cloudinaryConfig();
})
