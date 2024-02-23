import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'

// Game variables
var self;
const socket = getSocket();
var reactionSceneHTML;

var sidebar_visible = false;




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
        reactionSceneHTML = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('reactionSceneHTML');


        var sidebarbutton = new MyDOMElement(self, -2, 0, reactionSceneHTML.getChildByID("sidebarbutton"));
        sidebarbutton.setOrigin(0, 0);
        sidebarbutton.addListener('click');

        sidebarbutton.on('click', emoteNav)

        var emoji_up = new MyDOMElement(self, 10, 90, reactionSceneHTML.getChildByID("emoji_up"));
        var emoji_down = new MyDOMElement(self, 10, 160, reactionSceneHTML.getChildByID("emoji_down"));
        var emoji_laughing = new MyDOMElement(self, 10, 230, reactionSceneHTML.getChildByID("emoji_laughing"));
        var emoji_tear = new MyDOMElement(self, 10, 300, reactionSceneHTML.getChildByID("emoji_tear"));
        var emoji_thinking = new MyDOMElement(self, 10, 370, reactionSceneHTML.getChildByID("emoji_thinking"));
        var emoji_nerd = new MyDOMElement(self, 10, 440, reactionSceneHTML.getChildByID("emoji_nerd"));
        var emoji_astonished = new MyDOMElement(self, 10, 510, reactionSceneHTML.getChildByID("emoji_astonished"));
        var emoji_heart = new MyDOMElement(self, 10, 580, reactionSceneHTML.getChildByID("emoji_heart"));
        var emoji_poo = new MyDOMElement(self, 10, 650, reactionSceneHTML.getChildByID("emoji_poo"));

        var emoji_up_image = new MyDOMElement(self, 10, 90, reactionSceneHTML.getChildByID("emoji_up_image"));
        var emoji_down_image = new MyDOMElement(self, 10, 160, reactionSceneHTML.getChildByID("emoji_down_image"));
        var emoji_laughing_image = new MyDOMElement(self, 10, 230, reactionSceneHTML.getChildByID("emoji_laughing_image"));
        var emoji_tear_image = new MyDOMElement(self, 10, 300, reactionSceneHTML.getChildByID("emoji_tear_image"));
        var emoji_thinking_image = new MyDOMElement(self, 10, 370, reactionSceneHTML.getChildByID("emoji_thinking_image"));
        var emoji_nerd_image = new MyDOMElement(self, 10, 440, reactionSceneHTML.getChildByID("emoji_nerd_image"));
        var emoji_astonished_image = new MyDOMElement(self, 10, 510, reactionSceneHTML.getChildByID("emoji_astonished_image"));
        var emoji_heart_image = new MyDOMElement(self, 10, 580, reactionSceneHTML.getChildByID("emoji_heart_image"));
        var emoji_poo_image = new MyDOMElement(self, 10, 650, reactionSceneHTML.getChildByID("emoji_poo_image"));

        emoji_up.addListener('click');
        emoji_down.addListener('click');
        emoji_laughing.addListener('click');
        emoji_tear.addListener('click');
        emoji_thinking.addListener('click');
        emoji_nerd.addListener('click');
        emoji_astonished.addListener('click');
        emoji_heart.addListener('click');
        emoji_poo.addListener('click');

        emoji_up.on('click', send_emoji_up);
        emoji_down.on('click', send_emoji_down);
        emoji_laughing.on('click', send_emoji_laughing);
        emoji_tear.on('click', send_emoji_tear);
        emoji_thinking.on('click', send_emoji_thinking);
        emoji_nerd.on('click', send_emoji_nerd);
        emoji_astonished.on('click', send_emoji_astonished);
        emoji_heart.on('click', send_emoji_heart);
        emoji_poo.on('click', send_emoji_poo);

        document.getElementById("emoji_up").style.visibility = "hidden";
        document.getElementById("emoji_down").style.visibility = "hidden";
        document.getElementById("emoji_laughing").style.visibility = "hidden";
        document.getElementById("emoji_tear").style.visibility = "hidden";
        document.getElementById("emoji_thinking").style.visibility = "hidden";
        document.getElementById("emoji_nerd").style.visibility = "hidden";
        document.getElementById("emoji_astonished").style.visibility = "hidden";
        document.getElementById("emoji_heart").style.visibility = "hidden";
        document.getElementById("emoji_poo").style.visibility = "hidden";

        document.getElementById("emoji_up_image").style.width = "0px";
        document.getElementById("emoji_down_image").style.width = "0px";
        document.getElementById("emoji_laughing_image").style.width = "0px";
        document.getElementById("emoji_tear_image").style.width = "0px";
        document.getElementById("emoji_thinking_image").style.width = "0px";
        document.getElementById("emoji_nerd_image").style.width = "0px";
        document.getElementById("emoji_astonished_image").style.width = "0px";
        document.getElementById("emoji_heart_image").style.width = "0px";
        document.getElementById("emoji_poo_image").style.width = "0px";





    }
    update() {

    }

}


