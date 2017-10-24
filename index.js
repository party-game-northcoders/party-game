"use strict";

var Alexa = require("alexa-sdk");

var SKILL_NAME = "say potty words";
var APP_ID = "";

var SWEAR_WORDS = [
    "Sugar",
    "Shut the front door",
    "Frig off",
    "Pee off"
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler (event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
}

var handlers = {
    'LaunchRequest' : function () {
        this.emit('GetPottyWords');
    },
    
    'GetPottyWordsIntent': function () {
        this.emit('GetPottyWords');
    },
    'GetPottyWords': function () {
        var pottyWordsIndex = Math.floor(Math.random() * SWEAR_WORDS.length);
        var randomSwearWord = SWEAR_WORDS[pottyWordsIndex];
        
        var speechOutput = "Swear word of the day" + randomSwearWord;

        this.emit(":tellWithCard", speechOutput, SKILL_NAME, randomSwearWord);

    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "Say give me a swear word, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(":ask", speechOutput, reprompt);
    },
    'AMAZON.StopIntent': function () {
        this.emit(":tell", "Goodbye!");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(":tell", "Goodbye!");
    },
};