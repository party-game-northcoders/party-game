"use strict";

const bodyParser = require("body-parser");
const axios = require('axios');

var Alexa = require("alexa-sdk");

var APP_ID = undefined;

const counter = 0;

const states = {
    START: "_START",
    QUIZ: "_QUIZ"
}

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

const START_GAME_MESSAGE = "Hey party people! When you're ready to play, say start quiz. ";
const HELP_MESSAGE = "Please say start quiz to begin the music quiz. ";
const GAME_END_MESSAGE = "Goodbye";
const START_QUIZ_MESSAGE = "I will ask you to name 5 songs. ";

function getSarcyComment (type) {
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + sarcyCommentsCorrect[getRandomSong(0, sarcyCommentsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + sarcyCommentsIncorrect[getRandomSong(0, sarcyCommentsIncorrect.length-1)] + " </say-as><break strength='strong'/>";
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

const quizHandlers = Alexa.CreateStateHandler(states.QUIZ,{
    "Quiz": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        // call spotify function to populate artist and songs array
        // next will go in .then
        fetchArtistNames()
        .then((data) => {
            this.attributes["songChoice"] = data;
            this.emitWithState("AskQuestion");  
        }) 
    },

    "AskQuestion": function() {
        if (this.attributes["counter"] == 0) {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }
        
        // gets random object(from data)
        // let random = getRandomSong(0, data.length-1);
        // let song = data[random];
        let songObj = songRandomiser(this.attributes["songChoice"]);
        //fetch lyrics from musixmatch with title and singer from spotify
        fetchsongAPI(songObj.title, songObj.singer)
            .then((data) => {
        
            let property = "singer";
    
           this.attributes["quizsong"] = data;
           this.attributes["quizproperty"] = property;
           this.attributes["counter"]++;
    
           // property is the key from data
           let songQuestion = getSong(this.attributes["counter"], property, data.title, data.lyrics);
           let songGuess = this.attributes["response"] + songQuestion;
    
           this.emit(":ask", songGuess, songQuestion);

        });

    },
    "AnswerIntent": function() {
        let response = "";
        let speechOutput = "";
        let data = this.attributes["quizsong"];
        let property = this.attributes["quizproperty"]
    

        let correct = compareSlots(this.event.request.intent.slots, data[property]);
        
        if (correct) {
            response = getSarcyComment(true);
            this.attributes["quizscore"]++;
        }
        else{
            response = getSarcyComment(false);
        }

        response += getAnswer(property, data);

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
// function fetchSong(slots,data) {
//     // get keys from data
//     let propertyArray = Object.getOwnPropertyNames(data[0]);
//     let value;
//     for (let slot in slots)
//     {
//         if (slots[slot].value !== undefined)
//         {
//             value = slots[slot].value;
//             for (let property in propertyArray)
//             {
//                 let song = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
//                 if (song.length > 0)
//                 {
//                     return song[0];
//                 }
//             }
//         }
//     }
//     return value;
// }

// function defining song that alexa uses for question
function getSong(counter, property, song, lyrics) {
    return "Here is song number " + counter + ". Name the artist. The song is coming in 5. 4. 3. 2. 1. " + lyrics;    
}

// returns the answer after allocated time.
function getAnswer(property, song) {
return "The song was " + song.title + "bye " + song[property];
}

function getRandomSong (startNum, endNum) {
    return Math.floor(Math.random() * (endNum - startNum + 1) + startNum);
}

function compareSlots(slots, value) {
    for (let slot in slots) {
        if (slots[slot].value !== undefined) {
            if (slots[slot].value.toString().toLowerCase() === value.toString().toLowerCase()) {
                return true;
            }
        }
    }
    return false;
}

function getCurrentScore (score, counter) {
    return "Good lord, your current score is " + score + " out of " + counter + ". ";
 //return "Your current score is " + score + " out of " + counter + ". "; }
}

function getFinalScore (score, counter) {
    return "Bloody hell, you scored " + score + " out of " + counter + ". ";
}

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context,callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers, startHandlers, quizHandlers);
    alexa.execute();
};

// randomly gets artist and song for fetch request
function songRandomiser(arr) {
    let random = Math.floor(Math.random() * arr.length);
    let songObj = {
        title: arr[random].title,
        singer: arr[random].singer
    }
    return songObj;
    
}

function fetchsongAPI(title, singer) {
    return axios.get(`https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${title}&q_artist=${singer}&apikey=c6af8e74da168c2f810eab97f6a8f603`)
    .then(response => {
        let lyrics = response.data.message.body.lyrics.lyrics_body;
        //take first 3 new lines 
        let lyricsArray = lyrics.split("\n");
        let lyricsOutput = lyricsArray.slice(0, 3).join(". ")+".";
        let data = {
            title: title,
            singer: singer,
            lyrics: lyricsOutput
        };
        return data;
    })
}
// This fetches artist names from spotify to use for fetchsongAPI (musix match) function
function fetchArtistNames() {
    let songArr =[];

    const spotifyHeaders = {
        headers: {
            Accept: 'application/json',
            Authorization:"Bearer BQBtRPZbUqSOFv4lRHRfX-nfyEei6ef_yBd9MF5B1qoHyVdz8n9vM3Zu7lS5teiy_Bzv07ikM5ke_SZkZwp_TL0sVnz97CU5n7yfZHjqYUB0NuHruY9tXTf3cWnc5xqBjQmhT3FDoDHGCgZxfODD1TSN2rQ2FPJAQ7s6RAPYJlpSKOWFDtg0hW8I_aoh_x0sUIrPH82_lLBfwWdmc-TJFtX9PtqV2R0OiF50AjqYwfUcoxny6ZxkfiWY1KgCnL3j376savACyWL8BCjsBAtlCpbggb1_mqA6_S8_s-Qrqmd4Z0uPSq9Em4k8x_WiRFcXvK-O5g"
        }  
    };
    return axios.get("https://api.spotify.com/v1/me/top/artists", spotifyHeaders) 
    .then((response)=>{
        response.data.items.map(function (artist) {
        songArr.push({
                singer: artist.name, 
                id: artist.id, 
                popularity:artist.popularity
            })
        })
        return songArr;
    })
    // This fetches artist song from spotify to use for fetchsongAPI (musix match) function
    .then(artists => {
        artists.sort((a, b) => b.popularity - a.popularity);
        const artistRequests = artists.map(artist => {
          return axios.get(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?country=GB`,
            spotifyHeaders
          );
        });
        return Promise.all(artistRequests);
      })
      .then(resolvedArtists => {
        const data = resolvedArtists.reduce((acc, artistArr) => {
          const artistTracks = artistArr.data.tracks.map(track => {
            return {
              title: track.name,
              id: track.id,
              popularity: track.popularity,
              singer: track.artists[0].name
            };
          });
          acc = acc.concat(artistTracks);
          return acc;
        }, []);
        return data;
      })
      .catch(err => {
        throw err;
      });


    };