const { verifyJWT } = require("../Utils/generateToken");


const verifyUser = async (req,res,next) =>{  // middleware
    let token = req.headers.authorization.split(" ")[1]; 
    // console.log(token)
    if(!token){
        return res.status(400).json({
            success : false,
            message : "Please signin"
        })
    }

    try { // always look for expiration of token
        // console.log(token)
        let user = await verifyJWT(token);
        // console.log(user)
        if(!user){
            return res.status(400).json({
                success : false,
                message : "Please signin"
            })
        }
        req.user = user.id;
        // console.log(req.user)
        next();
    } catch (error) {
        console.log(error)
    }
}

module.exports = verifyUser;