const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const fs = require('fs');
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
var playerIndex = 0; //Each player will join a separate room on his own by default, but I need an index to make the valuator join all of them
var joinedRooms = 0; //I need this so I won't join the same room twice
var valuatorIndex = 0; //TODO? In case of multiple valuators? The "account" is shared tho.
var valuatorID = undefined; //starts with undefined, in case players connect before valuator(s)

io.on('connection', (socket) => {
    //handling sockets for chat: I need to configure players and valuator separately
    if (socket.handshake.query['type'] == 'player') {
        console.log("A player(" + (playerIndex + 1) + ") connected and joined: Room" + playerIndex);
        socket.join("Room" + playerIndex + "");
        //valuator needs to join new clients that connected AFTER him. I can retrieve the valuator socket and make him join new rooms
        if (valuatorID) {
            let ValSocket = io.sockets.sockets[valuatorID];
            ValSocket.join("Room" + playerIndex + "");
            console.log("Valuator joined: Room" + playerIndex)
        }
        playerIndex++;
    }
    else if (socket.handshake.query['type'] == 'valuator') {
        console.log("A valuator page connected. Saving the socket ID.")
        valuatorID = socket.id;
        //Valuator will join all rooms, so he will have 1:1 chat with everyone
        //TODO? check if a valuator enters when the number of rooms and joined rooms is the same? This would mean there's at least another valuator online.
        //check if valuator entered before there were any players
        if (playerIndex != 0) {
            for (joinedRooms; joinedRooms < playerIndex; joinedRooms++) {
                socket.join("Room" + joinedRooms + "")
                console.log("Valuator joined: Room" + joinedRooms)
            }
        }
        tempSocket = socket;
    }
    else {
        console.log("Someone connected. This shouldn't be possible. Probably there are some old pages still online.");
    }
})

app.get('/player', function (req, res) {
    //handling GET request to 
    var game = req.query.game;
    //retrieving parameters in the URL since it's a GET request
    fs.readFile('public/player/games/' + game + '.json', function read(err, data) {
        //trying to read the game file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send("Error 404: Game not found.").end();
                //the game wasn't found, so I answer with a 404 status response
            }
            else {
                console.log(err);
                res.status(404).send("An unknown error occurred. Read logs for details.").end();
            }
        }
        else {
            console.log("Request for " + game + " received successfully. Returning the player and the game to be loaded.");
            const $ = cheerio.load(fs.readFileSync('public/player/player_test.html'));
            //loading the player, TODO handling player not found
            $('head').append('<template id="game-name">' + game + '</template>');
            //appending to the body a template with the JSON to load
            res.status(200).send($.html()).end();
            //sending back the player page
        }
    });
})

app.get('/valuator', function (req, res) {
    //reading valuator page
    fs.readFile('valuator_page.html', function read(err, data) {
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send("Error 404: Valuator page not found.").end();
                //the game wasn't found, so I answer with a 404 status response
            }
            else {
                console.log(err);
                res.status(404).send("An unknown error occurred. Read logs for details.").end();
            }
        }
        else {
            console.log("Request for the valuator page received successfully. Returning the page.");
            //returning the valuator, I'm using cheerio since it's handy...and it would be a waste not using loaded libraries ¯\_(ツ)_/¯
            const $ = cheerio.load(data);
            res.status(200).send($.html()).end();
        }
    })
})

app.post('/updates', function (req, res) {
    //TODO player updates handling
})

app.get('/updates', function (req, res) {
    //TODO valutator updates handling
})

http.listen(3000, () => {
    console.log('Listening on *:3000');
});

// app.listen(3000, function () {
//     console.log("Server listening on port 3000.")
// })

//old stuff I used to learn

// app.use(bodyParser.urlencoded({ extended: true }));
// app.get('/hello', function (req, res) {
//     res.send('Hello World')
// })

// app.post('/login', function (req, res) {
//     console.log("Username:" + req.body.user);
//     console.log("Password:" + req.body.pwd);
//     res.send("<p>POST Done!</p>")
// });

// app.get('/login', function (req, res) {
//     console.log("Username:" + req.query.user);
//     console.log("Password:" + req.query.pwd);
//     res.send("<p>GET Done!</p>")
// });
