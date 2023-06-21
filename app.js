var express=require('express')
require("dotenv").config()

var app=express()
const authRoute=require('./routes/auth-routes.js')
const studentRoute=require('./routes/student-route.js')

app.use(express.json())

app.use('/auth',authRoute)
app.use('/student',studentRoute)

app.listen(process.env.port,()=>{
    console.log("server is running")
})