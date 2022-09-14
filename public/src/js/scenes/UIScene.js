var self;
var buttonChangeFullscreenWindow;


export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' });
    }

    preload() {
      this.load.image('buttonFullscreen', 'assets/scenes/UIScene/button_fullscreen.png')
      this.load.image('buttonWindow', 'assets/scenes/UIScene/button_window.png')
    }

    create() {
        self = this;

        buttonChangeFullscreenWindow = self.physics.add.sprite(340, 10, 'buttonFullscreen').setOrigin(0,0).setScale(0.2).setInteractive();
        buttonChangeFullscreenWindow.alpha = 0.7;

        buttonChangeFullscreenWindow.on('pointerup', function (pointer){
            
        if (self.scale.isFullscreen) {
          buttonChangeFullscreenWindow.setTexture("buttonFullscreen")
          self.scale.stopFullscreen();
        }
        else{
          self.scale.startFullscreen();
          buttonChangeFullscreenWindow.setTexture("buttonWindow")
          screen.orientation.lock("portrait-primary");
        }
      
    }, this);

    }
    update() {

      if (self.scale.isFullscreen){
        buttonChangeFullscreenWindow.setTexture("buttonFullscreen")
      }
      else{
        buttonChangeFullscreenWindow.setTexture("buttonWindow")
      }
    }

}