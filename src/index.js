import dotenv from 'dotenv'
// import mongoose, { mongo } from 'mongoose'
// import { DB_name } from './constants.js'
import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000, ()=>{
        console.log(`The server is listening on ${process.env.PORT||8000}`)
    })
})
.catch((err)=>{console.log("The application is not able to connect to the database", err)})


/*
const app = express()

(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`)
       app.on("error", (err)=>{
        console.log("The application is not able to connect to the database", err)
        throw err
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`The server is listening on ${process.env.PORT}`)
       })
    } catch (error) {
        console.error
        throw error
    }
})()
*/