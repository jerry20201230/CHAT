const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
  var user = []
  var nickname = []
  var people = 0
  var typeing = []


  var lastmsg = ""
  var msgCount = 0
  var lastID  = ""

  function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });

}    
Math.getRandomInt = function  (max) {
      return Math.floor(Math.random() * max);
    }
io.on('connection', (socket) => {

  socket.on('chat message', msg => {


    i = socket.id

    if(msg === "!DEV /_"){
      io.to(i).emit("sys-info chat message","[伺服器回應][重要!]你已經是開發人員")
      io.to(i).emit('typeing', "開發人員模式已啟用")
    }else{

    
    console.log(nickname[user.indexOf(i)]+" ("+i+") 發布了: "+msg)


    io.emit('chat message', nickname[user.indexOf(i)]+" ("+i+") 發布了: "+msg);
    if(lastmsg == msg && i == lastID){
      msgCount += 1
      if(msgCount == 2){
        io.to(i).emit('sys-warn chat message',"[伺服器警告!] "+nickname[user.indexOf(i)]+" ("+i+") 請勿洗版，否則我們將斷開你的連線!")
      }else if(msgCount == 3){
        io.to(i).emit("BAN","byebye");
        io.emit("sys-info chat message",nickname[user.indexOf(i)]+" ("+i+") 因大量發送相同訊息/洗版，已被伺服器中斷連線")
      }
    }
    else{
      lastmsg = msg
      msgCount = 0
      lastID = i
    }
  }
  });

i = socket.id
  console.log('user ' +i+ ' connected');
   people += 1
  console.log(i);
  user.push(i)
  r= Math.getRandomInt(9999)
  while(nickname.includes(r)){
    r= Math.getRandomInt(9999)
    console.log("X")
  }
  nickname.push("User"+(r))
  console.log(user)
  console.log(nickname)
  io.to(i).emit('nickname',nickname.at(-1))
  
  io.emit('sys-info chat message', nickname[user.indexOf(i)]+" ("+i+") 已加入");
  io.emit('people online',people)

  io.to(i).emit("sys-info chat message","[伺服器回應] "+ nickname.at(-1)+" ("+i+") 歡迎來到聊天室~")
  io.emit("UserList",{"userID":user,"nickname":nickname})
  socket.on('typeing', msg => {
    i = socket.id || msg
    _display = ""
    
    if(typeing.indexOf(i) == -1){
       typeing.push(i)
    }
    console.log(typeing)
    if(typeing === []){
      console.log("no one is typeing")
      io.emit('typeing'," ")
    }else{
   
    for(let a=0; a<typeing.length; a++){
    
      _display = _display + nickname[user.indexOf(typeing[a])]+" ("+typeing[a]+")"
    }

    if(_display+" 正在輸入..." == " 正在輸入..."){
      io.emit('typeing',"&nbsp;")
    }else{
         console.log( _display+" 正在輸入...")
    io.emit('typeing', _display+" 正在輸入...")
    }

    }





  });
  socket.on('typeing-end', function (msg) {
    _display = ""
   typeing =  arrayRemove(typeing,msg)
    console.log(typeing)
    for(let a=0; a<typeing.length; a++){

      _display = _display + nickname[user.indexOf(typeing[a])]+" ("+typeing[a]+")"
    }
  
    console.log( _display+" 正在輸入...")
    io.emit('typeing', _display+" 正在輸入...")
  });


  socket.on('GetUsers',msg =>{
     io.to(i).emit("UserList",{"userID":user,"nickname":nickname})
  })
  socket.on('rename_nickname', msg => {
    i = socket.id
    _nic = nickname[user.indexOf(i)]
    if(nickname.includes(msg)){
      io.to(i).emit("sys-info chat message","[伺服器回應] "+ _nic+" ("+i+") 請勿使用與別人相同的暱稱")
    }else{
          _nic = nickname[user.indexOf(i)]
    console.log( _nic+" ("+i+") 已更改暱稱為: "+msg)
    nickname[user.indexOf(i)] = msg
    io.emit("NM",user+nickname)
    io.emit('sys-info chat message', _nic+" ("+i+") 已更改暱稱為: "+msg);
    io.emit("UserList",{"userID":user,"nickname":nickname})
    }

  });


  socket.on('disconnect', function(){
    i = socket.id
 
    typeing =  arrayRemove(typeing,i)
    _display = ""

     console.log(typeing)
     for(let a=0; a<typeing.length; a++){
 
       _display = _display + nickname[user.indexOf(typeing[a])]+" ("+typeing[a]+")"
     }
   
     console.log( _display+" 正在輸入...")
     io.emit('typeing', _display+" 正在輸入...")



    
    console.log(`user[${socket.id}] disconnected`);
    io.emit("sys-info chat message",nickname[user.indexOf(i)]+" ("+i+") 已離線")
    people -= 1
    io.emit('people online',people)
   let _nickname = nickname[user.indexOf(i)]
   user =  arrayRemove(user,socket.id)
   nickname = arrayRemove(nickname,_nickname)
   console.log(user)
   console.log(nickname)
   io.emit("UserList",{"userID":user,"nickname":nickname})
    
   })
  
});

http.listen(port, () => {
  console.log("Hi,There!")
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
