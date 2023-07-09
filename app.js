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


app.listen(process.env.port,()=>{
    console.log("server is running")
})

