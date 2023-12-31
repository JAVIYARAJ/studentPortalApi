const mysql=require("mysql2")
const conn=require("../config/database")

async function queryExecuter(query){
    return new Promise((resolve, reject)=>{
        conn.query(query,(err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}

async function queryExecuter(query,data){
    return new Promise((resolve, reject)=>{
        conn.query(query,[data],(err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve(result)
            }
        })
    })
}

module.exports=queryExecuter