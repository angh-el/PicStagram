import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


export const signup = async(req, res) => {
    try{
        const {username, password} = req.body;
        
        const existingUser = await User.findOne({username:username})
        if(existingUser){
            return res.status(400).json({error: "Usernaame is already taken"});
        }

        if(password.length < 6){
            return res.status(400).json({error:"Password length must be at least 6 characters long"})
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password:hashedPassword,
        });

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
            })
        }
        else{
            res.status(400).json({error: "Invalid user data"});
        }

    }
    catch(e){
        console.log("error in signup controller ", e.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const login = async(req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username})
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"})
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.username,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
        });

    }
    catch(error){
        console.log("error in login controller ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const logout = async(req, res) => {
    try{
        res.cookie("jwt", "",{maxAge:0});   
        res.status(200).json({message: "Logged out successfully"});
    }
    catch(error){
        console.log("error in logout controller ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};


export const getMe = async(req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }
    catch(error){
        console.log("error in getMe controller ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

