import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'


// Game variables
var self;
const socket = getSocket();

// HTML element variables
var elementStartSceneHTML;
var startbutton;
var groupnameinput;
var waitingtext;
var connectedTeamstext;

// Phaser game element variables
var currentConnectedPlayersText;
var title_gastro_quiz;

// Gameplay variables
var playerReady = false;

export default class StartScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StartScene' });
    }
  
    preload() {
      this.load.html('startSceneHTML', 'src/html/StartScene.html');
      this.load.image('title_gastro_quiz', 'assets/scenes/StartScene/start_scene_title_gastro_quiz.png')

    }
    
    create() {
      
      // <Scene Management> 
      self = this;
      const cameraWidth = self.cameras.main.width
      const cameraHeight = self.cameras.main.height
      // </Scene Management> 

      // <Launch UI Scene, Reaction Scene, Background Scene>
 

      self.scene.launch("UIScene");
      self.scene.get("UIScene").scene.setVisible(true);
      self.scene.get("UIScene").scene.bringToTop();
      self.scene.launch("ReactionScene");
      self.scene.get("ReactionScene").scene.setVisible(true);
      self.scene.get("ReactionScene").scene.bringToTop();
      self.scene.launch("BackgroundScene");
      self.scene.get("BackgroundScene").scene.setVisible(true);
      self.scene.get("BackgroundScene").scene.sendToBack();
  
      // </Launch UI Scene, Reaction Scene, Background Scene>

      // <Place HTML DOM Elements>
      elementStartSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('startSceneHTML');
      
      groupnameinput = new MyDOMElement(self, 360, 500, elementStartSceneHTML.getChildByID("group_name")); 
      groupnameinput.setOrigin(0,0);
      startbutton = new MyDOMElement(self, 360, 550, elementStartSceneHTML.getChildByID("startbutton")); 
      startbutton.setOrigin(0,0).addListener('click');
      waitingtext = new MyDOMElement(self, 520, 630, elementStartSceneHTML.getChildByID("waitingInfo")); 
      waitingtext.setOrigin(0,0);
      connectedTeamstext = new MyDOMElement(self, 80, 730, elementStartSceneHTML.getChildByID("connectedTeams")); 
      connectedTeamstext.setOrigin(0,0);
      // </Place HTML DOM Elements>
     

      // Phaser game element placement & setup


      const title_gastro_quiz = self.add.image(0, 0, 'title_gastro_quiz')
      .setOrigin(0)

      title_gastro_quiz.setScale(Math.max(cameraWidth / title_gastro_quiz.width, cameraHeight / title_gastro_quiz.height))

      socket.emit('setPlayerClassServer');
      socket.emit('joinedGameServer');


      startbutton.on('click', function(pointer) {
        handleInput();
    });

    // Create a Key object for the Enter key
    var enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    enterKey.on('down', function (event) {
      handleInput();
    });
      



      // Socket Interactions

      // Set the player counter correctly

      socket.on('setPlayerClassGame', function(playerCountCurrent){
        Global.currentConnectedPlayers = playerCountCurrent;
        if (Global.currentConnectedPlayers == 1){
          Global.isHost = true;
        }
        if (Global.currentConnectedPlayers == 2 && !Global.isHost){
          Global.isGuest = true;
        }
      });

      // End start scene and start into category choice scene
      socket.on('startGame', function(){
        var name =  document.getElementById("group_name");

          if (Global.isHost){
            Global.playerOneName = name.value;
            console.log(name.value)
            socket.emit('setPlayerOneName', name.value);
          }
          if (Global.isGuest){
            Global.playerTwoName = name.value;
            console.log(name.value)
            socket.emit('setPlayerTwoName', name.value);
          }
          groupnameinput.destroy();
          startbutton.destroy();
          waitingtext.destroy();
          self.scene.launch("CategoryChoiceScene");
          //self.scene.launch("ChatScene");
  
  
          self.scene.get("StartScene").scene.setVisible(false);
          self.scene.get("StartScene").scene.setActive(false);
          self.scene.get("ReactionScene").scene.bringToTop();

   

      });

      // End start scene and start into gamefull scene (Only when lobby is already filled up)
      socket.on('callGameFullGame', function(){
        startbutton.destroy();
        self.scene.launch("GameFullScene");

        self.scene.get("StartScene").scene.setVisible(false);
        self.scene.get("StartScene").scene.setActive(false);
        socket.emit('disconnect', "Game is full.");
      });

      // Send opposing socket IDs to each other player for communication
      socket.on('setSockeId', function(hostId, guestId){
        Global.hostId = hostId;
        Global.guestId = guestId;
      });

      socket.on('setPlayerOneNameGlobal', function(name){
        Global.playerOneName = name;
        Global.categoryDecider = name;
      });

      socket.on('setPlayerTwoNameGlobal', function(name){
        Global.playerTwoName = name;

      });

      
      socket.on('joinedGamePlayers', function(playerCount){
        connectedTeamstext.setText("Verbunden: " + playerCount + "/2")
      });

      socket.on('notifyReadyPlayers', function(isReady, isHost){
        if (isHost == true){
          if(Global.isHost == false){
            if(isReady){
              waitingtext.setText("Gegnerisches Team is bereit!")
            }
            if(!isReady){
              waitingtext.setText("Warten auf gegnerisches Team...")
            }
          }
        }

        if (isHost == false){
          if(Global.isHost == true){
            if(isReady){
              waitingtext.setText("Gegnerisches Team is bereit!")
            }
            if(!isReady){
              waitingtext.setText("Warten auf gegnerisches Team...")
            }
          }
        }
        
      });

    }

    update() {
      var entername = document.getElementById("group_name");
      
      if (entername.value != "" && Global.currentConnectedPlayers == 2){
        document.getElementById("startbutton").disabled = false;
      }
      else{
        document.getElementById("startbutton").disabled = true;
      }


    }
}

function handleInput() {
  var validPattern = /^[a-zA-ZäöüÄÖÜ0-9-# ]+$/;
  var input = document.getElementById("group_name");

  if (validPattern.test(input.value) && input.value.length >= 3) {
      if (playerReady) {
          playerReady = false;
          document.getElementById("startbutton").classList.remove('btn-dark');
          document.getElementById("startbutton").classList.add('btn-outline-dark');
      } else {
          playerReady = true;
          document.getElementById("startbutton").classList.add('btn-dark');
          document.getElementById("startbutton").classList.remove('btn-outline-dark');
      }
      socket.emit('setPlayerReadyServer', playerReady);
      socket.emit('notifyReadyServer', playerReady, Global.isHost);
  } else if (validPattern.test(input.value) && input.value.length < 3) {
      document.getElementById("group_name").value = "Eingabe zu kurz!";
  } else {
      // If the input is invalid, handle the error
      document.getElementById("group_name").value = "Unerlaubte Eingabe!";
  }
}