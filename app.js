const express = require("express")
const app = express()
const cors = require("cors")
const http = require("http").createServer(app)
require("dotenv").config()
const port = process.env.PORT

http.listen(port, ()=>{
    console.log("Listen and run at port: " + port)
})

app.use(cors())
app.get("/ping", (req,res)=>{
    return res.status(200).json({
        message: "pong"
    })
})

const {Server} = require("socket.io")
const io = new Server(http, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket)=>{
    console.log(`${socket.id} connected`)

    //**Code socket's event listener here */


    //**------------------------------------- */

})