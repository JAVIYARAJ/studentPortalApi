const express=require('express')
const routes=express.Router()
const studentController = require('../controller/student-controller')

routes.post('/attendance/checkIn',studentController.studentCheckIn)

module.exports=routes