import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import apiError from "../utils/apiError.js";
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log('MONGO_DB connection eastablised ast host: '+connectionInstance.connection.host);
    } catch (error) {
        throw new apiError(400, "FAILED connect database!", error);
    }
}

export default connectDB;