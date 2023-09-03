const express=require('express')
const routes=express.Router()
const teacherController=require('../controller/teacher-controller')

routes.post('/approve-leave',teacherController.approveLeave)
routes.post('/add-subject',teacherController.addFacultySubject)
routes.get('/get-student-list',teacherController.getStudentList)
routes.get('/get-faculty-list',teacherController.getFacultyList)
routes.post('/create-class',teacherController.createClass)
routes.get('/get-students-class',teacherController.getStudentList)
routes.post('/join-class',teacherController.joinClass)

module.exports=routes
