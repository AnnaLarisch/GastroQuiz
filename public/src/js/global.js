var Global = {
    currentConnectedPlayers: 0,
    playerOneScore: 0,
    playerTwoScore: 0,
    playerOneName: "Player 1",
    playerTwoName: "Player 2",
    currentCategory: "Empty Category",
    isHost: false,
    isGuest: false,
    categoryDecider: "Player 1",
    usedQuestions: []
}


// Random whole number between min (inclusive) and max (inclusive)
export function getRandomIntInclusive(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
export function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

export function shuffleArray(returnArray){
    var j, x, i;
      for (i = returnArray.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = returnArray[i];
          returnArray[i] = returnArray[j];
          returnArray[j] = x;
      }
      return returnArray;
  }

export default Global
