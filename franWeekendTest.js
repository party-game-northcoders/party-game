app.get('/playSong/:songID', function (req, res) {
    return axios
    .put('https://api.spotify.com/v1/me/player/play', spotifyHeaders)
    .then(response => {
        console.log(response)
    })
})

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