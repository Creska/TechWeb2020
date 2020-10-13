const express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const cheerio = require('cheerio')
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
app.use(express.json()); //JSON loaded gets automatically parsed into an object
var valuatorID; //starts with undefined, in case players connect before valuator(s)
var storedJoins = []; //storing the join event of the player in case the valuator is still not connected
var storedMessages = []; //storing messages of the player in case the valuator is still not connected
var player_data = new Map(); //stores some player data, need this to be able to do a game summary
var storysent = undefined; //the last game that was requested, so I can know where to put the new player.
var valuatorID = undefined; //valuatorID, managing all games. There can be only one valuator online at a time.
var stories_map = new Map(); //game_id(key), (value) : {story: parsed json story, players: array of sockets.id of the players playing this story}
var path = require('path');
var pubpath = 'public/player/stories/published/';
var unpubpath = 'public/player/stories/unpublished/';

/*
    TEAMS
    Teams can be made of maximum 5 people, minumum 2
    assumption(it's not specified anywhere, so who knows?): each team has ONLY one device, so it's the same as handling non-teams stories.

    VALUATORS
    There can be multiple valuators online, they share all games and all chats being played.

    SOCKETS
    All text messages(help,validation ones) will be sent using the socket.io library.
    This library simulates an high-level TCP/IP protocol, it's really handy for exchanging informations between clients.
    I couldn't find another method to send data between clients, and socket.io is nice and fast to implement anyway...

    TODO
=> should I change all the "else" statements by putting a return after the if?
=> warning about players stopped for too long on a game's specific phase
=> test to-be-valuated handling
=> what the fuck does "parallel teams" mean???
=> Return a JSON with the game summary, I think it'll have to contain:
    -Rankings
    -For each activity, minumum, maximum and average time needed to answer(maybe some questions are too hard?)
    -For each activity, minimum, maximum and average of how many time the help chat was used(maybe some questions are too hard?)
*/

function valuator_emit(method, socket, data) {
    //emits the event passed with the arg to the valuator
    socket.to(valuatorID).emit(method, socket.id, data);
    console.log("Sending the event '" + method + "' to the valuator, from: " + socket.id);
}

function removePlayer(id) {
    //by passing the socket id, this specific player will be removed from the story he's playing
    stories_map.forEach((v, k) => {
        if (v.players.includes(id)) {
            v.players = v.players.filter((value) => {
                return value !== id;
            })
            if (!v.players.length) {
                //if there's no players for this story, delete it
                stories_map.delete(k);
                console.log("The story with ID " + k + " has no more players, deleting the record.");
                //TODO signal the valuator that a story has been deleted due to players leaving
            }
        }
    })
}

