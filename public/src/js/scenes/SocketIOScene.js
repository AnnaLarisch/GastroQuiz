import Global from "../global.js";

var self;
const socket = io();


export default class SocketIOScene extends Phaser.Scene {
    constructor() {
      super({ key: 'SocketIOScene'});
    }
  
    preload() {
    }
    
    create() {

        self = this;
        self.scene.launch("StartScene");

    }

    update() {
    }

   
    
}

export function getSocket(){
    return socket;
}



