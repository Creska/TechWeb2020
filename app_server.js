const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
// app.use(bodyParser.urlencoded({ extended: true }));

app.get('/hello', function (req, res) {
    res.send('Hello World')
})

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

app.get('/player', function (req, res) {
    //handling GET request to /player
    var game = req.query.game;
    //retrieving parameters in the URL since it's a GET request
    fs.readFile('public/games/' + game + '.json', function read(err,data) {
        //trying to read the game file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send("Error 404: Game not found.").end();
                //the game wasn't found, so I answer with a 404 status response
            }
        }
        else {
            console.log("Request for " + game + " received successfully. Returning the page with the correctly-loaded player.");
            const $ = cheerio.load(fs.readFileSync('public/Player/player_test.html'));
            //loading the player
            $('body').append('<template id="game-info">' + data + '</template>');
            //appending to the body a template with the actual .json inside
            res.status(200);
            res.send($.html()).end();
            //sending back the player page
        }
    });
})

app.post('/chat', function (req, res) {
    if (!req.body.valutator) {
        var name = (req.body.teamname || req.body.username);
    }
    var text = req.body.text;
    //TODO player chat handling
})

app.post('/updates', function (req, res) {
    //TODO player updates handling
})

app.get('/updates', function (req, res) {
    //TODO valutator updates handling
})
app.listen(3000, function () {
    console.log("Server listening on port 3000.")
})