function emoteNav() {
    if (sidebar_visible) {
        sidebar_visible = false;
        console.log("click")
        document.getElementById("emoji_up").style.visibility = "hidden";
        document.getElementById("emoji_down").style.visibility = "hidden";
        document.getElementById("emoji_laughing").style.visibility = "hidden";
        document.getElementById("emoji_tear").style.visibility = "hidden";
        document.getElementById("emoji_thinking").style.visibility = "hidden";
        document.getElementById("emoji_nerd").style.visibility = "hidden";
        document.getElementById("emoji_astonished").style.visibility = "hidden";
        document.getElementById("emoji_heart").style.visibility = "hidden";
        document.getElementById("emoji_poo").style.visibility = "hidden";
        document.getElementById("emoji_down").style.width = "0px";
        document.getElementById("emoji_laughing").style.width = "0px";
        document.getElementById("emoji_tear").style.width = "0px";
        document.getElementById("emoji_thinking").style.width = "0px";
        document.getElementById("emoji_nerd").style.width = "0px";
        document.getElementById("emoji_astonished").style.width = "0px";
        document.getElementById("emoji_heart").style.width = "0px";
        document.getElementById("emoji_poo").style.width = "0px";
        document.getElementById("emoji_up").style.width = "0px";
        document.getElementById("emoji_down").style.width = "0px";
        document.getElementById("emoji_laughing").style.width = "0px";
        document.getElementById("emoji_tear").style.width = "0px";
        document.getElementById("emoji_thinking").style.width = "0px";
        document.getElementById("emoji_nerd").style.width = "0px";
        document.getElementById("emoji_astonished").style.width = "0px";
        document.getElementById("emoji_heart").style.width = "0px";
        document.getElementById("emoji_poo").style.width = "0px";
        document.getElementById("emoji_up_image").style.width = "0px";
        document.getElementById("emoji_down_image").style.width = "0px";
        document.getElementById("emoji_laughing_image").style.width = "0px";
        document.getElementById("emoji_tear_image").style.width = "0px";
        document.getElementById("emoji_thinking_image").style.width = "0px";
        document.getElementById("emoji_nerd_image").style.width = "0px";
        document.getElementById("emoji_astonished_image").style.width = "0px";
        document.getElementById("emoji_heart_image").style.width = "0px";
        document.getElementById("emoji_poo_image").style.width = "0px";


    }
    else {
        sidebar_visible = true;
        console.log("click")
        document.getElementById("emoji_up").style.visibility = "visible";
        document.getElementById("emoji_down").style.visibility = "visible";
        document.getElementById("emoji_laughing").style.visibility = "visible";
        document.getElementById("emoji_tear").style.visibility = "visible";
        document.getElementById("emoji_thinking").style.visibility = "visible";
        document.getElementById("emoji_nerd").style.visibility = "visible";
        document.getElementById("emoji_astonished").style.visibility = "visible";
        document.getElementById("emoji_heart").style.visibility = "visible";
        document.getElementById("emoji_poo").style.visibility = "visible";
        document.getElementById("emoji_up").style.width = "150px";
        document.getElementById("emoji_down").style.width = "150px";
        document.getElementById("emoji_laughing").style.width = "150px";
        document.getElementById("emoji_tear").style.width = "150px";
        document.getElementById("emoji_thinking").style.width = "150px";
        document.getElementById("emoji_nerd").style.width = "150px";
        document.getElementById("emoji_astonished").style.width = "150px";
        document.getElementById("emoji_heart").style.width = "150px";
        document.getElementById("emoji_poo").style.width = "150px";
        document.getElementById("emoji_up_image").style.width = "50px";
        document.getElementById("emoji_down_image").style.width = "50px";
        document.getElementById("emoji_laughing_image").style.width = "50px";
        document.getElementById("emoji_tear_image").style.width = "50px";
        document.getElementById("emoji_thinking_image").style.width = "50px";
        document.getElementById("emoji_nerd_image").style.width = "50px";
        document.getElementById("emoji_astonished_image").style.width = "50px";
        document.getElementById("emoji_heart_image").style.width = "50px";
        document.getElementById("emoji_poo_image").style.width = "50px";
    }

}
function send_emoji_up() {
    socket.emit('sendEmoji', "emoji_up");
    console.log("send_emoji_up");
}
function send_emoji_down() {
    socket.emit('sendEmoji', "emoji_down");
    console.log("send_emoji_down");
}
function send_emoji_laughing() {
    socket.emit('sendEmoji', "emoji_laughing");
    console.log("send_emoji_laughing");
}
function send_emoji_tear() {
    socket.emit('sendEmoji', "emoji_tear");
    console.log("send_emoji_tear");
}
function send_emoji_thinking() {
    socket.emit('sendEmoji', "emoji_thinking");
    console.log("send_emoji_thinking");
}
function send_emoji_nerd() {
    socket.emit('sendEmoji', "emoji_nerd");
    console.log("send_emoji_nerd");
}
function send_emoji_astonished() {
    socket.emit('sendEmoji', "emoji_astonished");
    console.log("send_emoji_astonished");
}
function send_emoji_heart() {
    socket.emit('sendEmoji', "emoji_heart");
    console.log("send_emoji_heart");
}
function send_emoji_poo() {
    socket.emit('sendEmoji', "emoji_poo");
    console.log("send_emoji_poo");
}

