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
      "Bearer BQCVmOYo3rIhPPRDC5WF0Wv_YJERJIJeaQvwKgUYHkwemD-GEJmfXhS8XuD3AMs8eeI0GN2YyhyeojAfcocIWboway75suLp2U-xYdeioTudlYUviPk62SV7RkLM4psql55JD4yZFXLizRBprH7OYeOF-GJHMByHSCiTpueyJkkaEK_PnYcl_qg-fgJT-IpwSyRuEohmdLLE3B8mMVbbyMYuQu22a1TmS3vE3ZVHdFqaLHpA2yuTGyXUiYEhuQtOrzN4ZF8cwt-PK2CU7iOQyQR0uHHJHsF_QII5vQMovvPpwtW6Rj3JrNv3Rte8aBSsnaWVeA"
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
            singer: track.artists[0].name
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
