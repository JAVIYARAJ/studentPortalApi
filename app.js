var express=require('express')
require("dotenv").config()
const conn=require('./config/database.js')

var app=express()
const authRoute=require('./routes/auth-routes.js')

app.use(express.json())

app.use('/student/auth',authRoute)

app.listen(process.env.port,()=>{
    console.log("server is running")
})