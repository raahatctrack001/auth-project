import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";


const router = Router();
//syntax: router.route(define route here).apitype(middleware, controller)
router.route('/register').post(upload.any(),  registerUser);
router.route('/login').post(upload.any(), loginUser);
router.route('/logout').post(verifyUser, logoutUser);


export default router;
