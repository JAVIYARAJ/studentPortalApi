const express=require('express')
const routes=express.Router()
const studentController = require('../controller/student-controller')

routes.post('/attendance',studentController.markAttendance)
routes.post('/check-attendance',studentController.checkAttendance)

module.exports=routes