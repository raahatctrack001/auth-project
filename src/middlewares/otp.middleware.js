import { 
    validateEmail, 
    validateUsername 
} from "../controllers/auth.controller.js";
import { otp } from "../models/otp.model.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const generateAndUpdateOTP = async (email) => {
    const generatedOTP = Math.random().toString().slice(2, 8); // Generate 6-digit OTP
    const newOTP = { generatedOTP };
    const updatedData = await otp.updateOne({ email }, { $push: { otps: newOTP } }, { upsert: true });
    return updatedData;
}


export const addOTP = asyncHandler(async (req, res, next)=>{
    const { usernameOrEmail } = req.body;
    if(!usernameOrEmail){
        throw new apiError(400, "Username or email is required!")
    }
    // console.log(usernameOrEmail)
    let query = {};
    if(validateEmail(usernameOrEmail)){
        query = {email: usernameOrEmail}
    }else{
        if(validateUsername(usernameOrEmail)){
            query = {username: usernameOrEmail}
        }
        else{
            throw new apiError(404, "invalid username!");
        }
    }
    const user = await User.findOne(query);
    if(!user){
        throw new apiError(401, "Unauthorised credentials trying to access!");
    }
    // console.log(user);
    const currentUser = await User.findByIdAndUpdate(user?._id, 
        {
            $set:{
                refreshToken: 1,
            },                
        },
        {
            new: true,
        }
    )?.select("-password");

    if(!currentUser){
        throw new apiError(404, "user doesn't exist!")
    }
    const otpData = await otp.findOne({email: currentUser?.email});
    if(otpData){
        try {
            const email = currentUser?.email;
            const otpData = await generateAndUpdateOTP(email);
            console.log(otpData);
            // console.log(`OTP sent to ${email}:`, otp);
            // Code to send OTP via SMS or email
        } catch (error) {
            console.error('Error generating OTP:', error);
        }
    }
    else{
        //create schema!
        const generateOtp = Math.random().toString().slice(2, 8);
        const newOTP = {generateOtp};
        try {
            const otpData = await otp.create({
                email: currentUser.email,
                $push: {
                    otps: {
                        newOTP
                    }
                }
            })
            console.log(otpData);
        } catch (error) {
            console.log("Failed! ", error.message);
        }
    }
    
    
    
})

