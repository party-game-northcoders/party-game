const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require('axios');

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

app.get("/:song/:artist", function(req, res) {
    const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${req.params.song}&q_artist=${req.params.artist}&apikey=c6af8e74da168c2f810eab97f6a8f603`; 
    
    return axios
        .get(url)
        .then(response => {
            // res.send(response.data.message.body)
            res.send(response.data.message.body.lyrics.lyrics_body)
        }
        )
        .catch(e => res.send(e.message));

})



