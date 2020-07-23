const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
app.use(express.json()); //JSON loaded gets automatically parsed into an object
var playerMax; //DINT max number of players allowed for the story
var groups = new Map(); //DINT in case the story is made of multiple groups.
var valuatorID; //starts with undefined, in case players connect before valuator(s)
var storedJoins = []; //storing the join event of the player in case the valuator is still not connected
var storedMessages = []; //storing messages of the player in case the valuator is still not connected
var player_data = new Map(); //stores some player data, need this to be able to do a game summary
var gamesent = undefined; //the last game that was requested, so I can know where to put the new player.
var playerIndexes = new Map(); //player counter for each story: story(key),counter(value)
var playersInStories = new Map(); //storing which players(array,value) are in which story(key)
var stories_played = []; //stores all stories being played
var valuatorIDs = []; //all valuators
/*
    TODO
=> multiple valuator/stories, tho most has been done. Multiple valuators are possible, they supervision all active stories. Multiple games should work(untested)
=> handling teams, I should split things up based on the story
=> should I change all the "else" statements by putting a return after the if?
=> warning about players stopped for too long on a game's specific phase
=> different handling for help-request
=> different handling for an input to be valued from a valuator
=> Return a JSON with the game summary, I think it'll have to contain:
    -Rankings
    -For each activity, minumum, maximum and average time needed to answer(maybe some questions are too hard?)
    -For each activity, minimum, maximum and average of how many time the help chat was used(maybe some questions are too hard?)
*/

function valuator_emit(method, socket) {
    valuatorIDs.forEach(valuatorID => {
        socket.to(valuatorID).emit(method, socket.id);
    })
}

function getStoryFromSocketId(id) {
    var story = false;
    playersInStories.forEach((v, k) => {
        if (v.includes(id)) {
            story = k;
        }
    })
    return story;
}

io.on('connection', (socket) => {
    //handling sockets for chat: I need to configure players and valuator separately
    console.log("Connection: " + socket.id,)
    if (socket.handshake.query['type'] == 'player') {
        //playerIndexes: increment the number of players(value) of that specific story(key)
        if (playerIndexes.has(gamesent.story_ID)) {
            playerIndexes.set(gamesent.story_ID, playerIndexes.get(gamesent.story_ID) + 1);
            console.log("A new player arrived(" + playerIndexes.get(gamesent.story_ID) + ") for the story: " + gamesent.story_ID);
        } else {
            playerIndexes.set(gamesent.story_ID, 1);
            console.log("The first player arrived for the story: " + gamesent.story_ID);
        }
        //stories_played: adding a new story being played
        if (!stories_played.includes(gamesent.story_ID)) {
            stories_played.push(gamesent.story_ID);
            console.log("A new story is being played: " + gamesent.story_ID)
        }
        //playersInStories: set the socket id(value) to be playing to that story(key)
        if (playersInStories.has(gamesent.story_ID)) {
            playersInStories.get(gamesent.story_ID).push(socket.id)
        } else {
            playersInStories.set(gamesent.story_ID, [socket.id]);
        }
        console.log("Setting this socket id(" + socket.id + ") to be playing: " + gamesent.story_ID);
        //set an empty array for the current player, so I can push activities data with /update. I know that [0] is the game name
        player_data.set(socket.id, [gamesent.story_ID]);
        //set gamesent to undefined, so other players can go
        gamesent = undefined;
        //socket automatically joins a room with his ID as its name
        if (valuatorIDs.length) {
            valuator_emit('user-joined', socket)
        }
        else {
            //storing join event in case the valuator is still not connected
            console.log("Valuator is offline, storing the join event.")
            storedJoins.push(socket.id);
        }
    }
    else if (socket.handshake.query['type'] == 'valuator') {
        console.log("A valuator page connected.")
        valuatorIDs.push(socket.id);
    }
    else {
        console.log("Someone connected without querying for player or valuator. This shouldn't be possible,probably there are some old pages's socket still online.");
    }
    socket.on('disconnect', () => {
        console.log("Disconnecting: " + socket.id)
        //Removing history from a player that connected,sent some messages and then disconnected before the valuator logged in
        if (!valuatorIDs.length) {
            console.log("Removing history from this socket, since the valuator is still not connected.")
            storedMessages = storedMessages.filter(function (value) {
                return value.id != socket.id;
            });
            storedJoins = storedJoins.filter(function (value) {
                return value != socket.id;
            })
        }
        //A player is disconnected, I have to decrement the number of players, since when the room population is 0 then it gets deleted
        if (!valuatorIDs.includes(socket.id)) {
            //sending the disconnect event to the valuator so I can remove the chat
            valuator_emit('user-left', socket.id);
            var game_from_socket = getStoryFromSocketId(socket.id);
            if (game_from_socket) {
                console.log("Decreasing the player index of game: "+game_from_socket)
                playerIndexes.set(game_from_socket, playerIndexes.get(game_from_socket) - 1);
            }
            else {
                console.log("ERROR: getStoryFromSocketId returned FALSE.")
            }
        }
    })
    socket.on('chat-message', (message, id, type) => {
        //TODO handling what to do depending on the type(not here, on the valuator page's own javascript)
        console.log("The player " + id + " is sending the message: " + message + ". Type: " + type);
        //sending the chat event to the valuator page
        if (valuatorID) {
            console.log("Sending the message to the valuator.")
            socket.to(valuatorID).emit('chat-message', message, id, type);
        }
        else {
            console.log("Valuator is offline, storing the message.")
            storedMessages.push({ message: message, id: id, type: type });
        }

    })
})


