const express=require('express')
const routes=express.Router()
const commonController=require('../controller/common-controller')

routes.get('/get-subjects',commonController.getSubjects)
routes.get('/get-class',commonController.getClass)

module.exports=routes 