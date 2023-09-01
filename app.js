var express=require('express')
const cors=require('cors')
require("dotenv").config()

var app=express()
const authRoute=require('./routes/auth-routes.js')
const studentRoute=require('./routes/student-route.js')
const teacherRoute=require('./routes/teacher-routes.js')
const commonRoute=require('./routes/common-routes.js')

app.use(express.json())
app.use(cors());

app.use('/auth',authRoute)
app.use('/student',studentRoute)
app.use('/teacher',teacherRoute)
app.use('/common',commonRoute)

app.listen(3000,()=>{
    console.log("server is running")
})

