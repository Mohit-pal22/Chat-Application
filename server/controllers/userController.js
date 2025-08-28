const User = require('../models/user');
const cloudinary = require("../cloudinary");

async function getLogedInUser(req, res) {
    try {
        const user = await User.findOne({_id: req.userId});
       
        res.status(200).send({
            message: "User Fetch Successfully",
            success: true,
            data: user
        });
    } catch (error) {
        res.send({
            message: error.message,
            success: false
       }) 
    }
}

async function getAllUsers(req, res) {
    try {
        const userId = req.userId;
        const users = await User.find({_id: {$ne: req.userId}});
       
        res.status(200).send({
            message: "All users Fetch Successfully",
            success: true,
            data: users
        });
    } catch (error) {
            res.send({
            message: error.message,
            success: false
       }) 
    }
}

async function uploadProfilePic(req, res) {
    try{
        const image = req.body.image;

        //UPLOAD THE IMAGE TO CLODINARY
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: 'chat-app'
        });

        //UPDATE THE USER MODEL & SET THE PROFILE PIC PROPERTY
        const user = await User.findByIdAndUpdate(
            {_id: req.userId},
            { profilePic: uploadedImage.secure_url},
            { new: true}
        );

        res.send({
            message: 'Profic picture uploaded successfully',
            success: true,
            data: user
        })
    }catch(error){
        res.send({
            message: error.message,
            success: false
        })
    }
}
module.exports = {getLogedInUser, getAllUsers, uploadProfilePic};