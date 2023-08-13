const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
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
                        res.status(200).json({ status: "success", leave_id: leave_id, std_id: (leaveResult[0].std_id), leave_status: status, message: 'leave status updated successfully' })
                    } else {
                        const attendanceQuery = `insert into student_attendance_master (std_id,status) values(${leaveResult[0].std_id},'absent')`

                        const attendanceResult = await executer(attendanceQuery)


                        res.status(200).json({ status: "success", leave_id: leave_id, std_id: (leaveResult[0].std_id), leave_status: status, message: 'leave status updated successfully.' })
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

}

module.exports = TeacherController