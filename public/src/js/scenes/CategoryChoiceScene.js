import CONFIG from '../config.js'
import Global, { getRandomIntInclusive } from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'
import { shuffleArray } from "../global.js";
import { filterArray } from "../global.js";

import categories from "../../../assets/content/categories.js"


// Game variables
var self;

// HTML element variables
var elementCategoryChoiceSceneHTML;
var category1Button;
var category2Button;
var category3Button;
var header;
var headerContent;
var player1Backsprite;
var player1ProfileIcon;
var player1Text;
var player2Backsprite; 
var player2ProfileIcon;
var player2Text;
var playerTurnDiv;
var playerTurnText;

// Phaser game element variables
var profileIconPlayer1;
var profileIconPlayer2;
var playerOneScoreText;
var playerTwoScoreText;
var playerOneNameText;
var playerTwoNameText;
var chooseCategoryText;

// Choosing category variables
var categoryList;
var chosenCategoriesList = [];
var chosenCategory = "Empty"
var chosenCategoryNumber;

var currentRound;

var usedCategories = [];
const socket = getSocket();

var newCategory = false;



export default class CategoryChoiceScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CategoryChoiceScene' });
    }
  
    preload() {
        this.load.html('categoryChoiceSceneHTML', 'src/html/CategoryChoiceScene.html');
        this.load.image('profile_icon', 'assets/scenes/CategoryChoiceScene/placeholder_profile_icon.png')
    }
    
    create() {

        // Scene management
        self = this;

        // Category selection
        if (Global.isHost){
            chooseCategory(categories.categories);
        }
    

        // HTML element placement & setup
        elementCategoryChoiceSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('categoryChoiceSceneHTML');
        
        category1Button = new MyDOMElement(self, 10, 500, elementCategoryChoiceSceneHTML.getChildByID("category1Button"), null, "Category"); 
        category2Button = new MyDOMElement(self, 10, 600, elementCategoryChoiceSceneHTML.getChildByID("category2Button"), null, "Category"); 
        category3Button = new MyDOMElement(self, 10, 700, elementCategoryChoiceSceneHTML.getChildByID("category3Button"), null, "Category");
        category1Button.setOrigin(0,0).addListener('click');
        category2Button.setOrigin(0,0).addListener('click');
        category3Button.setOrigin(0,0).addListener('click');

        header = new MyDOMElement(self, 0, -50, elementCategoryChoiceSceneHTML.getChildByID("header"));
        headerContent = new MyDOMElement(self, 0, -50, elementCategoryChoiceSceneHTML.getChildByID("header-content"), null, "GastroQuiz");
        header.setOrigin(0,0);
        headerContent.setOrigin(0,0);

        player1Backsprite = new MyDOMElement(self, 11, 130, elementCategoryChoiceSceneHTML.getChildByID("player1Backsprite"));
        player1ProfileIcon = new MyDOMElement(self, 30, 128, elementCategoryChoiceSceneHTML.getChildByID("player1ProfileIcon"));
        player1Text = new MyDOMElement(self, 190, 125, elementCategoryChoiceSceneHTML.getChildByID("player1Text"));
        player1Text.setInnerText(Global.playerOneName +"\nScore: "+ Global.playerOneScore +" / " + Global.currentQuestionsOverallAmount)
        player1Backsprite.setOrigin(0,0);
        player1ProfileIcon.setOrigin(0,0);
        player1Text.setOrigin(0,0);

        player2Backsprite = new MyDOMElement(self, 11, 245, elementCategoryChoiceSceneHTML.getChildByID("player2Backsprite"));
        player2ProfileIcon = new MyDOMElement(self, 270, 243, elementCategoryChoiceSceneHTML.getChildByID("player2ProfileIcon"));
        player2Text = new MyDOMElement(self, 24, 240, elementCategoryChoiceSceneHTML.getChildByID("player2Text"));
        player2Text.setInnerText(Global.playerTwoName +"\nScore: "+ Global.playerTwoScore +" / " + Global.currentQuestionsOverallAmount)
        player2Backsprite.setOrigin(0,0);
        player2ProfileIcon.setOrigin(0,0);
        player2Text.setOrigin(0,0);

        playerTurnDiv = new MyDOMElement(self, 11, 390, elementCategoryChoiceSceneHTML.getChildByID("playerTurnDiv"));
        playerTurnText = new MyDOMElement(self, 25, 393, elementCategoryChoiceSceneHTML.getChildByID("playerTurnText"));
        playerTurnText.setInnerText(Global.categoryDecider +" decides on a category: ")
        playerTurnDiv.setOrigin(0,0);
        playerTurnText.setOrigin(0,0);
      
        // Phaser game element placement & setup
        //profileIconPlayer1 = self.physics.add.sprite(30, 40, 'profile_icon').setOrigin(0,0);
        //profileIconPlayer2 = self.physics.add.sprite(280, 40, 'profile_icon').setOrigin(0,0);
        //playerOneScoreText = self.add.text(58, 170, Global.playerOneScore, { fontSize: 60 } );
        //playerTwoScoreText = self.add.text(312, 170, Global.playerTwoScore, { fontSize: 60 } );
        //playerOneNameText = self.add.text(35, 140, Global.playerOneName, { fontSize: 20 } );
        //playerTwoNameText = self.add.text(285, 140, Global.playerTwoName, { fontSize: 20 } );
        //chooseCategoryText = self.add.text(20, 350, Global.categoryDecider + " decides on a category: ", { fontSize: 20 } );
        
        currentRound = self.add.text(15, 815, 'Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES);


        // Player one or Player two decides on a category here 
        // Other Players category buttons are not interactable
        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("decider")
        }
        else{
            //setColourList(["category1Button", "category2Button", "category3Button"], ["grey", "grey", "grey"])
        }
        category1Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("Category 1!")
            socket.emit("chooseCategoryCallServer", chosenCategoriesList[0], 1, 2, 3)
        }

        });
        category2Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("Category 2!")
            socket.emit("chooseCategoryCallServer", chosenCategoriesList[1], 2, 1, 3)
        }
        });
        category3Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("Category 3!")
            socket.emit("chooseCategoryCallServer", chosenCategoriesList[2], 3, 1, 2)
        }
        });

        

        // Socket Interactions

        // Set categories for all players
        socket.on('tellCategoriesGame', function(category1, category2, category3){
            chosenCategoriesList.push(category1, category2, category3);
            category1Button.setInnerText(category1);
            category2Button.setInnerText(category2);
            category3Button.setInnerText(category3);
            document.getElementById("category1Button").style.width = "370px";
            document.getElementById("category2Button").style.width = "370px";
            document.getElementById("category3Button").style.width = "370px";

          });
          
        
        // Set chosen categories for all players
        socket.on('chooseCategoryCallGame', function(categoryName, setId, clearId1, clearId2){
            Global.currentCategory = categoryName;
            usedCategories.push(categoryName);
            setColourList(["category"+ setId + "Button", "category"+ clearId1 + "Button", "category"+ clearId2 + "Button"], ["orange", "gray", "gray"])

            // And after a short while, change to the next scene
            var toQuestionSceneTimeout = setTimeout(function(){
          
                changeVisibilityList(["playerTurnDiv", "playerTurnText", "header", "header-content", "player1Backsprite","player1ProfileIcon","player1Text", "player2Backsprite","player2ProfileIcon","player2Text", "category1Button", "category2Button", "category3Button"], "hidden")
    
                self.scene.setVisible(false);
                self.scene.setActive(false);
                
                // Launch or reactivate scene depending on if the scene was launched beforehand
                if (!Global.questionSceneLaunched){
                    self.scene.launch("QuestionScene");
                }
                else{
                    self.scene.get("QuestionScene").scene.setActive(true);
                    self.scene.get("QuestionScene").scene.setVisible(true);

                    self.scene.get("QuestionScene").resetQuestion();
                }
                clearTimeout(toQuestionSceneTimeout);
            }, 1300);
        });

        // Set color of chosen category to orange
        socket.on('colourCategoryGame', function(chosenCategoryNumber_server){
            document.getElementById("category"+ chosenCategoryNumber_server + "Button").style.backgroundColor = "orange"
        });


    }

    update() {
        // As a fail safe, send the categors to the server after 1 second
        if (newCategory){
            var replaceCategory = setTimeout(function(){         
                socket.emit("tellCategoriesServer", categoryList[0],categoryList[1], categoryList[2])
                clearTimeout(replaceCategory);
                newCategory = false;
            }, 1000);
          }

    }

    // Reset category for the next game round
    resetCategory(){
        changeCategoryDecider(Global.categoryDecider);
        changeVisibilityList(["playerTurnDiv", "playerTurnText", "header", "header-content", "player1Backsprite","player1ProfileIcon","player1Text", "player2Backsprite","player2ProfileIcon","player2Text", "category1Button", "category2Button", "category3Button"], "visible")

        currentRound.setText('Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES);
        playerTurnText.setText(Global.categoryDecider + " decides on a category: ");
        player1Text.setText(Global.playerOneName +"\nScore: "+ Global.playerOneScore +" / " + Global.currentQuestionsOverallAmount)
        player2Text.setText(Global.playerTwoName +"\nScore: "+ Global.playerTwoScore +" / " + Global.currentQuestionsOverallAmount)


       // chooseCategoryText.setText(Global.categoryDecider + " decides on a category: ");
        //playerOneScoreText.setText(Global.playerOneScore);
        //playerTwoScoreText.setText(Global.playerTwoScore);


        chosenCategoriesList.splice(0, chosenCategoriesList.length);

        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) ||
            (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            setColourList(["category1Button", "category2Button", "category3Button"], ["blue", "blue", "blue"])
        } 
        if ((Global.categoryDecider === Global.playerOneName && !Global.isHost) ||
            (Global.categoryDecider === Global.playerTwoName && !Global.isGuest)){
            setColourList(["category1Button", "category2Button", "category3Button"], ["grey", "grey", "grey"])
        } 
        if (Global.isHost){
            chooseCategory(categories.categories)
        }

    }
}

