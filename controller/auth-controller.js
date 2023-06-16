const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
class AuthController {

    static userLogin = async (req, res) => {
        const { email, password } = req.body

        if (email && password) {

            const result = await executer(`SELECT password,role FROM user_master where email="${email}"`)
            if (result.length > 0) {
                const loggedInUser = result[0]
                const isMatch = await bcrypt.compare(password, loggedInUser.password)
                if (isMatch) {
                    const token = await jwt.sign({ email }, process.env.JWT_SECRET, { "expiresIn": "5d" })

                    res.status(200).json({ status: "success", message: "Login successfully", token: token });

                } else {
                    res.status(400).json({ status: "failed", message: "email or password is not valid" })
                }
            } else {
                res.status(400).json({ status: "failed", message: "user not exists" })
            }



        } else {
            res.status(400).json({ status: "failed", message: "please enter email and password" })

        }
    }

    static studentRegistration = async (req, res) => {
        const { fname, lname, email, password, cpassword, city, bod, address, image, phone, role, standard, graduation, percentage } = req.body;

        if (fname && lname && email && password && cpassword && city && bod && address && phone && standard && percentage) {

            if (password === cpassword) {
                try {


                    //check that is the user already exists or not
                    var isActiveUser = await executer(`SELECT count(*) as count from user_master where email="${email}"`)

                    const activeCount = isActiveUser[0].count

                    if (activeCount > 0) {
                        res.status(400).json({ status: "failed", message: "email already exists" })
                    } else {
                        //create account

                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password, salt)
                        const token = jwt.sign({ email }, process.env.JWT_SECRET, { "expiresIn": "5d" })

                        const userQuery = `INSERT INTO user_master(email, role, isDeleted, password) VALUES ('${email}', '${role}', '0', '${hashPassword}');`

                        const userResult = await executer(userQuery)

                        const uid = userResult.insertId


                        const studentQuery = `INSERT INTO student (std_id, fname, lname, email, city, address, bod, phonenumber) VALUES ('${uid}', '${fname}', '${lname}', '${email}', '${city}', '${address}', '${bod}', '${phone}');`

                        const studentResult = await executer(studentQuery)

                        const studentEducationQuery = `INSERT INTO student_education_master (edu_id, standard, graduation, percentage) VALUES ('${uid}', '${standard}', '${graduation}', ${percentage});
                        `

                        const eduResult = await executer(studentEducationQuery)


                        res.status(201).json({ status: "success", message: "Register successfully", token: token });
                    }



                } catch (e) {
                    res.status(400).json({ status: "failed", message: e.message })
                }
            } else {
                res.status(400).json({ status: "failed", message: "password and confirm password not match" })
            }

        } else {
            res.status(400).json({ status: "failed", message: "please enter all values" })
        }

    }

    static forgotPassword = async (req, res) => {
        const { email } = req.body

        if (email) {
            const result = await this.isActiveUser(email)
            if (result) {
                res.status(200).json({ status: "success", message: "mail sent" })
            } else {
                res.status(400).json({ status: "failed", message: "user not exists" })
            }
        } else {
            res.status(400).json({ status: "failed", message: "please enter email" })
        }

    }

    static isActiveUser = async (email) => {
        var isActiveUser = await executer(`SELECT count(*) as count from user_master where email="${email}"`)

        const activeCount = isActiveUser[0].count

        return activeCount > 0
    }

}

module.exports = AuthController