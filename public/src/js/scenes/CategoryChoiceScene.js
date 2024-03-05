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

var player1Text;
var player1PointsText;
var player2Text;
var player2PointsText;
var playerTurnText;

var versusText;
var currentRoundText;



// Choosing category variables
var categoryList;
var chosenCategoriesList = [];
var chosenCategory = "Empty"
var chosenCategoryNumber;


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
        //this.load.image('category_choice_bg', 'assets/scenes/CategoryChoiceScene/category_choice_background.png')

    }
    
    create() {

        // Scene management
        // Scene management
        self = this;
        const cameraWidth = self.cameras.main.width
        const cameraHeight = self.cameras.main.height
        
        socket.emit("startReactionScene")


    

        // Category selection
        if (Global.isHost){
            chooseCategory(categories.categories);
        }

      //  const category_choice_bg = self.add.image(0, 0, 'category_choice_bg')
        //.setOrigin(0)

        //category_choice_bg.setScale(Math.max(cameraWidth / category_choice_bg.width, cameraHeight / category_choice_bg.height));


        // HTML element placement & setup

        elementCategoryChoiceSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('categoryChoiceSceneHTML');
             
        category1Button = new MyDOMElement(self, 260, 500, elementCategoryChoiceSceneHTML.getChildByID("category1Button"), null, "Category"); 
        category2Button = new MyDOMElement(self, 665, 500, elementCategoryChoiceSceneHTML.getChildByID("category2Button"), null, "Category"); 
        category3Button = new MyDOMElement(self, 460, 620, elementCategoryChoiceSceneHTML.getChildByID("category3Button"), null, "Category");
        category1Button.setOrigin(0,0).addListener('click');
        category2Button.setOrigin(0,0).addListener('click');
        category3Button.setOrigin(0,0).addListener('click');
      
      
  
        player1Text = new MyDOMElement(self, 270, 130, elementCategoryChoiceSceneHTML.getChildByID("player1Text"));
        player1Text.setInnerText(Global.playerOneName )
        player1Text.setOrigin(0,0);
        player1PointsText = new MyDOMElement(self, 270, 150, elementCategoryChoiceSceneHTML.getChildByID("player1TextPunkte"));
        player1PointsText.setInnerText("\nPunkte: "+ Global.playerOneScore)
        player1PointsText.setOrigin(0,0);


        player2Text = new MyDOMElement(self, 830, 130, elementCategoryChoiceSceneHTML.getChildByID("player2Text"));
        player2Text.setInnerText(Global.playerTwoName )  
        player2Text.setOrigin(0,0);
        player2PointsText = new MyDOMElement(self, 830, 150, elementCategoryChoiceSceneHTML.getChildByID("player2TextPunkte"));
        player2PointsText.setInnerText("\nPunkte: "+ Global.playerTwoScore)
        player2PointsText.setOrigin(0,0);


        playerTurnText = new MyDOMElement(self, 260, 460, elementCategoryChoiceSceneHTML.getChildByID("playerTurnText"));
        playerTurnText.setInnerText("Team " + Global.categoryDecider +" entscheidet!")
        playerTurnText.setOrigin(0,0);

        versusText = new MyDOMElement(self, 450, 10, elementCategoryChoiceSceneHTML.getChildByID("versusText"));
        versusText.setOrigin(0,0);

        currentRoundText = new MyDOMElement(self, 1050, 730, elementCategoryChoiceSceneHTML.getChildByID("currentRoundText"));
        currentRoundText.setInnerText('Runde ' + (Global.currentCategoryAmount+1) + " von " + CONFIG.MAX_CATEGORIES);
        currentRoundText.setOrigin(0,0);
        
       

        // Player one or Player two decides on a category here 
        // Other Players category buttons are not interactable
        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("decider")
            document.getElementById("category1Button").disabled = false;
            document.getElementById("category2Button").disabled = false;
            document.getElementById("category3Button").disabled = false;
    
        }
        else{
            document.getElementById("category1Button").disabled = true;
            document.getElementById("category2Button").disabled = true;
            document.getElementById("category3Button").disabled = true;

        }
        category1Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            document.getElementById("category1Button").disabled = true;
            document.getElementById("category2Button").disabled = true;
            document.getElementById("category3Button").disabled = true;
            console.log("Category 1!")
            socket.emit("chooseCategoryCallServer", chosenCategoriesList[0], 1, 2, 3)
        }

        });
        category2Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            document.getElementById("category1Button").disabled = true;
            document.getElementById("category2Button").disabled = true;
            document.getElementById("category3Button").disabled = true;
            console.log("Category 2!")
            socket.emit("chooseCategoryCallServer", chosenCategoriesList[1], 2, 1, 3)
        }
        });
        category3Button.on('click', function (pointer){
            if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            document.getElementById("category1Button").disabled = true;
            document.getElementById("category2Button").disabled = true;
            document.getElementById("category3Button").disabled = true;
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

          });
          
        
        // Set chosen categories for all players
        socket.on('chooseCategoryCallGame', function(categoryName, setId, clearId1, clearId2){
            Global.currentCategory = categoryName;
            usedCategories.push(categoryName);
            document.getElementById("category"+ setId + "Button").classList.add('btn-dark')
            document.getElementById("category"+ setId + "Button").classList.remove('btn-outline-dark')


           //setColourList(["category"+ setId + "Button", "category"+ clearId1 + "Button", "category"+ clearId2 + "Button"], ["orange", "gray", "gray"])

            // And after a short while, change to the next scene
            var toQuestionSceneTimeout = setTimeout(function(){
          
                changeVisibilityList(["playerTurnText","player1Text", "player1TextPunkte", "player2Text",  "player2TextPunkte", "category1Button", "versusText", "category2Button", "category3Button"], "hidden")
    
                self.scene.setVisible(false);
                self.scene.setActive(false);
                
                // Launch or reactivate scene depending on if the scene was launched beforehand
                if (!Global.questionSceneLaunched){
                    self.scene.launch("QuestionScene");
                    self.scene.get("ReactionScene").scene.bringToTop();

                }
                else{
                    self.scene.get("QuestionScene").scene.setActive(true);
                    self.scene.get("QuestionScene").scene.setVisible(true);
                    self.scene.get("ReactionScene").scene.bringToTop();

                    self.scene.get("QuestionScene").resetQuestion();
                }
                clearTimeout(toQuestionSceneTimeout);
            }, 1300);
        });

        // Set color of chosen category to orange
        socket.on('colourCategoryGame', function(chosenCategoryNumber_server){
            document.getElementById("category"+ chosenCategoryNumber_server + "Button").classList.add('btn-dark')
            document.getElementById("category"+ chosenCategoryNumber_server + "Button").classList.remove('btn-outline-dark')
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
        changeVisibilityList(["playerTurnText","player1Text", "player1TextPunkte", "player2Text",  "player2TextPunkte", "category1Button", "versusText", "category2Button", "category3Button"], "visible")
        currentRoundText.setInnerText('Runde ' + (Global.currentCategoryAmount+1) + " von " + CONFIG.MAX_CATEGORIES);
        playerTurnText.setText("Team " + Global.categoryDecider +" entscheidet!");
        player1PointsText.setText("\nPunkte: "+ Global.playerOneScore)
        player2PointsText.setText("\nPunkte: "+ Global.playerTwoScore)


       // chooseCategoryText.setText(Global.categoryDecider + " decides on a category: ");
        //playerOneScoreText.setText(Global.playerOneScore);
        //playerTwoScoreText.setText(Global.playerTwoScore);


        chosenCategoriesList.splice(0, chosenCategoriesList.length);

        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) ||
            (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
                document.getElementById("category1Button").classList.remove('btn-dark')
                document.getElementById("category1Button").classList.add('btn-outline-dark')
                document.getElementById("category2Button").classList.remove('btn-dark')
                document.getElementById("category2Button").classList.add('btn-outline-dark')
                document.getElementById("category3Button").classList.remove('btn-dark')
                document.getElementById("category3Button").classList.add('btn-outline-dark')
                document.getElementById("category1Button").disabled = false;
                document.getElementById("category2Button").disabled = false;
                document.getElementById("category3Button").disabled = false;
        } 
        if ((Global.categoryDecider === Global.playerOneName && !Global.isHost) ||
            (Global.categoryDecider === Global.playerTwoName && !Global.isGuest)){
                document.getElementById("category1Button").classList.remove('btn-dark')
                document.getElementById("category1Button").classList.add('btn-outline-dark')
                document.getElementById("category2Button").classList.remove('btn-dark')
                document.getElementById("category2Button").classList.add('btn-outline-dark')
                document.getElementById("category3Button").classList.remove('btn-dark')
                document.getElementById("category3Button").classList.add('btn-outline-dark')
                document.getElementById("category1Button").disabled = true;
                document.getElementById("category2Button").disabled = true;
                document.getElementById("category3Button").disabled = true;
            
            
                   
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



