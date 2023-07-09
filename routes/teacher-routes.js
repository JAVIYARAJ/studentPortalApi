const express=require('express')
const routes=express.Router()
const teacherController=require('../controller/teacher-controller')

routes.post('/approve-leave',teacherController.approveLeave)


module.exports=routes
