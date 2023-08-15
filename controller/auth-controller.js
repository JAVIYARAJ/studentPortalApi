const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()

class AuthController {

    static userLogin = async (req, res) => {
        const { email, password } = req.body

        if (email && password) {

            const result = await executer(`SELECT password,role,id FROM user_master where email="${email}"`)
            if (result.length > 0) {
                const loggedInUser = result[0]
                const uid = loggedInUser.id
                const isMatch = await bcrypt.compare(password, loggedInUser.password)
                if (isMatch) {
                    const token = await jwt.sign({ uid }, process.env.JWT_SECRET, { "expiresIn": "5d" })

                    res.status(200).json({
                        "status": "success",
                        "data": {
                            "role": loggedInUser.role,
                            "token": token
                        },
                        "message": "Login successfully.",
                    });

                } else {
                    res.status(200).json({ status: "failed", message: "email or password is not valid." })
                }
            } else {
                res.status(200).json({ status: "failed", message: "user not exists." })
            }

        } else {
            res.status(200).json({ status: "failed", message: "please enter email and password." })

        }
    }

    static studentRegistration = async (req, res) => {

        const { fname, lname, email, password, cpassword, city, bod, address, image, phone, role, standard, graduation, percentage, parentname, parentemail, parentnumber } = req.body;

        if (fname && lname && email && password && cpassword && city && bod && address && phone && standard && percentage && parentname && parentemail && parentnumber) {

            if (password === cpassword) {
                try {

                    //check that is the user already exists or not
                    const activeCount = await this.isActiveUser(email)

                    if (activeCount) {
                        res.status(200).json({ status: "failed", message: "email already exists." })
                    } else {
                        //create account

                        const salt = await bcrypt.genSalt(10)

                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email, role, isDeleted, password) VALUES ('${email}', '${role}', '0', '${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        const studentQuery = `INSERT INTO student_master (id, fname, lname, email, city, address, bod, phonenumber,parentname,parentemail,parentnumber) VALUES ('${uid}', '${fname}', '${lname}', '${email}', '${city}', '${address}', '${bod}', '${phone}','${parentname}','${parentemail}','${parentnumber}');`

                        const studentResult = await executer(studentQuery)

                        const studentEducationQuery = `INSERT INTO student_education_master (id, standard, graduation, percentage) VALUES ('${uid}', '${standard}', '${graduation}', ${percentage});
                        `

                        const eduResult = await executer(studentEducationQuery)


                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully.",
                        });
                    }
                } catch (e) {
                    res.status(200).json({ status: "failed", message: e.message })
                }
            } else {
                res.status(200).json({ status: "failed", message: "password and confirm password not match." })
            }

        } else {
            res.status(200).json({ status: "failed", message: "please enter all values." })
        }

    }

    static userRegister = async (req, res) => {

        const { fname, lname, email, password,role } = req.body

        if (fname && lname && email && password && role) {

            try {

                //check that is the user already exists or not
                const activeCount = await this.isActiveUser(email)

                if (activeCount) {
                    res.status(200).json({ status: "failed", message: "email already exists." })
                } else {
                    //create account

                    const salt = await bcrypt.genSalt(10)

                    const hashPassword = await bcrypt.hash(password, salt)

                    const userQuery = `INSERT INTO user_master(email, role, isDeleted, password) VALUES ('${email}', '${role}', '0', '${hashPassword}');`

                    const userResult = await executer(userQuery)

                    const uid = userResult.insertId

                    const studentQuery = `INSERT INTO student_master (id, fname, lname, email) VALUES ('${uid}', '${fname}', '${lname}', '${email}');`

                    const studentResult = await executer(studentQuery)

                    res.status(200).json({
                        "status": "success",
                        "message": "Account created successfully.",
                    });
                }
            } catch (e) {
                res.status(200).json({ status: "failed", message: e.message })
            }


        } else {
            res.status(200).json({ status: "failed", message: "please enter all values." })
        }
    }

    static teacherRegistration = async (req, res) => {
        const { fname, lname, email, password, cpassword, city, bod, address, image, phone, role, education, experience, subjects } = req.body;

        if (fname && lname && email && password && cpassword && city && bod && address && phone && education && experience && subjects) {

            if (password === cpassword) {
                try {


                    //check that is the user already exists or not
                    const activeCount = await this.isActiveUser(email)


                    if (activeCount) {
                        res.status(200).json({ status: "failed", message: "email already exists." })
                    } else {
                        //create account

                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email, role, isDeleted, password) VALUES ('${email}', '${role}', '0', '${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        const studentQuery = `INSERT INTO teacher_master (id, fname, lname, email, bod, phone, city, address,education,experience,image) VALUES ('${uid}', '${fname}', '${lname}', '${email}', '${bod}', '${phone}', '${city}', '${address}','${education}',${experience},'${image}');`

                        const teacherResult = await executer(studentQuery)

                        for (let i = 0; i < subjects.length; i++) {

                            const teacherSubjectQuery = `INSERT INTO teacher_subject_master (id, subject) VALUES ('${uid}', '${subjects[i]}');
                            `

                            const subjectResult = await executer(teacherSubjectQuery)
                        }

                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully."
                        });
                    }
                } catch (e) {
                    res.status(200).json({ status: "failed", message: e.message })
                }
            } else {
                res.status(200).json({ status: "failed", message: "password and confirm password not match." })
            }

        } else {
            res.status(200).json({ status: "failed", message: "please enter all values." })
        }

    }

    static adminRegistration = async (req, res) => {
        const { fname, lname, email, password, cpassword, city, address, image, phone, role, admin_role } = req.body;

        if (fname && lname && email && password && cpassword && city && address && phone && admin_role) {

            if (password === cpassword) {
                try {


                    //check that is the user already exists or not
                    const activeCount = await this.isActiveUser(email)

                    if (activeCount) {
                        res.status(200).json({ status: "failed", message: "email already exists." })
                    } else {
                        //create account

                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email, role, isDeleted, password) VALUES ('${email}', '${role}', '0', '${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        if (image != undefined) {
                            const studentQuery = `INSERT INTO admin_master (id, fname, lname, email, phone, city, address,admin_role,image) VALUES ('${uid}', '${fname}', '${lname}', '${email}', '${phone}', '${city}', '${address}', '${admin_role}','${Image}');`

                            const teacherResult = await executer(studentQuery)

                        } else {
                            const studentQuery = `INSERT INTO admin_master (id, fname, lname, email, phone, city, address,admin_role) VALUES ('${uid}', '${fname}', '${lname}', '${email}', '${phone}', '${city}', '${address}', '${admin_role}');`

                            const teacherResult = await executer(studentQuery)

                        }

                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully.",
                        });
                    }
                } catch (e) {
                    res.status(200).json({ status: "failed", message: e.message })
                }
            } else {
                res.status(200).json({ status: "failed", message: "password and confirm password not match." })
            }

        } else {
            res.status(200).json({ status: "failed", message: "please enter all values." })
        }
    }

    static forgotPassword = async (req, res) => {
        const { email } = req.body

        if (email) {
            const result = await this.isActiveUser(email)
            if (result) {
                res.status(200).json({
                    "status": "success",
                    "data": {
                        "email": email,
                    },
                    "message": "Email Sent Successfully.",
                })
            } else {
                res.status(200).json({ status: "failed", message: "user not exists." })
            }
        } else {
            res.status(200).json({ status: "failed", message: "please enter email." })
        }

    }

    static getUserData = async (req, res) => {
        const { role } = req.query
        const authHeader = req.headers['authorization']
        try {

            if (role) {

                if (!authHeader) {
                    res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
                } else {
                    const token = authHeader.split(" ")[2];
                    //verify token
                    const response = await jwt.verify(token, process.env.JWT_SECRET)
                    if (response) {
                        const uid = response.uid
                        if (role == "student") {

                            //check that current user is student or not
                            const isStudentQuery = `SELECT count(*) as isUser FROM user_master where role="${role}" and id=${uid}`

                            const isStudentResult = await executer(isStudentQuery)

                            if (isStudentResult[0].isUser > 0) {
                                const studentInfoResult = await executer(`select student_master.fname,student_master.lname,student_master.email,student_master.city,student_master.address,student_master.bod,
                                student_master.parentnumber,student_master.image,student_master
                                .parentname,student_master.parentemail,student_master.parentnumber,
                                student_education_master.standard,student_education_master.graduation,student_education_master.percentage from student_master inner join student_education_master where student_master.id=${uid}`)

                                res.status(200).json({
                                    "status": "success",
                                    data: studentInfoResult ? studentInfoResult[0] : [],
                                    "message": "Data fetch successfully."
                                });
                            } else {
                                res.status(200).json({
                                    "status": "failed",
                                    "message": "Student Account Not Exists.",
                                });
                            }
                        } else if (role == "teacher") {
                            //check that current user is student or not
                            const isStudentQuery = `SELECT count(*) as isUser FROM user_master where role="${role}" and id=${uid}`

                            const isTeacherResult = await executer(isStudentQuery)
                            if (isTeacherResult[0].isUser > 0) {
                                const teacherInfoResult = await executer(`select * from teacher_master where teacher_master.id=${uid}`)

                                const subjects = await executer(`SELECT teacher_subject_master.subject FROM teacher_subject_master where teacher_subject_master.id=${uid}`)

                                var subjectsList = []
                                for (let i = 0; i < subjects.length; i++) {
                                    subjectsList[i] = subjects[i].subject
                                }

                                res.status(200).json({
                                    "status": "success",
                                    data: {
                                        "data": teacherInfoResult ? teacherInfoResult[0] : [],
                                        "subjects": subjectsList
                                    },
                                    "message": "Data fetch successfully."
                                });
                            } else {
                                res.status(200).json({
                                    "status": "failed",
                                    "message": "Teacher Account Not Exists.",
                                });
                            }
                        } else if (role == "admin") {
                            //check that current user is student or not
                            const isStudentQuery = `SELECT count(*) as isUser FROM user_master where role="${role}" and id=${uid}`

                            const isAdminResult = await executer(isStudentQuery)
                            if (isAdminResult[0].isUser > 0) {
                                const adminInfoResult = await executer(`select * from admin_master where admin_master.id=${uid}`)

                                res.status(200).json({
                                    "status": "success",
                                    data: adminInfoResult ? adminInfoResult[0] : [],
                                    "message": "Data fetch successfully."
                                });
                            } else {
                                res.status(200).json({
                                    "success": "failed",
                                    "message": "Admin Account Not Exists.",
                                });
                            }
                        } else {
                            res.status(200).json({ status: "failed", message: "user role is not valid." })
                        }
                    } else {
                        res.status(401).json({ status: "failed", message: "UnAuthorization User." });
                    }
                }
            } else {
                res.status(200).json({ status: "failed", message: "please specified user role." })
            }
        } catch (e) {
            console.log(e)
        }

    }

    //reusable function
    static isActiveUser = async (email) => {
        var isActiveUser = await executer(`SELECT count(*) as count from user_master where email="${email}"`)

        const activeCount = isActiveUser[0].count

        return activeCount > 0
    }
}

module.exports = AuthController