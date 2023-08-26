const express=require('express')
const routes=express.Router()
const teacherController=require('../controller/teacher-controller')

routes.post('/approve-leave',teacherController.approveLeave)
routes.post('/add-subject',teacherController.addFacultySubject)

module.exports=routes
