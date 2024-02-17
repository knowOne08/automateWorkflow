const express = require('express')
const server = express()

server.all("/",(req,res)=>{
    console.log("Worflow is running")
    res.send("Workflow is running")
})

function keepAlive(){
    server.listen(3000,()=>{
        console.log("Server is Ready")
    })
}
module.exports = keepAlive