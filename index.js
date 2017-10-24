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


// function defining question that alexa asks
function getSong(counter, item) {
        return "Here is song number " + counter + "Name the song! The song is coming in 5   4   3   2   1  " + item.lyrics;    
}

// returns the answer after allocated time.
function getAnswer(item) {
    return "The song was " + item.song + "by " + item.artist;
}



