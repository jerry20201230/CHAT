
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {

  maxHttpBufferSize: 1e8
});
const port = process.env.PORT || 3000;

app.get(/js|icon/, (req, res) => {
  res.sendFile(`${__dirname}/${req.path}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
var user = ["admin01"]
var nickname = ["🔧聊天室管理員<span class='badge bg-secondary text-light'>機器人</span>"]
var socketID = ["server"]
var statue = ["線上"]

var roomName = ["主聊天室","MyRoom"]
var roomID = ["@room-1","@room-123"]
var roomPws = ["","102030."]
var room_socketID = [["server"],["server"]]



var typeing = []


var lastmsg = ""
var msgCount = 0
var lastID = ""

var fileID= 0
//////////////////////////////////////////////////
function arrayRemove(arr, value) {

  return arr.filter(function (ele) {
    return ele != value;
  });

}
function arrayRemove_val(arr, value) {
  var b = '';
  for (b in arr) {
    if (arr[b] === value) {
      arr.splice(b, 1);
      break;
    }
  }
  return arr;
};
function GetUserInRoom(room){
  let roomUsers= io.sockets.adapter.rooms.get(room)
 // console.log(io.sockets.adapter.rooms.get())
  return roomUsers
}
Math.getRandomInt = function (max) {
  return Math.floor(Math.random() * max);
}
/////////////////////////////////////////////////

io.on('connection', (socket) => {

  socket.on('GetID',msg =>{
    var random = Math.getRandomInt(9999)
    while (nickname.includes("User"+random)) {
      random  = Math.getRandomInt(9999)
    }
    socket.myid = random
    io.to(socket.id).emit("PostID","User"+random)
  })

  socket.on('create',msg =>{
    i = socket.id
    var random = Math.getRandomInt(9999)
    while (roomID.includes("@room-"+random)) {
      random  = Math.getRandomInt(9999)
    }
    roomName.push(msg.name)
    roomPws.push(msg.pws)
    room_socketID.push(["server"])
    roomID.push('@room-'+random)
    io.to(i).emit("created",{'id':'@room-'+random,'name':msg.name,'pws':msg.pws})


  })

  socket.on("statue",msg=>{
    
    if(msg.statue.includes('online')){statue[socketID.indexOf(socket.id)] = "線上"}
    else
    if(msg.statue.includes('leave')){statue[socketID.indexOf(socket.id)] = "離開"}
    else
    if(msg.statue.includes('busy')){statue[socketID.indexOf(socket.id)] = "忙碌"}
    else
    if(msg.statue.includes('disconnect')){statue[socketID.indexOf(socket.id)] = "離線"}

  
  })

  socket.on("join",msg=>{
    i = socket.id
    console.log(i);
    if(roomPws[roomID.indexOf(msg.room)] == msg.pws){
      io.to(socket.id).emit("welcome",roomName[roomID.indexOf(msg.room)])
      console.log(msg.id+"joined"+msg.room)
      nickname.push(msg.nickname)
      user.push(msg.id)
      socketID.push(i)
      room_socketID[roomID.indexOf(msg.room)].push(i)

      socket.join(msg.room)

      console.log(GetUserInRoom(msg.room))
      io.emit('sys-info chat message',{"to":roomName[roomID.indexOf(msg.room)],"msg": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已加入"});
      io.to(socket.id).emit("sys-info chat message",{"to":"you","msg": "[伺服器回應] " + nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 歡迎來到聊天室~"});

      let room = msg.room,
      return_user_arr = [],
      return_nickname_arr = [],
      return_statue_arr = [];
      console.log(msg.room)
      console.log(room_socketID)
      console.log(roomName.indexOf(room))
      for(i=0;(i < room_socketID[roomID.indexOf(room)].length);i++){
        if(user[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])] !== undefined){
        return_user_arr.push(user[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])])
        return_nickname_arr.push(nickname[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])])
        return_statue_arr.push(statue[socketID.indexOf(room_socketID[roomID.indexOf(room)[i]])])
        }
      }
     console.log(return_nickname_arr)
     console.log(return_user_arr)
     io.emit("UserList", {"to":room, "userID":return_user_arr, "nickname": return_nickname_arr,"statue":return_statue_arr})

    }
    else if(roomName[roomID.indexOf(msg.room)] == -1){
      io.to(socket.id).emit("room not found",msg.room)
    }

    else if(roomPws[roomID.indexOf(msg.room)] !== msg.pws){
      io.to(socket.id).emit("password incorrect",msg.room)
    }







  })


  socket.on('chat message room', msg => {


    i = socket.id

    if (msg.msg === "!DEV /_") {
      io.to(i).emit("sys-info chat message", "[伺服器回應][重要!]你已經是開發人員")
      io.to(i).emit('typeing', "開發人員模式已啟用")
    } else {


      console.log(msg.room+nickname[socketID.indexOf(i)] + " (" + i + ") 發布了: " + msg.msg)

      io.emit('chat message room', {"msg":nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發布了: " + msg.msg,"room":msg.room});
      if (lastmsg == msg.msg && i == lastID) {
        msgCount += 1
        if (msgCount == 2) {
          io.to(i).emit('sys-warn chat message', "[伺服器警告!] " + nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 請勿洗版，否則我們將斷開你的連線!")
        } else if (msgCount == 3) {
          io.to(i).emit("BAN", "byebye");
          io.emit("sys-info chat message", {"to":msg.to,"msg":nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線"})
        }
      }
      else {
        lastmsg = msg.msg
        msgCount = 0
        lastID = i
      }
    }
  });

  socket.on('typeing', msg => {
  /*  i = socket.id 
    _display = ""

    if (typeing.indexOf(i) == -1) {
      typeing.push(i)
    }
    console.log(typeing)
    if (typeing === []) {
      console.log("no one is typeing")
      io.emit('typeing', " ")
    } else {

      for (let a = 0; a < typeing.length; a++) {

        _display = _display + nickname[socketID.indexOf(typeing[a])] + " (" + user[socketID.indexOf(typeing[a])] + ")<br>"
      }

      if (_display + " 正在輸入..." == " 正在輸入...") {
        io.emit('typeing', {'to':msg.rooom,'msg':"&nbsp;"})
      } else {
        console.log(_display + " 正在輸入...")
        io.emit('typeing', _display + " 正在輸入...")
      }

    }
*/
  });
  socket.on('typeing-end', function (msg) {
  /*  _display = ""
    typeing = arrayRemove(typeing, msg)
    console.log(typeing)
    for (let a = 0; a < typeing.length; a++) {

      _display = _display +  nickname[socketID.indexOf(typeing[a])] + " (" + user[socketID.indexOf(typeing[a])] + ")<br>"
    }

    console.log(_display + " 正在輸入...")
    io.emit('typeing', _display + " 正在輸入...")
  
  */});




  socket.on('send img', function (msg) {
    i = socket.id
    fileID++
    io.emit('send img', {"to":msg.to, "text": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送了圖片:", "src": msg.src,"filename":msg.filename, "id": 'img-' + fileID ,"alt": (nickname[(user.indexOf(i))] + " (" + i + ") 發送的圖片")})

    if (lastmsg == msg.src && i == lastID) {
      msgCount += 1
      if (msgCount == 2) {
        io.to(i).emit('sys-warn chat message', "[伺服器警告!] " + nickname[socketID.indexOf(i)] + " (" + i + ") 請勿洗版，否則我們將斷開你的連線!")
      } else if (msgCount == 3) {
        io.to(i).emit("BAN", "byebye");
        

        io.emit("sys-info chat message", {"to":msg.to,"msg":nickname[socketID.indexOf(i)] + " (" + i + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線"})

   
 
        
      }
    }
    else {
      lastmsg = msg
      msgCount = 0
      lastID = i
    }
  });




  socket.on('send txt', function (msg) {
    i = socket.id
    fileID++
    io.emit('send txt', {"to":msg.to, "text": (nickname[(user.indexOf(i))] + " (" + i + ") 發送了文字文件:"), "src": msg.src, "id": 'txt-' + fileID ,"filename":msg.filename})

    if (lastmsg == msg.src && i == lastID) {
      msgCount += 1
      if (msgCount == 2) {
        io.to(i).emit('sys-warn chat message', "[伺服器警告!] " + nickname[socketID.indexOf(i)] + " (" + i + ") 請勿洗版，否則我們將斷開你的連線!")
      } else if (msgCount == 3) {
        io.to(i).emit("BAN", "byebye");
        io.emit("sys-info chat message", nickname[socketID.indexOf(i)] + " (" + i + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線")
      }
    }
    else {
      lastmsg = msg
      msgCount = 0
      lastID = i
    }
  });




  socket.on('GetUsers', msg => {
 //   
    let room = msg.room,
    return_user_arr = [],
    return_nickname_arr = [],
    return_statue_arr = [];
    console.log(msg.room)
    console.log(room_socketID)
    console.log(roomName.indexOf(room))
    for(i=0;(i < room_socketID[roomName.indexOf(room)].length);i++){
      if(user[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])] !== undefined){
      return_user_arr.push(user[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
      return_nickname_arr.push(nickname[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
      return_statue_arr.push(statue[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
      }
    }
   console.log(return_nickname_arr)
   console.log(return_user_arr)
   console.log(return_statue_arr)
   io.emit("UserList", {"to":room, "userID":return_user_arr, "nickname": return_nickname_arr,"statue":return_statue_arr})
   
  })
  socket.on('rename_nickname', msg => {
    i = socket.id
    _nic = nickname[socketID.indexOf(i)]
    if (nickname.includes(msg)) {
      io.to(i).emit("sys-info chat message", "[伺服器回應] " + _nic + " (" + i + ") 請勿使用與別人相同的暱稱")
    } else {
      _nic = nickname[socketID.indexOf(i)]
      console.log(_nic + " (" + i + ") 已更改暱稱為: " + msg)
      nickname[socketID.indexOf(i)] = msg
      io.emit("NM", user + nickname)
      io.emit('sys-info chat message', _nic + " (" + i + ") 已更改暱稱為: " + msg);
      io.emit("UserList", { "userID": user, "nickname": nickname})
    }

  });



  socket.on('disconnect', function () {
    i = socket.id

    typeing = arrayRemove(typeing, i)

    _display = ""

    console.log(typeing)
    for (let a = 0; a < typeing.length; a++) {

      _display = _display + nickname[socketID.indexOf(typeing[a])] + " (" + user[socketID.indexOf(typeing[a])] + ")<br>"
    }

    console.log(_display + " 正在輸入...")
    io.emit('typeing', _display + " 正在輸入...")




    console.log(`user[${socket.id}] disconnected`);
    console.warn((roomName))
    console.log(room_socketID)

    for (let o = 0; o < room_socketID.length; o++) {
      let k = room_socketID[o]
      if(k.includes(i)){
        console.log("u")
        console.log(roomName[o])
        io.emit("sys-info chat message",{"to":roomName[o],"msg":nickname[socketID.indexOf(i)]+" ("+user[socketID.indexOf(i)]+" ) 已離線"})
        //room_socketID[roomID.indexOf(roomName[o])] = arrayRemove(room_socketID[roomID.indexOf(roomName[o])] ,i)
        //console.log(room_socketID)
        //console.log(roomID.indexOf(roomName[o]))
      }
    }


    //io.to(room_socketID[room_socketID.indexOf(i)]).emit("sys-info chat message", nickname[socketID.indexOf(i)] + " (" + i + ") 已離線")
    console.log(socketID.indexOf(i))
    user = arrayRemove(user,user[socketID.indexOf(i)])
    nickname = arrayRemove(nickname,nickname[socketID.indexOf(i)])
    socketID = arrayRemove(socketID, socketID[socketID.indexOf(i)])
    
    console.log(user)
    console.log(nickname)
    console.log(socketID)

    //io.emit("UserList", { "userID": user, "nickname": nickname })

  })

});

http.listen(port, () => {
  console.log("Hi,There!")
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
