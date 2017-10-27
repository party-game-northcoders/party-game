// basic server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
app.use(bodyParser.json())
app.listen(3000)

const artistsForGame = [];
const songsForGame = [];
// authentication passed through via headers
const spotifyHeaders = {
    headers: {
        Accept: 'application/json',
        Authorization:"Bearer BQDwOI4wVn9NMP_WjYoKZ_vIqr14_7i8BqDDjiTCJzHu652PT96cGqQf9Ix15t4U-ZrVoh5LtIJED9DAzC1R6cBH7E1vJdFpYjnDeaO_cyOCQxmfIsSO11wm4VJnLA5qi9l7plXH1jX-OFBDCiSsItxbDS4JdWSYVI4i5rDedHZCNWRfOu5mHrB8fmopHAr9X0AMOBGO2GbjRRx-Bc3z1UNEwjazUTJ7A2SQNLGWk7bXSj3jeA_tFUJzmNfTVa5_oCwFeFE1qqKizJcJtiQnvONWZYipWs7b0f0gN3bpz93_7EPDWNwigE4GJ47QinAWSS7MFw"
    }  
};

// fetch user's top artists or songs - either do all the songs and select on popularity or all the artists and same
app.get('/topArtists', function (req, res) {
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
    })
    .catch((err) => {
        throw err;
    })
})


app.get('/topArtistsSongs', function (req, res){
    return axios.get("https://api.spotify.com/v1/artists/5K4W6rqBFWDnAN6FQUkS6x/top-tracks?country=GB", spotifyHeaders)
    .then((response)=>{
        response.data.tracks.map(function (track){
            songsForGame.push({
                name:track.name,
                id:track.id, 
                popularity:track.popularity,
                artist: track.artists[0].name
            })
        })
        res.send(songsForGame)
;    })
    .catch((err) => {
        throw err
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

