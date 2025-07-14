
const mongoose = require('mongoose');
const { DB_URL } = require('./dotenv.config');
require("dotenv").config(); 

async function dbConnect(){
    try {
        await mongoose.connect(DB_URL);
        console.log("DB connectd successfully...")

    } catch (error) { 
        console.log("Error occured while connecting!!")
        console.log(error.message);
    }
}

module.exports = dbConnect;