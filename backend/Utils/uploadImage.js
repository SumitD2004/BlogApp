
const cloudinary = require('cloudinary').v2;

async function uploadImage(imagePath){

    const result = await cloudinary.uploader.upload(imagePath , {
        folder : "blog app", // cloudinary pe ek blog app naam ka folder banega jisme sari images store hogi.
    });

    // console.log(result);
    return result;
}


async function deleteImageFromCloudinary(imageId){
    try {
        const result = await cloudinary.uploader.destroy(imageId);// deletes image from cloudinary
    } catch (error) {
        console.log(error)
    }
}


module.exports = {uploadImage,deleteImageFromCloudinary};