import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
//syntax: router.route(define route here).apitype(middleware, controller)
router.route('/register').post(upload.any(),  registerUser);
router.route('/login').post(loginUser);


export default router;
