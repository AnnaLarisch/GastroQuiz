import StartScene from './src/js/scenes/StartScene.js';
import CategoryChoiceScene from './src/js/scenes/CategoryChoiceScene.js';
import QuestionScene from './src/js/scenes/QuestionScene.js';
import UIScene from './src/js/scenes/UIScene.js';
import SettingsScene from './src/js/scenes/SettingsScene.js';
import CreditsScene from './src/js/scenes/CreditsScene.js';
import ScoreScene from './src/js/scenes/ScoreScene.js';

import SocketIOScene from './src/js/scenes/SocketIOScene.js';


import CONFIG from './src/js/config.js'
import Global from './src/js/global.js';
import GameFullScene from './src/js/scenes/GameFullScene.js';

var config = {
    type: Phaser.CANVAS,
    width: CONFIG.DEFAULT_WIDTH,
    height: CONFIG.DEFAULT_HEIGHT,
    backgroundColor: "#b0b0b0",
    dom: {
      createContainer: true
    },
    parent: 'phaser-example',
    fullscreenTarget: 'phaser-example',

    scale:{
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: CONFIG.DEFAULT_GRAVITY }
      }
    },
    scene: [SocketIOScene, StartScene, UIScene, SettingsScene, CreditsScene, ScoreScene, CategoryChoiceScene, QuestionScene, GameFullScene]
    //scene: [QuestionScene, SocketIOScene, StartScene, UIScene, SettingsScene, CreditsScene, ScoreScene, CategoryChoiceScene]

  };

const game = new Phaser.Game(config);
