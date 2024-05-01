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
let queueMatch = []
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

     socket.on("findMatch", (req)=>{
        //{
        //  min:,
        //  userID:
        //}
        const check = queueMatch.some((user)=> req.userID === user.userID)
        if(check){
            console.log("Exist user")
            socket.emit("getErrorMatch", "User has aldready find match")
            return;
        }
        const result = queueMatch.find((user)=> req.min === user.min)
        if(result){
           queueMatch = queueMatch.filter((user)=> user.userID !== result.userID)
           console.log(queueMatch)
           const data = {
            user1: result,
            user2: req
           }
           io.to(result.socketID).emit("getMatchData", data)
           io.to(socket.id).emit("getMatchData",data)
        }
        else{
            queueMatch.push({
                min: req.min,
                userID: req.userID,
                socketID: socket.id
            } )
            console.log(queueMatch)
        }
     })

     socket.on("cancelFindMatch", (userID)=>{
        queueMatch = queueMatch.filter((user)=> user.userID !== userID)
     })
    
     socket.on("completeTurn", (res)=>{
        console.log(board)
        io.to(res.socketID).emit("getTurn", res.board)
     })

    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter((user)=> user.socketID !== socket.id)
        queueMatch = queueMatch.filter((user)=> user.socketID !== socket.id)
        io.emit("getOnlineUsers", onlineUsers)

    });

    //**------------------------------------- */

})