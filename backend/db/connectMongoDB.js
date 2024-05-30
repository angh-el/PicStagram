import mongoose from "mongoose";

const connectMongoDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(e){
        console.error(`Error connection ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;