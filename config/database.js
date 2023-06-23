const mysql=require("mysql2")
require('dotenv').config()

const conn=mysql.createConnection({
    database:process.env.DATABASE,
    host: process.env.HOSTNAME,
    user: "root",
    password:process.env.password,
    port:process.env.database_port,
})


conn.connect(()=>{
    console.log("database connect successfully")
})

module.exports =conn