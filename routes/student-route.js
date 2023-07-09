const express=require('express')
const routes=express.Router()
const studentController = require('../controller/student-controller')

routes.post('/attendance',studentController.markAttendance)
routes.post('/check-attendance',studentController.checkAttendance)
routes.post('/attendance-report',studentController.studentAttendanceReport)
routes.post('/leave',studentController.studentLeave)

module.exports=routes