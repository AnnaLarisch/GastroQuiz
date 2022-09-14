import CONFIG from '../config.js'
import Global, { arrayRemove } from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'
import { getRandomIntInclusive } from "../global.js";
import { shuffleArray } from "../global.js";


import questions from "../../../assets/content/questions.js"

//import questionJson from './public/assets/content/questions.json' assert {type: 'json'};

var self;
var categoryDiv;
var questionDiv;
var answer1Button;
var answer2Button;
var answer3Button;
var answer4Button;

var questionList;


//let obj = JSON.parse(questions);

var profileIconPlayer1;
var profileIconPlayer2;

var playerOneScoreText;
var playerTwoScoreText;
var playerOneNameText;
var playerTwoNameText;

var progressBar1;

var timeOut = false;

var chosenAnswer;
var chosenButton;
var answerButtonList = [];
var availableQuestionList = [];
var correct_answer;


var currentAnswers = [];
var shuffleAnswers = [];
var currentQuestion;




export default class QuestionScene extends Phaser.Scene {
    constructor() {
      super({ key: 'QuestionScene' });
    }
  
    preload() {
        this.load.html('questionSceneHTML', 'src/html/QuestionScene.html');
        this.load.image('profile_icon', 'assets/scenes/QuestionScene/placeholder_profile_icon.png')

    }
    
    create() {
        self = this;
        const socket = getSocket();

        if (Global.isHost){
          currentQuestion = chooseQuestion(questions.questions)
          correct_answer = currentQuestion.correct_answer;
          currentAnswers = [currentQuestion.correct_answer, currentQuestion.wrong_answer_1, currentQuestion.wrong_answer_2, currentQuestion.wrong_answer_3];
          shuffleAnswers = shuffleArray([0, 1, 2, 3]);
          socket.emit('tellQuestionServer', currentQuestion, correct_answer, currentAnswers, shuffleAnswers);
        }
          
        

        var element = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('questionSceneHTML');
        
        categoryDiv = new MyDOMElement(self, 34, 250, element.getChildByID("categoryDiv"), null, Global.currentCategory); 
        questionDiv = new MyDOMElement(self, 34, 310, element.getChildByID("questionDiv"), null, "Current Question"); 

        categoryDiv.setOrigin(0, 0);
        questionDiv.setOrigin(0, 0);

        console.log(element.getChildByID("progressBar1").style);
        progressBar1 = new MyDOMElement(self, 34, 760, element.getChildByID("progressBar1")); 
        progressBar1.setOrigin(0, 0);

        progressBarMovement(330, 10);

        
        

      


        answer1Button = new MyDOMElement(self, 34, 550, element.getChildByID("answer1Button"), null, "Answer 1"); 
        answer2Button = new MyDOMElement(self, 204, 550, element.getChildByID("answer2Button"), null, "Answer 2"); 
        answer3Button = new MyDOMElement(self, 34, 650, element.getChildByID("answer3Button"), null, "Answer 3"); 
        answer4Button = new MyDOMElement(self, 204, 650, element.getChildByID("answer4Button"), null, "Answer 4"); 
        answer1Button.setOrigin(0, 0).setInteractive();
        answer2Button.setOrigin(0, 0).setInteractive();
        answer3Button.setOrigin(0, 0).setInteractive();
        answer4Button.setOrigin(0, 0).setInteractive();
        answerButtonList.push(answer1Button, answer2Button, answer3Button, answer4Button);
        profileIconPlayer1 = self.physics.add.sprite(30, 40, 'profile_icon').setOrigin(0,0);
        profileIconPlayer2 = self.physics.add.sprite(280, 40, 'profile_icon').setOrigin(0,0);
        playerOneScoreText = self.add.text(58, 170, Global.playerOneScore, { fontSize: 60 } );
        playerTwoScoreText = self.add.text(312, 170, Global.playerTwoScore, { fontSize: 60 } );
        playerOneNameText = self.add.text(35, 140, Global.playerOneName, { fontSize: 20 } );
        playerTwoNameText = self.add.text(285, 140, Global.playerTwoName, { fontSize: 20 } );

        answer1Button.on('pointerup', function (pointer){
          chosenAnswer = currentAnswers[shuffleAnswers[0]];
          chosenButton = 1;
        });
        answer2Button.on('pointerup', function (pointer){
          chosenAnswer = currentAnswers[shuffleAnswers[1]];        
          chosenButton = 2;
        });
        answer3Button.on('pointerup', function (pointer){
          chosenAnswer = currentAnswers[shuffleAnswers[2]];
          chosenButton = 3;        
        });
        answer4Button.on('pointerup', function (pointer){
          chosenAnswer = currentAnswers[shuffleAnswers[3]];
          chosenButton = 4;
        });

        socket.on('tellQuestionGame', function(currentQuestion_s, correct_answer_s, currentAnswers_s, shuffleAnswers_s){
          currentQuestion = currentQuestion_s;
          correct_answer = correct_answer_s;
          currentAnswers = currentAnswers_s;
          shuffleAnswers = shuffleAnswers_s;
          answer1Button.setInnerText(shuffleAnswers[0]);
          answer2Button.setInnerText(shuffleAnswers[1]);
          answer3Button.setInnerText(shuffleAnswers[2]);
          answer4Button.setInnerText(shuffleAnswers[3]);
          categoryDiv.setInnerText(currentQuestion.category);
          questionDiv.setInnerText(currentQuestion.question);
        });

        socket.on('increaseScoreGame', function(hostScored, guestScored){
          if (hostScored){
            Global.playerOneScore = Global.playerOneScore + 1;
            playerOneScoreText.setText(Global.playerOneScore)
          }
          if (guestScored){
            Global.playerTwoScore = Global.playerTwoScore + 1;
            playerTwoScoreText.setText(Global.playerTwoScore)
          }
        });
    }

    update() {
    }
}


function nextQuestion(){
  const socket = getSocket();
  if (chosenAnswer === correct_answer){
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "green"
    socket.emit('increaseScoreServer', Global.isHost, Global.isGuest);
  }
  else{
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "red"
  }
}


function progressBarMovement(progressBarWidth, Interval){
  var counterBack = setInterval(function(){
    progressBarWidth = progressBarWidth - Interval;
    if(progressBarWidth>=0){
      document.getElementById("progressBar1").style.width = progressBarWidth.toString() +"px"
    } else {
      clearTimeout(counterBack);
      timeOut = true;
      nextQuestion(); 
    }
    if (progressBarWidth == 160){
      document.getElementById("progressBar1").style.backgroundColor = "orange";
    }
    if (progressBarWidth == 50){
      document.getElementById("progressBar1").style.backgroundColor = "red";
    }
    }, 1000);
}


function chooseQuestion(questionList){
      
  for (let i = 0; i < questionList.length; i++) {
    var checkQuestion = questionList[i];
    if (checkQuestion.category === Global.currentCategory){
      availableQuestionList.push(checkQuestion);
    }
  }
  console.log(availableQuestionList);

  var choosenQuestion = availableQuestionList[getRandomIntInclusive(0, availableQuestionList.length-1)];

  Global.usedQuestions.push(choosenQuestion);
  return choosenQuestion;
}

//self.scene.get("QuestionScene").scene.restart("QuestionScene");


