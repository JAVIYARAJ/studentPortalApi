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

    //admin role required
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

                        var finalSubjects = []

                        if (activeCount > 0) {
                            if (typeof subjects === 'object' && subjects != null) {
                                const subjectCodes = []

                                for (let i = 0; i < subjects.length; i++) {
                                    const checkSubject = await executer(`SELECT count(*) as isAdded FROM subject_master where subject_master.subject_code='${subjects[i].code}'`)

                                    const isSubjectAdded = checkSubject[0].isAdded
                                    if (isSubjectAdded > 0) {
                                        subjectCodes.push(subjects[i].code)
                                    } else {
                                        finalSubjects.push(subjects[i])
                                    }
                                }

                                if (finalSubjects.length > 0) {
                                    const insertQuery = `INSERT INTO subject_master(subject_name, subject_code, semester, isOptional) VALUES ?`;

                                    const valuesToInsert = finalSubjects.map(subject => [
                                        subject.subject,
                                        subject.code,
                                        subject.semester,
                                        subject.isOptional ? subject.isOptional : 0
                                    ]);

                                    const insertResult = await executer(insertQuery, valuesToInsert)
                                    res.status(200).json({ status: "success", message: 'already added subject', code: subjectCodes })
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

    //faculty or admin role required
    static getStudentList = async (req, res) => {

        const authHeader = req.headers["authorization"]
        const { semester, sort, limit, offset } = req.query

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role in ("faculty","admin")`)

                var activeCount = isActiveUser[0].count

                if (activeCount > 0) {

                    if (sort && limit && offset) {

                        if (semester != undefined && typeof semester === 'string') {
                            const result = await executer(`select * from student_master where semester=${semester} order by semester ${sort} limit ${limit} offset ${offset}`)

                            res.status(200).json({ status: "success", message: 'subject get successfully.', data: result })
                        } else {
                            //all sem
                            const result = await executer(`select * from student_master order by semester ${sort} limit ${limit} offset ${offset}`)

                            res.status(200).json({ status: "success", message: 'student list get successfully.', data: result })

                        }
                    } else {
                        res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                    }


                } else {
                    res.status(400).json({ status: "failed", message: "permission denied for this user." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }

    }

    //open role
    static getFacultyList = async (req, res) => {

        const authHeader = req.headers["authorization"]
        const { sort, limit, offset } = req.query

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}"`)

                var activeCount = isActiveUser[0].count

                if (activeCount > 0) {

                    if (sort && limit && offset) {

                        const result = await executer(`select * from faculty_master order by total_experience ${sort} limit ${limit} offset ${offset}`)

                        res.status(200).json({ status: "success", message: 'faculty list get successfully.', data: result })

                    } else {
                        res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                    }


                } else {
                    res.status(400).json({ status: "failed", message: "permission denied for this user." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }

    }

    //admin role required 
    static createClass = async (req, res) => {
        const authHeader = req.headers["authorization"]
        const { className, facultyId, totalStudents, semester } = req.body

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role="admin"`)

                const activeCount = isActiveUser[0].count

                if (activeCount > 0) {
                    if (className && facultyId && totalStudents && semester) {

                        var isActiveFaculty = await executer(`SELECT count(*) as count from user_master where id="${facultyId}" and role="faculty"`)

                        const facultyActiveCount = isActiveFaculty[0].count

                        if (facultyActiveCount > 0) {
                            const createClassQuery = `insert into class_master (class_name,faculty_id,total_students,semester) values('${className}',${facultyId},${totalStudents},${semester})`

                            const results = await executer(createClassQuery)

                            res.status(200).json({ status: "success", message: "class created successfully." });
                        } else {
                            res.status(400).json({ status: "failed", message: "faculty dose not exists." });
                        }

                    } else {
                        res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                    }
                } else {
                    res.status(400).json({ status: "failed", message: "permission denied for this user." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }
    }

    //get student list(which not joined in any class room)

    static getStudentList = async (req, res) => {
        const authHeader = req.headers["authorization"]
        const { semester, classId } = req.query

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role in("faculty","admin")`)

                const activeCount = isActiveUser[0].count

                if (activeCount > 0) {
                    if (classId && semester) {

                        var alreadyJoinedStudents = await executer(`SELECT student_id FROM student_class_master where class_id=${classId}`)

                        const joinedStudentList=alreadyJoinedStudents.map(student =>student.student_id)

                        var allStudents = await executer(`SELECT id,fname,lname,email,semester,image FROM student_master where semester=${semester} and id not in (${joinedStudentList})`)

                        res.status(200).json({ status: "success", message: "Student list get successfully.", data: allStudents });
                        
                    } else {
                        res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                    }
                } else {
                    res.status(400).json({ status: "failed", message: "permission denied for this user." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }
    }

    static joinClass = async (req, res) => {
        const authHeader = req.headers["authorization"]
        const { classId, studentId } = req.body

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${uid}" and role in("faculty","admin")`)

                const activeCount = isActiveUser[0].count

                if (activeCount > 0) {
                    if (classId && studentId) {

                        var isActiveClass = await executer(`SELECT count(*) as count from class_master where id="${classId}"`)

                        const isActiveClassResult = isActiveClass[0]

                        const activeCount=isActiveClassResult.count

                        if (activeCount> 0) {

                            if (typeof studentId == "number") { 

                                //single student join class

                                const isAlreadyAdded = `select count(*) as count from student_class_master where student_id=${studentId} and class_id=${classId}`

                                const addedCount = isAlreadyAdded[0].count;

                                if (addedCount > 0) {
                                    res.status(400).json({ status: "failed", message: 'student already joined the class.' })

                                } else {

                                    const joinClassQuery = `insert into student_class_master(class_id,student_id) values(${classId},${studentId})`

                                    const result = await executer(joinClassQuery)

                                    res.status(200).json({ status: "success", message: 'student joined the class successfully.' })

                                }


                            } else if (typeof studentId == "object") {
                                //multiple student join class

                                var alreadyJoinedClass = []

                                var insertStudentData = []

                                const joinClassQuery = `insert into student_class_master(class_id,student_id) 
                                values ?`

                                for (let i = 0; i < studentId.length; i++) {

                                    const isAlreadyAddedQuery = `select count(*) as count from student_class_master where student_id=${studentId[i]} and class_id=${classId}`

                                    const isAlreadyAdded = await executer(isAlreadyAddedQuery);

                                    const addedCount = isAlreadyAdded[0].count;

                                    if (addedCount > 0) {
                                        alreadyJoinedClass.push(studentId[i]);
                                    } else {
                                        insertStudentData.push(studentId[i]);
                                    }

                                }

                                const insertStudentValue = insertStudentData.map(id => [
                                    classId,
                                    id,
                                ]);

                                const result = await executer(joinClassQuery, insertStudentValue)

                                if (alreadyJoinedClass.length > 0) {
                                    res.status(200).json({ status: "success", message: 'student joined the class successfully.', alreadyAddedStudents: alreadyJoinedClass })
                                } else {
                                    res.status(200).json({ status: "success", message: 'student joined the class successfully.' })
                                }
                            } else {
                                res.status(400).json({ status: "failed", message: "please provide studentId." });

                            }

                        } else {
                            res.status(400).json({ status: "failed", message: "class not exists." });
                        }

                    } else {
                        res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                    }
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