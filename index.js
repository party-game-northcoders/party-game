"use strict";
const axios = require('axios');
const songAudio = require('./songlist');
const Alexa = require("alexa-sdk");
const _ = require('underscore');

var APP_ID = undefined;

const counter = 0;
const token = "Bearer BQBeBMLMvVmoJ21o-BMNYvZ16LFzQBsJdccWd28uUBMXS_4i2MZohQ1FuDK6LlEc_lQ22yutfZosczWpzck2FKVLWPp99CKsY7QJPzBg-W77qm3Fv_w1DDKTr1ePhAmJuiFo-3Y6PxwgrcD1hydDzHskGxzslSTlTdY6IkM06zVJCD_K4X_LGoVyoiGGw5lSEhndoAgEKb1KD0VR143hfEJQD84iaMIGJcZ8hSnBIoYmIEHNQHgRtjXzOlHizXQlNvLo4U8eiEOHXLEMoeFp7zcYh8u-q3zMqAqbJw05dCz-4SxmsBmReS8Cl8440TeuJomj7Q";

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

//const START_GAME_MESSAGE = "Hey party people! When you're ready to play, say. start lyrics quiz. or. start music quiz . or. start party playlist. ";
const START_GAME_MESSAGE = "Hey party people! When you're ready to play, say. start lyrics quiz. or. start music quiz. ";
const HELP_MESSAGE = "Please say . start lyrics quiz. or start music quiz. to begin the music quiz. ";
const GAME_LOSE_MESSAGE = " You are really shit at this game. Don't bother playing again! Goodbye ";
const GAME_WIN_MESSAGE = "Oh my god! You are actually not as bad at this game as I thought. Laters ";
const START_QUIZ_MESSAGE = "I will play 5 songs, and after each song I will ask you to name the artist. ";
const PLAY_MUSIC_MESSAGE = "The song will play in 3. 2. 1. ";
const REPROMPT = "Come on! Are you ready to play?";


function getSarcyComment (type) {
    let speechCon = "";
    if (type) return "<say-as interpret-as='interjection'>" + sarcyCommentsCorrect[getRandomSong(0, sarcyCommentsCorrect.length-1)] + "! </say-as><break strength='strong'/>";
    else return "<say-as interpret-as='interjection'>" + sarcyCommentsIncorrect[getRandomSong(0, sarcyCommentsIncorrect.length-1)] + " </say-as><break strength='strong'/>";
}

