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

      if (Global.playerOneScore > Global.playerTwoScore){
        if (Global.isHost){
          endGameText.setInnerText('You won this game!\n Score: '+ Global.playerOneScore);
        }
        if (Global.isGuest){
          endGameText.setInnerText('You lost this game!\n Score: '+ Global.playerTwoScore);
        }
      }
      else if (Global.playerOneScore < Global.playerTwoScore){
        if (Global.isGuest){
          endGameText.setInnerText('You won this game!\n Score: '+ Global.playerTwoScore);
        }
        if (Global.isHost){
          endGameText.setInnerText('You lost this game!\n Score: '+ Global.playerOneScore);
        }
      }
      else if (Global.playerOneScore == Global.playerTwoScore){
        endGameText.setInnerText("This game ended in a draw!");
      
      }
    }

    update() {
    }
}