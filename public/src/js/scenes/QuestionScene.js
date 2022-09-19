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
var categoryDiv;
var questionDiv;
var answer1Button;
var answer2Button;
var answer3Button;
var answer4Button;
var progressBarQuestion;

// Phaser game element variables
var profileIconPlayer1;
var profileIconPlayer2;
var playerOneScoreText;
var playerTwoScoreText;
var playerOneNameText;
var playerTwoNameText;

var progressBarStart = 330;
var progressBarIntervall = 20;

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

export default class QuestionScene extends Phaser.Scene {
    constructor() {
      super({ key: 'QuestionScene' });
    }
    preload() {
        this.load.html('questionSceneHTML', 'src/html/QuestionScene.html');
        this.load.image('profile_icon', 'assets/scenes/QuestionScene/placeholder_profile_icon.png')
    }
    create() {

      // Scene & Socket Management
      self = this;

      // Question selection
      if (Global.isHost){
        pickNewQuestion();
      }

      // HTML element placement & setup
      elementQuestionSceneHTML = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('questionSceneHTML');
      
      progressBarQuestion = new MyDOMElement(self, 34, 760, elementQuestionSceneHTML.getChildByID("progressBarQuestion")); 
      progressBarQuestion.setOrigin(0, 0);
      if (Global.isHost){
        progressBarMovement(progressBarStart, progressBarIntervall);  
      }

      categoryDiv = new MyDOMElement(self, 34, 250, elementQuestionSceneHTML.getChildByID("categoryDiv"), null, Global.currentCategory); 
      questionDiv = new MyDOMElement(self, 34, 310, elementQuestionSceneHTML.getChildByID("questionDiv"), null, "Current Question"); 

      categoryDiv.setOrigin(0, 0);
      questionDiv.setOrigin(0, 0);

      answer1Button = new MyDOMElement(self, 34, 550, elementQuestionSceneHTML.getChildByID("answer1Button"), null, "Answer 1"); 
      answer2Button = new MyDOMElement(self, 204, 550, elementQuestionSceneHTML.getChildByID("answer2Button"), null, "Answer 2"); 
      answer3Button = new MyDOMElement(self, 34, 650, elementQuestionSceneHTML.getChildByID("answer3Button"), null, "Answer 3"); 
      answer4Button = new MyDOMElement(self, 204, 650, elementQuestionSceneHTML.getChildByID("answer4Button"), null, "Answer 4"); 
      
      answer1Button.setOrigin(0, 0).addListener('click');
      answer2Button.setOrigin(0, 0).addListener('click');
      answer3Button.setOrigin(0, 0).addListener('click');
      answer4Button.setOrigin(0, 0).addListener('click');
      

      // Phaser game element placement & setup
      profileIconPlayer1 = self.physics.add.sprite(30, 40, 'profile_icon').setOrigin(0,0);
      profileIconPlayer2 = self.physics.add.sprite(280, 40, 'profile_icon').setOrigin(0,0);
      playerOneScoreText = self.add.text(58, 170, Global.playerOneScore, { fontSize: 60 } );
      playerTwoScoreText = self.add.text(312, 170, Global.playerTwoScore, { fontSize: 60 } );
      playerOneNameText = self.add.text(35, 140, Global.playerOneName, { fontSize: 20 } );
      playerTwoNameText = self.add.text(285, 140, Global.playerTwoName, { fontSize: 20 } );

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

      socket.on('tellQuestionGame', function(currentQuestion_s, correct_answer_s, currentAnswers_s, shuffleAnswers_s){
        currentQuestion = currentQuestion_s;
        correct_answer = correct_answer_s;
        currentAnswers = currentAnswers_s;
        shuffleAnswers = shuffleAnswers_s;
  
        answer1Button.setInnerText(shuffleAnswers_s[0]);
        answer2Button.setInnerText(shuffleAnswers_s[1]);
        answer3Button.setInnerText(shuffleAnswers_s[2]);
        answer4Button.setInnerText(shuffleAnswers_s[3]);
        categoryDiv.setInnerText(currentQuestion_s.category);
        questionDiv.setInnerText(currentQuestion_s.question);
      });


      socket.on('moveProgressBarGame', function(progressBarWidth){
        if(progressBarWidth>=0){    
          document.getElementById("progressBarQuestion").style.width = progressBarWidth.toString() +"px"
        } else {
          document.getElementById("progressBarQuestion").style.width = "0px"
          if (Global.isHost){
            clearInterval(progressBarInterval);
          }
          checkAnswers();
        }
        if (progressBarWidth > 160){
          document.getElementById("progressBarQuestion").style.backgroundColor = "green";
        }
        if (progressBarWidth < 160 && progressBarWidth > 50){
          document.getElementById("progressBarQuestion").style.backgroundColor = "orange";
        }
        if (progressBarWidth <= 50 && progressBarWidth > 0){
          document.getElementById("progressBarQuestion").style.backgroundColor = "red";
        }
      });

      socket.on('increaseScoreHostGame', function(score){
        Global.playerTwoScore = score;
        playerTwoScoreText.setText(Global.playerTwoScore)
      });
      socket.on('increaseScoreGuestGame', function(score){
        Global.playerOneScore = score;
        playerOneScoreText.setText(Global.playerOneScore)
      });

      socket.on('resetSceneGame', function(){
        currentQuestionRound.setText('Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES + " and Question: " + (Global.currentQuestionsPerCategoryAmount+1) + "/" + CONFIG.MAX_QUESTIONS_PER_CATEGORY);
        chosenAnswer = "NO_ANSWER";
        chosenButton = 0;
        document.getElementById("answer1Button").style.backgroundColor = "blue"
        document.getElementById("answer2Button").style.backgroundColor = "blue"
        document.getElementById("answer3Button").style.backgroundColor = "blue"
        document.getElementById("answer4Button").style.backgroundColor = "blue"
      });
      socket.on('backToCategoryGame', function(){
        chosenAnswer = "NO_ANSWER";
        chosenButton = 0;
        availableQuestionList.splice(0,availableQuestionList.length)

        document.getElementById("categoryDiv").style.visibility = "hidden";
        document.getElementById("questionDiv").style.visibility = "hidden";
        document.getElementById("answer1Button").style.visibility = "hidden";
        document.getElementById("answer2Button").style.visibility = "hidden";
        document.getElementById("answer3Button").style.visibility = "hidden";
        document.getElementById("answer4Button").style.visibility = "hidden";

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
        self.scene.setVisible(false);
        self.scene.setActive(false);
        self.scene.launch("ScoreScene");
      });
      
    }

    update() {
      if (newQuestion){
        var replaceQuestion = setTimeout(function(){         
          socket.emit('tellQuestionServer', currentQuestion, correct_answer, currentAnswers, shuffleAnswers);
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
      document.getElementById("categoryDiv").style.visibility = "visible";
      document.getElementById("questionDiv").style.visibility = "visible";
      document.getElementById("answer1Button").style.visibility = "visible";
      document.getElementById("answer2Button").style.visibility = "visible";
      document.getElementById("answer3Button").style.visibility = "visible";
      document.getElementById("answer4Button").style.visibility = "visible";
      document.getElementById("answer1Button").style.backgroundColor = "blue"
      document.getElementById("answer2Button").style.backgroundColor = "blue"
      document.getElementById("answer3Button").style.backgroundColor = "blue"
      document.getElementById("answer4Button").style.backgroundColor = "blue"
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
  socket.emit('tellQuestionServer', currentQuestion, correct_answer, currentAnswers, shuffleAnswers);
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
    }, 500);
}

function checkAnswers(){
  if (chosenAnswer === correct_answer){
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "green"

    if (Global.isHost){
      Global.playerOneScore = Global.playerOneScore + 1;
      playerOneScoreText.setText(Global.playerOneScore);
      socket.emit('increaseScoreGuestServer', Global.guestId, Global.playerOneScore);
    }
    else{
      Global.playerTwoScore = Global.playerTwoScore + 1;
      playerTwoScoreText.setText(Global.playerTwoScore)
      socket.emit('increaseScoreHostServer', Global.hostId, Global.playerTwoScore);
    }
    console.log("Correct answer selected!")
  }
  else if (chosenAnswer === "NO_ANSWER") {
    console.log("No answer selected!")
  }
  else{
    document.getElementById("answer"+ chosenButton + "Button").style.backgroundColor = "red"
    console.log("Wrong answer selected!")
  }
  Global.currentQuestionsOverallAmount = Global.currentQuestionsOverallAmount + 1;
  Global.currentQuestionsPerCategoryAmount = Global.currentQuestionsPerCategoryAmount + 1;

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
    clearTimeout(answerGivenTimeout);
}, 1300);

}
function setAndClearButtonColor(setId, clearId1, clearId2, clearId3, clearId4){
  document.getElementById("answer"+ setId + "Button").style.backgroundColor = "gray"
  document.getElementById("answer"+ clearId1 + "Button").style.backgroundColor = "blue"
  document.getElementById("answer"+ clearId2 + "Button").style.backgroundColor = "blue"
  document.getElementById("answer"+ clearId3 + "Button").style.backgroundColor = "blue"
};