const sarcyCommentsCorrect = ["Well done!. ", "Smarty pants. ", "Check you out. ", "Correctamundo. ", "You are a wise and noble human being. ", "Wrong! . Just kidding . You're right. "];
const sarcyCommentsIncorrect = ["As if!. ", "Seriously?. ", "Now you are not even trying. ", "You might as well give up now", "I don't know why I bother! "];


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
        
        fetchArtistNames()
        .then((data) => {
            
            this.attributes["songChoice"] = data;
            this.emitWithState("AskSpotifyQuestion");
        }) 
    },
    "AskSpotifyQuestion": function () {
        if (this.attributes["counter"] == 0) {
            this.attributes["response"] = START_QUIZ_MESSAGE + " ";
        };

        let prevScore = this.attributes["response"] + "Are you ready to play? ";
        this.emit(":ask", prevScore, REPROMPT);
    },
    
    "ReadyToPlayIntent" : function () {
        let fetchedSongObj = songRandomiser(this.attributes["songChoice"]);
        let classicsongObj = songRandomiser(classicSongArr);
        // remove selected songs from classic array
        let index = _.indexOf(classicSongArr, classicsongObj);
        let firstPart = classicSongArr.slice(0, index);
        let secondPart = classicSongArr.slice(index + 1);
        classicSongArr = firstPart.concat(secondPart);

        let songObj = pickRandomSong(fetchedSongObj, classicsongObj);
        let property = "singer";
    
           this.attributes["quizsong"] = songObj;
           this.attributes["quizproperty"] = property;
           this.attributes["counter"]++; 

        PlaySpotifySong(songObj)
            .then (() => {
                let question = getQuestion() 
                this.emit(":ask", question, REPROMPT)
            });        
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
            if (this.attributes["quizscore"] <= 3) {
                speechOutput = response + " " + GAME_LOSE_MESSAGE;
            }
            else {
                speechOutput = response + " " + GAME_WIN_MESSAGE;
            }
            

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
        this.emitWithState('AnswerMusicIntent');
    }

})
const musicHandlers = Alexa.CreateStateHandler(states.MUSIC,{
    "Music": function() {
        this.emit(":responseReady")  
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
        
        //let fetchedSongObj = songRandomiser(this.attributes["songChoice"]);
        let classicsongObj = songRandomiser(classicSongArr);
        
        // remove selected songs from classic array
        let index = _.indexOf(classicSongArr, classicsongObj);
        let firstPart = classicSongArr.slice(0, index);
        let secondPart = classicSongArr.slice(index + 1);
        classicSongArr = firstPart.concat(secondPart);
        let songObj  = classicSongObj;
        //let songObj = pickRandomSong(fetchedSongObj, classicsongObj);
        let property = "singer";
 
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
            
            if (this.attributes["quizscore"] <= 3) {
                speechOutput = response + " " + GAME_LOSE_MESSAGE;
            }
            else {
                speechOutput = response + " " + GAME_WIN_MESSAGE;
            }

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

function getSong(counter, lyrics) {
    return "Here is song number " + counter + ". The song is coming in 3. 2. 1. " + lyrics + " name the artist. ";    
}

function getQuestion() {
        return "Name the artist."
}

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

function fetchArtistNames() {
    let songArr =[];  
    
    const spotifyHeaders = {
        headers: {
            Accept: 'application/json',
            Authorization: token
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
              Authorization: token
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


    function pickRandomSong(song1, song2) {
        let num = Math.random();
        if (num >= 0.5) return song1;
        else return song2;
    }

    exports.handler = (event, context, callback) => {
        const alexa = Alexa.handler(event, context,callback);
        alexa.appId = APP_ID;
        alexa.registerHandlers(handlers, startHandlers, quizHandlers, musicHandlers, spotifyHandlers);
        alexa.execute();
    }

    let classicSongArr = 

    [ 
  { title: 'Wannabe',
    id: '0n6FMFq5bE22tNTmd6L9U4',
    popularity: 54,
    singer: 'Spice Girls' },
  { title: 'Mr. Brightside',
    id: '5zvJ6DUahHHjeknQPn7iAH',
    popularity: 61,
    singer: 'The Killers' },
  { title: 'Bohemian Rhapsody - Remastered 2011',
    id: '1AhDOtG9vPSOmsWgNW0BEY',
    popularity: 79,
    singer: 'Queen' },
  { title: 'Video Killed The Radio Star',
    id: '0CjThnQPB1DzU3jEtMv3oo',
    popularity: 0,
    singer: 'The Buggles' },
  { title: 'Toxic',
    id: '717TY4sfgKQm4kFbYQIzgo',
    popularity: 63,
    singer: 'Britney Spears' },
  { title: 'Mambo No. 5 (A Little Bit of...)',
    id: '3qrUiGsAC0ZXKP6uOtikOY',
    popularity: 12,
    singer: 'Lou Bega' },
  { title: 'Come On Eileen',
    id: '5uzNa0SBGOe5pPnstWHMCt',
    popularity: 71,
    singer: 'Dexys Midnight Runners' },
  { title: 'P.I.M.P.',
    id: '29UzHkRHqGrqSikUDRWIam',
    popularity: 61,
    singer: '50 Cent' },
  { title: 'Brown Eyed Girl',
    id: '3yrSvpt2l1xhsV9Em88Pul',
    popularity: 78,
    singer: 'Van Morrison' },
  { title: '(Everything I Do) I Do It For You',
    id: '76qB2ZEZlEJAMqMqUjKusp',
    popularity: 70,
    singer: 'Bryan Adams' },
  { title: 'School\'s Out',
    id: '5Z8EDau8uNcP1E8JvmfkZe',
    popularity: 63,
    singer: 'Alice Cooper' },
  { title: 'Thriller',
    id: '3S2R0EVwBSAVMd5UMgKTL0',
    popularity: 67,
    singer: 'Michael Jackson' },
  { title: 'Crazy In Love',
    id: '0TwBtDAWpkpM3srywFVOV5',
    popularity: 70,
    singer: 'Beyoncé' },
  { title: 'I Wanna Dance with Somebody (Who Loves Me)',
    id: '2tUBqZG2AbRi7Q0BIrVrEj',
    popularity: 79,
    singer: 'Whitney Houston' },
  { title: 'I Want You Back',
    id: '3b0EOvScbZUc0qJx0E1L2z',
    popularity: 73,
    singer: 'The Jackson 5' },
  { title: 'Don\'t You Want Me - 2002 - Remaster',
    id: '3L7RtEcu1Hw3OXrpnthngx',
    popularity: 71,
    singer: 'The Human League' },
  { title: 'Hey Jude - Remastered 2015',
    id: '3H7sv3Krffn15BufUuXzf3',
    popularity: 70,
    singer: 'The Beatles' },
  { title: 'Wonderwall',
    id: '79RUMZfMNMpqZnswovvTqv',
    popularity: 73,
    singer: 'Oasis' },
  { title: 'Believe',
    id: '2goLsvvODILDzeeiT4dAoR',
    popularity: 72,
    singer: 'Cher' },
  { title: 'Livin\' On A Prayer',
    id: '3X7abqSXC4xrxuC1ykpWcY',
    popularity: 62,
    singer: 'Bon Jovi' },
  { title: 'Sweet Home Alabama',
    id: '4CJVkjo5WpmUAKp3R44LNb',
    popularity: 76,
    singer: 'Lynyrd Skynyrd' },
  { title: 'I\'m Gonna Be (500 Miles)',
    id: '67iAlVNDDdddxqSD2EZhFs',
    popularity: 59,
    singer: 'The Proclaimers' },
  { title: 'Suspicious Minds',
    id: '1H5IfYyIIAlgDX8zguUzns',
    popularity: 70,
    singer: 'Elvis Presley' },
  { title: 'Ignition (Remix)',
    id: '3zSCNTXI7Ed0PiidZVmzIe',
    popularity: 77,
    singer: 'R. Kelly' },
  { title: 'My Heart Will Go On - Love Theme from "Titanic"',
    id: '3oEHQmhvFLiE7ZYES0ulzv',
    popularity: 70,
    singer: 'Céline Dion' },
  { title: 'Milkshake',
    id: '2cMTIlktg3M9mXYqCPqw1J',
    popularity: 68,
    singer: 'Kelis' },
  { title: 'Girls Just Wanna Have Fun',
    id: '0xs0ewnEb6c2DlY7LjOD7t',
    popularity: 58,
    singer: 'Cyndi Lauper' },
  { title: 'Uptown Funk',
    id: '32OlwWuMpZ6b0aN2RZOeMS',
    popularity: 83,
    singer: 'Mark Ronson' },
  { title: 'Stayin\' Alive - Remastered Version',
    id: '3LmpQiFNgFCnvAnhhvKUyI',
    popularity: 29,
    singer: 'Bee Gees' },
  { title: 'Wake Me up Before You Go-Go',
    id: '0ikz6tENMONtK6qGkOrU3c',
    popularity: 77,
    singer: 'Wham!' },
  { title: 'Baby Love - Juke Box Single Version',
    id: '5uM9zdUz8PpYJME9wZCM4W',
    popularity: 61,
    singer: 'The Supremes' },
  { title: 'Livin\' la Vida Loca',
    id: '0Ph6L4l8dYUuXFmb71Ajnd',
    popularity: 70,
    singer: 'Ricky Martin' },
  { title: 'Hips Don\'t Lie',
    id: '3ZFTkvIE7kyPt6Nu3PEa7V',
    popularity: 82,
    singer: 'Shakira' },
  { title: 'Gold Digger',
    id: '1PS1QMdUqOal0ai3Gt7sDQ',
    popularity: 76,
    singer: 'Kanye West' },
  { title: 'Step Back In Time',
    id: '3J9604GDguYw2c3YvMJQ2a',
    popularity: 30,
    singer: 'Kylie Minogue' },
  { title: 'Good Luck (Feat Lisa Kekaula)',
    id: '0UyQ9TuZ1lG6eJi4eRKDfO',
    popularity: 53,
    singer: 'Basement Jaxx' },
  { title: 'MMMBop',
    id: '4RwIkzRJEk1pPVsyd592tc',
    popularity: 11,
    singer: 'Hanson' },
  { title: 'U Can\'t Touch This',
    id: '1B75hgRqe7A4fwee3g3Wmu',
    popularity: 71,
    singer: 'MC Hammer' },
  { title: 'Time Warp',
    id: '4WFeJTXNHIS2wURtwlAkhu',
    popularity: 64,
    singer: 'Patricia Quinn' },
  { title: 'Saturday Night - Radio Mix',
    id: '426dSooXpAbPSpwY4cqj3D',
    popularity: 2,
    singer: 'Whigfield' },
  { title: 'Agadoo - original',
    id: '1eIuD1gHB8TBO2IxPBrzL3',
    popularity: 0,
    singer: 'Black Lace' },
  { title: 'Ghostbusters - From "Ghostbusters"',
    id: '7MnxdIXJd4N4mHCTPNKhkX',
    popularity: 58,
    singer: 'Ray Parker, Jr.' },
  { title: 'The Locomotion',
    id: '5IHNFbwUmh7GHUhqdZ67QS',
    popularity: 46,
    singer: 'Little Eva' },
  { title: 'Standing in the Way of Control - Tronik Youth Remix',
    id: '4ifSfvHp0DJo3IKTEYSk1Y',
    popularity: 5,
    singer: 'Gossip' },
  { title: 'Firestarter',
    id: '0QwzCPyTv6UnzjAhZZ0CkB',
    popularity: 54,
    singer: 'The Prodigy' },
  { title: 'Song 2 - 2012 Remastered Version',
    id: '1FTSo4v6BOZH9QxKc3MbVM',
    popularity: 75,
    singer: 'Blur' },
  { title: 'Gettin\' Jiggy Wit It',
    id: '0weAUscowxeqDtpCgtbpgp',
    popularity: 72,
    singer: 'Will Smith' },
  { title: 'Like A Prayer',
    id: '1z3ugFmUKoCzGsI6jdY4Ci',
    popularity: 68,
    singer: 'Madonna' },
  { title: 'Jump Around',
    id: '2oTDOIAdsxPTE7yAp4YOcv',
    popularity: 63,
    singer: 'House Of Pain' },
  { title: 'Tainted Love',
    id: '6eSenvDwIVjNQLiQPcF7rL',
    popularity: 37,
    singer: 'Soft Cell' },
  { title: 'The Bare Necessities - From Walt Disney\'s \'\'The Jungle Book\'\'',
    id: '0IGNnlIB4pdxCK6WgziP9s',
    popularity: 1,
    singer: 'Bruce Reitherman' } 
]

