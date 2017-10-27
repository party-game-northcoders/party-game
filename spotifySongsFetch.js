// basic server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
app.use(bodyParser.json())
app.listen(3000)

const artistsForGame = [];
// authentication passed through via headers
const spotifyHeaders = {
    headers: {
        Accept: 'application/json',
        Authorization:"Bearer BQCNORERKAFMBzLSoCx8NutpkT81AXFCAw5w4gg17PrP10Gq2cEHCZjgAu25LArqRVgUpGc-qe-EtHwAEm3rEd8Wu0ziePwGrWo649tyxFjz6eL543xqmyh5eE4s0DYXUC3qD3lQFzYhER7vaTY1otA"
    }  
};

// fetch user's top artists or songs - either do all the songs and select on popularity or all the artists and same
app.get('/', function (req, res) {
    return axios.get("https://api.spotify.com/v1/me/top/artists", spotifyHeaders) 
    .then((response)=>{
        response.data.items.map(function (artist) {
            artistsForGame.push({
                name: artist.name, 
                id: artist.id, 
                popularity:artist.popularity
            })
        })
        res.send(artistsForGame)
        console.log(artistsForGame)
    })
    .catch((err) => {
        throw err;
    })
})


// -- Artist generator --
// the results is the whole 50 artists - from here we will take the most popular 30 (if available) artist IDs

//  response.data.items this is an array
// response.data.items[i] all things available here artist names, popularity, id

//  -- This output informs music match search. There is a need for another step before the music match search.
// - using artist id find out the artists popular songs 10 each?
// - get popular songs from those artists 
//  and top fifty songs on spotify

