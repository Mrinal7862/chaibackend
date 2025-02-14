import { request } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
// import { JsonWebTokenError } from "jsonwebtoken";
import jwt from 'jsonwebtoken'
import { userModel } from "../models/user.model.js";


export  const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new apiError(401, "Un-Authorized Request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await userModel.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // todo: disscuss on front-end
            throw new apiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Access Token")
    }
}) 