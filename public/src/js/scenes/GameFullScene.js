var gameFullText;
export default class GameFullScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameFullScene' });
    }
  
    preload() {

    }
    
    create() {
      self = this;
      gameFullText = self.add.text(50, 400, 'Game is full. Sorry, dude!');

    }

    update() {
    }
}