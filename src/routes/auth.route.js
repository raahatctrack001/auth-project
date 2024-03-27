import { Router } from "express";
import { 
    changeCurrentPassword,
    loginUser, 
    logoutUser, 
    registerUser, 
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { verifyOTP } from "../middlewares/verifyOTP.middleware.js";


const router = Router();
//syntax: router.route(define route here).apitype(middleware, controller)
router.route('/register').post(upload.any(),  registerUser);
router.route('/login').post(upload.any(), loginUser);
router.route('/logout').post(verifyUser, logoutUser);
router.route('/change-password').post(upload.none(), verifyUser, changeCurrentPassword)
// router.route('/verify-user').post(upload.none(), verifyOTP);
// router.route('/verify-user/reset-password').post(upload.none(), verifyOTP, resetPassword)//.route('/reset-password').post(verifyUser, forgotPassword);


export default router;
