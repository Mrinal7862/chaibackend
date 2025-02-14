import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import {userModel} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { Apiresponse } from "../utils/apiResponse.js";


const generateAccessRefereshTokens = async(userId)=>{
    try {
        const user = await userModel.findById(userId)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.RefreshToken = RefreshToken
        await user.save({ validateBeforeSave: false })

        return {AccessToken, RefreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}  

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

    const existedUser = await userModel.findOne({
        $or : [{ email }, { username }]
    })

    console.log(existedUser)

    if(existedUser){
        throw new apiError(409, "User already exists")
    }

    console.log(req.files);

    const AvatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    
    if(!AvatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(AvatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
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



const loginUser = asyncHandler(async(req, res)=>{
    // req -> data
    //Take Email username from the user...
    // find the user  
    // password check
    // access and refresh token
    // send cookies
    
    const {username, email, password} = req.body  

    if(!username || !email){
        throw new apiError(400, "username or email is required.")
    }

    const user = await userModel.findOne({
        $or: [{email}, {username}]
    })

    if(!username){
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401, "Invalid user credentials")
    }

    const {AccessToken, RefreshToken} = await generateAccessRefereshTokens(user._id)

    const loggedInUser = await userModel.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
        new Apiresponse(
            200,
            {
                user: loggedInUser, AccessToken, RefreshToken
            },
            "User logged In successfully"
        )
    )

})

const loggedOutUser = asyncHandler(async(req, res)=>{
    //Clear cookies
    //reset refresh token
    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User Logged Out"))

})
export {
    registerUser,
    loginUser,
    loggedOutUser
}; 