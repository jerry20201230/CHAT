
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
var nickname = ["🔧聊天室管理員&nbsp;<span class='badge bg-secondary text-light'>機器人</span>&nbsp;<span class='badge bg-success text-light'>官方帳號</span>"]
var socketID = ["server"]
var statue = ["線上"]

var roomName = ["主聊天室", "MyRoom"]
var roomID = ["@room-1", "@room-123"]
var roomPws = ["", "102030."]
var room_socketID = [["server"], ["server"]]
var room_typeing = [[], []]

var room_setting_change = ["@admin01","@admin01"]
var room_setting_invite = ["@all","@all"]
var room_setting_remove = ["@all","@all"]
var room_setting_how_to_join = [{'pws':true,'invite':'allow'},{'pws':true,'invite':'auto'}]
var room_welcome_msg = ["歡迎加入<!s>主聊天室","測試人員聊天室<!s>歡迎你"]

var typeing = []

var TotalMsgCount = [0,0]

var lastmsg = ""
var msgCount = 0
var lastID = ""

var fileID = 0
//////////////////////////////////////////////////
function arrayRemove(arr, value) {

  return arr.filter(function(ele){ 
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
function GetUserInRoom(room) {
  let roomUsers = io.sockets.adapter.rooms.get(room)
  // console.log(io.sockets.adapter.rooms.get())
 // return roomUsers

/*if (io.sockets.adapter.rooms.has(room)) */return io.sockets.adapter.rooms.get(room)//.size
}
Math.getRandomInt = function (max) {
  return Math.floor(Math.random() * max);
}
/////////////////////////////////////////////////

io.on('connection', (socket) => {

  socket.on('GetID', msg => {
    var random = Math.getRandomInt(9999)
    while (nickname.includes("User" + random)) {
      random = Math.getRandomInt(9999)
    }
    socket.myid = random
    io.to(socket.id).emit("PostID", "User" + random)
  })

  socket.on('create', msg => {
  i = socket.id
    if(roomName.includes(msg.name)){
      console.log("includes")
io.to(i).emit("create err", { 'id': '@room-' + random, 'name': msg.name, 'pws': msg.pws })
  }
  else{
  
    var random = Math.getRandomInt(9999)
    while (roomID.includes("@room-" + random)) {
      random = Math.getRandomInt(9999)
    }
    roomName.push(msg.name)
    roomPws.push(msg.pws)
    room_socketID.push(["server"])

    room_setting_change.push(msg.setting.change)
    room_setting_invite.push(msg.setting.invite)
    room_setting_remove.push(msg.setting.remove)
    room_setting_how_to_join.push(msg.setting.how_to_join)
    room_welcome_msg.push(msg.setting.welcome_msg)
    

    roomID.push('@room-' + random)
    io.to(i).emit("created", { 'id': '@room-' + random, 'name': msg.name, 'pws': msg.pws })
  }

  })

  socket.on("statue", msg => {

    if (msg.statue.includes('online')) { statue[socketID.indexOf(socket.id)] = "線上" }
    else
      if (msg.statue.includes('leave')) { statue[socketID.indexOf(socket.id)] = "離開" }
      else
        if (msg.statue.includes('busy')) { statue[socketID.indexOf(socket.id)] = "忙碌" }
        else
          if (msg.statue.includes('disconnect')) { statue[socketID.indexOf(socket.id)] = "離線" }


  })

  socket.on("join", msg => {
    i = socket.id
    console.log(i);

    if (msg.pws == '##' && msg.room == `server-${i}`) {
      io.to(socket.id).emit("welcome", { 'name': 'robot', 'id':  '@admin1'})
    } else {
      if (roomPws[roomID.indexOf(msg.room)] == msg.pws) {
        
        socket.join(msg.room)

        console.log("JOIN")
        console.log(GetUserInRoom('@room-1'))
        io.to(socket.id).emit("welcome", { 'name': roomName[roomID.indexOf(msg.room)], 'id': roomID[roomID.indexOf(msg.room)] ,"msg":room_welcome_msg[roomID.indexOf(msg.room)]})
        console.log(msg.id + "joined" + msg.room)
        nickname.push(msg.nickname)
        user.push(msg.id)
        socketID.push(i)
        console.log(GetUserInRoom(msg.room))
        room_socketID[roomID.indexOf(msg.room)].push(i) //= Array.from(GetUserInRoom(msg.room)) //arrayRemove(room_socketID[roomID.indexOf(roomName[o])] ,i)
       // room_socketID[roomID.indexOf(msg.room)][0] = 'server'

        

        console.log(GetUserInRoom(msg.room))
        io.emit('sys-info chat message', { "to": roomName[roomID.indexOf(msg.room)], "head": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已加入 "+roomName[roomID.indexOf(msg.room)] ,'msg': nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已加入",'type':"join"});
//        io.to(socket.id).emit("sys-info chat message", { "to": "you", "msg": "[伺服器回應] " + nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 歡迎來到聊天室~" ,'head':"none"});

        let room = msg.room,
          return_user_arr = [],
          return_nickname_arr = [],
          return_statue_arr = [];
        console.log(msg.room)
        console.log(room_socketID)
        console.log(roomName.indexOf(room))
        for (i = 0; (i < room_socketID[roomID.indexOf(room)].length); i++) {
          if (user[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])] !== undefined) {
            return_user_arr.push(user[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])])
            return_nickname_arr.push(nickname[socketID.indexOf(room_socketID[roomID.indexOf(room)][i])])
            return_statue_arr.push(statue[socketID.indexOf(room_socketID[roomID.indexOf(room)[i]])])
          }
        }
        console.log(return_nickname_arr)
        console.log(return_user_arr)
        io.emit("UserList", { "to": room, "userID": return_user_arr, "nickname": return_nickname_arr, "statue": return_statue_arr })
      }

      else if (roomName[roomID.indexOf(msg.room)] == -1) {
        io.to(socket.id).emit("room not found", msg.room)
      }

      else if (roomPws[roomID.indexOf(msg.room)] !== msg.pws) {
        io.to(socket.id).emit("password incorrect", msg.room)
      }




    }


  })


  socket.on('chat message room', msg => {


    i = socket.id

    TotalMsgCount[roomName.indexOf(msg.room)] += 1



      console.log(msg.room +  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發布了: " + msg.msg)

      io.to(roomID[roomName.indexOf(msg.room)]).emit('chat message room', { "msg": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發布了:"+msg.msg, "room": msg.room ,"html": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ")","count":TotalMsgCount[roomName.indexOf(msg.room)]});
      if (lastmsg == msg.msg && i == lastID) {
        msgCount += 1
        if (msgCount == 2) {
          io.to(i).emit('sys-warn chat message', "[伺服器警告!] " + nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 請勿洗版，否則我們將斷開你的連線!")
        } else if (msgCount == 3) {
          io.to(i).emit("BAN", "byebye");
          io.emit("sys-info chat message", { "to": msg.to, "msg": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線" ,'head': nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已離線","type":"leave"})
        }
      }
      else {
        lastmsg = msg.msg
        msgCount = 0
        lastID = i
      }
    
  });

  socket.on('typeing', msg => {
    i = socket.id
    _display = ""

    console.log("----------------")
    console.log(room_typeing[roomName.indexOf(msg.room)])
    console.log("----------------")
    if (room_typeing[roomName.indexOf(msg.room)].indexOf(i) == -1) {
      room_typeing[roomName.indexOf(msg.room)].push(i)
    }
    console.log(room_typeing[roomName.indexOf(msg.room)])
    if (room_typeing[roomName.indexOf(msg.room)] === []) {
      console.log("no one is typeing")
      io.emit('typeing', " ")
    } else {

      for (let a = 0; a < room_typeing[roomName.indexOf(msg.room)].length; a++) {

        _display = _display + nickname[socketID.indexOf(typeing[a])] + " (" + user[socketID.indexOf(room_typeing[roomName.indexOf(msg.room)][a])] + ")<br>"
      }

      if (_display + " 正在輸入..." == " 正在輸入...") {
        io.emit('typeing', { 'to': msg.rooom, 'msg': "&nbsp;" })
      } else {
        console.log(_display + " 正在輸入...")
        io.emit('typeing', { "to": msg.room, "msg": _display + " 正在輸入..." })
      }

    }

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
    io.emit('send img', { "to": msg.to, "text": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送了圖片:", "src": msg.src, "filename": msg.filename, "id": 'img-' + fileID, "alt": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送的圖片" ,"head": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送了圖片", "src": msg.src, "filename": msg.filename})

    if (lastmsg == msg.src && i == lastID) {
      msgCount += 1
      if (msgCount == 2) {
        io.to(i).emit('sys-warn chat message', "[伺服器警告!] " +  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 請勿洗版，否則我們將斷開你的連線!")
      } else if (msgCount == 3) {
        io.to(i).emit("BAN", "byebye");


        io.emit("sys-info chat message", { "to": msg.to, "msg":  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線" ,'head': nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已離線","type":"leave"})




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
    io.emit('send txt', { "to": msg.to, "text": (nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送了文字文件:"), "src": msg.src, "id": 'txt-' + fileID, "filename": msg.filename,'head':(nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 發送了文字文件") })

    if (lastmsg == msg.src && i == lastID) {
      msgCount += 1
      if (msgCount == 2) {
        io.to(i).emit('sys-warn chat message', "[伺服器警告!] " +  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 請勿洗版，否則我們將斷開你的連線!")
      } else if (msgCount == 3) {
        io.to(i).emit("BAN", "byebye");
        io.emit("sys-info chat message", { "to": msg.to, "msg":  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 因大量發送相同訊息/洗版，已被伺服器中斷連線" ,'head': nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已離線","type":"leave"})
      }
    }
    else {
      lastmsg = msg
      msgCount = 0
      lastID = i
    }
  });




  socket.on('GetUsers', msg => {
     let room = msg.room
    //   decode the attr(data-room)is<server>?=>return:server.
    if(room == 'server'){
      io.emit("UserList", { "to": room, "userID": [user[0]], "nickname": [nickname[0]], "statue": statue[0],"self":true })
    }else{


   
   let   return_user_arr = [],
      return_nickname_arr = [],
      return_statue_arr = [];
    console.log(msg.room)
    console.log(room_socketID)
    console.log(roomName.indexOf(room))
    
    for (i = 0; (i < room_socketID[roomName.indexOf(room)].length); i++) {
      if (user[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])] !== undefined) {
        return_user_arr.push(user[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
        return_nickname_arr.push(nickname[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
        return_statue_arr.push(statue[socketID.indexOf(room_socketID[roomName.indexOf(room)][i])])
      }
    }
  
 


    console.log(return_nickname_arr)
    console.log(return_user_arr)
    console.log(return_statue_arr)
    io.emit("UserList", { "to": room, "userID": return_user_arr, "nickname": return_nickname_arr, "statue": return_statue_arr })
 }
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
      io.emit("UserList", { "userID": user, "nickname": nickname })
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

  
            console.log("u")
        console.log(GetUserInRoom(roomName[o]))
        console.log(GetUserInRoom(roomID[o]))
        console.log(room_socketID)
        
        room_socketID[o] = arrayRemove(room_socketID[o] ,i)

        //console.log(Array.from(GetUserInRoom(roomID[o])))
        io.emit("sys-info chat message", { "to": roomName[o], "msg": nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + " ) 已離線",'head': nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已離線","type":"leave" })
       
        
        console.log(room_socketID)
        console.log(roomID.indexOf(roomName[o]))
 

      
    }


    //io.to(room_socketID[room_socketID.indexOf(i)]).emit("sys-info chat message",  nickname[socketID.indexOf(i)] + " (" + user[socketID.indexOf(i)] + ") 已離線")

      console.log(socketID.indexOf(i))
    user = arrayRemove_val(user, socketID.indexOf(i))
    nickname = arrayRemove_val(nickname, socketID.indexOf(i))
    socketID = arrayRemove_val(socketID, socketID.indexOf(i))
    

    

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
