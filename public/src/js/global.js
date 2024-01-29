var Global = {
    hostId: "",
    guestId: "",
    currentConnectedPlayers: 0,
    playerOneScore: 0,
    playerTwoScore: 0,
    playerOneName: "Team 1",
    playerTwoName: "Team 2",
    currentCategory: "Empty Category",
    isHost: false,
    isGuest: false,
    categoryDecider: "Team 1",
    usedQuestions: [],
    currentCategoryAmount: 0,
    currentQuestionsPerCategoryAmount: 0,
    currentQuestionsOverallAmount: 0,
    questionSceneLaunched: false

}


// Random whole number between min (inclusive) and max (inclusive)
export function getRandomIntInclusive(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// Take 
export function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

// Take an array, and shuffle position of elements
export function shuffleArray(returnArray){
    var j, x, i;
    console.log(returnArray)
      for (i = returnArray.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = returnArray[i];
          returnArray[i] = returnArray[j];
          returnArray[j] = x;
      }
      return returnArray;
  }

  export function filterArray(toBeFilteredArray, filteringArray){
    toBeFilteredArray = toBeFilteredArray.filter( function( el ) {
        return !filteringArray.includes( el );
      } );
    return toBeFilteredArray;
  }

export default Global
