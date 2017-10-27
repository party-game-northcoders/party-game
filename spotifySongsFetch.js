// basic server
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(bodyParser.json());
app.listen(3000);

const artistsForGame = [];
const songsForGame = [];
// authentication passed through via headers
const spotifyHeaders = {
  headers: {
    Accept: "application/json",
    Authorization:
      "Bearer BQA6fQjcUuI6PIVwRDZmG0tt-N411ZWapsc6SzbNf-COQRKjsUJu7O9AmuFt9TnbeJDm_hTgiJWPj1NGXCb27dDbH4YHoG9109ejD1LDsVvA4QNqzkmjYvLhcGLfLB8njgjv1FqcqZToBjuaPB4gFb2Y9PQ4SZTmJBVeFZK2GkGBk4vf_VmjLlPuGFQeh2_or123RlrR91oZG06BPN7-n3flX6J05thKou2rB84nkAHmI9-4aY56QnkePWdiV2GGNfks0osIMUGqCwuGAyyyKT9Jnh8zcaW1bdGo4rj6bstWBGOsJ9dhjiUFEc_zOvKTNEbF5Q"
  }
};

// fetch user's top artists or songs - either do all the songs and select on popularity or all the artists and same
app.get("/topArtists", function(req, res) {
  return axios
    .get("https://api.spotify.com/v1/me/top/artists?limit=30", spotifyHeaders)
    .then(response => {
      response.data.items.map(function(artist) {
        artistsForGame.push({
          name: artist.name,
          id: artist.id,
          popularity: artist.popularity
        });
      });
      artistsForGame.sort((a, b) => {
        return b.popularity - a.popularity;
      });
      res.send(artistsForGame.slice(0, 30));
    })
    .catch(err => {
      throw err;
    });
});

app.get("/topArtistsSongs", function(req, res) {
  return axios
    .get(
      "https://api.spotify.com/v1/artists/5K4W6rqBFWDnAN6FQUkS6x/top-tracks?country=GB",
      spotifyHeaders
    )
    .then(response => {
      response.data.tracks.map(function(track) {
        songsForGame.push({
          name: track.name,
          id: track.id,
          popularity: track.popularity,
          artist: track.artists[0].name
        });
      });
      songsForGame.sort((a, b) => {
        return b.popularity - a.popularity;
      });
      res.send(songsForGame.slice(0, 5));
    })
    .catch(err => {
      throw err;
    });
});

// get artists
// get top songs for each



// -- Artist generator --
// the results is the whole 50 artists - from here we will take the most popular 30 (if available) artist IDs

//  response.data.items this is an array
// response.data.items[i] all things available here artist names, popularity, id

//  -- This output informs music match search. There is a need for another step before the music match search.
// - using artist id find out the artists popular songs 10 each?
// - get popular songs from those artists
//  and top fifty songs on spotify
