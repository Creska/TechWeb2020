const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const fs = require('fs');
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
var playerIndex = 1; //player counter
var valuatorIndex = 0; //TODO? In case of multiple valuators? The "account" is shared tho
var valuatorID = undefined; //starts with undefined, in case players connect before valuator(s)

//TODO, I probably don't need the room astraction at all. I just need the valuator in the room0 and everyone else in another room of which I know the ID
io.on('connection', (socket) => {
    //handling sockets for chat: I need to configure players and valuator separately
    console.log("Connection:" + socket.id)
    if (socket.handshake.query['type'] == 'player') {
        //socket automatically joins a room with his ID as its name
        console.log("A player(" + playerIndex + ") connected and joined the room: " + socket.id);
        playerIndex++;
        if (valuatorID) {
            socket.to("Room0").emit('user-joined', socket.id);
        }
        else {
            //TODO store join event in case the valuator is still not connected
        }
    }
    else if (socket.handshake.query['type'] == 'valuator') {
        //TODO load join event in case the valuator is still not connected
        //TODO multiple valuators handling?
        console.log("A valuator page connected.")
        valuatorID = socket.id;
        //valuator will join Room0 by default, so I have a nice way to know where to emit message events
        socket.join("Room0", () => {
            console.log("Valuator joined the default Room0.")
        })
    }
    else {
        console.log("Someone connected without querying for player or valuator. This shouldn't be possible,psrobably there are some old pages's socket still online.");
    }
    socket.on('disconnect', () => {
        console.log("Disconnecting: " + socket.id)
        //a player is disconnected, I have to decrement the number of players, since when the room population is 0 then it gets deleted
        if (socket.id !== valuatorID) {
            //sending the disconnect event to the valuator so I can remove the chat
            socket.to("Room0").emit('user-left', socket.id);
            playerIndex--;
        }
    })
    socket.on('chat-message', (message, id) => {
        //sending the chat event to the valuator page
        socket.to("Room0").emit('chat-message', message, id);
    })
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
