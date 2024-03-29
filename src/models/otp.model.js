import mongoose from 'mongoose';

 const otpSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: []
        }
    }, 
    {timeStamp: true}
 );

 otpSchema.methods.resetOTP = function(){
    if(this.isModified('otp')){
        setTimeout(() => {
           this.otp = '' 
        }, 120000);
    }
 }


export const otp = mongoose.model("otp", otpSchema);