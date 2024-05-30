import exists from "express";
import User from "../models/user.model.js"; 
import Notification from "../models/notification.model.js";
import bcrypy from "bcryptjs";
import {v2 as cloudinary}  from "cloudinary";


export const getUserProfile = async (req, res) => {
    const {username} = req.params;
    try{
        const user = await User.findOne({username: username}).select("-password");
        if(!user)
        {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);

    }
    catch(error){
        res.status(500).json({error: error.message});
        console.log("Error in getUserProfile" + error.message );
    }

}


export const followUnfollowUser = async (req, res) => {
    try{
        const {id}  = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        // check so that you cannot follow/unfollow yourself
        if(id === req.user._id.toString())
        {
            return res.status(400).json({message: "You can't follow/ unfollow yourself"});
        }

        // check to see id the user/user to follow exists
        if(!userToModify || !currentUser)
        {
            return res.status(404).json({message: "User not found"});
        }

        const isFollowing = userToModify.followers.includes(currentUser._id);   // check if the user is already following the user

        if(isFollowing){
            // unfollow
            await User.findByIdAndUpdate(id, {$pull: {followers: currentUser._id}});
            await User.findByIdAndUpdate(currentUser._id, {$pull: {following: id}});
            res.status(200).json({message: "Unfollowed successfully"});
        }
        else{
            // follow
            await User.findByIdAndUpdate(id, {$push: {followers: currentUser._id}});
            await User.findByIdAndUpdate(currentUser._id, {$push: {following:id}});
            res.status(200).json({message: "Followed successfully"});

            // send notification to user that he has been followed
            const newNotification = new Notification({
                from: currentUser._id,
                to: id,
                type: "follow",
            })

            await newNotification.save();

        }

    }
    catch(error){
        res.status(500).json({error: error.message});
        console.log("Error in followUnfollowUser" + error.message );
    }
}

export const getSuggestedUsers = async (req, res) => {
    try{
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne:userId}
                }
            },
            {
                $sample:{size:10}
            }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);
        suggestedUsers.forEach(user => user.password = null);
        res.status(200).json(suggestedUsers);

    }
    catch(error){
        res.status(500).json({error: error.message});
        console.log("Error in getSuggestedUsers" + error.message );
    }
}  


export const updateUser = async (req, res) => {
    const {username, currentPassword, newPassword} = req.body;
    let{profileImg} = req.body;

    const userId = req.user._id;

    try{
        let user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found"});

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Please enter both current and new password"});
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypy.compare(currentPassword, user.password);
            if(!isMatch){return res.status(400).json({error: "Incorrect password"});}

            if(newPassword.length < 6){return res.status(400).json({error: "Password must be atleast 6 characters long"});}

            const salt = await bcrypy.genSalt(10);
            user.password = await bcrypy.hash(newPassword, salt);
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        user.username = username || user.username;
        user.profileImg = profileImg || user.profileImg;

        user = await user.save();

        user.password = null;
        return res.status(200).json(user);

    }
    catch(error){
        res.status(500).json({error: error.message});
        console.log("Error in updateUser" + error.message );
    }
}