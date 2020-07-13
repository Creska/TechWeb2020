const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
app.use(express.json());
var playerIndex = 1; //player counter
var valuatorIndex = 0; //TODO? In case of multiple valuators? The "account" is shared tho
var valuatorID; //starts with undefined, in case players connect before valuator(s)
var storedJoins = []; //storing the join event of the player in case the valuator is still not connected
var storedMessages = []; //storing messages of the player in case the valuator is still not connected
//TODO changing all the errors into objects


io.on('connection', (socket) => {
    //handling sockets for chat: I need to configure players and valuator separately
    console.log("Connection: " + socket.id)
    if (socket.handshake.query['type'] == 'player') {
        //socket automatically joins a room with his ID as its name
        console.log("A player(" + playerIndex + ") connected.");
        playerIndex++;
        if (valuatorID) {
            socket.to(valuatorID).emit('user-joined', socket.id);
        }
        else {
            //storing join event in case the valuator is still not connected
            console.log("Valuator is offline, storing the join event.")
            storedJoins.push(socket.id);
        }
    }
    else if (socket.handshake.query['type'] == 'valuator') {
        //TODO multiple valuators handling?
        console.log("A valuator page connected.")
        valuatorID = socket.id;
    }
    else {
        console.log("Someone connected without querying for player or valuator. This shouldn't be possible,probably there are some old pages's socket still online.");
    }
    socket.on('disconnect', () => {
        console.log("Disconnecting: " + socket.id)
        //a player is disconnected, I have to decrement the number of players, since when the room population is 0 then it gets deleted
        if (socket.id !== valuatorID) {
            //sending the disconnect event to the valuator so I can remove the chat
            socket.to(valuatorID).emit('user-left', socket.id);
            playerIndex--;
        }
    })
    socket.on('chat-message', (message, id, fn) => {
        //sending the chat event to the valuator page
        console.log("The player " + id + " is sending the message: " + message);
        if (valuatorID) {
            console.log("Sending the message to the valuator.")
            socket.to(valuatorID).emit('chat-message', message, id);
        }
        else {
            console.log("Valuator is offline, storing the message.")
            storedMessages.push({ message: message, id: id });
        }

    })
})


app.get('/player', function (req, res) {
    //handling GET request to 
    var story = req.query.story;
    //retrieving parameters in the URL since it's a GET request
    //TODO i have to read published stories
    fs.readFile('public/player/stories/' + story, function read(err, data) {
        //trying to read the story file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send({ code: "ENOENT", message: "Story not found." }).end();
                //the story wasn't found, so I answer with a 404 status response
            }
            else {
                console.log("An error accourred inside /player, while retrieving the story: " + err);
                res.status(500).send(err).end();
            }
        }
        else {
            console.log("Request for " + story + " received successfully. Returning the player and the story to be loaded.");
            fs.readFile('public/player/player_test.html', function (err, data) {
                if (err) {
                    if (err.code == "ENOENT") {
                        res.status(404).send({ code: "ENOENT", message: "Player not found." }).end();
                    }
                    else {
                        console.log("An error accourred inside /player, while retrieving the player: " + err);
                        res.status(500).send(err).end();
                    }
                }
                else {
                    const $ = cheerio.load(data);
                    $('head').append('<template id="story-name">' + story + '</template>');
                    //appending to the body a template with the JSON to load
                    res.status(200).send($.html()).end();
                    //sending back the player page
                }
            });

        }
    });
})

app.get('/valuator', function (req, res) {
    //reading valuator page
    fs.readFile('valuator_page.html', function read(err, data) {
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send({ code: "ENOENT", message: "Valuator page not found." }).end();
                //the story wasn't found, so I answer with a 404 status response
            }
            else {
                console.log("An error accourred inside /valuator, while retrieving the valuator: " + err);
                res.status(500).send(err).end();
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

app.get('/valuator/history', function (req, res) {
    var data = { messages: undefined, joins: undefined };
    if (storedMessages.length) {
        data.messages = storedMessages;
    }
    if (storedJoins.length) {
        data.joins = storedJoins;
    }
    //check if the number of properties is at least 1, otherwise there's no data
    if (Object.keys(data).length > 0) {
        res.status(200).send(data).end();
    }
    else {
        //retrieve nothing in case no history was found
        res.status(200).end();
    }
})

app.get('/editor/getStories', function (req, res) {
    console.log("getStories request received.")
    var stories = [];
    var published_stories = [];
    var read1 = new Promise((resolve, _reject) => {
        fs.readdir('public/player/stories', (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                res.status(500).send(err).end();
                resolve(false);
            }
            else {
                files.forEach(file => {
                    if (file.substring(file.length - 5, file.length) == '.json') {
                        stories.push(file);
                    }
                })
                resolve(true);
            }
        })
    })
    var read2 = new Promise((resolve, _reject) => {
        fs.readdir('public/player/stories/published', (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the published stories: " + err);
                res.status(500).send(err).end();
                resolve(false);
            } else {
                files.forEach((file) => {
                    if (file.substring(file.length - 5, file.length) == '.json') {
                        published_stories.push(file);
                    }
                })
                resolve(true);
            }
        })
    })
    Promise.all([read1, read2]).then(values => {
        if (values[0] && values[1]) {
            if (!(stories.length || published_stories.length)) {
                res.status(404).send({ code: "ENOENT", message: "No stories were found." }).end();
            }
            else {
                res.status(200).send({ stories: stories, published_stories: published_stories });
            }
        }
    });

})

app.get('/editor/getStory', function (req, res) {
    console.log("getStory request received.")
    var story = req.query.story;
    var published = req.query.published || false;
    if (published) {
        fs.readFile('public/player/stories/published/' + story, function (err, data) {
            if (err) {
                console.log("An error accourred inside /editor/getStory, while retrieving a published story: " + err);
                res.status(404).send(err).end();
            }
            else {
                res.status(200).send(JSON.stringify(JSON.parse(data))).end();
            }
        })
    }
    fs.readFile('public/player/stories/' + story, function (err, data) {
        if (err) {
            console.log("An error accourred inside /editor/getStory, while retrieving a published story: " + err);
            res.status(404).send(err).end();
        }
        else {

        } res.status(200).send(JSON.stringify(JSON.parse(data))).end();

    })
})

app.post('/editor/saveStory', function (req, res) {
    var story_data = req.body.story;
    var story_name = req.body.story_name;
    var published = req.body.published || false;
    if (story_name) {
        if (published) {
            fs.writeFile('public/player/stories/published/' + story_name, JSON.stringify(story_data), (err) => {
                if (err) {
                    console.log("An error accourred inside /editor/saveStory, while saving a published story: " + err);
                    res.status(404).send(err).end();
                } else {
                    console.log("Published story saved successfully.")
                    res.status(200).end();
                }
            })
        }
        else {
            fs.writeFile('public/player/stories/' + story_name, JSON.stringify(story_data), (err) => {
                if (err) {
                    console.log("An error accourred inside /editor/getStory, while saving story: " + err);
                    res.status(404).send(err).end();
                } else {
                    console.log("Story saved successfully.")
                    res.status(200).end();
                }
            })
        }
    } else {
        console.log("Trying to save a story without providing the story name.")
        res.status(400).send({ code: "BAD_REQUEST", message: "Trying to save a story without providing the story name." })
    }

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
