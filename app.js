var express=require('express')
require("dotenv").config()

var app=express()
const authRoute=require('./routes/auth-routes.js')
const studentRoute=require('./routes/student-route.js')
const teacherRoute=require('./routes/teacher-routes.js')

app.use(express.json())

app.use('/auth',authRoute)
app.use('/student',studentRoute)
app.use('/teacher',teacherRoute)

app.get('/test',(req,res)=>{
    res.json("test")
})

app.listen(3000,()=>{
    console.log("server is running")
})

