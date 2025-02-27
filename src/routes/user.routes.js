import { Router } from "express";
import { loggedOutUser, loginUser, registerUser } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
// import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)


//securedRoutes
router.route('/logout').post(verifyJWT, loggedOutUser) 

// here we'are  downloading each codeblock window 

export default router;