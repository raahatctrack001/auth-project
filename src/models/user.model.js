import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
      username:{
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },
      email: {        
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {        
        type: String, 
        required: true,
        trim: true,
      } , 
      refreshToken: {
        type: String,
      }
    }, 
    {timestamps:true}
);



//pre hook: before 'save' this document do this following
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) 
        return next();

    this.password = await bcryptjs.hash(this.password, 10)
    next()
})

//method injection: to check whether entered password is correct or not
userSchema.methods.isPasswordCorrect = (password)=>{
    return bcryptjs.compareSync(password, this.password);
}

/* 
 concept of access and refresh token @ https://www.baeldung.com/cs/access-refresh-tokens
 it’s possible for applications to get fresh access tokens during the refresh token’s lifetime without having to ask the user to re-authenticate.
 To implement the tokens, we’ll require two models: one for users and the other for access and refresh tokens. User models contain data such
 as usernames, passwords, e-mail addresses, and other details.
 On the other hand, a token model includes a refresh token’s value, expiration date, and user ID. We can store tokens in a 
 cache or a secured relational database.

 When the application requests a resource, but the access token is no longer valid, then:
 
 the resource server should refuse to fulfill the request and sends an invalid token response
 the application will send a new access token request using the refresh token
 the authorization server will use the previously supplied refresh token and sends a new access token
 
*/

//method injection: generate access token with jwt
userSchema.methods.generateAccessToken = async ()=>{
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET, 
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}


//method injection: generate access token
userSchema.methods.generateRefreshToken = ()=>{
    return {
        _id : this._id,
    }
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFERSH_TOKEN_EXPIRY
    }
}


// export const User = new mongoose.model("User", userSchema);
export const User = mongoose.model("User", userSchema);
