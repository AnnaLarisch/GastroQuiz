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
var checkmarkPopUp;
var crossPopUp;
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


      //const question_background = self.add.image(0, 0, 'question_background')
      //.setOrigin(0)

      //question_background.setScale(Math.max(cameraWidth / question_background.width, cameraHeight / question_background.height));


      // Question selection
      if (Global.isHost){
        pickNewQuestion();
      }

      // HTML element placement & setup
      elementQuestionSceneHTML = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('questionSceneHTML');


      var progressBarBehindQuestion = new MyDOMElement(self, 470, 412, elementQuestionSceneHTML.getChildByID("progressBarBehindQuestion")); 
      progressBarBehindQuestion.setOrigin(0, 0);
      progressBarQuestion = new MyDOMElement(self, 470, 412, elementQuestionSceneHTML.getChildByID("progressBarQuestion")); 
      progressBarQuestion.setOrigin(0, 0);
      if (Global.isHost){
        progressBarMovement(progressBarStart, progressBarIntervall);  
      }



      questionDiv = new MyDOMElement(self, 300, 135, elementQuestionSceneHTML.getChildByID("questionDiv"), null, "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat."); 
      questionDiv.setOrigin(0, 0);

      answer1Button = new MyDOMElement(self, 50, 500, elementQuestionSceneHTML.getChildByID("answer1Button"), null, "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat"); 
      answer2Button = new MyDOMElement(self, 665, 500, elementQuestionSceneHTML.getChildByID("answer2Button"), null, "Answer 2"); 
      answer3Button = new MyDOMElement(self, 50, 620, elementQuestionSceneHTML.getChildByID("answer3Button"), null, "Answer 3"); 
      answer4Button = new MyDOMElement(self, 665, 620, elementQuestionSceneHTML.getChildByID("answer4Button"), null, "Answer 4"); 
      answer1Button.setOrigin(0, 0).addListener('click');
      answer2Button.setOrigin(0, 0).addListener('click');
      answer3Button.setOrigin(0, 0).addListener('click');
      answer4Button.setOrigin(0, 0).addListener('click');




      player1ProfilePopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("player1IconPopup"));
      player2ProfilePopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("player2IconPopup"));

      checkmarkPopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("checkmarkIcon"));
      crossPopUp = new MyDOMElement(self, -100, -100, elementQuestionSceneHTML.getChildByID("crossIcon"));

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
        
        document.getElementById("answer1Button").classList.remove('btn-outline-success')
        document.getElementById("answer1Button").classList.remove('btn-outline-danger')
        document.getElementById("answer1Button").classList.add('btn-outline-secondary')

        document.getElementById("answer2Button").classList.remove('btn-outline-success')
        document.getElementById("answer2Button").classList.remove('btn-outline-danger')
        document.getElementById("answer2Button").classList.add('btn-outline-secondary')

        document.getElementById("answer3Button").classList.remove('btn-outline-success')
        document.getElementById("answer3Button").classList.remove('btn-outline-danger')
        document.getElementById("answer3Button").classList.add('btn-outline-secondary')

        document.getElementById("answer4Button").classList.remove('btn-outline-success')
        document.getElementById("answer4Button").classList.remove('btn-outline-danger')
        document.getElementById("answer4Button").classList.add('btn-outline-secondary')

      });

      socket.on('backToCategoryGame', function(){
        player1ProfilePopUp.setPosition(-100, -100);
        player2ProfilePopUp.setPosition(-100, -100);
        checkmarkPopUp.setPosition(-100, -100);
        crossPopUp.setPosition(-100, -100);
        chosenAnswer = "NO_ANSWER";
        chosenButton = 0;
        availableQuestionList.splice(0,availableQuestionList.length)

        document.getElementById("questionDiv").style.visibility = "hidden";
        document.getElementById("answer1Button").style.visibility = "hidden";
        document.getElementById("answer2Button").style.visibility = "hidden";
        document.getElementById("answer3Button").style.visibility = "hidden";
        document.getElementById("answer4Button").style.visibility = "hidden";
    
        document.getElementById("progressBarBehindQuestion").style.visibility = "hidden";
    
        self.scene.setVisible(false);
        self.scene.setActive(false);
        self.scene.get('CategoryChoiceScene').scene.setVisible(true);
        self.scene.get('CategoryChoiceScene').scene.setActive(true);
        self.scene.get('CategoryChoiceScene').resetCategory();
      });
      socket.on('endGameSceneGame', function(){

        document.getElementById("questionDiv").style.visibility = "hidden";
        document.getElementById("answer1Button").style.visibility = "hidden";
        document.getElementById("answer2Button").style.visibility = "hidden";
        document.getElementById("answer3Button").style.visibility = "hidden";
        document.getElementById("answer4Button").style.visibility = "hidden";


        document.getElementById("progressBarBehindQuestion").style.visibility = "hidden";

        self.scene.setVisible(false);
        self.scene.setActive(false);
        self.scene.launch("ScoreScene");
      });
      socket.on('tellAnswerToOpponentGame', function(opponentChosenAnswer, sendbyHost){
        var ypos = 0;
        var xpos = 0;
        if (opponentChosenAnswer == 1){ 
          xpos = 50;
          ypos = 470;
        }
        else if (opponentChosenAnswer == 2){
          xpos = 665;
          ypos = 470;
        }
        else if (opponentChosenAnswer == 3){
          xpos = 50;
          ypos = 590;
        }
        else if (opponentChosenAnswer == 4){
          xpos = 665;
          ypos = 590;
         
        }
        else {
          ypos = -100;
          xpos= -100;

        }

        if (sendbyHost){
          player1ProfilePopUp.setPosition(xpos, ypos);
        }
        else{
          player2ProfilePopUp.setPosition(xpos, ypos);
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

      document.getElementById("progressBarBehindQuestion").style.visibility = "visible";

     
      document.getElementById("answer1Button").classList.remove('btn-outline-success')
      document.getElementById("answer1Button").classList.remove('btn-outline-danger')
      document.getElementById("answer1Button").classList.add('btn-outline-secondary')

      document.getElementById("answer2Button").classList.remove('btn-outline-success')
      document.getElementById("answer2Button").classList.remove('btn-outline-danger')
      document.getElementById("answer2Button").classList.add('btn-outline-secondary')

      document.getElementById("answer3Button").classList.remove('btn-outline-success')
      document.getElementById("answer3Button").classList.remove('btn-outline-danger')
      document.getElementById("answer3Button").classList.add('btn-outline-secondary')

      document.getElementById("answer4Button").classList.remove('btn-outline-success')
      document.getElementById("answer4Button").classList.remove('btn-outline-danger')
      document.getElementById("answer4Button").classList.add('btn-outline-secondary')
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
    var chosenxpos = 0;
    var chosenypos = 0;
    
    if (chosenButton == 1){ 
      chosenxpos = 150;
      chosenypos = 470;
    }
    else if (chosenButton == 2){
      chosenxpos = 765;
      chosenypos = 470;
    }
    else if (chosenButton == 3){
      chosenxpos = 150;
      chosenypos = 590;
    }
    else if (chosenButton == 4){
      chosenxpos = 765;
      chosenypos = 590;
     
    }
    else {
      chosenxpos = -100;
      chosenypos= -100;
    }

    var correctxpos = 0;
    var correctypos = 0;
    
    if (correctAnswerButton == 1){ 
      correctxpos = 150;
      correctypos = 470;
    }
    else if (correctAnswerButton == 2){
      correctxpos = 765;
      correctypos = 470;
    }
    else if (correctAnswerButton == 3){
      correctxpos = 150;
      correctypos = 590;
    }
    else if (correctAnswerButton == 4){
      correctxpos = 765;
      correctypos = 590;
     
    }

  if (chosenAnswer === correct_answer){
    document.getElementById("answer"+ chosenButton + "Button").classList.add('btn-outline-success')
    document.getElementById("answer"+ chosenButton + "Button").classList.remove('btn-outline-secondary')
    

    checkmarkPopUp.setPosition(chosenxpos, chosenypos);


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
    document.getElementById("answer"+ correctAnswerButton + "Button").classList.add('btn-outline-success')
    document.getElementById("answer"+ correctAnswerButton + "Button").classList.remove('btn-outline-secondary')
    document.getElementById("answer"+ chosenButton + "Button").classList.add('btn-outline-danger')
    document.getElementById("answer"+ chosenButton + "Button").classList.remove('btn-outline-secondary')
    console.log("Wrong answer selected!")
    crossPopUp.setPosition(chosenxpos, chosenypos);
    checkmarkPopUp.setPosition(correctxpos, correctxpos);

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
        player1ProfilePopUp.setPosition(-100, -100);
        player2ProfilePopUp.setPosition(-100, -100);
        socket.emit('endGameSceneServer');
      }
    }
    else if (Global.currentQuestionsPerCategoryAmount == CONFIG.MAX_QUESTIONS_PER_CATEGORY){
      Global.currentQuestionsPerCategoryAmount = 0;
      
      Global.currentCategoryAmount = Global.currentCategoryAmount +1;
      if(Global.isHost){
        player1ProfilePopUp.setPosition(-100, -100);
        player2ProfilePopUp.setPosition(-100, -100);
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
    checkmarkPopUp.setPosition(-100, -100);
    crossPopUp.setPosition(-100, -100);
    clearTimeout(answerGivenTimeout);
    player1ProfilePopUp.setPosition(-100, -100);
    player2ProfilePopUp.setPosition(-100, -100);
    checkmarkPopUp.setPosition(-100, -100);
    crossPopUp.setPosition(-100, -100);
}, 2000);
    player1ProfilePopUp.setPosition(-100, -100);
    player2ProfilePopUp.setPosition(-100, -100);
    checkmarkPopUp.setPosition(-100, -100);
    crossPopUp.setPosition(-100, -100);

}
function setAndClearButtonColor(setId, clearId1, clearId2, clearId3){

  document.getElementById("answer"+ setId + "Button").classList.add('btn-outline-success')
  document.getElementById("answer"+ setId + "Button").classList.remove('btn-outline-secondary')


  document.getElementById("answer"+ clearId1 + "Button").classList.remove('btn-outline-success')
  document.getElementById("answer"+ clearId1 + "Button").classList.add('btn-outline-secondary')

  
  document.getElementById("answer"+ clearId2 + "Button").classList.remove('btn-outline-success')
  document.getElementById("answer"+ clearId2 + "Button").classList.add('btn-outline-secondary')


  document.getElementById("answer"+ clearId3 + "Button").classList.remove('btn-outline-success')
  document.getElementById("answer"+ clearId3 + "Button").classList.add('btn-outline-secondary')

 

};