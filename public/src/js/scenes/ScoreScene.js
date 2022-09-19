import Global from '../global.js';
import { getSocket } from './SocketIOScene.js'


var self;
const socket = getSocket();

var endGameText;


export default class ScoreScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ScoreScene' });
    }
  
    preload() {

    }
    
    create() {
      self = this;
      if (Global.playerOneScore > Global.playerTwoScore){
        if (Global.isHost){
          endGameText = self.add.text(100, 315, 'You won this game!\n Score: '+ Global.playerOneScore);
        }
        if (Global.isGuest){
          endGameText = self.add.text(100, 315, 'You lost this game!\n Score: '+ Global.playerTwoScore);
        }
      }
      else if (Global.playerOneScore < Global.playerTwoScore){
        if (Global.isGuest){
          endGameText = self.add.text(100, 315, 'You won this game!\n Score: '+ Global.playerTwoScore);
        }
        if (Global.isHost){
          endGameText = self.add.text(100, 315, 'You lost this game!\n Score: '+ Global.playerOneScore);
        }
      }
      else if (Global.playerOneScore == Global.playerTwoScore){
        endGameText = self.add.text(100, 315, "This game ended in a draw!");
      
      }
    }

    update() {
    }
}