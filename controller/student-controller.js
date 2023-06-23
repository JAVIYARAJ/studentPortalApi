const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const util = require('../utils/Util')
const moment = require('moment')

const currentTime = moment()

require('dotenv').config()

class StudentController {
    
    //mark student attendance
    static markAttendance = async (req, res) => {
        const authHeader = req.headers['authorization']
        const { status } = req.body

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing' });
        } else {
            const token = authHeader.split(" ")[2];

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                const attendanceQuery = `insert into student_attendance_master (std_id,status) values(${uid},'${status}')`

                const result = await executer(attendanceQuery)

                res.status(200).json({ status: "success", message: "Attendance mark successfully" })
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User" });
            }

        }
    }

    //check that student mark attendance or not
    static checkAttendance = async (req, res) => {
        const {id}=req.query
        const df = moment(currentTime, "YYYY-MM-DD")
        const date = (df.format()).split("T")[0]

        const statusQuery = `
        SELECT status,createdAt FROM student_attendance_master where createdAt like '%${date}%' and std_id=${id}`

        const result=await executer(statusQuery)
        res.status(200).json({ status: "success", message: 'data fetch successfully',data:result })
    }

}

module.exports = StudentController