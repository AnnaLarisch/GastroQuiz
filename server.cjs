// Server Configuration

var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// Game Configurarion

var playerCountOverall = 0;
var playerCountCurrent = 0;
var playerCountReady = 0;
var playerCountMax = 2;

var hostIsReady = false;
var guestIsReady = false;

/*
  Player object:
    - playerID: Simple integer counter
    - socketID: 20 character long socket.id string
    - connectionsStatus: "disconnected" / "connected"
*/
var player = {
  playerID: 0,
  socketID: "empty",
  connectionStatus: "disconnected"
};
var playerList = [player];



// Player connection

io.on('connection', function (socket) {

    

    playerList[playerCountOverall] = {
      playerID: playerCountOverall,
      socketID: socket.id,
      connectionStatus: "connected"
    }
    
    console.log('User with PlayerID: ', playerList[playerCountOverall].playerID, ' and with SocketID: ', playerList[playerCountOverall].socketID, ' has connected!\n');
    playerCountOverall ++;
    playerCountCurrent ++;
    if (playerCountOverall <= playerCountMax){
      socket.join('game');
    }
    else{
      gameFull = true;
      socket.join('gameFull');
      console.log("The game is full, there are already " + playerCountMax + " players!");
    }

  

  

  socket.on("disconnect", (reason) => {
    player = getPlayer(socket);
    console.log('User with PlayerID: ', player.playerID, ' and with SocketID: ', player.socketID, ' has disconnected!');
    console.log('Reason: ', reason);
    playerList[player.playerID].connectionStatus = "disconnected" 
    playerCountCurrent --;
    io.in('game').emit('setPlayerCountCurrent', playerCountCurrent);
    if (playerCountCurrent == 0){
      console.log('All players left. The server will now close down');

      io.close()
      
    }
  });

  socket.on('getPlayerCountCurrent', function (){
    if (playerCountCurrent <= playerCountMax){
      io.in('game').emit('setPlayerCountCurrent', playerCountCurrent);
    }
    else{
      io.in('gameFull').emit('gameFullCall');
    }

  });

  socket.on('setPlayerReady', function (isHost, isGuest){
    if (isHost && !isGuest){
      hostIsReady = true;
    }
    if (!isHost && isGuest){
      guestIsReady = true;
    }
    if (hostIsReady && guestIsReady){
      io.in('game').emit('startGame');
    }
  });

  socket.on('tellCategoriesServer', function(categoriesList){
    io.in('game').emit('tellCategoriesGame', categoriesList);
  });

  socket.on('tellQuestionServer', function(currentQuestion, correct_answer, currentAnswers, shuffleAnswers){
    io.in('game').emit('tellQuestionGame', currentQuestion, correct_answer, currentAnswers, shuffleAnswers);
  });
  socket.on('launchQuestionSceneServer', function(){
    io.in('game').emit('launchQuestionSceneGame');
  });
  socket.on('increaseScoreServer', function(hostScored, guestScored){
    io.in('game').emit('increaseScoreGame', hostScored, guestScored);
  });
  

});


function getPlayer(socket){
  for (let i = 0; i < playerList.length; i++) {
    if (String(playerList[i].socketID) === String(socket.id)) {
      return(playerList[i]);
    }
  }
  return null;
}


// Server listens on port 80 for join requests
// use 8081 for localhost testing and 80 for heroku server testing

const PORT = process.env.PORT || 8081;


server.listen(PORT, function () {
  console.log(`Listening on ${server.address().port}`);
});