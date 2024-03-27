import apiError from "../utils/apiError.js";
import apiResponse from '../utils/apiReponse.js'
import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js'

/********************* Time to Learn RegEx **************************/
// Username validation: alphanumeric characters and underscores allowed, length between 5 and 20 characters
const  validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    return usernameRegex.test(username);
}

// Email validation using a regular expression
const validateEmail = (email) => {
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
export const registerUser = asyncHandler(async (req, res, next)=>{
    const {username, email, password, confirmPassword} = req.body;
    console.log(req.body)

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

    res
    .status(200)
    .json(
        new apiResponse(200, "Registration successfull!", createdUser)
    );   
    
});

export const loginUser = asyncHandler(async(req, res, next)=>{

})