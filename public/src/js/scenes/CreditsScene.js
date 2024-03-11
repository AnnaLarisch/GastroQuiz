import Global from "../global.js";
import { getSocket } from './SocketIOScene.js'
import MyDOMElement from '../objects/MyDOMElement.js'

var self;
const socket = getSocket();

export default class CreditsScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CreditsScene' });
    }
 
  
    preload() {
      this.load.html('creditsSceneHTML', 'src/html/CreditsScene.html');
      this.load.image('background_white_asbtract', 'assets/scenes/BackgroundImage/background_white_abstract.png')

    }
    
    create() {
      console.log("credits")
      self = this;
      const cameraWidth = self.cameras.main.width
      const cameraHeight = self.cameras.main.height
      self.scene.get("ChatScene").scene.sendToBack();
      self.scene.get("ChatScene").scene.setVisible(false);
      self.scene.get("ChatScene").scene.setActive(false);
      self.scene.get("ReactionScene").scene.sendToBack();
      self.scene.get("ReactionScene").scene.setVisible(false);
      self.scene.get("ReactionScene").scene.setActive(false);
      self.scene.get("UIScene").scene.bringToTop();
      const bg = self.add.image(0, 0, 'background_white_asbtract')
      .setOrigin(0)

      bg.setScale(Math.max(cameraWidth / bg.width, cameraHeight / bg.height))

      // <Scene Management> 

      var elementCreditsSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('creditsSceneHTML');
      var text1 = new MyDOMElement(self, 650, 400, elementCreditsSceneHTML.getChildByID("text1"));
      var text2 = new MyDOMElement(self, 650, 420, elementCreditsSceneHTML.getChildByID("text2"));


    }
    update() {
    }
}