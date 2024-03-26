import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
import apiError from "../utils/apiError.js";
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log('MONGO_DB connection eastablised ast host: '+connectionInstance.connection.host);
    } catch (error) {
        console.log("FAILED to connect database!")
    }
}

export default connectDB;