const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const queryExecuter = require('../service/helper')
require('dotenv').config()

class TeacherController {

    static approveLeave = async (req, res) => {

        const { leave_id, teacher_id, status, comment } = req.body

        if (leave_id && teacher_id && status) {

            const leaveQuery = `SELECT * FROM student_leave_master where leave_id=${leave_id}`

            const leaveResult = await executer(leaveQuery)

            if (leaveResult[0].teacher_id == teacher_id) {

                if (leaveResult[0].status == "in-review") {

                    var leaveUpdateQuery = ``
                    if (comment != null) {
                        leaveUpdateQuery = `UPDATE student_leave_master SET status='${status}',comment='${comment}' WHERE leave_id = '${leave_id}';
                        `
                    } else {
                        leaveUpdateQuery = `UPDATE student_leave_master SET status='${status}' WHERE leave_id = '${leave_id}';
                        `
                    }
                    const leaveUpdateResult = await executer(leaveUpdateQuery)

                    if (status == "rejected") {
                        res.status(200).json({ status: "success", leave_id: leave_id, std_id: (leaveResult[0].id), leave_status: status, message: 'leave status updated successfully' })
                    } else {
                        const attendanceQuery = `insert into student_attendance_master (id,status) values(${leaveResult[0].std_id},'absent')`

                        const attendanceResult = await executer(attendanceQuery)


                        res.status(200).json({ status: "success", leave_id: leave_id, std_id: (leaveResult[0].id), leave_status: status, message: 'leave status updated successfully.' })
                    }


                } else {

                    res.status(200).json({ status: "failed", message: "already leave approved." })
                }


            } else {

                res.status(200).json({ status: "failed", message: "you haven't authority to approve leave." })

            }
        } else {
            res.status(200).json({ status: "failed", message: 'please provide all values.' })
        }
    }

    static addFacultySubject = async (req, res) => {
        const authHeader = req.headers["authorization"]
        const { subjects } = req.body

        try {
            if (!authHeader) {
                res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
            } else {

                const token = authHeader.split(" ")[2]

                const response = await jwt.verify(token, process.env.JWT_SECRET)

                if (response) {

                    if (subjects) {
                        const uid = response.uid

                        var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role="admin"`)

                        const activeCount = isActiveUser[0].count

                        if (activeCount > 0) {
                            if (typeof subjects === 'object' && subjects != null) {
                                const subjectCodes = []

                                for (let i = 0; i < subjects.length; i++) {

                                    const checkSubject = await executer(`SELECT count(*) as isAdded FROM subject_master where subject_master.subject_code='${subjects[i].code}'`)

                                    const isSubjectAdded = checkSubject[0].isAdded

                                    if (isSubjectAdded > 0) {
                                        subjectCodes.push(subjects[i].code)
                                        subjects.pop()
                                    }
                                }

                                console.log(subjectCodes)

                                const insertQuery = `INSERT INTO subject_master(subject_name, subject_code, semester, isOptional) VALUES ?`;

                                const valuesToInsert = subjects.map(subject => [
                                    subject.subject,
                                    subject.code,
                                    subject.semester,
                                    subject.isOptional ? subject.isOptional : 0
                                ]);

                                const insertResult = await executer(insertQuery, valuesToInsert)

                                if (subjectCodes.length > 0) {
                                    res.status(200).json({ status: "success", message: 'already added subject',code: subjectCodes})
                                } else {
                                    res.status(200).json({ status: "success", message: 'subject added successfully.' })
                                }

                            } else {
                                res.status(400).json({ status: "failed", message: 'subject is not an object.' })
                            }
                        } else {
                            res.status(401).json({ status: "failed", message: "permission denied for this user." });
                        }
                    } else {
                        res.status(400).json({ status: "failed", message: 'provide subjects.' })
                    }
                } else {
                    res.status(401).json({ status: "failed", message: "UnAuthorization User." });
                }
            }

        } catch (e) {

        }
    }

    static createClass = async (req, res) => {
        const authHeader = req.headers["authorization"]

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role="faculty"`)

                const activeCount = isActiveUser[0].count

                if (activeCount > 0) {



                } else {
                    res.status(400).json({ status: "failed", message: "permission denied for this user." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }
    }
}

module.exports = TeacherController