app.get('/player', function (req, res) {
    //handling GET request to
    var story = req.query.story;
    console.log("Retrieving the player with the story " + story);
    //retrieving parameters in the URL since it's a GET request
    //TODO I have to read published stories
    fs.readFile('public/player/stories/published/' + story, function read(err, story_data) {
        //trying to read the story file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send({ code: "ENOENT", message: "Story not found." }).end();
                //the story wasn't found, so I answer with a 404 status response
                console.log("An error accourred inside /player, story not found.")
            }
            else {
                console.log("An error accourred inside /player, while retrieving the story: " + err);
                res.status(500).send(err).end();
            }
        }
        else {
            console.log("Request for " + story + " received successfully. Returning the player and the story to be loaded.");
            //saving the current game, the first player locks the game until it gets closed.
            //DINT there could be race conditions between 2 players
            while (gamesent != undefined) {
                ;;
            }
            gamesent = JSON.parse(story_data);
            fs.readFile('public/player/player.html', function (err, player_data) {
                if (err) {
                    if (err.code == "ENOENT") {
                        res.status(404).send({ code: "ENOENT", message: "Player not found." }).end();
                        console.log("An error accourred inside /player, player not found. " + err);
                    }
                    else {
                        console.log("An error accourred inside /player, while retrieving the player: " + err);
                        res.status(500).send(err).end();
                    }
                }
                else {
                    //TODO this needs to be tested(JSON parse required?), stores the current game server-side
                    const $ = cheerio.load(player_data);
                    $('head').append('<template id="story-name">' + story + '</template>');
                    //appending to the body a template with the JSON to load
                    res.status(200).send($.html()).end();
                    //sending back the player page
                }
            });

        }
    });
})

app.post('/player/activityUpdate', function (req, res) {
    //Every time an activity is finished, I send the time spent, how many time a help message was sent and the ID of the socket, I need this for the summary
    var time = req.query.time;
    var help = req.query.help;
    var socketID = req.query.socket;
    player_data.get(socketID).push({ time: time, help: help });
})

app.post('/player/playerWarnings', function (req, res) {
    //TODO player storing how much time has passed inside an activity, this will be sent every 10 seconds
    //I will use socket.io to send a special message to the valuator from here
})

app.get('/editor', function (req, res) {
    fs.readFile('public/editor/editor.html', function (err, editor_data) {
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send({ code: "ENOENT", message: "Editor page not found." }).end();
                console.log("An error accourred inside /editor, editor page not found.");
                //the story wasn't found, so I answer with a 404 status response
            }
            else {
                console.log("An error accourred inside /editor, while retrieving the editor: " + err);
                res.status(500).send(err).end();
            }
        }
        else {
            console.log("Request for the editor page received successfully. Returning the page.");
            const $ = cheerio.load(editor_data);
            res.status(200).send($.html()).end();
        }
    })

});

app.get('/editor/getStories', function (req, res) {
    console.log("getStories request received.")
    var unpublished_stories = [];
    var published_stories = [];
    var read1 = new Promise((resolve, _reject) => {
        fs.readdir('public/player/stories/unpublished', (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                res.status(500).send(err).end();
                resolve(false);
            }
            else {
                files.forEach(file => {
                    if (file.substring(file.length - 5, file.length) == '.json') {
                        unpublished_stories.push(file);
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
            if (!(unpublished_stories.length || published_stories.length)) {
                res.status(404).send({ code: "ENOENT", message: "No stories were found." }).end();
            }
            else {
                res.status(200).send({ unpublished_stories: unpublished_stories, published_stories: published_stories });
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
    fs.readFile('public/player/stories/unpublished/' + story, function (err, data) {
        if (err) {
            console.log("An error accourred inside /editor/getStory, while retrieving an unpublished story: " + err);
            res.status(404).send(err).end();
        }
        else {
            res.status(200).send(JSON.stringify(JSON.parse(data))).end();
        }
    })
})

app.post('/editor/saveStory', function (req, res) {
    //TODO this needs to be tested...
    var story_data = req.body.story;
    var story_name = req.body.story_name;
    var published = req.body.published || false;
    console.log("saveStory request received for: " + story_name)
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
            fs.writeFile('public/player/stories/unpublished/' + story_name, JSON.stringify(story_data), (err) => {
                if (err) {
                    console.log("An error accourred inside /editor/getStory, while saving an unpublished story: " + err);
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

app.get('/valuator', function (req, res) {
    //reading valuator page
    fs.readFile('public/valuator/valuator_page.html', function read(err, data) {
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send({ code: "ENOENT", message: "Valuator page not found." }).end();
                console.log("An error accourred inside /valuator, valuator page not found.");
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

app.post('/valuator/return', function (req, res) {
    //TODO ending summary, I have to decide what to do with player_data
    //game ends, so I unset the story
    stories_played = undefined;
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
