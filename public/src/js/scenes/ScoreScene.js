import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'


// Game variables
var self;
const socket = getSocket();

var endGameText;

var scoreSceneHTML;

var startchattingbutton;

var startChatting = false;


export default class ScoreScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ScoreScene' });
    }
  
    preload() {
      this.load.html('scoreSceneHTML', 'src/html/ScoreScene.html');
      this.load.image('score_scene_game_over', 'assets/scenes/ScoreScene/score_scene_game_over.png')
    }
    
    create() {
      console.log("score scene")
      self = this;
 
      const cameraWidth = self.cameras.main.width
      const cameraHeight = self.cameras.main.height

      const score_scene_bg = self.add.image(0, 0, 'score_scene_game_over')
      .setOrigin(0)

      score_scene_bg.setScale(Math.max(cameraWidth / score_scene_bg.width, cameraHeight / score_scene_bg.height));


      // HTML element placement & setup

      scoreSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('scoreSceneHTML');

      endGameText = new MyDOMElement(self, 360, 400, scoreSceneHTML.getChildByID("gameOverText"));
      endGameText.setOrigin(0,0);

      startchattingbutton = new MyDOMElement(self, 360, 550, scoreSceneHTML.getChildByID("endbutton")); 
      startchattingbutton.setOrigin(0,0).addListener('click');

      startchattingbutton.on('click', function (pointer){

        if (startChatting){
          startChatting = false;
          document.getElementById("endbutton").classList.remove('btn-dark')
          document.getElementById("endbutton").classList.add('btn-outline-dark')

        }
        else{
          startChatting = true;
          document.getElementById("endbutton").classList.add('btn-dark')
          document.getElementById("endbutton").classList.remove('btn-outline-dark')
        }
        socket.emit('notifyChattingServer', startChatting, Global.isHost);


      });

      if (Global.playerOneScore > Global.playerTwoScore){
        if (Global.isHost){
          endGameText.setInnerText('Herlichen Glückwunsch, Team ' + Global.playerOneName + '!' 
          + '\nIhr habt gewonnen!\n Ihr habt '+ Global.playerOneScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerTwoName + ' haben nur '+ Global.playerTwoScore + ' Punkte verdient!' );
        }
        if (Global.isGuest){
          endGameText.setInnerText('Schade, Team ' + Global.playerTwoName + '!' 
          + '\nIhr habt leider verloren!\n Ihr habt '+ Global.playerTwoScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerOneName + ' haben '+ Global.playerOneScore + ' Punkte verdient!' );
        }
      }

      else if (Global.playerOneScore < Global.playerTwoScore){
        if (Global.isGuest){
          endGameText.setInnerText('Herlichen Glückwunsch, Team ' + Global.playerTwoName + '!' 
          + '\nIhr habt gewonnen!\n Ihr habt '+ Global.playerTwoScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerOneName + ' haben nur '+ Global.playerOneScore + ' Punkte verdient!' );
        }
        if (Global.isHost){
          endGameText.setInnerText('Schade, Team ' + Global.playerOneName + '!' 
          + '\nIhr habt leider verloren!\n Ihr habt '+ Global.playerOneScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerTwoName + ' haben '+ Global.playerTwoScore + ' Punkte verdient!' );
        }
      }

      else if (Global.playerOneScore == Global.playerTwoScore){
        if (Global.isHost){
          endGameText.setInnerText('Das ist ein Unentschieden, Team ' + Global.playerOneName + '!' 
          + '\nIhr habt '+ Global.playerOneScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerTwoName + ' haben  genau so viele Punkte geholt!' );
        }
        if (Global.isGuest){
          endGameText.setInnerText('Das ist ein Unentschieden, Team ' + Global.playerTwoName + '!' 
          + '\nIhr habt '+ Global.playerTwoScore + ' Punkte verdient!' 
          + '\nEure Wiedersacher, Team ' + Global.playerOneName + ' haben genau so viele Punkte geholt!' );
        }
       
      
      }


      socket.on('notifyChattingPlayers', function(){
      
          startchattingbutton.destroy();
          endGameText.destroy();
         
          self.scene.launch("ChatScene");
          self.scene.get("ChatScene").scene.bringToTop();

  
          self.scene.get("ChatScene").scene.setVisible(true);
          self.scene.get("ChatScene").scene.setActive(true);
          self.scene.get("ReactionScene").scene.bringToTop();

      });
    }



    update() {
    }
}