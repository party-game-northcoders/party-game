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
      "Bearer BQCjotcS4ALVz8s9lewnLPKKRCmwG7P7fFXTLHgdJjcsHn7hWCA04uYLjptMv9MfLUN3K0gICMahCcgq367rWl27n8Y6WCkgU8sju8d3OuLelM_Q2x5etdPJGoukIYg90ZwvmBY932gwLI4v4j8rSCwONNvxuvMPQF7rFR9zlM78Bvx4Wbhsz-eKC_Yipb8OAXOOch9MN6KR-Dbtq7xunA3X1WTeUKCY9H9ahZgnxlFVvNrj9jVJFtEMja9BEef7ZzaoXm19nl0r8o1lcGh_rVxNVJjvujW-lSzYA2M9WEZMYv3Fow5Z0s2TTvYFOSykaXR0rA"
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

// -- Artist generator --
// the results is the whole 50 artists - from here we will take the most popular 30 (if available) artist IDs

//  response.data.items this is an array
// response.data.items[i] all things available here artist names, popularity, id

//  -- This output informs music match search. There is a need for another step before the music match search.
// - using artist id find out the artists popular songs 10 each?
// - get popular songs from those artists
//  and top fifty songs on spotify
