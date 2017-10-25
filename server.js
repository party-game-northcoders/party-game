const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require('axios');
const songs = require('./songList');

app.listen(3000);

app.use(bodyParser.json())

// app.get("/", function(req, res) {
//     const url = 'https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=sexy%20and%20i%20know%20it&q_artist=lmfao&apikey=c6af8e74da168c2f810eab97f6a8f603'; 
    
//     return axios
//         .get(url)
//         .then(response => {
//             // res.send(response.data.message.body)
//             res.send(response.data.message.body.lyrics.lyrics_body)
//         }
//         )
//         .catch(e => res.send(e.message));

// })

let title = "";
let singer= "";
function songRandomiser(arr) {
    let random = Math.floor(Math.random() * songs.length)
    title = arr[random].song 
    singer = arr[random].artist 
}



app.get("/random_song", function(req, res) {
    
    songRandomiser(songs);
    
    const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${title}&q_artist=${singer}&apikey=c6af8e74da168c2f810eab97f6a8f603`; 
    
    return axios
        .get(url)
        .then(response => {
            // res.send(response.data.message.body)
            let lyrics = response.data.message.body.lyrics.lyrics_body

            //take first 3 new lines 
            let lyricsArray = lyrics.split("\n");
            let lyricsOutput = lyricsArray.slice(0, 3).join("/n");

            res.send({
                title: title,
                singer: singer,
                lyricsOutput: lyricsOutput 
            })
        }
        )
        .catch(e => res.send(e.message));

})


