const executer = require('../service/helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
class AuthController {

    static userLogin = async (req, res) => {
        res.status(202).json("success");
    }

    static studentRegistration = async (req, res) => {
        const { fname, lname, email, password, cpassword, city, bod, address, image, phone } = req.body;

        if (fname && lname && email && password && cpassword && city && bod && address && phone) {

            if (password === cpassword) {
                try {
                    const salt = await bcrypt.genSalt(10)
                    const hashPassword =await bcrypt.hash(password,salt)
                    console.log(hashPassword)
                    const token = jwt.sign({ email }, process.env.JWT_SECRET, { "expiresIn": "5d" })

                    res.status(200).json({status: "success",message:"Register successfully",token:token})

                } catch (e) {
                    res.status(404).json({ status: "failed", message:e.message})
                }
            } else {
                res.status(400).json({ status: "failed", message: "password and confirm password not match" })
            }

        } else {
            res.status(400).json({ status: "failed", message: "please enter all values" })
        }

        // const userQuery = `INSERT INTO user_master(id, email, role, isDeleted, password) VALUES ('1', '${email}', 'student', '0', 'raj@123');`

        // const query = `INSERT INTO student (std_id, fname, lname, email, city, address, bod, phonenumber) VALUES ('1', '${fname}', '${lname}', '${email}', '${city}', '${address}', '${bod}', '${phone}');
        // `
    }
}

module.exports = AuthController