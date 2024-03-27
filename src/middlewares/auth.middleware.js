/**
    * extract access token only (access token is responsible for resource access!) from cookie or header! and validate it
    * decode the token to get the details from which token was generated
    * find user by decoded token
    * req.user = currentUser
 */

import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiReponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
export const verifyUser = asyncHandler(async (req, res, next)=>{
    try {
        // console.log(req.cookies?.accessToken);
        // console.log(req.headers?.cookie?.split(";"))
        const cookieFromReq = req.cookies;
        const cookieHeader = req.headers?.cookie;
        const parsedCookie = {};
        if(cookieHeader){
            const cookies = cookieHeader.split(";");
            cookies.forEach(cookie => {
              const [name, value] = cookie?.trim().split("=");
              parsedCookie[name] = value;  
            });
        }
        // throw new apiError(500, "Intentional termination for unit testing!");
        const accessToken = cookieFromReq?.accessToken || parsedCookie?.accessToken;
        
        if(!accessToken){
            throw new apiError(401, "Unauthorised Request!");
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const currentUser = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!currentUser){
            throw new apiError(401, "INVALID access token!");
        }
        req.user = currentUser;
        // console.log(req.user);
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "INVALID access token!");
    }
})