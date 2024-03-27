import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyOTP = asyncHandler(async(req, res, next)=>{
    console.log(req.body);
    const otp = 0;
    if(!otp){
        throw new apiError(401, "invalid otp");
    }
    console.log("otp verified!");
    req.isVerified = true;
    next();
})