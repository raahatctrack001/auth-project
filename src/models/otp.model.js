import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true // Ensure email uniqueness
    },
    otps: [{
        otp: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            expires: 300, // Set expiry time to 5 minutes (300 seconds)
            default: Date.now
        }
    }]
});

export const otp = mongoose.model("otp", otpSchema);