const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

class StudentController{
    
    static studentCheckIn=async(req,res)=>{
        const authHeader = req.headers['authorization']

        if(!authHeader){
            res.status(401).json({status:"failed", message: 'Authorization header missing' });
        }else{
            const token = authHeader.split(" ")[2];

            const response=await jwt.verify(token,process.env.JWT_SECRET)
        
            if(response){
                
            }else{
                res.status(401).json({status:"failed", message: "UnAuthorization User" });
            }

        }
    }
}

module.exports=StudentController