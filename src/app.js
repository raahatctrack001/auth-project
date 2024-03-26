import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config({path:'./.env'});
const app = express();
//configure incoming data;

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(cors({origin: process.env.CORS_ORIGIN}));
app.use(cookieParser());
app.use(express.static("public"));


export default app;