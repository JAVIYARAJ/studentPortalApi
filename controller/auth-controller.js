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

        const { fname, lname, email, password, role, gender } = req.body

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
                    } else if (role == "admin") {

                        const salt = await bcrypt.genSalt(10)

                        const hashPassword = await bcrypt.hash(password, salt)

                        const userQuery = `INSERT INTO user_master(email,role,password) VALUES ('${email}', '${role}','${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId

                        const facultyQuery = `INSERT INTO admin_master (id, fname, lname, email,gender) VALUES ('${uid}', '${fname}', '${lname}', '${email}','${gender}');`

                        const facultyResult = await executer(facultyQuery)

                        res.status(200).json({
                            "status": "success",
                            "message": "Account created successfully.",
                        });
                    }
                    else {
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

    //working on it
    static forgotPassword = async (req, res) => {
        const { email, oldPassword, newPassword } = req.body

        if (email && oldPassword && newPassword) {

            const isActiveUser = this.isActiveUser(email)

            if (isActiveUser) {


                const result = await executer(`SELECT password as pwd FROM user_master where user_master.email='${email}'`)

                const isOldPassword = await bcrypt.compare(oldPassword, result[0].pwd)

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

                    if (role == "student" || role == "faculty" || role == "admin") {
                        const userData = await queryExecuter(`select * from ${role}_master where id=${uid}`)
                        res.status(200).json({
                            "status": "success",
                            data: userData ? userData[0] : [],
                            "message": "Data fetch successfully."
                        });
                    } else {
                        res.status(400).json({
                            "status": "failed",
                            "message": "permission denied for this user."
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

    static updateProfile = async (req, res) => {

        const authHeader = req.headers["authorization"]
        const { email, city, address, phoneNumber } = req.body

        if (!authHeader) {
            res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
        } else {
            const token = authHeader.split(" ")[2]

            const response = await jwt.verify(token, process.env.JWT_SECRET)

            if (response) {
                const uid = response.uid

                var isActiveUser = await executer(`SELECT count(*) as count,role from user_master where id="${uid}"`)

                const activeUserResult = isActiveUser[0]

                if (activeUserResult.count > 0) {

                    if (email && city && address && phoneNumber) {

                        const role = activeUserResult.role

                        const updateProfileQuery = `update ${role}_master set email='${email}',city='${city}',address='${address}',phonenumber='${phoneNumber}' where id=${uid}`

                        const result = await executer(updateProfileQuery)

                        res.status(200).json({ status: "success", message: "profile updated successfully." });

                    } else {
                        res.status(400).json({ status: "failed", message: "provide all parameters." });
                    }

                } else {
                    res.status(400).json({ status: "failed", message: "user not exists." });

                }
            } else {
                res.status(401).json({ status: "failed", message: "UnAuthorization User." });
            }
        }
    }
    
}

module.exports = AuthController