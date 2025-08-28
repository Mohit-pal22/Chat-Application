const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

async function signup(req, res) {
    try{
        const user = await User.findOne({email: req.body.email});
        // user exist send error
        if(user) {
            return res.send({
                message: "User Already Exist", 
                success: false
            })
        }
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashPassword;
        req.body.email = req.body.email.toLowerCase();
        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).send({
            message: "Signup Successfull",
            success: true
        })

    }catch(error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

async function login(req, res) {
    try {
        // check user exist
        const user = await User.findOne({email: req.body.email.toLowerCase()});
        if(!user) {
            return res.send({
            message: "User does not exist",
            success: false
            })
        }
        // validate credentials
        const isValid =  await bcrypt.compare(req.body.password, user.password);
        if(!isValid) {
            return res.send({
                message: "Invalid Credentials",
                success: false
            })
        }

        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: "1d"});
        return res.status(200).send({
            message: "User LogedIn",
            success: true,
            token
        })
    } catch (error) {
        res.send({
            message: error.message,
            success: false
        })
    }
}

module.exports = {signup, login};