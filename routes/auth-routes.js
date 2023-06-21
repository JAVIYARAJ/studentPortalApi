const express=require('express')
const routes=express.Router()
const authController=require('../controller/auth-controller')

routes.post('/login',authController.userLogin)
routes.post('/student-register',authController.studentRegistration)
routes.post('/teacher-register',authController.teacherRegistration)
routes.post('/admin-register',authController.adminRegistration)
routes.post('/forgot',authController.forgotPassword)

module.exports=routes