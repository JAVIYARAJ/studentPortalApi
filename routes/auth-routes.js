const express=require('express')
const routes=express.Router()
const authController=require('../controller/auth-controller')

routes.get('/login',authController.userLogin)
routes.post('/register',authController.studentRegistration)

module.exports=routes