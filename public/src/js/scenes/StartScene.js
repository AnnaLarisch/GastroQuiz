import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'


var self;
var startbutton;
var quitbutton;
var currentConnectedPlayersText;

export default class StartScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StartScene' });
    }
  
    preload() {
      this.load.html('startSceneHTML', 'src/html/StartScene.html');
      this.load.image('title_gastro_quiz', 'assets/scenes/StartScene/title_gastro_quiz.png')

    }
    
    create() {
      self = this;

      
      self.scene.launch("UIScene");

      self.scene.get("UIScene").scene.setVisible(true);
      self.scene.get("UIScene").scene.bringToTop();

      const socket = getSocket();
      
    

      var element = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('startSceneHTML');
      var title_gastro_quiz = self.physics.add.sprite(0, 20, 'title_gastro_quiz').setOrigin(0,0);
      currentConnectedPlayersText = self.add.text(15, 815, 'Connected: ' + Global.currentConnectedPlayers);

      startbutton = new MyDOMElement(self, (CONFIG.DEFAULT_WIDTH/2)-50, 400, element.getChildByID("startbutton")); 
      quitbutton = new MyDOMElement(self, 338, 820, element.getChildByID("quitbutton")); 

      startbutton.setInteractive();
      quitbutton.setInteractive();
      

      socket.emit('getPlayerCountCurrent');

      

      startbutton.on('pointerdown', function (pointer){
        console.log("Player is ready!");
        socket.emit('setPlayerReady', Global.isHost, Global.isGuest);
      });

      socket.on('setPlayerCountCurrent', function(playerCountCurrent){
        Global.currentConnectedPlayers = playerCountCurrent;
        currentConnectedPlayersText.setText('Connected: ' + Global.currentConnectedPlayers);
        if (Global.currentConnectedPlayers == 1){
          Global.isHost = true;
        }
        if (Global.currentConnectedPlayers == 2 && !Global.isHost){
          Global.isGuest = true;
        }
      });

      socket.on('startGame', function(){
        startbutton.destroy();
        quitbutton.destroy();
        self.scene.launch("CategoryChoiceScene");

        self.scene.get("StartScene").scene.setVisible(false);
        self.scene.get("StartScene").scene.setActive(false);

      });


      socket.on('gameFullCall', function(){
        startbutton.destroy();
        quitbutton.destroy();
        self.scene.launch("GameFullScene");

        self.scene.get("StartScene").scene.setVisible(false);
        self.scene.get("StartScene").scene.setActive(false);
        socket.emit('disconnect', "Game is full.");

      });
  
    }

    update() {
    }

 
}