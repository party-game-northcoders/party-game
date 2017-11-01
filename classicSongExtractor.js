const songs = require('./classic songs');

const classicSongExtractor = function (object) {
    const songIDs = [];
    // songIDs.push(object.items[0].track.id)
    for(var i = 0; i < object.items.length; i ++) {

        songIDs.push({
            // id : object.items[i].track.id,
            // title : object.items[i].track.name,
            // popularity : object.items[i].track.popularity,
            singer : object.items[i].track.artists[0].name,
        })
    }

    console.log(songIDs);
}

classicSongExtractor(songs);

// title: "Slip Away",
// id: "3Gda1sTo2ZjbztjjsnAsP3",
// popularity: 61,
// singer: "Perfume Genius",
// sample: