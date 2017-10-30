// basic server
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(bodyParser.json());
app.listen(3000);

const fs = require('fs');

const artistsForGame = [];
const songsForGame = [];
// authentication passed through via headers
const spotifyHeaders = {
  headers: {
    Accept: "application/json",
    Authorization:
      "Bearer BQA9R4whEHFiZVOZhD5JU786CGtum7pRLTtDHUyS0siRoMxXFQk0SvRbfCW1tBIuGHPT_3C2dcGN-GOkFzMSNiWT4iq3YzmOrKQ5pK2mPnzIOtP3Y3aszRfIKaiSjCxZst4pQMQtochrj8p1cdpZmYhj6AOJr2Jha0TGw3W1x2BqKpExgMT1xKePj4j3pH-fBex596n3OSisaMawBSJGsFMBWPgM1vA8uLOp9L-rP_hylhdHtA-kTVNHFNTBURTSxj8yrpHSZHTKBgiaA34n9eDDvYMbGQxuQgg8WhZ5a5BS_JFlqNuSOb_rwDufMFQPDMM5FA"
  },
  data: {    
   uris:["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"]
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



app.get('/playSong', function (req, res) {
  const spotConfig = {
    headers: {
      Authorization:
        "Bearer BQA9R4whEHFiZVOZhD5JU786CGtum7pRLTtDHUyS0siRoMxXFQk0SvRbfCW1tBIuGHPT_3C2dcGN-GOkFzMSNiWT4iq3YzmOrKQ5pK2mPnzIOtP3Y3aszRfIKaiSjCxZst4pQMQtochrj8p1cdpZmYhj6AOJr2Jha0TGw3W1x2BqKpExgMT1xKePj4j3pH-fBex596n3OSisaMawBSJGsFMBWPgM1vA8uLOp9L-rP_hylhdHtA-kTVNHFNTBURTSxj8yrpHSZHTKBgiaA34n9eDDvYMbGQxuQgg8WhZ5a5BS_JFlqNuSOb_rwDufMFQPDMM5FA"
    }
  };

  const spotData = {    
    uris:["spotify:track:4iV5W9uYEdYUVa79Axb7Rh"]
   }

  return axios
  .put('https://api.spotify.com/v1/me/player/play', spotData, spotConfig)
  .then (response => {
    response.send(200)
  })
  .catch(err => {
    console.log(':(', err.message)
    res.send(500)
  });
})


function songRandomiser(songsArr) {
  let random = Math.floor(Math.random() * songs.length)
  songID = songsArr[random].id
}

// axios.put('/user', {
//     firstName: 'Fred',
//     lastName: 'Flintstone'
//   })
//   .then(function (response) {
//     console.log(response);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

//   axios.put(url[, data[, config]])