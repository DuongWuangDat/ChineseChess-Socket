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
let onlineUsers = []
io.on("connection", (socket)=>{
    console.log(`${socket.id} connected`)

    //**Code socket's event listener here */
    socket.on("addOnlineUser", (userID)=>{
        const check = onlineUsers?.some((user) => user.userID == userID) 
        if(check){
         const index = onlineUsers.findIndex((user) => user.userID == userID)
         onlineUsers[index].socketID = socket.id
        }else{
         onlineUsers.push({
             userID: userID,
             socketID: socket.id
         })
        }
         
         console.log(onlineUsers)
         io.emit("getOnlineUsers", onlineUsers)
     })
     
     socket.on("sendMessage", (req)=>{
         console.log(req.recipientID)
         const user = onlineUsers.find((userFind) => userFind.userID == req.recipientID)
         console.log(user)
         if(user){
             io.to(user.socketID).emit("getMessage", req)
         }
     })
    
    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter((user)=> user.userID !== userID)
        io.emit("getOnlineUsers", onlineUsers)
    });

    //**------------------------------------- */

})