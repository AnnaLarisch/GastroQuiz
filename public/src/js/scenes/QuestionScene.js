import CONFIG from '../config.js'
import Global, { arrayRemove } from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'
import { getRandomIntInclusive } from "../global.js";
import { shuffleArray } from "../global.js";




import questions from "../../../assets/content/questions.js"

// Game variables
var self;

// HTML element variables
var elementQuestionSceneHTML;
var questionDiv;
var answer1Button;
var answer2Button;
var answer3Button;
var answer4Button;
var progressBarQuestion;
var questionHeader;
var questionHeaderContent;

// Phaser game element variables
var profileIconPlayer1;
var profileIconPlayer2;
var playerOneScoreText;
var playerTwoScoreText;
var playerOneNameText;
var playerTwoNameText;

var progressBarStart = 330;
var progressBarIntervall = 10;

var progressBarInterval;

const socket = getSocket();


var chosenAnswer = "NO_ANSWER";
var chosenButton;
var availableQuestionList = [];
var correct_answer;

var currentAnswers = [];
var shuffleAnswers = [];
var currentQuestion;

var currentQuestionRound;

var newQuestion;
var usedQuestions = [];
var opponentPortrait;
var player1ProfilePopUp;
var player2ProfilePopUp;
var correctAnswerButtonHere;
var correctAnswerButton;


var htmlElementList = [];

