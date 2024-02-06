import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'

// Game variables
var self;
const socket = getSocket();
var reactionSceneHTML;



export default class ReactionScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ReactionScene' });
    }

    preload() {
        this.load.html('reactionSceneHTML', 'src/html/ReactionScene.html');
        this.load.image('title_gastro_quiz', 'assets/scenes/StartScene/start_scene_title_gastro_quiz.png')
  
    }

    create() {
        self = this;
        const cameraWidth = self.cameras.main.width
        const cameraHeight = self.cameras.main.height
        reactionSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('reactionSceneHTML');


    }
    update() {

    }

}