import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config({path:'./.env'});
const app = express();
//configure incoming data;

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(cors({origin: process.env.CORS_ORIGIN, credentials:true}));
/*Calling use(cors()) will enable the express server to respond to preflight requests.
A preflight request is basically an OPTION request sent to the server before the actual request is sent, 
in order to ask which origin and which request options the server accepts.
So CORS is basically a set of headers sent by the server to the browser. 
Calling cors() without any additional information will set the following defaults:
{
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}
*/

/* 
credentials: true: This option in the cors middleware indicates whether the server should include 
any cookies or authorization headers with the requests. When set to true, it allows the server to respond to 
requests with credentials such as cookies, HTTP authentication, and client-side SSL certificates.
*/
app.use(cookieParser());
app.use(express.static("public"));


//router import
import authRouter from './routes/auth.route.js';

app.use('/api/v1/auth', authRouter);






export default app;