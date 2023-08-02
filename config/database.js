const mysql=require("mysql2")
require('dotenv').config()

const conn=mysql.createConnection({
    database:"studentio",
    host: "sample.cebpkg1kaupc.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password:"password",
    port:3306,
})


conn.connect((error)=>{
    console.log(error)
    console.log("database connect successfully")
})

module.exports =conn