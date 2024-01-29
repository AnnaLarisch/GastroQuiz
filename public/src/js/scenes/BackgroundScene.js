var background_blue;
var self;

export default class BackgroundScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BackgroundScene' });
    }
  
    preload() {
        this.load.image('background_white_asbtract', 'assets/scenes/BackgroundImage/background_white_abstract.png')

    }
    
    create() {
        self = this;
        const cameraWidth = self.cameras.main.width
        const cameraHeight = self.cameras.main.height

        const bg = self.add.image(0, 0, 'background_white_asbtract')
        .setOrigin(0)

        bg.setScale(Math.max(cameraWidth / bg.width, cameraHeight / bg.height))

    }

    update() {
    }
}