export default class QuestionScene extends Phaser.Scene {
    constructor() {
      super({ key: 'QuestionScene'});
    }
    preload() {
        this.load.html('questionSceneHTML', 'src/html/QuestionScene.html');
        this.load.image('profile_icon', 'assets/scenes/QuestionScene/placeholder_profile_icon.png')
        this.load.image('profile_icon_blue_popup', 'assets/scenes/QuestionScene/placeholder_profile_icon_blue_popup.png')
        this.load.image('profile_icon_orange_popup', 'assets/scenes/QuestionScene/placeholder_profile_icon_orange_popup.png')
        this.load.image('question_background', 'assets/scenes/QuestionScene/question_background.png')

    }
    create() {

      // Scene & Socket Management
      self = this;
      Global.questionSceneLaunched = true;
      const cameraWidth = self.cameras.main.width
      const cameraHeight = self.cameras.main.height

      self.scene.launch("UIScene");
      self.scene.get("UIScene").scene.setVisible(true);
      self.scene.get("UIScene").scene.bringToTop();
      self.scene.launch("BackgroundScene");
      self.scene.get("BackgroundScene").scene.setVisible(true);
      self.scene.get("BackgroundScene").scene.sendToBack();

      const question_background = self.add.image(0, 0, 'question_background')
      .setOrigin(0)

      question_background.setScale(Math.max(cameraWidth / question_background.width, cameraHeight / question_background.height));


      // Question selection
      if (Global.isHost){
        pickNewQuestion();
      }

      // HTML element placement & setup
      elementQuestionSceneHTML = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('questionSceneHTML');

      htmlElementList.push("headerQuestion");

      var progressBarBehindQuestion = new MyDOMElement(self, 470, 412, elementQuestionSceneHTML.getChildByID("progressBarBehindQuestion")); 
      progressBarBehindQuestion.setOrigin(0, 0);
      progressBarQuestion = new MyDOMElement(self, 474, 415, elementQuestionSceneHTML.getChildByID("progressBarQuestion")); 
      progressBarQuestion.setOrigin(0, 0);
      console.log(questionHeader);
      if (Global.isHost){
        progressBarMovement(progressBarStart, progressBarIntervall);  
      }



      questionDiv = new MyDOMElement(self, 200, 135, elementQuestionSceneHTML.getChildByID("questionDiv"), null, "Current Question"); 
      questionDiv.setOrigin(0, 0);

      answer1Button = new MyDOMElement(self, 50, 500, elementQuestionSceneHTML.getChildByID("answer1Button"), null, "Answer 1"); 
      answer2Button = new MyDOMElement(self, 665, 500, elementQuestionSceneHTML.getChildByID("answer2Button"), null, "Answer 2"); 
      answer3Button = new MyDOMElement(self, 50, 620, elementQuestionSceneHTML.getChildByID("answer3Button"), null, "Answer 3"); 
      answer4Button = new MyDOMElement(self, 665, 620, elementQuestionSceneHTML.getChildByID("answer4Button"), null, "Answer 4"); 
      answer1Button.setOrigin(0, 0).addListener('click');
      answer2Button.setOrigin(0, 0).addListener('click');
      answer3Button.setOrigin(0, 0).addListener('click');
      answer4Button.setOrigin(0, 0).addListener('click');




      player1ProfilePopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("player1IconPopup"));
      player2ProfilePopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("player2IconPopup"));

      // Phaser game element placement & setup

      currentQuestionRound = self.add.text(15, 815, 'Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES + " and Question: " + (Global.currentQuestionsPerCategoryAmount+1) + "/" + CONFIG.MAX_QUESTIONS_PER_CATEGORY);



      // Question interaction 
      answer1Button.on('click', function (pointer){
        chosenAnswer = shuffleAnswers[0];
        chosenButton = 1;
        setAndClearButtonColor(1, 2, 3, 4);
      });
      answer2Button.on('click', function (pointer){
        chosenAnswer = shuffleAnswers[1];        
        chosenButton = 2;
        setAndClearButtonColor(2, 1, 3, 4);

      });
      answer3Button.on('click', function (pointer){
        chosenAnswer = shuffleAnswers[2];
        chosenButton = 3;        
        setAndClearButtonColor(3, 1, 2, 4);
      });
      answer4Button.on('click', function (pointer){
        chosenAnswer = shuffleAnswers[3];
        chosenButton = 4;
        setAndClearButtonColor(4, 1, 2, 3);
      });

    

      // Socket Interactions

      // Set chosen question for all players 
      socket.on('tellQuestionGame', function(currentQuestion_s, correct_answer_s, correctAnswerHere_s, currentAnswers_s, shuffleAnswers_s){
        currentQuestion = currentQuestion_s;
        correct_answer = correct_answer_s;
        correctAnswerButton = correctAnswerHere_s;
        currentAnswers = currentAnswers_s;
        shuffleAnswers = shuffleAnswers_s;
  
        answer1Button.setInnerText(shuffleAnswers_s[0]);
        answer2Button.setInnerText(shuffleAnswers_s[1]);
        answer3Button.setInnerText(shuffleAnswers_s[2]);
        answer4Button.setInnerText(shuffleAnswers_s[3]);
        questionHeader.setInnerText(currentQuestion_s.category);
        questionDiv.setInnerText(currentQuestion_s.question);
      });

      // Host tells other players to move prpgress bar
      socket.on('moveProgressBarGame', function(progressBarWidth){

        // Progress Bar size reduction
        if(progressBarWidth >= 0){    
          document.getElementById("progressBarQuestion").style.width = progressBarWidth.toString() +"px"
        } else {
          document.getElementById("progressBarQuestion").style.width = "0px"
          if (Global.isHost){
            clearInterval(progressBarInterval);
          }
          // If time is up, call to check correct answer
          checkAnswers();
        }
        
      });

      socket.on('increaseScoreGame', function(isHost){
        if (isHost){
          Global.playerOneScore = Global.playerOneScore + 1;
          //playerOneScoreText.setText(Global.playerOneScore);
        }
        else{
          Global.playerTwoScore = Global.playerTwoScore + 1;
          //playerTwoScoreText.setText(Global.playerTwoScore)
        }
      });

      socket.on('resetSceneGame', function(){
        currentQuestionRound.setText('Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES + " and Question: " + (Global.currentQuestionsPerCategoryAmount+1) + "/" + CONFIG.MAX_QUESTIONS_PER_CATEGORY);
        chosenAnswer = "NO_ANSWER";
        chosenButton = 0;
        document.getElementById("answer1Button").style.backgroundColor = "#D5D5D5"
        document.getElementById("answer1Button").style.color = "black"
        document.getElementById("dot1").style.backgroundColor = "#de7f09"
        document.getElementById("dot1").style.color = "white"
        document.getElementById("answer2Button").style.backgroundColor = "#D5D5D5"
        document.getElementById("answer2Button").style.color = "black"
        document.getElementById("dot2").style.backgroundColor = "#de7f09"
        document.getElementById("dot2").style.color = "white"
        document.getElementById("answer3Button").style.backgroundColor = "#D5D5D5"
        document.getElementById("answer3Button").style.color = "black"
        document.getElementById("dot3").style.backgroundColor = "#de7f09"
        document.getElementById("dot3").style.color = "white"
        document.getElementById("answer4Button").style.backgroundColor = "#D5D5D5"
        document.getElementById("answer4Button").style.color = "black"
        document.getElementById("dot4").style.backgroundColor = "#de7f09"
        document.getElementById("dot4").style.color = "white"
        document.getElementById("answer1Button").style.width = "370px";
        document.getElementById("answer2Button").style.width = "370px";
        document.getElementById("answer3Button").style.width = "370px";
        document.getElementById("answer4Button").style.width = "370px";

      });

      socket.on('backToCategoryGame', function(){
        chosenAnswer = "NO_ANSWER";
        chosenButton = 0;
        availableQuestionList.splice(0,availableQuestionList.length)

        document.getElementById("questionDiv").style.visibility = "hidden";
        document.getElementById("answer1Button").style.visibility = "hidden";
        document.getElementById("answer2Button").style.visibility = "hidden";
        document.getElementById("answer3Button").style.visibility = "hidden";
        document.getElementById("answer4Button").style.visibility = "hidden";
        document.getElementById("headerQuestion").style.visibility = "hidden";
        document.getElementById("dot1").style.visibility = "hidden";
        document.getElementById("dot2").style.visibility = "hidden";
        document.getElementById("dot3").style.visibility = "hidden";
        document.getElementById("dot4").style.visibility = "hidden";
        document.getElementById("progressBarBehindQuestion").style.visibility = "hidden";
        document.getElementById("topline").style.visibility = "hidden";

        self.scene.setVisible(false);
        self.scene.setActive(false);
        self.scene.get('CategoryChoiceScene').scene.setVisible(true);
        self.scene.get('CategoryChoiceScene').scene.setActive(true);
        self.scene.get('CategoryChoiceScene').resetCategory();
      });
      socket.on('endGameSceneGame', function(){

        document.getElementById("categoryDiv").style.visibility = "hidden";
        document.getElementById("questionDiv").style.visibility = "hidden";
        document.getElementById("answer1Button").style.visibility = "hidden";
        document.getElementById("answer2Button").style.visibility = "hidden";
        document.getElementById("answer3Button").style.visibility = "hidden";
        document.getElementById("answer4Button").style.visibility = "hidden";
        document.getElementById("headerQuestion").style.visibility = "hidden";
        document.getElementById("dot1").style.visibility = "hidden";
        document.getElementById("dot2").style.visibility = "hidden";
        document.getElementById("dot3").style.visibility = "hidden";
        document.getElementById("dot4").style.visibility = "hidden";
        document.getElementById("progressBarBehindQuestion").style.visibility = "hidden";
        document.getElementById("topline").style.visibility = "hidden";

        self.scene.setVisible(false);
        self.scene.setActive(false);
        self.scene.launch("ScoreScene");
      });
      socket.on('tellAnswerToOpponentGame', function(opponentChosenAnswer, sendbyHost){
        var ypos = 0;
        if (opponentChosenAnswer == 1){ 
          ypos = 450;
        }
        else if (opponentChosenAnswer == 2){
          ypos = 530;
        }
        else if (opponentChosenAnswer == 3){
          ypos = 610;
        }
        else if (opponentChosenAnswer == 4){
          ypos = 690;

        }
        else {
          ypos = -100;

        }

        if (sendbyHost){
          player1ProfilePopUp.setPosition(350, ypos);
        }
        else{
          player2ProfilePopUp.setPosition(350, ypos);
        }
      });
      
    }

    update() {
      if (newQuestion){
        var replaceQuestion = setTimeout(function(){         
          socket.emit('tellQuestionServer', currentQuestion, correct_answer, correctAnswerButtonHere, currentAnswers, shuffleAnswers);
          clearTimeout(replaceQuestion);
          newQuestion = false;
        }, 1000);

      }
    }

    resetQuestion(){
      if (Global.isHost){
        pickNewQuestion();
        progressBarMovement(progressBarStart, progressBarIntervall);  
      }
      currentQuestionRound.setText('Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES + " and Question: " + (Global.currentQuestionsPerCategoryAmount+1) + "/" + CONFIG.MAX_QUESTIONS_PER_CATEGORY);
      document.getElementById("questionDiv").style.visibility = "visible";
      document.getElementById("answer1Button").style.visibility = "visible";
      document.getElementById("answer2Button").style.visibility = "visible";
      document.getElementById("answer3Button").style.visibility = "visible";
      document.getElementById("answer4Button").style.visibility = "visible";
      document.getElementById("dot1").style.visibility = "visible";
      document.getElementById("dot2").style.visibility = "visible";
      document.getElementById("dot3").style.visibility = "visible";
      document.getElementById("dot4").style.visibility = "visible";
      document.getElementById("progressBarBehindQuestion").style.visibility = "visible";
      document.getElementById("headerQuestion").style.visibility = "visible";
      document.getElementById("topline").style.visibility = "visible";

      document.getElementById("answer1Button").style.backgroundColor = "#D5D5D5"
      document.getElementById("dot1").style.backgroundColor = "#de7f09"
      document.getElementById("answer2Button").style.backgroundColor = "#D5D5D5"
      document.getElementById("dot2").style.backgroundColor = "#de7f09"
      document.getElementById("answer3Button").style.backgroundColor = "#D5D5D5"
      document.getElementById("dot3").style.backgroundColor = "#de7f09"
      document.getElementById("answer4Button").style.backgroundColor = "#D5D5D5"
      document.getElementById("dot4").style.backgroundColor = "#de7f09"
      document.getElementById("answer1Button").style.color = "black"
      document.getElementById("dot1").style.color = "white"
      document.getElementById("answer2Button").style.color = "black"
      document.getElementById("dot2").style.color = "white"
      document.getElementById("answer3Button").style.color = "black"
      document.getElementById("dot3").style.color = "white"
      document.getElementById("answer4Button").style.color = "black"
      document.getElementById("dot4").style.color = "white"
    }
}

function pickNewQuestion(){
  console.log(currentQuestion);
  console.log(questions.questions);
  currentQuestion = chooseQuestion(questions.questions)
  correct_answer = currentQuestion.correct_answer;
  currentAnswers = [currentQuestion.correct_answer, currentQuestion.wrong_answer_1, currentQuestion.wrong_answer_2, currentQuestion.wrong_answer_3];
  shuffleAnswers = shuffleArray(currentAnswers);
  console.log(currentQuestion);
  if (Global.isHost){
    newQuestion = true;
  };
  for (let i = 0; i < shuffleAnswers.length; i++) {
    if (shuffleAnswers[i] === correct_answer){
      correctAnswerButtonHere = i + 1;
    }
  }
  socket.emit('tellQuestionServer', currentQuestion, correct_answer, correctAnswerButtonHere, currentAnswers, shuffleAnswers);
}

function chooseQuestion(questionList){
  console.log(Global.currentCategory);
  availableQuestionList.splice(0, availableQuestionList.length);
  for (let i = 0; i < questionList.length; i++) {
    var checkQuestion = questionList[i];
    if (checkQuestion.category === Global.currentCategory){
      availableQuestionList.push(checkQuestion);
    }
  }
  availableQuestionList = availableQuestionList.filter( function( el ) {
    return !usedQuestions.includes( el );
  } );
  console.log(availableQuestionList);
  var choosenQuestion = availableQuestionList[getRandomIntInclusive(0, availableQuestionList.length-1)];
  usedQuestions.push(choosenQuestion);
  return choosenQuestion;
}

function progressBarMovement(progressBarWidth, Interval){
  progressBarInterval = setInterval(function(){
    progressBarWidth = progressBarWidth - Interval;
    socket.emit('moveProgressBarServer', progressBarWidth);
    }, 800);
}

function checkAnswers(){
  if (chosenAnswer === correct_answer){
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "green"

    if (Global.isHost){
      socket.emit('increaseScoreServer', true);
    }
    else{
      socket.emit('increaseScoreServer', false);
    }
    console.log("Correct answer selected!")
  }
  else if (chosenAnswer === "NO_ANSWER") {
    console.log("No answer selected!")
  }
  else{
    document.getElementById("answer" + correctAnswerButton + "Button").style.backgroundColor = "#94e294"
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "red"
    console.log("Wrong answer selected!")
  }
  Global.currentQuestionsOverallAmount = Global.currentQuestionsOverallAmount + 1;
  Global.currentQuestionsPerCategoryAmount = Global.currentQuestionsPerCategoryAmount + 1;
  if (Global.isHost){
    socket.emit('tellAnswerToOpponentServer', chosenButton, Global.guestId, true);
  }
  else if (Global.isGuest){
    socket.emit('tellAnswerToOpponentServer', chosenButton, Global.hostId, false);
  }
  var answerGivenTimeout = setTimeout(function(){
  
    if (Global.currentQuestionsOverallAmount == CONFIG.MAX_QUESTIONS_OVERALL){
      if(Global.isHost){
        socket.emit('endGameSceneServer');
      }
    }
    else if (Global.currentQuestionsPerCategoryAmount == CONFIG.MAX_QUESTIONS_PER_CATEGORY){
      Global.currentQuestionsPerCategoryAmount = 0;
      
      Global.currentCategoryAmount = Global.currentCategoryAmount +1;
      if(Global.isHost){
        socket.emit('backToCategoryServer');
      }

    } 
    else if (Global.currentQuestionsPerCategoryAmount < CONFIG.MAX_QUESTIONS_PER_CATEGORY){
      console.log("newQuestion");
      if (Global.isHost){
        socket.emit('resetSceneServer');
        pickNewQuestion();
        progressBarMovement(progressBarStart, progressBarIntervall);
      }
    }
    player1ProfilePopUp.setPosition(-100, -100);
    player2ProfilePopUp.setPosition(-100, -100);
    clearTimeout(answerGivenTimeout);
}, 2000);

}
function setAndClearButtonColor(setId, clearId1, clearId2, clearId3){
  document.getElementById("answer"+ setId + "Button").style.backgroundColor = "#de7f09"
  document.getElementById("answer"+ setId + "Button").style.boxShadow = "inset 2px 2px 2px rgba(255, 255, 255, .4), inset -2px -2px 2px rgba(0, 0, 0, .4)"
  document.getElementById("answer"+ setId + "Button").style.color = "white"

  document.getElementById("dot"+ setId).style.backgroundColor = "#D5D5D5"
  document.getElementById("dot"+ setId).style.color = "black"

  document.getElementById("answer"+ clearId1 + "Button").style.backgroundColor = "#D5D5D5"
  document.getElementById("answer"+ clearId1 + "Button").style.color = "black"
  document.getElementById("dot"+ clearId1).style.backgroundColor = "#de7f09"
  document.getElementById("dot"+ clearId1).style.color = "white"

  document.getElementById("answer"+ clearId2 + "Button").style.backgroundColor = "#D5D5D5"
  document.getElementById("answer"+ clearId2 + "Button").style.color = "black"
  document.getElementById("dot"+ clearId2).style.backgroundColor = "#de7f09"
  document.getElementById("dot"+ clearId2).style.color = "white"

  document.getElementById("answer"+ clearId3 + "Button").style.backgroundColor = "#D5D5D5"
  document.getElementById("answer"+ clearId3 + "Button").style.color = "black"
  document.getElementById("dot"+ clearId3).style.backgroundColor = "#de7f09"
  document.getElementById("dot"+ clearId3).style.color = "white"

};