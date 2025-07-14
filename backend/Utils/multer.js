
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // doesn't store images on server directly sends to cloudinary.  

const upload = multer({
    storage,
})


module.exports = upload;