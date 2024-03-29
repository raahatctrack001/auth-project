import { Router } from "express";
import { 
    changeCurrentPassword,
    loginUser, 
    logoutUser, 
    recoverAccount, 
    registerUser, 
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";


const router = Router();
//syntax: router.route(define route here).apitype(middleware, controller)
router.route('/register').post(upload.none(),  registerUser);
router.route('/login').post(upload.none(), loginUser);
router.route('/logout').post(verifyUser, logoutUser);
router.route('/change-password').post(upload.none(), verifyUser, changeCurrentPassword);
router.route('/generate-otp').post(upload.none(), recoverAccount);

export default router;
