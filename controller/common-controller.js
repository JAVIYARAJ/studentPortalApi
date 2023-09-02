const executer = require('../service/helper')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const queryExecuter = require('../service/helper')

require('dotenv').config()

class CommonController {

    
    static getSubjects = async (req, res) => {
        const authHeader = req.headers['authorization']
        const { semester, sort, limit, offset } = req.query

        try {
            if (!authHeader) {
                res.status(401).json({ status: "failed", message: 'Authorization header missing.' })
            } else {
                const token = authHeader.split(" ")[2];
                //verify token
                const response = await jwt.verify(token, process.env.JWT_SECRET)

                if (response) {
                    const uid = response.uid

                    var isActiveUser = await this.isActiveUser(uid)

                    if (isActiveUser) {

                        if (sort && limit && offset) {

                            if(semester!=undefined && typeof semester === 'string'){
                                    const result=await executer(`select * from subject_master where semester=${semester} order by semester ${sort} limit ${limit} offset ${offset}`)

                                    res.status(200).json({ status: "success", message: 'subject get successfully.', data: result })
                            }else{
                                //all sem
                                const result=await executer(`select * from subject_master order by semester ${sort} limit ${limit} offset ${offset}`)

                                res.status(200).json({ status: "success", message: 'subject get successfully.', data: result })


                            }
                        } else {
                            res.status(400).json({ status: "failed", message: "please provide all query parameters." });
                        }
                    } else {
                        res.status(400).json({ status: "failed", message: "user not exists." });
                    }

                } else {
                    res.status(401).json({ status: "failed", message: "UnAuthorization User." });
                }
            }
        } catch (e) {
            res.status(400).json({ status: "failed", message: e.message });
        }

    }

    static isActiveUser = async (id) => {
        var isActiveUser = await executer(`SELECT count(*) as count from user_master where id="${id}"`)

        const activeCount = isActiveUser[0].count

        return activeCount > 0
    }
    
}

module.exports = CommonController