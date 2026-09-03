import {io} from "../../app.js"

let mainIO
// let mainSocket

export const setSocketHandler=(thisIO)=>{
    mainIO=thisIO

    mainIO.on('connection',(socket)=>{
        console.log('-----------------a user connected-----------------');

        socket.emit('TEST','test')
    })
}

export const sendSocketMessage=(group,message)=>{
    mainIO.emit(group,message)
}

export const sendSocketToRoomMessage=(room,group,message)=>{
    mainIO.to(room).emit(group,message)
}

export const sendSocketToSocketIdMessage=(socketId,group,message)=>{
    mainIO.to(socketId).emit(group,message)
}



// io.on('connection', (socket) => {
//   console.log('-----------------a user connected-----------------');
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });

// const socket = io()

// io.on("connection",()=>{

//     console.log('-----------------Another Connection Check-----------------')

   

// })


// export const sendTest=()=>{
//      socket.emit('TEST','THIS IS A test')
// }