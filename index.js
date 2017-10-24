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
        // here, we needed to call the intent function, so Alexa is waiting for intent
        this.emit('swear');
    },
    
    'swear': function () {
        var pottyWordsIndex = Math.floor(Math.random() * SWEAR_WORDS.length);
        var randomSwearWord = SWEAR_WORDS[pottyWordsIndex];
        var speechOutput = "Swear word of the day" + randomSwearWord;
        this.response.cardRenderer(SKILL_NAME, randomSwearWord);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
        //this.emit(":tellWithCard", speechOutput, SKILL_NAME, randomSwearWord);
    },
    // 'GetPottyWords': function () {
    //     var pottyWordsIndex = Math.floor(Math.random() * SWEAR_WORDS.length);
    //     var randomSwearWord = SWEAR_WORDS[pottyWordsIndex];
        
    //     var speechOutput = "Swear word of the day" + randomSwearWord;

    //     this.emit(":tellWithCard", speechOutput, SKILL_NAME, randomSwearWord);

    // },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "Say give me a swear word, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
        //this.emit(":ask", speechOutput, reprompt);
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
        //this.emit(":tell", "Goodbye!");
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
        //this.emit(":tell", "Goodbye!");
    },
};