var background_blue;
var self;

export default class BackgroundScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BackgroundScene' });
    }
  
    preload() {
        this.load.image('background_blue', 'assets/scenes/BackgroundImage/background_blue.png')

    }
    
    create() {
        self = this;
        background_blue = self.physics.add.sprite(0, 0, 'background_blue').setOrigin(0,0);

    }

    update() {
    }
}