io.on('connection', (socket) => {
    /* handling sockets for chat: I need to configure players and valuator separately
       sockets automatically join a room with his ID as its name
    */
    console.log("Connection: " + socket.id,)
    if (socket.handshake.query['type'] == 'player') {
        if (stories_map.has(storysent.story_ID)) {
            //A player entered a game already instanciated, updating it
            let temp_game = stories_map.get(storysent.story_ID);
            temp_game.players.push(socket.id)
            stories_map.set(storysent.story_ID, temp_game);
            console.log("A new player arrived(" + temp_game.players.length + ") for the story: " + storysent.story_ID);
        }
        else {
            //A player entered with a new game, creating the record for it
            stories_map.set(storysent.story_ID, { story: storysent, players: [socket.id] })
            console.log("A new player arrived(1) for the new story: " + storysent.story_ID + ", creating the record for it.");
        }
        //Set an array for the current player, so I can push activities data with /update. I know that [0] is the game name
        player_data.set(socket.id, [storysent.story_ID]);
        //Set gamesent to undefined, so /player can continue
        storysent = undefined;
        if (valuatorID) {
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
        if (!valuatorID) {
            //saving the valuator socket ID
            valuatorID = socket.id;
        }
        else {
            console.log("A valuator tried to connect while another valuator was already connected.");
        }
    }
    else {
        console.log("Someone connected without querying for player or valuator. This shouldn't be possible,probably there are some old pages's socket still online.");
    }
    socket.on('disconnect', () => {
        console.log("Disconnecting: " + socket.id)
        if (valuatorID) {
            if (valuatorID != socket.id) {
                //A player is disconnected
                //sending the disconnect event to the valuator so I can remove the chat
                valuator_emit('user-left', socket);
                //removes the player(socket) from the story he's in, also decreasing the number of players for that story
                removePlayer(socket.id);
            } else {
                //A valuator is disconnected
                valuatorID = undefined;
                console.log("A valuator disconnected. Setting valuatorID to undefined.")
            }
        }
        else {
            //Removing history from a player that connected, sent some messages and then disconnected while the valuator wasn't online
            console.log("Removing history from this socket, since the valuator is still not connected or disconnected.")
            storedMessages = storedMessages.filter((value) => {
                return value.id != socket.id;
            });
            storedJoins = storedJoins.filter((value) => {
                return value != socket.id;
            })
        }
    })
    socket.on('chat-message', (message, id) => {
        //handler for CHAT MESSAGES (help)
        console.log("The player " + id + " is sending the message: " + message);
        //sending the chat event to the valuator page
        if (valuatorID) {
            console.log("Sending the message to the valuator.")
            valuator_emit('chat-message', socket, { message: message, id: id });
        }
        else {
            console.log("Valuator is offline, storing the message.")
            storedMessages.push({ message: message, id: id });
        }

    })
    //TODO this need to be tested
    socket.on('validate-input-player', (question, answer, socketID) => {
        //handling input validation to the valuator
        socket.to(valuatorID).emit('valuate-input', question, answer, socketID)
    })
    socket.on('validate-input-valuator', (answer_is_right, socketID) => {
        //input validation was handled, sending the result back
        socket.to(socketID).emit('input-valued', answer_is_right);
    })
})
app.get('/player', function (req, res) {
    //handling GET request to /player
    var story = req.query.story;
    console.log("Retrieving the player with the story " + story);
    //retrieving parameters in the URL since it's a GET request
    //TODO I have to read published stories
    fs.readFile('public/player/stories/published/' + story, function read(err, story_data) {
        //trying to read the story file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Story not found." })).end();
                //the story wasn't found, so I answer with a 404 status response
                console.log("An error accourred inside /player, story not found.")
                return;
            }
            else {
                console.log("An error accourred inside /player, while retrieving the story: " + err);
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
        }
        else {
            console.log("Request for " + story + " received successfully. Returning the player and the story to be loaded.");
            //saving the current game
            //DINT there could be race conditions between 2 players
            while (storysent != undefined) {
                ;;
            }
            storysent = JSON.parse(story_data);
            fs.readFile('public/player/player.html', function (err, player_data) {
                if (err) {
                    if (err.code == "ENOENT") {
                        res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Player not found." })).end();
                        console.log("An error accourred inside /player, player not found. " + err);
                        return;
                    }
                    else {
                        console.log("An error accourred inside /player, while retrieving the player: " + err);
                        res.status(500).send(JSON.stringify(err)).end();
                        return;
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
    /*Every time an activity is finished, I send the time spent, how many time a help message was sent and the ID of the socket.
    I know that [0] cointains the game name, and every push is an activity(so I know the flow of the game)
    This is needed for the summary, NOT for the warnings
    */
    var time = req.query.time || undefined;
    var help = req.query.help || undefined;
    var socketID = req.query.socket || undefined;
    if (time && help && socketID) {
        player_data.get(socketID).push({ time: time, help: help });
        console.log("Sending an activityUpdate for: " + socketID)
        res.status(200).end();
    }
    else {
        console.log("/player/activityUpdate BAD REQUEST, a parameter was not provided.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "A parameter(time,help,socketID) was not provided." })).end();
        return;
    }
})

app.post('/player/playersActivities', function (req, res) {
    /*each player will send every n seconds the current activity situation(i.e. if the player is still in the same activity and for how long it has been)
    player will need to send {socket_id, story_ID, activity, time}, so I can check if the player is taking too long to answer the question.
    */
    var story_ID = req.body.story_ID || undefined
    var quest_index = req.body.quest || undefined
    var activity_index = req.body.activity || undefined
    var time_elapsed = req.body.time || undefined
    if (story_ID && activity_index && time_elapsed) {
        var maximum_time = stories_map.get(story_ID).game.quests[quest_index].activities[activity_index].expected_time;
        if (time_elapsed > maximum_time) {
            var socketID = req.body.socket_id;
            let tempsocket = io.sockets.connected[socketID];
            // valuator_emit('player-warning', tempsocket, { id: socketID, time: time_elapsed });
            // console.log("Sending a player warning for: " + socketID + ". Time elapsed: " + time_elapsed + ", Maximum time: " + maximum_time);
            // why the fuck did I do it this way?
            res.status(200).end();
            return;
        }
    } else {
        console.log("/player/playerWarnings BAD REQUEST, a parameter was not provided.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "A parameter(socket_id, story_ID, activity, time) was not provided." })).end();
        return;
    }
})


app.get('/editor', function (req, res) {
    fs.readFile('public/editor/editor.html', function (err, editor_data) {
        if (err) {
            if (err.code == "ENOENT") {
                res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Editor page not found." })).end();
                console.log("An error accourred inside /editor, editor page not found.");
                //the story wasn't found, so I answer with a 404 status response
                return;
            }
            else {
                console.log("An error accourred inside /editor, while retrieving the editor: " + err);
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
        }
        else {
            console.log("Request for the editor page received successfully. Returning the page.");
            const $ = cheerio.load(editor_data);
            res.status(200).send($.html()).end();
            return;
        }
    })

});

app.get('/editor/getStories', function (req, res) {
    console.log("getStories request received.")
    var stories = {};
    var read1 = new Promise((resolve, _reject) => {
        fs.readdir(unpubpath, (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                res.status(500).send(JSON.stringify(err)).end();
                resolve(false);
            }
            else {
                stories.unpublished = files;
                resolve(true);
            }
        })
    })
    var read2 = new Promise((resolve, _reject) => {
        fs.readdir(pubpath, (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the published stories: " + err);
                res.status(500).send(JSON.stringify(err)).end();
                resolve(false);
            } else {
                stories.published = files;
                resolve(true);
            }
        })
    })
    Promise.all([read1, read2]).then(values => {
        if (values[0] && values[1]) {
            if (!(stories.unpublished || stories.published)) {
                res.status(404).send(JSON.stringify({ code: "ENOENT", message: "No stories were found." })).end();
            }
            else {
                res.status(200).send(JSON.stringify(stories)).end();
            }
        }
    });

})

app.get('/editor/getStory', function (req, res) {
    console.log("getStory request received.")
    var story_name = req.query.story_name;
    var published = req.query.published || false;
    var story_path;
    if (story_name && path.extname(story_name) == undefined) {
        if (published) {
            story_path = pubpath;
        }
        else {
            story_path = unpubpath;
        }
        fs.readdir(story_path + story_name, function (err, files) {
            if (err) {
                console.log("An error accourred inside /editor/getStory, while retrieving an unpublished story: " + err);
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
            else {
                var story_elements = [];
                files.forEach(element => {
                    fs.readFile(story_path + story_name + element, function (err, data) {
                        story_elements.push({ name: element, data: data, extension: path.extname(element) });
                    })
                })
                res.status(200).send(JSON.stringify(story_elements)).end();
                return;
            }
        })
    }
    else {
        console.log("/editor/getStory BAD REQUEST: Trying to get a story without providing the story name or a name with an extension.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "Trying to get a story without providing the story name or a name with an extension." })).end();
        return;
    }

})


app.post('/editor/saveStory', function (req, res) {
    //TODO this needs to be tested...
    var story_data = req.body.story; //object received: array [{name: string, data: value}]
    var story_name = req.body.story_name; //the name of the story(directory)
    var published = req.body.published || false;
    var story_path;
    console.log("saveStory request received for: " + story_name)
    if (story_name && path.extname(story_name) == undefined) {
        if (published) {
            story_path = pubpath;
        }
        else {
            story_path = unpubpath;
        }
        for (let index = 0; index < story_data.length; index++) {
            fs.writeFile(story_path + story_name + '/' + story_data[index].name, story_data[index].data, (err) => {
                if (err) {
                    console.log("An error occurred inside /editor/getStory while saving " + story_data[index].name + "of " + story_name + ": " + err);
                    res.status(500).send(JSON.stringify(err)).end();
                    return;
                } else {
                    if (index + 1 > story_data.length) {
                        console.log("Story " + story_name + "saved successfully.")
                        res.status(200).end();
                        return;
                    }
                    console.log("Element " + story_data[index].name + " of " + story_name + " saved successfully.")
                }
            })
        }
    } else {
        console.log("/editor/saveStory BAD REQUEST: Trying to save a story without providing the story name or a name with an extension.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "Trying to save a story without providing the story name or a name with an extension." })).end()
        return;
    }

})

app.post('/editor/deleteStory', function (req, res) {
    var story_name = req.body.story_name;
    var published = req.body.published || false;
    var story_path;
    if (story_name && path.extname(story_name) == undefined) {
        if (published) {
            story_path = pubpath;
        }
        else {
            story_path = unpubpath;
        }
        fs.rmdir(story_path + story_name, { recursive: true }, (err) => {
            if (err) {
                console.log("An error occurred inside /editor/deleteStory while removing " + story_name + ": " + err);
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
            else {
                console.log("Story " + story_name + "deleted successfully.")
                return;
            }
        })
    }
    else {
        console.log("/editor/deleteStory BAD REQUEST: Trying to delete a story without providing the story name or a name with an extension.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "Trying to delete a story without providing the story name or a name with an extension." })).end();
    }
})

app.post('/editor/publisher', function (req, res) {
    var story_name = req.body.story_name;
    //beware that this function will overwrite an existing story with the same name in case it exist in both published and unpublished
    if (fs.existsSync(pubpath + story_name)) {
        fs.rename(pubpath + story_name, unpubpath + story_name, (err) => {
            if (err) {
                console.log("An error occurred inside /editor/publisher while publishing " + story_name + ": " + err)
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
            console.log('The story ' + story_name + 'was unpublished.');
            res.status(200).end();
            return;
        });
    }
    else if (fs.existsSync(unpubpath + story_name)) {
        fs.rename(unpubpath + story_name, pubpath + story_name, (err) => {
            if (err) {
                console.log("An error occurred inside /editor/publisher while unpublishing " + story_name + ": " + err)
                res.status(500).send(JSON.stringify(err)).end();
                return;
            }
            console.log('The story ' + story_name + 'was published.');
            res.status(200).end();
            return;
        });
    }
    else {
        console.log("/editor/publisher BAD REQUEST: Trying to use the publisher on a story that doesnt exist.")
        res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "Trying to use the publisher on a story that doesnt exist." })).end();
        return;
    }
})



app.get('/valuator', function (req, res) {
    //reading valuator page
    if (valuatorID) {
        console.log("/valuator CONFLICT: A valuator is already in use");
        res.status(409).send(JSON.stringify({ code: "CONFLICT", message: "A valuator is already in use" })).end();
        return;
    }
    else {
        fs.readFile('public/valuator/valuator_page.html', function read(err, data) {
            if (err) {
                if (err.code == "ENOENT") {
                    res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Valuator page not found." })).end();
                    console.log("An error accourred inside /valuator, valuator page not found.");
                    return;
                    //the story wasn't found, so I answer with a 404 status response
                }
                else {
                    console.log("An error accourred inside /valuator, while retrieving the valuator: " + err);
                    res.status(500).send(JSON.stringify(err)).end();
                    return;
                }
            }
            else {
                console.log("Request for the valuator page received successfully. Returning the page.");
                //returning the valuator, I'm using cheerio since it's handy...and it would be a waste not using loaded libraries ¯\_(ツ)_/¯
                const $ = cheerio.load(data);
                res.status(200).send($.html()).end();
                return;
            }
        })
    }
})

app.get('/valuator/history', function (req, res) {
    //DINT I probably don't even need this in the end
    var data = { messages: undefined, joins: undefined };
    if (storedMessages.length) {
        data.messages = storedMessages;
    }
    if (storedJoins.length) {
        data.joins = storedJoins;
    }
    //check if the number of properties is at least 1, otherwise there's no data
    if (Object.keys(data).length > 0) {
        res.status(200).send(JSON.stringify(data)).end();
        return;
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

app.get('/valuator/activeStories', function (req, res) {
    //sending all current active games to the valuator
    var activeStories = [];
    stories_map.forEach((v, _k) => {
        activeStories.push({ story_name: v.story_name, story_ID: v.story_ID });
    })
    res.status(200).send(JSON.stringify(activeStories)).end();
    return;
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
