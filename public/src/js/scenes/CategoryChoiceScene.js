import CONFIG from '../config.js'
import Global, { getRandomIntInclusive } from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'
import { shuffleArray } from "../global.js";
import categories from "../../../assets/content/categories.js"


// Game variables
var self;

// HTML element variables
var elementCategoryChoiceSceneHTML;
var category1Button;
var category2Button;
var category3Button;

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

        // Scene & Socket Management
        self = this;
        console.log("Restart category Choice")

        // Category selection
        if (Global.isHost){
            chooseCategory(categories.categories);
        }
    

        // HTML element placement & setup
        elementCategoryChoiceSceneHTML  = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('categoryChoiceSceneHTML');
        
        category1Button = new MyDOMElement(self, 50, 400, elementCategoryChoiceSceneHTML.getChildByID("category1Button"), null, "Category"); 
        category2Button = new MyDOMElement(self, 220, 400, elementCategoryChoiceSceneHTML.getChildByID("category2Button"), null, "Category"); 
        category3Button = new MyDOMElement(self, 135, 550, elementCategoryChoiceSceneHTML.getChildByID("category3Button"), null, "Category");
        console.log(category1Button)
        console.log(category2Button)
        console.log(category3Button)
        category1Button.setOrigin(0,0).addListener('click');
        category2Button.setOrigin(0,0).addListener('click');
        category3Button.setOrigin(0,0).addListener('click');
    

        // Phaser game element placement & setup
        profileIconPlayer1 = self.physics.add.sprite(30, 40, 'profile_icon').setOrigin(0,0);
        profileIconPlayer2 = self.physics.add.sprite(280, 40, 'profile_icon').setOrigin(0,0);
        playerOneScoreText = self.add.text(58, 170, Global.playerOneScore, { fontSize: 60 } );
        playerTwoScoreText = self.add.text(312, 170, Global.playerTwoScore, { fontSize: 60 } );
        playerOneNameText = self.add.text(35, 140, Global.playerOneName, { fontSize: 20 } );
        playerTwoNameText = self.add.text(285, 140, Global.playerTwoName, { fontSize: 20 } );
        chooseCategoryText = self.add.text(20, 350, Global.categoryDecider + " decides on a category: ", { fontSize: 20 } );
        
        currentRound = self.add.text(15, 815, 'Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES);


        // Player one or Player two decides on a category here 
        // Other Players category buttons are not interactable
        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            console.log("decider")
        }
        else{
            document.getElementById("category1Button").style.backgroundColor = "grey"
            document.getElementById("category2Button").style.backgroundColor = "grey"
            document.getElementById("category3Button").style.backgroundColor = "grey"
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

        // Give categories to buttons
        socket.on('tellCategoriesGame', function(categoriesList, category1, category2, category3){
            console.log(category1, category2, category3)
            chosenCategoriesList.push(category1, category2, category3);
            category1Button.setInnerText(category1);
            category2Button.setInnerText(category2);
            category3Button.setInnerText(category3);
          });
          
        socket.on('chooseCategoryCallGame', function(categoryName, setId, clearId1, clearId2){
            console.log(Global.currentCategory);
            console.log(categoryName);
            Global.currentCategory = categoryName;
            console.log(Global.currentCategory);
            console.log(categoryName)
            usedCategories.push(categoryName);
            document.getElementById("category"+ setId + "Button").style.backgroundColor = "orange"
            document.getElementById("category"+ clearId1 + "Button").style.backgroundColor = "gray"
            document.getElementById("category"+ clearId2 + "Button").style.backgroundColor = "gray"
            var toQuestionSceneTimeout = setTimeout(function(){
                /*
                setPosition("category1Button", -1000);
                setPosition("category2Button", -1000);
                setPosition("category3Button", -1000);
                */
                document.getElementById("category1Button").style.visibility = "hidden";
                document.getElementById("category2Button").style.visibility = "hidden";
                document.getElementById("category3Button").style.visibility = "hidden";


                self.scene.setVisible(false);
                self.scene.setActive(false);
                Global.questionReset = true;
                if (Global.currentQuestionsOverallAmount < 2){
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

        socket.on('colourCategoryGame', function(chosenCategoryNumber_server){
            document.getElementById("category"+ chosenCategoryNumber_server + "Button").style.backgroundColor = "orange"
        });


    }

    update() {
        if (newCategory){
            var replaceCategory = setTimeout(function(){         
                socket.emit("tellCategoriesServer", chosenCategoriesList, categoryList[0],categoryList[1], categoryList[2])
                learTimeout(replaceCategory);
                newCategory = false;
            }, 1000);
    
          }

    }

    resetCategory(){
        currentRound.setText('Round ' + (Global.currentCategoryAmount+1) + "/" + CONFIG.MAX_CATEGORIES);
        chosenCategoriesList.splice(0, chosenCategoriesList.length);
        changeCategoryDecider(Global.categoryDecider);
        chooseCategoryText.setText(Global.categoryDecider + " decides on a category: ");
        console.log("Reset Category")
        document.getElementById("category1Button").style.visibility = "visible";
        document.getElementById("category2Button").style.visibility = "visible";
        document.getElementById("category3Button").style.visibility = "visible";
        if (Global.categoryDecider === Global.playerOneName && Global.isHost){
            setColour("category1Button", "blue");
            setColour("category2Button", "blue");
            setColour("category3Button", "blue");
        } 
        if (Global.categoryDecider === Global.playerOneName && !Global.isHost){
            setColour("category1Button", "grey");
            setColour("category2Button", "grey");
            setColour("category3Button", "grey");
        } 
        if (Global.categoryDecider === Global.playerTwoName && Global.isGuest){
            setColour("category1Button", "blue");
            setColour("category2Button", "blue");
            setColour("category3Button", "blue");
        } 
        if (Global.categoryDecider === Global.playerTwoName && !Global.isGuest){
            setColour("category1Button", "grey");
            setColour("category2Button", "grey");
            setColour("category3Button", "grey");
        } 
        
        playerOneScoreText.setText(Global.playerOneScore);
        playerTwoScoreText.setText(Global.playerTwoScore);

        if (Global.isHost){
            chooseCategory(categories.categories)
    
        }

    }
}

function changeCategoryDecider(decider){
    if (decider === Global.playerOneName){
        Global.categoryDecider = Global.playerTwoName;
    }
    else if (decider === Global.playerTwoName){
        Global.categoryDecider = Global.playerOneName;
    }
    console.log("Global.categoryDecider: " + Global.categoryDecider)
}

function getCompactCategoryList(categoryList){
    var returnList = [];
    for (let i = 0; i < categoryList.length; i++) {
        var pushedCategory = categoryList[i].category
        returnList.push(pushedCategory);
    }
    return returnList;
}

function setPosition(object, position){
    document.getElementById(object).style.left = position + "px"
}
function setColour(object, colour){
    document.getElementById(object).style.backgroundColor = colour
}

function chooseCategory(categories){
    categoryList = getCompactCategoryList(categories)
    console.log(categoryList);
    console.log(usedCategories);
    newCategory = true;

    categoryList = categoryList.filter( function( el ) {
        return !usedCategories.includes( el );
      } );
    console.log(categoryList);
    categoryList = shuffleArray(categoryList);
    console.log(categoryList);
    chosenCategoriesList.push(categoryList[0],categoryList[1], categoryList[2])
    socket.emit("tellCategoriesServer", chosenCategoriesList, categoryList[0],categoryList[1], categoryList[2])

}



