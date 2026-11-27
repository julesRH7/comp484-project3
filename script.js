const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElem = document.querySelector("#origin-text p");
//deleted .html from above line and renamed so same named originText below can be altered
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const errorDisplay = document.querySelector("#errors");
const wpmDisplay = document.querySelector("#wpm");
const leaders = document.querySelector("#leaders");
let savedScores = JSON.parse(localStorage.getItem("typingScores")) || [];
//empty array if no scores have been recorded yet. Otherwise array of saved scores in localStorage

let paragraphs = ["The quick brown fox jumps over the lazy dog.", "My girl wove six dozen plaid jackets before she quit.", "Pack my box with five-dozen liquor jugs.", "How quickly daft jumping zebras vex!", "Zelda quickly wove eight nubby flax jumpers."];
//the 5 random paragraphs to choose from. All pangrams

let errors=0;
//for error counter

let testCompleted = false;

// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time){
    return time <=9 ?"0" + time :time;
    //add the STRING 0 if time is 9 or lower to start of number
}

// Run a standard minute/second/hundredths timer:
let timer = [0,0,0,0];
//hours (a reset point), mins, sec, millisecs
let interval;
let timerRunning = false;
//variable to prevent multiple timers from running at same time

function runTimer(){
    timer[3]++;
    if(timer[3]>= 100){
        timer[3]=0;
        timer[2]++;
    }
    //if milliseconds passes 100, reset to 0 and add a second instead
    if(timer[2]>= 60){
        timer[2]=0;
        timer[1]++;
    }
    //if seconds passes 60, reset to 0 and add a minute instead
    if(timer[1]>= 60){
        timer[1]=0;
        timer[0]++;
    }
    //if minutes passes 60, reset to 0 and add an hour instead
    theTimer.innerHTML = leadingZero(timer[1]) + ":" + leadingZero(timer[2]) + ":" + leadingZero(timer[3]);
    //concatonate 3 time units. Reset at 1 hour based on requested time formatting
}
// Start the timer:
function startTimer(){
    if(!timerRunning){
        timerRunning = true;
        interval = setInterval(runTimer,10)
    }
    //prevent timer from starting every keypress. A timer must not be running for a timer to start
}

function calcWpm(){
    let totalCharacters = testArea.value.length;
    let totalSeconds = timer[1]*60+timer[2]+timer[3]/100;
    //total seconds has to convert minutes and milliseconds into seconds
    if(totalSeconds>0){
        let wpm = (totalCharacters/5)/(totalSeconds/60);
        wpmDisplay.textContent = Math.floor(wpm);
    }
    else{
        wpmDisplay.textContent=0;
    }
    //if timer has started, start calculating seconds by given formula and displaying them. Avoid 0 division if seconds is 0
}

function displayScores(){
    leaders.innerHTML = "";
    if(savedScores.length==0){
        let listItem = document.createElement("li");
        listItem.textContent = "No scores yet!";
        leaders.appendChild(listItem);
    }
    else{
      savedScores.forEach(function(score,index){
            let listItem = document.createElement("li");
            listItem.textContent = score + " WPM";
            if(index == 0){
                listItem.style.color = "#D3AF37";
                listItem.style.fontWeight = "bold";
                listItem.style.animation = "goldPulse 2s ease-in-out infinite"
                //add glow effect to first place that pulsates based on defined CSS goldPulse
            }
            else if(index == 1){
                listItem.style.color = "silver";
                listItem.style.textShadow = "0 0 1px silver";
                //add tiny glow effect to second place
            }
            else if(index == 2){
                listItem.style.color = "#CD7F32";
            }    
            //pick appropriate placement color based on index
            leaders.appendChild(listItem);
        });  
    }
    //unless array is empty, go through every saved score, make a list item for it, and add it to the leaderboard
}

// Match the text entered with the provided text on the page:
function spellCheck(){
    let typedText = testArea.value;
    //typed text
    let originText = originTextElem.innerHTML;
    //currrent paragraph
    let originTextMatch = originText.substring(0, typedText.length);
    if(typedText==originTextMatch){
        testWrapper.style.borderColor = "blue";
    }
    else{
        testWrapper.style.borderColor = "red";
    }
    //compare text and show appropriate border, but only for length of the text typed so far (substring in originTextMatch)
    if(typedText==originText && !testCompleted){
        testWrapper.style.borderColor = "green";
        clearInterval(interval);
        testCompleted = true;
        saveScore();
    }
    //if all typed text matches original paragraph, change border to finished green, stop timer, set flag so multiple scores can't be saved by one test, and save the score
}
function countErrors(event){
    const cursorPos = testArea.selectionStart;
    const expectedCharacter = originTextElem.textContent[cursorPos];
    //current position of where in the paragraph user should be typing
    if(event.key.length==1 && !event.ctrlKey && !event.metaKey && !event.altKey){
        if(event.key != expectedCharacter){
            errors++;
            errorDisplay.textContent = errors;
        }
    }
    //if user typed an incorrect key (read by event.key), add to errors. Don't count modifier keys as errors
}


// Reset everything:
function reset(){
    clearInterval(interval);
    //stop execution of runTimer
    timer = [0,0,0,0];
    timerRunning = false;
    //reset timer variables
    testArea.value = "";
    theTimer.innerHTML = "00:00:00";
    testWrapper.style.borderColor = "grey";
    errors=0;
    errorDisplay.textContent = errors;
    wpmDisplay.textContent = 0;
    testCompleted = false;
    //reset page to default, excluding paragraph (which will change unless randomly rolls same paragraph)


    let randPara = Math.floor(Math.random()*paragraphs.length);
    originTextElem.innerHTML = paragraphs[randPara];
    //randomly generate a new index for a paragraph, map it to one in paragraphs[], then replace paragraph in HTML with it
}

    displayScores();
    function saveScore(){
        let finalScore = Math.floor((testArea.value.length / 5) /((timer[1] * 60 + timer[2] + timer[3] / 100) / 60)
        );
        //calculate final score
        savedScores.push(finalScore);
        savedScores.sort(function(a,b){
            return b-a;
        });
        //add that score to the leaders list then sort it
        savedScores = savedScores.slice(0,3);
        //only keep the best 3 scores
        localStorage.setItem("typingScores", JSON.stringify(savedScores));
        //save the new array
        displayScores();
    }

// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", startTimer);
//key is pressed = start timer
testArea.addEventListener("keyup", spellCheck);
//user is done adding a character = spellCheck
testArea.addEventListener("keydown", countErrors);
//key is pressed down = count if an error
resetButton.addEventListener("click", reset);
//clicking reset = reset to default page
testArea.addEventListener("keyup", calcWpm);
//key is released = wpm is re-calculated