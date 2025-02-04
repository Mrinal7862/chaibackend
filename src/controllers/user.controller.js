import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import {userModel} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { Apiresponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async(req, res)=>{
    // input validation >> data req. username, email, password, phone number... 
    // not empty
    // check if user already exists: username, email
    // check for images, avatar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token feed from response
    // check for user creation
    // return response


    const {fullName, email, username, password} =  req.body
    console.log("email: ", email);
    
    // another basic approach

    // if(fullName === ""){
    //     throw new apiError(400, "Full name is required")
    // }

    if(
        [fullName, email, username, password].some((field)=>field ?.trim() === "")
    ){
        throw new apiError(400, "All Fields are compulsary")
    }

    const existedUser = userModel.findOne({
        $or : [{ email }, { username }]
    })

    console.log(existedUser)

    if(existedUser){
        throw new apiError(409, "User already exists")
    }

    const AvatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!AvatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(AvatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avtar){
        throw new apiError(400, "Avatar file is required")
    }
    
    const user = await userModel.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    
    const createdUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, 'Something went wrong, while regitering the user')
    }

    return res.status(201).json(
        new Apiresponse(200, createdUser, "User Registered successfully")
    )
})

export {registerUser}; 