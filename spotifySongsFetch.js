// basic server
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(bodyParser.json());
app.listen(3001);

const fs = require("fs");

const artistsForGame = [];
const songsForGame = [];
// authentication passed through via headers
const spotifyHeaders = {
  headers: {
    Accept: "application/json",
    Authorization:
      "Bearer BQAMQdlobUzrZ4DnpHpS99mJtB1_kAMA7g27si0o9YzjKrEEKj8dkfgKyR8SRkaonqHmJ2eReUIt34mJr51SLJZANuVk8sShSCWDZCQeBQSfQ0KrBvs-NejOavmZYsAhigTLx3qTUjCtINlaf6uglB-Gh6S92OXf0S09mjzDL1HUDAxmFBzEB9NbgXYk8NUrIOi2Ede6Yue1cViKg_XjPTmtAZYzzCcEE19NpD2Hx5Y7m4sXG-0UqWAdGmj1JYUtIN9zQOidKIFqWPf61_myu1oJjr1b2bh-_hY57NQ_pLOFMOjRY7d11Far9j24v0kQNDJ0rw"
  },
  data: {
    uris: ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"]
  }
};

// fetch user's top artists or songs - either do all the songs and select on popularity

app.get("/topArtistsSongs", function(req, res) {
  return axios
    .get("https://api.spotify.com/v1/me/top/artists?limit=30", spotifyHeaders)
    .then(response => {
      return response.data.items.map(function(artist) {
        return {
          name: artist.name,
          id: artist.id,
          popularity: artist.popularity
        };
      });
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
            singer: track.artists[0].name,
            sample: track.preview_url
          };
        });
        acc = acc.concat(artistTracks);
        return acc;
      }, []);
      res.send(data);
    })
    .catch(err => {
      throw err;
    });
});

app.get("/playSong", function(req, res) {
  const spotConfig = {
    headers: {
      Authorization:
        "Bearer BQAMQdlobUzrZ4DnpHpS99mJtB1_kAMA7g27si0o9YzjKrEEKj8dkfgKyR8SRkaonqHmJ2eReUIt34mJr51SLJZANuVk8sShSCWDZCQeBQSfQ0KrBvs-NejOavmZYsAhigTLx3qTUjCtINlaf6uglB-Gh6S92OXf0S09mjzDL1HUDAxmFBzEB9NbgXYk8NUrIOi2Ede6Yue1cViKg_XjPTmtAZYzzCcEE19NpD2Hx5Y7m4sXG-0UqWAdGmj1JYUtIN9zQOidKIFqWPf61_myu1oJjr1b2bh-_hY57NQ_pLOFMOjRY7d11Far9j24v0kQNDJ0rw"
    }
  };
  return axios
    .get("https://api.spotify.com/v1/me/top/artists?limit=30", spotifyHeaders)
    .then(response => {
      return response.data.items.map(function(artist) {
        return {
          name: artist.name,
          id: artist.id,
          popularity: artist.popularity
        };
      });
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
            singer: track.artists[0].name,
            sample: track.preview_url
          };
        });
        acc = acc.concat(artistTracks);
        return acc;
      }, []);
      res.send(data); // unecessary for functionality but gives visual representation of dataset
      let random = Math.floor(Math.random() * data.length);
      return axios
        .put(
          "https://api.spotify.com/v1/me/player/play",
          { uris: ["spotify:track:" + data[random].id] },
          spotConfig
        )
        .then((response) => {
          return axios
            .put(
              "https://api.spotify.com/v1/me/player/seek?position_ms=30000", 
              {}, spotConfig
            )
            .then((response) => {
              setTimeout(function (){
                return axios
                .put("https://api.spotify.com/v1/me/player/pause", {}, spotConfig)
                .then(response => {
                  console.log(response, "***************")
                })
                .catch(err => {
                  console.log("Pause Error" + err.message, err);
                })
              },12000);
            })
            .catch(err => {
              console.log("Play song position error" + err.message, err);
            })
        })
        .catch(err => {
          console.log("Song play error", err.message);
        });
    })
    .catch(err => {
      throw err;
    });
});

