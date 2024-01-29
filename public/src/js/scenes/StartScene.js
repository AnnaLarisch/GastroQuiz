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
      
      // Scene management
      self = this;
      const cameraWidth = self.cameras.main.width
      const cameraHeight = self.cameras.main.height

      // Launch UI scene and Background scene
      self.scene.launch("UIScene");
      self.scene.get("UIScene").scene.setVisible(true);
      self.scene.get("UIScene").scene.bringToTop();
      self.scene.launch("BackgroundScene");
      self.scene.get("BackgroundScene").scene.setVisible(true);
      self.scene.get("BackgroundScene").scene.sendToBack();

      // HTML element placement & setup
      elementStartSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('startSceneHTML');
      
      startbutton = new MyDOMElement(self, 360, 500, elementStartSceneHTML.getChildByID("startbutton")); 
      startbutton.setOrigin(0,0).addListener('click');

      // Phaser game element placement & setup


      const title_gastro_quiz = self.add.image(0, 0, 'title_gastro_quiz')
      .setOrigin(0)

      title_gastro_quiz.setScale(Math.max(cameraWidth / title_gastro_quiz.width, cameraHeight / title_gastro_quiz.height))

      currentConnectedPlayersText = self.add.text(15, 815, 'Connected: ' + Global.currentConnectedPlayers);
      socket.emit('setPlayerClassServer');

      startbutton.on('click', function (pointer){
        if (playerReady){
          playerReady = false;
          document.getElementById("startbutton").innerHTML = "Nicht Bereit!";
          document.getElementById("startbutton").classList.remove('btn-outline-primary')
          document.getElementById("startbutton").classList.add('btn-outline-secondary')

        }
        else{
          playerReady = true;
          document.getElementById("startbutton").innerHTML = "Bereit!";
          document.getElementById("startbutton").classList.add('btn-outline-primary')
          document.getElementById("startbutton").classList.remove('btn-outline-secondary')
        }
        socket.emit('setPlayerReadyServer', playerReady);
      });



      // Socket Interactions

      // Set the player counter correctly

      socket.on('setPlayerClassGame', function(playerCountCurrent){
        Global.currentConnectedPlayers = playerCountCurrent;
        currentConnectedPlayersText.setText('Connected: ' + Global.currentConnectedPlayers);
        if (Global.currentConnectedPlayers == 1){
          Global.isHost = true;
        }
        if (Global.currentConnectedPlayers == 2 && !Global.isHost){
          Global.isGuest = true;
        }
      });

      // End start scene and start into category choice scene
      socket.on('startGame', function(){
        startbutton.destroy();
        self.scene.launch("CategoryChoiceScene");

        self.scene.get("StartScene").scene.setVisible(false);
        self.scene.get("StartScene").scene.setActive(false);

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

    }

    update() {

    }
}