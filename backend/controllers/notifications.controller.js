import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({to: userId}).populate(
            {
                path: "from",
                select: "username profileImg",

            }
        );

        await Notification.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);
    } 
    catch (error) {
        res.status(500).json({message: error.message});
        console.log("error in getNotifications " + error);
    }
}

export const deleteNotifications = async (req, res) => {
    try{
        const userId = req.user._id;
        await Notification.deleteMany({to: userId});

        res.status(200).json({message: "Notifications deleted successfully"});  
    }
    catch( error){
        res.status(500).json({message: error.message});
        console.log("error in deleteNotifications" + error);
    }
}


export const deleteNotification = async (req, res) => {
    try{
        const notificationId = req.params.id;
        const userId = req.user._id;
        const notification = await Notification.findById(notificationId);

        if(!notification){
            return res.status(404).json({message: "Notification not found"});
        }

        if(notification.to.toString() !== userId.toString()){
            return res.status(401).json({message: "You are not authorized to delete this notification"});
        }

        await Notification.findByIdAndDelete(notificationId);
    }
    catch( error){
        res.status(500).json({message: error.message});
        console.log("error in deleteNotification " + error);
    }
}