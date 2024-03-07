import CONFIG from '../config.js'
import Global from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'


// Game variables
var self;
const socket = getSocket();

// HTML element variables
var chatSceneHTML;

export default class ChatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChatScene' });
    }

    preload() {
        this.load.html('chatSceneHTML', 'src/html/ChatScene.html');

    }

    create() {

        // Scene management
        self = this;
        const cameraWidth = self.cameras.main.width
        const cameraHeight = self.cameras.main.height

        var enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.on('down', function (event) {
            foo(); // Call your function when the Enter key is pressed
        });
        chatSceneHTML = self.add.dom(40, 0).setOrigin(0, 0).createFromCache('chatSceneHTML');

        if (Global.isHost) {
            var opponentGroupName = new MyDOMElement(self, 250, 45, chatSceneHTML.getChildByID("opponentGroupName"));
            opponentGroupName.setInnerText( Global.playerTwoName)
            var ownGroupName = new MyDOMElement(self, 130, 765, chatSceneHTML.getChildByID("ownGroupName"));
            ownGroupName.setInnerText(Global.playerOneName)

        }
        else {
            var opponentGroupName = new MyDOMElement(self, 175, 45, chatSceneHTML.getChildByID("opponentGroupName"));
            opponentGroupName.setInnerText( Global.playerOneName)
            var ownGroupName = new MyDOMElement(self, 130, 765, chatSceneHTML.getChildByID("ownGroupName"));
            ownGroupName.setInnerText(Global.playerTwoName)

        }


        var buttonCancel = new MyDOMElement(self, 1145, 40, chatSceneHTML.getChildByID("buttonCancel"));
        buttonCancel.addListener('click');
        buttonCancel.on('click', function (pointer){
            console.log("beenden")
            self.scene.get("BackgroundScene").scene.setActive(true);
            self.scene.get("BackgroundScene").scene.setVisible(true);
            self.scene.get("BackgroundScene").scene.bringToTop();
            self.scene.launch("CreditsScene");
            self.scene.get("CreditsScene").scene.setActive(true);
            self.scene.get("CreditsScene").scene.setVisible(true);
            self.scene.get("CreditsScene").scene.bringToTop();
            opponentGroupName.setVisible(false)
            ownGroupName.setVisible(false)
            buttonChat.setVisible(false)
            inputChat.setVisible(false)
            buttonCancel.setVisible(false)
            chatSceneHTML.setVisible(false)
          });
        var buttonChat = new MyDOMElement(self, 1170, 755, chatSceneHTML.getChildByID("buttonChat"));
        buttonChat.addListener('click');

        buttonChat.on('click', foo)

        var inputChat = new MyDOMElement(self, 680, 755, chatSceneHTML.getChildByID("inputChat"));
        inputChat.addListener('click');

    }

    update() {
    }
}

function foo() {
    if (inputChat.value.trim() != ""){
        console.log(inputChat.value);
        createOwnMessage(inputChat.value);
        socket.emit('sendOpponentMessage', inputChat.value, Global.isHost);
        inputChat.value = ""
    }

   

}

function createOwnMessage(value) {
    const messagesContainer = document.querySelector('.messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', "outgoing");
    const messageP = document.createElement('p');
    messageP.textContent = value;
    messageDiv.appendChild(messageP);
    messagesContainer.appendChild(messageDiv);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createOpponetMessage(value) {
    const messagesContainer = document.querySelector('.messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', "incoming");
    const messageP = document.createElement('p');
    messageP.textContent = value;
    messageDiv.appendChild(messageP);
    messagesContainer.appendChild(messageDiv);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

socket.on('createOpponentMessage', function (text, isHost) {

    if (isHost && Global.isGuest) {
        createOpponetMessage(text);
    }
    else if (!isHost && Global.isHost) {
        createOpponetMessage(text);
    }


});
