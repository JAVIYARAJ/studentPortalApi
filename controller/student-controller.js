const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const util = require('../utils/Util')
const moment = require('moment')

const currentTime = moment()

require('dotenv').config()

class StudentController {

    static markAttendance = async (req, res) => {

        const authHeader = req.headers['authorization']
        const { status } = req.body

        if (status) {
            if (!authHeader) {
                res.status(401).json({ status: false, message: 'Authorization header missing' });
            } else {
                const token = authHeader.split(" ")[2];

                //verify token
                const response = await jwt.verify(token, process.env.JWT_SECRET)

                if (response) {
                    const uid = response.uid

                    //check that current user is student or not
                    const isStudentQuery = `SELECT count(*) as isStudent FROM user_master where role="student" and id=${uid}`


                    const isStudentResult = await executer(isStudentQuery)

                    if (isStudentResult[0].isStudent > 0) {

                        //check that student is already mark attendance or not
                        const df = moment(currentTime, "YYYY-MM-DD")
                        const date = (df.format()).split("T")[0]

                        const statusQuery = `SELECT count(*) as count FROM student_attendance_master where createdAt like '%${date}%' and std_id=${uid}`

                        const isMarkDone = await executer(statusQuery)


                        if (isMarkDone[0].count > 0) {
                            res.status(200).json({ status: true, message: 'already you have marked your attendance for today' })
                        } else {

                            //mark attendance
                            const attendanceQuery = `insert into student_attendance_master (std_id,status) values(${uid},'${status}')`

                            const result = await executer(attendanceQuery)

                            res.status(200).json({ status: true, message: "Attendance mark successfully", status: status })
                        }

                    } else {
                        res.status(400).json({
                            "success": false,
                            "message": "Student Account Not Exists",
                        });
                    }

                } else {
                    res.status(401).json({ status: false, message: "UnAuthorization User" });
                }

            }
        } else {
            res.status(200).json({ status: "failed", message: "please specified attendance type." })
        }


    }

    //optional- at this moment not required
    static checkAttendance = async (req, res) => {
        const { id } = req.query
        const df = moment(currentTime, "YYYY-MM-DD")
        const date = (df.format()).split("T")[0]

        const statusQuery = `
        SELECT count(*) as count FROM student_attendance_master where createdAt like '%${date}%' and std_id=${id}`

        const result = await executer(statusQuery)

        console.log(result)

        if (result[0].count > 0) {
            res.status(200).json({ status: true, message: 'data fetch successfully', data: result })
        } else {
            res.status(400).json({ status: false, message: '' })
        }
    }

    static studentAttendanceReport = async (req, res) => {
        const { status, id, type, year, month } = req.query

        if (status && id && type && year) {

            if (type == "year") {
                //get all specified year data
                var yearDataQuery = ``
                if (status == "all") {
                    yearDataQuery = `SELECT * FROM student_attendance_master where createdAt like '%${year}%' and std_id=${id};
                    `
                } else {
                    yearDataQuery = `SELECT * FROM student_attendance_master where createdAt like '%${year}%' and std_id=${id} and status='${status}';
                `
                }

                const result = await executer(yearDataQuery)
                res.status(200).json({
                    "success": true,
                    "year": year,
                    "message": "year data get successfully",
                    "data": result
                });
            } else if (type == "month") {
                if (month && (month.length >= 1 && month.length <= 2) && month <= 11) {

                    var number = ""
                    if (month.length == 1) {
                        number = "0" + month
                    } else {
                        number = month
                    }

                    var monthDataQuery = ""

                    if (status == "all") {
                        monthDataQuery = `SELECT * FROM student_attendance_master where createdAt like '%${year}-${number}%' and std_id=${id};
                        `
                    } else {
                        monthDataQuery = `SELECT * FROM student_attendance_master where createdAt like '%${year}-${number}%' and std_id=${id} and status='${status}';
                        `
                    }

                    //get all specified month data within in year

                    const result = await executer(monthDataQuery)
                    res.status(200).json({
                        "success": true,
                        "year": year,
                        "month": number,
                        "message": "month data get successfully",
                        "data": result
                    });
                } else {
                    res.status(400).json({
                        "success": false,
                        "message": "Please provide valid month",
                    });
                }
            }


        } else {
            res.status(400).json({
                "success": false,
                "message": "Please provide all values",
            });
        }

    }

    static studentLeave = async (req, res) => {
        const authHeader = req.headers['authorization']

        const { leave_date, reason, teacher_id } = req.body

        const default_status = "in-review"

        if (!authHeader) {
            res.status(401).json({ status: false, message: 'Authorization header missing' });
        } else {
            const token = authHeader.split(" ")[2];

            //verify token
            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {

                //student id
                const uid = response.uid

                //check that current user is student or not
                const isStudentQuery = `SELECT count(*) as isStudent FROM user_master where role="student" and id=${uid}`


                //also check that current specified teacher id user is contain teacher role or not
                const isTeacherQuery = `SELECT count(*) as isTeacher FROM user_master where role="teacher" and id=${teacher_id}`


                const isStudentResult = await executer(isStudentQuery)
                const isTeacherResult = await executer(isTeacherQuery)



                if (isStudentResult[0].isStudent > 0) {

                    if (isTeacherResult[0].isTeacher > 0) {

                        //check that specified date leave already applied or not
                        try {

                            const isLeaveQuery = `SELECT count(*) isLeave FROM student_leave_master where std_id=${uid} and leave_date like '%${leave_date}%'`

                            const isLeaveResult = await executer(isLeaveQuery)

                            if (isLeaveResult[0].isLeave == 0) {

                                const leaveQuery = `INSERT INTO student_leave_master ( std_id, leave_date, teacher_id, reason) VALUES ('${uid}', '${leave_date}','${teacher_id}', '${reason}');`

                                const leaveResult = await executer(leaveQuery)

                                res.status(200).json({
                                    "success": true,
                                    "message": "Leave applied successfully",
                                    "date": leave_date,
                                    "teacher_id": teacher_id,
                                    "reason": reason,
                                    "status": default_status
                                });
                            } else {
                                res.status(200).json({
                                    "success": true,
                                    "message": "already applied leave for this date",
                                    "date": leave_date
                                });
                            }


                        } catch (e) {
                            res.status(400).json({
                                "success": false,
                                "message": e.message,
                            });
                        }
                    } else {
                        res.status(400).json({
                            "success": false,
                            "message": "Teacher Account Not Exists",
                        });
                    }
                } else {
                    res.status(400).json({
                        "success": false,
                        "message": "Student Account Not Exists",
                    });
                }

            } else {
                res.status(401).json({ status: false, message: "UnAuthorization User" });
            }

        }
    }


}

module.exports = StudentController