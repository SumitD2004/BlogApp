
require("dotenv").config();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../config/dotenv.config");

async function generateJWT(payload){
    let token =  await jwt.sign(payload , JWT_SECRET , {expiresIn : '7d'} ); // sign(payload,secretKey,algorithm);
    return token;
}

async function verifyJWT(token){
    try {
        let data =  jwt.verify(token , JWT_SECRET ); // sign(payload,secretKey,algorithm);
        return data;
    } 
    catch (error) {
        console.error("JWT verification error:", error);
        return false;
    }
}

async function decodeJWT(token){
    try {
        let decoded = await jwt.decode(token);
        return decoded;
    } 
    catch (error) {
        return false;
    }
}

module.exports = {generateJWT,verifyJWT,decodeJWT};