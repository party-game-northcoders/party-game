"use strict";

var Alexa = require("alexa-sdk");

var APP_ID = undefined;

const counter = 0;

const states = {
    START: "_START",
    QUIZ: "_QUIZ"
};

const handlers = {
    "LaunchRequest": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
     },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AnswerIntent": function() {
        this.handler.state = states.START;
        this.emitWithState("AnswerIntent");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.handler.state = states.START;
        this.emitWithState("Start");
    }
}

const START_GAME_MESSAGE = "Hey party people! When you're ready to play, say start quiz";
const HELP_MESSAGE = "Please say start quiz to start the music quiz";
const GAME_END_MESSAGE = "You're shiit, goodbye";
const START_QUIZ_MESSAGE = "I will ask you to name 5 songs";

function getSarcyComment (type) {
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + sarcyCommentsCorrect[getRandom(0, sarcyCommentsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + sarcyCommentsIncorrect[getRandom(0, sarcyCommentsIncorrect.length-1)] + " </say-as><break strength='strong'/>";
}

const sarcyCommentsCorrect = ["Well done!", "Smarty pants"];
const sarcyCommentsIncorrect = ["As if!", "Seriously?"];

const startHandlers = Alexa.CreateStateHandler(states.START, {
    "Start": function() {
        this.response.speak(START_GAME_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(GAME_END_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(GAME_END_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("Start");
    }
})

const quizHandlers = Alexa.CreateStateHandler(states.QUIZ, {
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        this.emitWithState("AskQuestion");
    },
    "AskQuestion": function() {
        if (this.attributes["counter"] == 0)
        {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }

        let random = getRandomSong(0, data.length-1);
        let song = data[random];

        let propertyArray = Object.getOwnPropertyNames(song);
        let property = propertyArray[getRandomSong(1, propertyArray.length-1)];

        this.attributes["quizsong"] = song;
        this.attributes["quizproperty"] = property;
        this.attributes["counter"]++;

        let songQuestion = getSong(this.attributes["counter"], property, song);
        let songGuess = this.attributes["response"] + songQuestion;

        this.emit(":ask", songGuess, songQuestion);
    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let song = this.attributes["quizsong"];
        let property = this.attributes["quizproperty"]

        let correct = compareSlots(this.event.request.intent.slots, song[property]);

        if (correct) {
            response = getSarcyComment(true);
            this.attributes["quizscore"]++;
        }
        else{
            response = getSarcyComment(false);
        }

        response += getAnswer(property, song);

        if (this.attributes["counter"] < 5) {
            response += getCurrentScore(this.attributes["quizscore"], this.attributes["counter"]);
            this.attributes["response"] = response;
            this.emitWithState("AskQuestion");
        }
        else {
            response += getFinalScore(this.attributes["quizscore"], this.attributes["counter"]);
            speechOutput = response + " " + GAME_END_MESSAGE;

            this.response.speak(speechOutput);
            this.emit(":responseReady");
        }
    },
    "AMAZON.RepeatIntent": function() {
        let song = getSong(this.attributes["counter"], this.attributes["quizproperty"], this.attributes["quizsong"]);
        this.response.speak(song).listen(song);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Quiz");
    },
    "AMAZON.StopIntent": function() {
        this.response.speak(GAME_END_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function() {
        this.response.speak(GAME_END_MESSAGE);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function() {
        this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
}) 

// gets object in data array
function getSong(slots) {
    // get keys from data
    let propertyArray = Object.getOwnPropertyNames(data[0]);
    let value;
    for (let slot in slots)
    {
        if (slots[slot].value !== undefined)
        {
            value = slots[slot].value;
            for (let property in propertyArray)
            {
                let song = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
                if (song.length > 0)
                {
                    return song[0];
                }
            }
        }
    }
    return value;
}

// function defining song that alexa uses for question
function getSong(counter, item) {
    return "Here is song number " + counter + "Name the song! The song is coming in 5   4   3   2   1  " + item.lyrics;    
}

// returns the answer after allocated time.
function getAnswer(item) {
return "The song was " + item.song + "by " + item.artist;
}

function getRandomSong (startNum, endNum) {
    return Math.floor(Math.random() * (endNum - startNum + 1) + startNum);
}

function compareSlots(slots, value) {
    for (let slot in slots) {
        if (slots[slot].value !== undefined) {
            if(slots[slot].value.toString().toLowerCase() === value.toString().toLowerCase()) {
                return true;
            }
        }
    }
    return false;
}

function getCurrentScore (score, counter) {
    return "Good lord, your current score is " + score " out of " + counter + ". ";
}

function getFinalScore (score, counter) {
    return "Bloody hell, you scored " + score " out of " + counter + ". ";
}

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};

const data = [
    {
        artist: "Beyoncé", 
        song: "Halo",
        lyrics: "Remember those walls I built?.  Well, baby they're tumbling down.  And they didn't even put up a fight.  They didn't even make a sound"
    }, 
    {
        artist: "David Bowie",
        song: "Starman",
        lyrics: "There's a starman waiting in the sky.  He'd like to come and meet us.  But he thinks he'd blow our minds"    
    },
    {
        artist: "Taylor Swift",
        song: "Shake It Off",
        lyrics: "I stay out too late.  Got nothing in my brain.  That's what people say, mm-mm.  That's what people say, mm-mm"
    },
    {
        artist: "Take That",
        song: "Rule the World",
        lyrics: "You light the skies, up above me.  A star, so bright, you blind me"
    },
    {
        artist: "LMFAO",
        song: "Rock the World",
        lyrics: "Party rock is in the house tonight.  Everybody just have a good time.  And we gon' make you loose your mind (wooo!)"
    },
    {
        artist: "The Beatles",
        song: "Hey Jude",
        lyrics: "Hey Jude, don't make it bad.  Take a sad song and make it better"
    },
    {
        artist: "Diana Ross and Lionel Ritchie", 
        song: "Endless Love",
        lyrics: "My love.  There's only you in my life.  The only thing that's bright.  My first love"
    },
    {
        artist: "Bryan Adams",
        song: "(Everything I Do) I Do It For You",
        lyrics: "Look into my eyes .   you will see.  What you mean to me..  Search your heart, search your soul.  And when you find me there you'll search no more."
    },
    {
        artist: "Adele",
        song: "Rolling In The Deep",
        lyrics: "There's a fire starting in my heart.  Reaching a fever pitch and it's bring me out the dark"
    },
    {
        artist: "Frank Sinatra",
        song: "New York, New York",
        lyrics: "Start spreading the news.  I am leaving today"
    }
];
