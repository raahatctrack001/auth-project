import apiError from "../utils/apiError.js";
import apiResponse from '../utils/apiReponse.js'
import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { otp } from "../models/otp.model.js";
import nodemailer from 'nodemailer';
import { verify } from "crypto";

/********************* Time to Learn RegEx **************************/
// Username validation: alphanumeric characters and underscores allowed, length between 5 and 20 characters
export const  validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    return usernameRegex.test(username);
}

// Email validation using a regular expression
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation: at least 8 characters long, at least one uppercase letter, one lowercase letter, one number, and one special character
// Password validation function
const validatePassword = (password) => {
    // Regular expression for password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

const validateCredentials = (username, email, password, confirmPassword)=>{
    if (
        [email, username, password, confirmPassword].some(field => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }
    
    //validate username
    if(!validateUsername(username)){
        throw new apiError(400, "Username can only contain alphabets, digits and underscore, must lie between 5 to 20 characters")        
    }
    
    //Validate Email
    if(!validateEmail(email)){
        throw new apiError(400, "INVALID! E-mail!")
    }

    //Validate password
    if(!validatePassword(password)){
        throw new apiError(400, "Password must be at least 8 characters consisting of letters (uppercase and lowercase), digits, and the only one among specified (@, $, !, %, *, ?, &) special characters.")
    }

    if(password !== confirmPassword){
        throw new apiError(400, "Password didn't match!");
    }
}

//for proper functioning of api error, function should be inside async handler

/** 
 * Registration ToDo's
    * Extract credentials from req.body
    * Validate them to find descrepancies, if found any! throw an error
    * check if user with same credentials exists, if yes throw an error
    * now create a new user and save it to database
    * get the created user by id remove sensitive credentials like password and refersh token
    * send the status 
 **/
const generateAccessAndRefreshToken = async(userId) => {
    try{
        const currentUser = await User.findById(userId); //whenever there's a communication between data base ASYNC AWAIT is mendatory otherwise you will end up your whole day finding bugs
        const accessToken = currentUser.generateAccessToken();
        const refreshToken = currentUser.generateRefreshToken();
        currentUser.refreshToken = refreshToken; //for refreshing the token once access token in expired
       

        currentUser// Save or update the user document in the database
        .save()
        .then(savedUser => {
            console.log('Tokens generated and added successfully!');
          })
        .catch(err => {
            console.error('Error saving user:', err);
          });
        return {accessToken, refreshToken};
    }catch(error){
        throw new apiError(500, 'something went wrong while generatign access and refresh token');
    }
}

const options = {
    httpOnly: true,
    secure: true
}

export const registerUser = asyncHandler(async (req, res, next)=>{
    const {username, email, password, confirmPassword} = req.body;
    // console.log(req.body)

    // throw new apiError(500,"intentional termination for unit testing!");
    validateCredentials(username, email, password, confirmPassword);
    
    const getUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(getUser){
        throw new apiError(409, "User with this credentials already exists!");
    }

    const newUser = await User.create({
        username,
        email,
        password
    });
    

    /*
        The error message "MongoServerError: Cannot do exclusion on field password in inclusion projection" 
        typically occurs when you are trying to perform a query in MongoDB that includes both inclusion and exclusion 
        projections on the same field, especially when dealing with sensitive information like passwords. 
    */
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if(!createdUser){
        throw new apiError(500, "FAILED to register your account!, plz try again later.")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, "Registration successfull!", createdUser)
    );   
    
});


/*
 * Login ToDo's:
    * Extracti Credentials from from data
    * validate them and send proper error if found any!
    * check if user exits! either by email or username in one single field!
    * match password
    * if found generate access and refresh token
    * set them to cookie and 
    * send successful response with suitable data!
*/

export const loginUser = asyncHandler(async(req, res, next)=>{
 const { usernameOrEmail, password } = req.body;
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
    
        const currentUser = await User.findOne(query); //query is already an object bro! no need to pass as {query}
        if(!currentUser){
            throw new apiError(404, "User doesn't exist");
        }
        // console.log(currentUser)
        const isPasswordValid = await currentUser.isPasswordCorrect(password);
        // console.log(isPasswordValid)
    
        if(!isPasswordValid){
            throw new apiError(404, "INVALID credentials!");
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(currentUser?._id);
        const loggedInUser = await User.findById(currentUser?._id).select("-password -refreshToken");
        console.log(loggedInUser);
        
        // throw new apiError(500, "intentional termination for unit testing!");
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, "Login Successful!", {user: loggedInUser, accessToken, refreshToken})
        );   
})


/*
 * ToDo's for Logout User:
    * update database by resetting refresh token!
    * clear refresh and access token
*/
export const logoutUser = asyncHandler(async(req,res, next)=>{
    // throw new apiError(500, "intentional termination for unit testing");
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refreshToken:1
            }
        }, 
        {
            new: true, //returns updates value
        }
    )
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200, "Logout SUCCESS!")
    );
})

