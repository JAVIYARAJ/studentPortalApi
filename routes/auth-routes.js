const express=require('express')
const routes=express.Router()
const authController=require('../controller/auth-controller')

routes.post('/login',authController.userLogin)
routes.post('/register',authController.userRegister)
routes.post('/forgot',authController.forgotPassword)
routes.get('/getUserData',authController.getUserData)
routes.post('/update-profile',authController.updateProfile)

module.exports=routes