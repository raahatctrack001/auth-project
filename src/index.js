import app from "./app.js";
import connectDB from '../src/database/index.js';
import dotenv from 'dotenv';
import apiError from "./utils/apiError.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,  ()=>{
        console.log(`server is up and running on port ${process.env.PORT}`)
    })
})
.catch(error=>{
    throw new apiError(503, "FAILED to connect database!", error);
})