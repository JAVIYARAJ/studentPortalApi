const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const queryExecuter = require('../service/helper')

require('dotenv').config()

class AuthController {

    //completed
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
                    res.status(400).json({ status: "failed", message: "email or password is not valid." })
                }
            } else {
                res.status(400).json({ status: "failed", message: "user not exists." })
            }

        } else {
            res.status(400).json({ status: "failed", message: "please enter email and password." })

        }
    }

    //completed
    static userRegister = async (req, res) => {

        const { fname, lname, email, password, role,gender} = req.body

        if (fname && lname && email && password && role && gender) {

            try {

                //check that is the user already exists or not
                const activeCount = await this.isActiveUser(email)

                if (activeCount) {
                    res.status(400).json({ status: "failed", message: "user already exists." })
                } else {
                    if (role == "student") {

                        const salt = await bcrypt.genSalt(10)

                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email,role,password) VALUES ('${email}', '${role}','${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        const studentQuery = `INSERT INTO student_master (id, fname, lname, email,gender) VALUES ('${uid}', '${fname}', '${lname}', '${email}','${gender}');`

                        const studentResult = await executer(studentQuery)

                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully.",
                        });

                    } else if (role == "faculty") {

                        const salt = await bcrypt.genSalt(10)

                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email,role,password) VALUES ('${email}', '${role}','${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        const facultyQuery = `INSERT INTO faculty_master (id, fname, lname, email,gender) VALUES ('${uid}', '${fname}', '${lname}', '${email}','${gender}');`

                        const facultyResult = await executer(facultyQuery)

                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully.",
                        });
                    } else {
                        res.status(400).json({ status: "failed", message: "role is invalid." })

                    }
                }
            } catch (e) {
                res.status(400).json({ status: "failed", message: e.message })
            }
        } else {
            res.status(400).json({ status: "failed", message: "please enter all values." })
        }
    }

    //not required
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

    //not required
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

    //not required
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

    //working on it
    static forgotPassword = async (req, res) => {
        const { email, oldPassword, newPassword } = req.body
        
        if (email && oldPassword && newPassword) {

            const isActiveUser = this.isActiveUser(email)

            if (isActiveUser) {


                const result = await executer(`SELECT password as pwd FROM user_master where user_master.email='${email}'`)
                
                const isOldPassword = await bcrypt.compare(oldPassword,result[0].pwd)

                if (isOldPassword) {

                    const salt = await bcrypt.genSalt(10)
                    const hashPassword = await bcrypt.hash(newPassword, salt)

                    const updatePassword = await executer(`update user_master set user_master.password='${hashPassword}' where user_master.email='${email}'`)

                    res.status(200).json({
                        "status": "success",
                        "message": "password changed Successfully.",
                    })
                } else {
                    res.status(400).json({ status: "failed", message: "password is wrong." })
                }

            } else {
                res.status(400).json({ status: "failed", message: "user not exists." })
            }
        } else {
            res.status(200).json({ status: "failed", message: "please provide all values." })
        }

    }

    //completed
    static getUserData = async (req, res) => {
        const authHeader = req.headers['authorization']
        try {

            if (!authHeader) {
                res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
            } else {
                const token = authHeader.split(" ")[2];
                //verify token
                const response = await jwt.verify(token, process.env.JWT_SECRET)

                if (response) {
                    const uid = response.uid

                    const roleCheckQuery = `SELECT role FROM user_master where id=${uid}`

                    const result = await queryExecuter(roleCheckQuery)

                    var role = result[0].role

                    if (role == "student") {
                        const studentData = await queryExecuter(`select * from student_master where id=${uid}`)
                        res.status(200).json({
                            "status": "success",
                            data: studentData ? studentData[0] : [],
                            "message": "Data fetch successfully."
                        });
                    } else if (role == "faculty") {
                        const facultyData = await queryExecuter(`select * from faculty_master where id=${uid}`)
                        res.status(200).json({
                            "status": "success",
                            data: facultyData ? facultyData[0] : [],
                            "message": "Data fetch successfully."
                        });
                    }
                } else {
                    res.status(401).json({ status: "failed", message: "UnAuthorization User." });
                }
            }
        } catch (e) {
            res.status(400).json({ status: "failed", message: e.message });
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