socket.on('reactWithEmoji', function (emoji, x, y) {
    var img = document.createElement('img');
    switch (emoji) {
        case 'emoji_up':
            img.src = "assets/scenes/ReactionScene/up.png"; // Replace with your image path
            break;
        case 'emoji_down':
            img.src = "assets/scenes/ReactionScene/down.png"; // Replace with your image path
            break;
        case 'emoji_laughing':
            img.src = "assets/scenes/ReactionScene/laughing.png"; // Replace with your image path
            break;
        case 'emoji_tear':
            img.src = "assets/scenes/ReactionScene/tear.png"; // Replace with your image path
            break;
        case 'emoji_thinking':
            img.src = "assets/scenes/ReactionScene/thinking.png"; // Replace with your image path
            break;
        case 'emoji_nerd':
            img.src = "assets/scenes/ReactionScene/nerd.png"; // Replace with your image path
            break;
        case 'emoji_astonished':
            img.src = "assets/scenes/ReactionScene/astonished.png"; // Replace with your image path
            break;
        case 'emoji_heart':
            img.src = "assets/scenes/ReactionScene/heart.png"; // Replace with your image path
            break;
        case 'emoji_poo':
            img.src = "assets/scenes/ReactionScene/poo.png"; // Replace with your image path
            break;
        default:
            console.log('no emoji');
    }
    img.style.height = "100px"
    img.style.left = x + 'px';
    img.style.top = y + 'px';

    img.classList.add('image');

    document.getElementById('imageContainer').appendChild(img);

    setTimeout(function () {
        img.classList.add('fade-out');
    }, 2000); // Start fading after 2 seconds

});
