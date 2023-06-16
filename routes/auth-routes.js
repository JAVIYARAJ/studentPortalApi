const express=require('express')
const routes=express.Router()
const authController=require('../controller/auth-controller')

routes.post('/login',authController.userLogin)
routes.post('/register',authController.studentRegistration)
routes.post('/forgot',authController.forgotPassword)

module.exports=routes