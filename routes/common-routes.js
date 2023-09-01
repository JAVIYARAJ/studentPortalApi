const express=require('express')
const routes=express.Router()
const commonController=require('../controller/common-controller')

routes.get('/get-subjects',commonController.getSubjects)

module.exports=routes