import express from "express";
import dotenv from "dotenv"

import notificationRoutes from "./routes/notification.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";

import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary}  from "cloudinary";

dotenv.config();  

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5050;


app.use(express.json({limit:"5mb"}));    //to prse request.body
app.use(express.urlencoded({extended: true}));  // to parse form data (url encoded)

app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(PORT, () =>{
    console.log("server is running on port " + PORT)
    connectMongoDB();
})
