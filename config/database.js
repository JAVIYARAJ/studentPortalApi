const mysql=require("mysql2")

const conn=mysql.createConnection({
    database:'student_io',
    host: 'localhost',
    user: 'root',
    password: 'root',
    port:3306
})


conn.connect(()=>{
    console.log("database connect successfully")
})

module.exports =conn