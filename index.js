"use strict";
const axios = require('axios');
const songAudio = require('./songlist');
var Alexa = require("alexa-sdk");

var APP_ID = undefined;

const counter = 0;

const states = {
    START: "_START",
    QUIZ: "_QUIZ",
    MUSIC: "_MUSIC",
    SPOTIFY: "_SPOTIFY"
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
    "MusicIntent": function () {
        this.handler.state = states.MUSIC;
        this.emitWithState("Music");
    },
    "SpotifyIntent": function () {
        this.handler.state = states.SPOTIFY;
        this.emitWithState("Spotify");
    },
    "ReadyToPlayIntent" : function () {
        this.handler.state = states.SPOTIFY;
        this.emitWithState("AnswerMusisIntent")
    },
    "AnswerMusicIntent": function() {
        this.handler.state = states.SPOTIFY;
        this.emitWithState("AnswerMusicIntent");
    },
    "AnswerIntent": function() {
        this.handler.state = states.QUIZ;
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

const START_GAME_MESSAGE = "Hey party people! When you're ready to play, say. start lyrics quiz. or. start music quiz . or. start party playlist. ";
const HELP_MESSAGE = "Please say . start lyrics quiz. or start music quiz. to begin the music quiz. or say start party playlist";
const GAME_END_MESSAGE = "You're shit. Goodbye";
const START_QUIZ_MESSAGE = "I will play 5 songs, and after each song I will ask you to name the artist. ";
const PLAY_MUSIC_MESSAGE = "The song will play in 5. 4. 3. 2. 1. "
const PAUSE_MESSAGE = "Please say continue to resume song. ";


function getSarcyComment (type) {
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + sarcyCommentsCorrect[getRandomSong(0, sarcyCommentsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + sarcyCommentsIncorrect[getRandomSong(0, sarcyCommentsIncorrect.length-1)] + " </say-as><break strength='strong'/>";
}

const sarcyCommentsCorrect = ["Well done!. ", "Smarty pants. "];
const sarcyCommentsIncorrect = ["As if!. ", "Seriously?. "];


const startHandlers = Alexa.CreateStateHandler(states.START, {
    "Start": function() {
        this.response.speak(START_GAME_MESSAGE).listen(HELP_MESSAGE);
        this.emit(":responseReady");
    },
    "QuizIntent": function() {
        this.handler.state = states.QUIZ;
        this.emitWithState("Quiz");
    },
    "MusicIntent": function () {
        this.handler.state = states.MUSIC;
        this.emitWithState("Music");
    },
    "SpotifyIntent": function () {
        this.handler.state = states.SPOTIFY;
        this.emitWithState("Spotify");
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
const spotifyHandlers = Alexa.CreateStateHandler(states.SPOTIFY,{
    "Spotify": function() {
        this.attributes["response"] = "";
        this.attributes["counter"] = 0;
        this.attributes["quizscore"] = 0;
        // call spotify function to populate artist and songs array
        // next will go in .then
        fetchArtistNames()
        .then((data) => {
            this.attributes["songChoice"] = data;
            this.emitWithState("AskSpotifyQuestion");
        }) 
    },
    "AskSpotifyQuestion": function () {
        if (this.attributes["counter"] == 0) {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        }
        // this.attributes["quizsong"] = songObj;
        // this.attributes["quizproperty"] = property;

        let prevScore = this.attributes["response"] + "Are you ready to play?";

        this.emit(":ask", prevScore)
    },
    
    "ReadyToPlayIntent" : function () {
        let songObj = songRandomiser(this.attributes["songChoice"]);
        let property = "singer";
    
           this.attributes["quizsong"] = songObj;
           this.attributes["quizproperty"] = property;
           this.attributes["counter"]++;
            
        //    let songQuestion = getQuestion(songObj).then(()=> {
        // },20000);
        PlaySpotifySong (songObj)
            .then (() => {
                let question = getQuestion() 
                this.emit(":ask", question, question)
            })
        
        // getQuestion(songObj).then((songQuestion)=> {
        //     console.log(songQuestion)
        //     let songGuess = this.attributes["response"] + songQuestion ;
        //     console.log(songGuess)
        //     this.emit(":ask", songGuess, songGuess)
        //  });
        //    let songGuess = this.attributes["response"] + songQuestion;
        //     // asks the question after song is played.
        //    this.emit(":ask", songGuess, songQuestion)
    
        
    },

    "AnswerMusicIntent": function() {
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
            this.emitWithState("AskSpotifyQuestion");
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
    "AMAZON.PauseIntent": function() {
        this.response.speak(PAUSE_MESSAGE).listen(PAUSE_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerMusicIntent");
    }

})
const musicHandlers = Alexa.CreateStateHandler(states.MUSIC,{
    "Music": function() {
       
        
        this.emit(":responseReady");  

    },
    "AMAZON.RepeatIntent": function() {
        let song = getSong(this.attributes["counter"], this.attributes["quizproperty"], this.attributes["quizsong"]);
        this.response.speak(song).listen(song);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function() {
        this.emitWithState("Music");
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
    "AMAZON.PauseIntent": function() {
        this.response.speak(PAUSE_MESSAGE).listen(PAUSE_MESSAGE);
        this.emit(":responseReady");
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
        
        let songObj = songRandomiser(this.attributes["songChoice"]);
        //fetch lyrics from musixmatch with title and singer from spotify
        fetchsongAPI(songObj.title, songObj.singer)
            .then((data) => {
        
            let property = "singer";
    
           this.attributes["quizsong"] = data;
           this.attributes["quizproperty"] = property;
           this.attributes["counter"]++;
    
           // property is the key from data
           let songQuestion = getSong(this.attributes["counter"], data.lyrics);
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
    "AMAZON.PauseIntent": function() {
        this.response.speak(PAUSE_MESSAGE).listen(PAUSE_MESSAGE);
        this.emit(":responseReady");
    },
    "Unhandled": function() {
        this.emitWithState("AnswerIntent");
    }
}) 


// function defining song that alexa uses for question
function getSong(counter, lyrics) {
    return "Here is song number " + counter + ". Name the artist. The song is coming in 5. 4. 3. 2. 1. " + lyrics;    
}

function getQuestion() {
        return "Name the artist."
}

// returns the answer after allocated time.
function getAnswer(property, song) {
return " The song was " + song.title + " bye " + song[property] + ". ";
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
    return "Your current score is " + score + " out of " + counter + ". ";
}

function getFinalScore (score, counter) {
    return "You scored " + score + " out of " + counter + ". ";
}

// randomly gets artist and song for fetch request
function songRandomiser(arr) {
    let random = Math.floor(Math.random() * arr.length);
    let songObj = {
        title: arr[random].title,
        singer: arr[random].singer,
        id: arr[random].id
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
            Authorization:"Bearer BQAzcrVCHLaMh_0vgGsOCCRTW_3REAB9LqjmMyh0fDdzxu-eSEtaSDG75lk_zPGrJ0wdFzzvIMFRZh_jO2Av9-XLiknITamgtEmWgoWmEmGHv0WJZmvoCJ2yCLLEPqyj0Cnbr18umil2PDmPva0cE6jh-kMXBVOW-4axX05Sai1gNkhwejCkdgm1oOAxJVGgLzY06FBI1_NmD6zE-5paVMhiLZWh2xS7YKV4waGVNxUk2Ns6yjqwMgc6EEr5h4BzDMNIMTzUymUskyHvmM9b39VCoBR8aoW6onixGgPXrBrxWTKPVMBRnOGrMJLBd4Elzq2HkQ"
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
        return data
    })
    .catch(err => {
            throw err;
          });
}

    function PlaySpotifySong(song) {
        const spotConfig = {
            headers: {
              Authorization:
                "Bearer BQAzcrVCHLaMh_0vgGsOCCRTW_3REAB9LqjmMyh0fDdzxu-eSEtaSDG75lk_zPGrJ0wdFzzvIMFRZh_jO2Av9-XLiknITamgtEmWgoWmEmGHv0WJZmvoCJ2yCLLEPqyj0Cnbr18umil2PDmPva0cE6jh-kMXBVOW-4axX05Sai1gNkhwejCkdgm1oOAxJVGgLzY06FBI1_NmD6zE-5paVMhiLZWh2xS7YKV4waGVNxUk2Ns6yjqwMgc6EEr5h4BzDMNIMTzUymUskyHvmM9b39VCoBR8aoW6onixGgPXrBrxWTKPVMBRnOGrMJLBd4Elzq2HkQ"
            }
          }

          return new Promise((resolve, reject) => {
                axios
                    .put(
                      "https://api.spotify.com/v1/me/player/play",
                      { uris: ["spotify:track:" + song.id] },
                      spotConfig
                    )
                    .then((response) => {
                      return axios
                        .put(
                          "https://api.spotify.com/v1/me/player/seek?position_ms=30000", 
                          {}, spotConfig
                        )
                        .then((response) => {
                          setTimeout(function () {
                            return axios
                            .put("https://api.spotify.com/v1/me/player/pause", {}, spotConfig)
                            .then(response => {
                                resolve();
                            })
                          }, 12000);
                        })
                    })
                    .catch(err => {
                      console.log(err.message);
                    });
          })

    }

    exports.handler = (event, context, callback) => {
        const alexa = Alexa.handler(event, context,callback);
        alexa.appId = APP_ID;
        alexa.registerHandlers(handlers, startHandlers, quizHandlers, musicHandlers, spotifyHandlers);
        alexa.execute();
    }

