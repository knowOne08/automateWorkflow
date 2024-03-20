const express = require('express');

const app = express()


app.all("/", (req,res)=>{
    res.send("Working");
})
const keepAlive = () => {  
    app.listen(3000, ()=>{
        console.log("Sever running on port 3000")
    });
}

module.exports = keepAlive