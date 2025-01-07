import mongoose from "mongoose";
import { DB_name } from "../constants.js";
// import { log } from "console";

const connectDB = async () =>{
    try {
       const connectionInstant = await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`);
       console.log(`\n MongoDB connected !! DB HOST: ${connectionInstant.connection.host}`);
       
    } catch (error) {
        console.error
        throw error
        
    }
}

export default connectDB