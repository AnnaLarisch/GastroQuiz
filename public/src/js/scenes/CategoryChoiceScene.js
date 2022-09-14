import CONFIG from '../config.js'
import Global, { getRandomIntInclusive } from "../global.js";
import MyDOMElement from '../objects/MyDOMElement.js'
import SocketIOScene from './SocketIOScene.js'
import { getSocket } from './SocketIOScene.js'
import { shuffleArray } from "../global.js";


import categories from "../../../assets/content/categories.js"


var self;
var category1Button;
var category2Button;
var category3Button;

var profileIconPlayer1;
var profileIconPlayer2;

var playerOneScoreText;
var playerTwoScoreText;
var playerOneNameText;
var playerTwoNameText;
var chooseCategoryText;

var categoryList;
var categoryNameList = [];
var chosenCategoriesList = [];
var chosenCategory = "Empty"

var progressBarCategory;


export default class CategoryChoiceScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CategoryChoiceScene' });
    }
  
    preload() {
        this.load.html('categoryChoiceSceneHTML', 'src/html/CategoryChoiceScene.html');
        this.load.image('profile_icon', 'assets/scenes/CategoryChoiceScene/placeholder_profile_icon.png')

    }
    
    create() {
        self = this;
        const socket = getSocket();

        categoryList = categories.categories;

        for (let i = 0; i < categoryList.length; i++) {
            var pushedCategory = categoryList[i].category
            categoryNameList.push(pushedCategory);
        }

        categoryNameList = shuffleArray(categoryNameList);
        chosenCategoriesList.push(categoryNameList[0],categoryNameList[1], categoryNameList[2]);

        progressBarMovement(330, 10);

        var element = self.add.dom(0, 0).setOrigin(0, 0).createFromCache('categoryChoiceSceneHTML');

        progressBarCategory = new MyDOMElement(self, 34, 760, element.getChildByID("progressBarCategory")); 
        progressBarCategory.setOrigin(0, 0);


        category1Button = new MyDOMElement(self, 50, 400, element.getChildByID("category1Button"), null, "Category"); 
        category2Button = new MyDOMElement(self, 220, 400, element.getChildByID("category2Button"), null, "Category"); 
        category3Button = new MyDOMElement(self, 135, 550, element.getChildByID("category3Button"), null, "Category");

        category1Button.setOrigin(0,0).setInteractive();
        category2Button.setOrigin(0,0).setInteractive();
        category3Button.setOrigin(0,0).setInteractive();

        profileIconPlayer1 = self.physics.add.sprite(30, 40, 'profile_icon').setOrigin(0,0);
        profileIconPlayer2 = self.physics.add.sprite(280, 40, 'profile_icon').setOrigin(0,0);
        playerOneScoreText = self.add.text(58, 170, Global.playerOneScore, { fontSize: 60 } );
        playerTwoScoreText = self.add.text(312, 170, Global.playerTwoScore, { fontSize: 60 } );
        playerOneNameText = self.add.text(35, 140, Global.playerOneName, { fontSize: 20 } );
        playerTwoNameText = self.add.text(285, 140, Global.playerTwoName, { fontSize: 20 } );
        chooseCategoryText = self.add.text(20, 350, Global.categoryDecider + " decides on a category: ", { fontSize: 30 } );

        if ((Global.categoryDecider === Global.playerOneName && Global.isHost) 
        || (Global.categoryDecider === Global.playerTwoName && Global.isGuest)){
            category1Button.on('pointerup', function (pointer){
                console.log("Category 1!")
                chosenCategory = categoryNameList[0]
                setAndClearButtonColor(1);
            });
            category2Button.on('pointerup', function (pointer){
                console.log("Category 2!")
                chosenCategory= categoryNameList[1]
                setAndClearButtonColor(2);
            });
            category3Button.on('pointerup', function (pointer){
                console.log("Category 3!")
                chosenCategory = categoryNameList[2]
                setAndClearButtonColor(3);

            });
        }
        

        if (Global.isHost){
            socket.emit("tellCategoriesServer", chosenCategoriesList)
        }


        socket.on('tellCategoriesGame', function(categoriesList){
            category1Button.setInnerText(categoriesList[0]);
            category2Button.setInnerText(categoriesList[1]);
            category3Button.setInnerText(categoriesList[2]);
          });

        socket.on('launchQuestionSceneGame', function(){
            changeCategoryDecider(Global.categoryDecider)
            if (Global.isHost){
                if (chosenCategory === "Empty"){
                    chosenCategory = categoryNameList[getRandomIntInclusive(0, 2)]
                }
                Global.currentCategory = chosenCategory;

            }
            category1Button.destroy();
            category2Button.destroy();
            category3Button.destroy();
            self.scene.setVisible(false);
            self.scene.launch("QuestionScene");

        });
    

    }

    update() {
    }
}

function progressBarMovement(progressBarWidth, Interval){
    var counterBack = setInterval(function(){
      progressBarWidth = progressBarWidth - Interval;
      if(progressBarWidth >= 0){
        document.getElementById("progressBarCategory").style.width = progressBarWidth.toString() +"px"
      } else {
        clearTimeout(counterBack);
        if (Global.isHost){
            const socket = getSocket();
            socket.emit("launchQuestionSceneServer");
        }
      }
      if (progressBarWidth == 160){
        document.getElementById("progressBarCategory").style.backgroundColor = "orange";
      }
      if (progressBarWidth == 50){
        document.getElementById("progressBarCategory").style.backgroundColor = "red";
      }
      }, 1000);
  };

 function setAndClearButtonColor(buttonId){
    document.getElementById("category1Button").style.backgroundColor = "blue";
    document.getElementById("category2Button").style.backgroundColor = "blue";
    document.getElementById("category3Button").style.backgroundColor = "blue";

    document.getElementById("category"+ buttonId + "Button").style.backgroundColor = "gray"

 };


  function changeCategoryDecider(decider){
    if (decider === Global.playerOneName){
        Global.categoryDecider = Global.playerTwoName;
    }
    else if (decider === Global.playerTwoName){
        Global.categoryDecider = Global.playerOneName;
    }
  }