/*
 * To Do's for forgot password
    * extract email/username or mobile: check if user exists
    * if exists first clear all tokens refresh and access
    * verify user using otp from email or phonenumber or other mechanis
    * extract data from data base and req.user = requestedUser
    * validate password
    * find and update in databse
    * send response  
 */
// export const resetPassword = asyncHandler(async (req, res, next)=>{
//     const { password, confirmPassword } = req.body;
// })


/**
 * To Do's for change password:
    * use middleware to get current user
    * check if old password matches with existing record else vaidate it
    * check if password and confirm password mathes else validate it
    * now check if password is abidind criteria
    * find user and update it
    * save the data, it will automatically hash it as we had already injected hook pre!
 */
export const changeCurrentPassword = asyncHandler(async (req, res, next)=>{
    console.log(req.body)
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(newPassword !== confirmPassword){
        throw new apiError(404, "password didnot match!");
    }
    
    // console.log(password === confirmPassword);
    if(!validatePassword(newPassword)){
        console.log(newPassword)
        throw new apiError(400, "Password must be at least 8 characters consisting of letters (uppercase and lowercase), digits, and the only one among specified (@, $, !, %, *, ?, &) special characters.")
    }
    const hashedPassword = bcryptjs.hashSync(newPassword);
    let currentUser = await User.findById(req.user?._id);
    currentUser.password  = hashedPassword;
    
    currentUser
    .save()
    .then((savedUser)=>{
        console.log("password change Successful!", savedUser);
    })
    .catch((error)=>{
        throw new apiError(401, error.message || "FAILED to change password!")
    })
    // console.log(currentUser)
    // console.log(req.user)
    // throw new apiErro r(500, "intentional termination for unit testing!")
    
    
    //working but need hashing!
    // const currentUser = await User.findByIdAndUpdate(
    //     req.user?._id,
    //     {
    //         $set:{
    //             password: newPassword,
    //         }
    //     },
    //     {
    //         new: true   
    //     }
    // );
    console.log(currentUser);

})

/**
 * To Do's for forgot and reset password:
 *  api/v1/auth/reset-password
    * 1. get email or phone or username
    * 2. validate each and check if user exists
    * 3. add otp to database linked with username 
 * api/v1/auth/reset-password/verify
    * 1. get email or phone or username taken from last route
    * 2. validate each and check if user exists    
    * 3. now take otp as extra data for verification!
    * 4. check if otp matches!
    * 5. if yes reset password
    * 6. else send unauthorised access!
    * 
 */

// Nodemailer transporter setup
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });
// async function sendEmail(transporter, email, otp) {
//     try {
//         const mailOptions = 
    
//         const response = await transporter.sendMail(mailOptions);
//         console.log("mail response: ", response)
//     } catch (error) {
//         console.log("mail error: ", error.message);
//     }
// }

// Function to send OTP via email
async function sendEmail(transporter, email, otp) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Password OTP',
            text: `Your OTP for resetting password is: ${otp}`,
        };
    
        return await transporter.sendMail(mailOptions);
    } catch (error) {
        return res
        .status(401)
        .json(
            new apiResponse(401,"Failed to send otp!")
        )
    }
}

// Function to send OTP via SMS
async function sendSMS(client, phoneNumber, otp) {
    try {
        const sentSMS = await client.messages.create({
            body: `Your OTP for resetting password is: ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        return sentSMS;
    } catch (error) {
        throw new apiError(401, 'Error sending SMS');
    }
}
export const resetPassword = asyncHandler(async (req, res, next)=>{

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
    
    const currentUser = await User.findOne(query);
    if(!currentUser){
        throw new apiError(404, "User doesn't exist")
    }
    
    // console.log(currentUser);
    //we have found the user now it's time to send otp
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    
    // Twilio client setup
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


    try {
        // Generate OTP (you can modify this logic)
        const generatedOTP = Math.random().toString().slice(2, 8);
        const newOTPData = await otp.create({
            email: currentUser?.email,
            opts: {generatedOTP}
        })

        if(!newOTPData){
            throw new apiError(500, 'error while generating otp!')
        }
        // Send OTP via email or SMS based on input
        if (emailOrPhone.includes('@')) {
            // Send OTP via email
            const sentEmail = await sendEmail(transporter, emailOrPhone, otp);
            sentEmail
            .then((response)=>{
                console.log(response);
            })
            .cathc((error)=>{
                console.log(error);
            })
        } else {
            // Send OTP via SMS
            const sentSMS = await sendSMS(client, emailOrPhone, otp);
            sentSMS
            .then((response)=>{
                console.log(response);
            })
            .catch((error)=>{
                console.log(error);
            })
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP.' });
    }    
})

export const verifyOTP = asyncHandler(async(req, res, next)=>{
    console.log(req.body);
});

export const setNewPassword = asyncHandler(async(req, res, next)=>{
    console.log(req.body)
})
