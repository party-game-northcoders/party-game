const fetch = require('node-fetch');
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
require('dotenv').config({path: './dev/.env'});

// app.listen(3000, () => {
//     console.log("listening on 3000")
// });
app.use(bodyParser.json())

const clientId = process.env['SPOTIFY_CLIENT_ID'];
const clientSecret = process.env['SPOTIFY_CLIENT_SECRET'];
const refreshToken = process.env['SPOTIFY_REFRESH_TOKEN'];
let accessToken = '';

const refreshAccessToken = () => {
  return fetch(`https://accounts.spotify.com/api/token`, {
    method: 'POST',
    body: `grant_type=refresh&refresh_token=${refreshToken}`,
    headers: {
      'Authorization': `Basic ${new Buffer(`${clientId}:${clientSecret}`).toString('base64')}`
    }
  })
}

const getRecentlyPlayed = (resolve) => {
  return fetch(`${'https://api.spotify.com'}/v1/me/player/recently-played`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
}

// app.get('/my-recently-played', function (req, res) {
  getRecentlyPlayed()
    .then((recentlyPlayedResponse) => recentlyPlayedResponse.json())
    .then((recentlyPlayedResponseJSON) => {
        if(recentlyPlayedResponseJSON.error.status !== 400) resolve(res.send(recentlyPlayedResponseJSON));
        return recentlyPlayedResponseJSON
    })
    .then(() => {
      refreshAccessToken()
        .then((refreshResponse) => refreshResponse.json())
        .then((refreshResponseJSON) => {
            console.log("First level catch", refreshResponseJSON)
            accessToken = refreshResponseJSON['access_token'];
            getRecentlyPlayed()
              .then((refreshResponseJSON) => refreshResponseJSON.json())
              .then((refreshResponseJSON) => {
                // res.send(recentlyPlayedResponseJSON)
                console.log('what')

              })
              .catch(() => {
                // res.status(500).send('Failed to get recently played tracks');
                console.log("ERROR")
              })
          })
          .catch((e) => {
            // res.status(500).send('Failed to refresh Spotify token')
            console.log("ERROR2", e);
          })
      })
//   })
  