function changeVisibilityList(objectList, state){
    for (let i = 0; i < objectList.length; i++) {
        changeVisibility(objectList[i], state);    
    }
}

function changeVisibility(object, state){
    document.getElementById(object).style.visibility = state;
}

function changeCategoryDecider(decider){
    if (decider === Global.playerOneName){
        Global.categoryDecider = Global.playerTwoName;
    }
    else if (decider === Global.playerTwoName){
        Global.categoryDecider = Global.playerOneName;
    }
}

function getCompactCategoryList(categoryList){
    var returnList = [];
    for (let i = 0; i < categoryList.length; i++) {
        var pushedCategory = categoryList[i].category
        returnList.push(pushedCategory);
    }
    return returnList;
}

function setColourList(objectList, colourList){
    for (let i = 0; i < objectList.length; i++) {
        setColour(objectList[i], colourList[i]);    
    }
}

function setColour(object, colour){
    document.getElementById(object).style.backgroundColor = colour;
}

function chooseCategory(categories){
    
    newCategory = true;
    // Prepare three categories
    categoryList = getCompactCategoryList(categories)
    categoryList = filterArray(categoryList, usedCategories)
    categoryList = shuffleArray(categoryList);

    chosenCategoriesList.push(categoryList[0],categoryList[1], categoryList[2])
    socket.emit("tellCategoriesServer", categoryList[0],categoryList[1], categoryList[2])

}



