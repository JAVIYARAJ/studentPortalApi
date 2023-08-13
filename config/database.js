const mysql=require("mysql2")
require('dotenv').config()

/*
const conn=mysql.createConnection({
    database:process.env.DATABASE,
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    password:process.env.PASSWORD,
    port:process.env.DATABASE_PORT,
})
*/

const conn=mysql.createConnection({
    database:"stdeunt_io",
    host:"localhost",
    user: "root",
    password:"root",
    port:3306,
})

conn.connect((error)=>{
    console.log("database connect successfully")
})

module.exports =conn