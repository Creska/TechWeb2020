process.umask(0);
process.chdir(__dirname);
const express = require('express');
var bodyParser = require('body-parser'); //parsing JSON requests in the body
const app = express();
const formidableMiddleware = require('express-formidable');//formData parsing
app.use("/editor/saveStory", formidableMiddleware({ maxFieldsSize: 50 * 1024 * 1024, maxFileSize: 500 * 1024 * 1024, uploadDir: 'temp' }, [{
    event: 'error',
    action: function (req, res, next, err) {
        res.status(500).send();
    }
}]));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const rmdir = require('rimraf');
const ncp = require('ncp').ncp;
const cheerio = require('cheerio')
var recap = false;
var uniqueFilename = require('unique-filename')
var storedJoins = []; //storing the join event of the player in case the valuator is still not connected
var storedMessages = []; //storing messages of the player in case the valuator is still not connected
var player_data = new Map(); //stores some player data, need this to be able to do a game summary
var storysent = undefined; //the last game that was requested, so I can know where to put the new player.
var story_name = undefined; //name of the story sent
var valuatorID = undefined; //valuatorID, managing all games. There can be only one valuator online at a time.
//var stories_map = new Map(); //game_id(key), (value) : {story: parsed json story, players: array of sockets.id of the players playing this story}. DELETE IF WE DON'T HANDLE MULTIPLE STORIES
const pubpath = 'public/player/stories/published/';
const unpubpath = 'public/player/stories/unpublished/';
var player_count = 0; //players online
var player_per_group_count = 0; //temp counter of players per group
let group = 0; //last group
let groupstory = undefined; //last shuffled group story

function UNF() {
    let id = uniqueFilename('');
    while (storyExists(id)) {
        id = uniqueFilename('');
    }
    return id;
}

// function shuffle(array) {
//     var currentIndex = array.length, temporaryValue, randomIndex;

//     // While there remain elements to shuffle...
//     while (0 !== currentIndex) {

//         // Pick a remaining element...
//         randomIndex = Math.floor(Math.random() * currentIndex);
//         currentIndex -= 1;

//         // And swap it with the current element.
//         temporaryValue = array[currentIndex];
//         array[currentIndex] = array[randomIndex];
//         array[randomIndex] = temporaryValue;
//     }

//     return array;
// }

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

    MAYBE
=> multiple stories handling?

    TODO
=> DONE removing the story once all sockets leave
=> DONE add a number for each group (groupID)
=> DONE check story coherence before writing them(coherence field inside the JSON)
=> DONE loadPlayer with specific JSON (?)
=> NOT NEEDED ANYMORE randomize the order of missions before sending them back to the client
=> DONE warning about players stopped for too long on a game's specific phase
=> DONE test to-be-valuated handling
=> DONE Return a JSON with the game summary, I think it'll have to contain:
    -DONE Rankings
    -DONE For each activity, minumum, maximum and average time needed to answer(maybe some questions are too hard?)
    -DONE For each activity, minimum, maximum and average of how many time the help chat was used(maybe some questions are too hard?)
*/

function valuator_emit(method, socket, data) {
    //emits the event passed with the arg to the valuator
    socket.to(valuatorID).emit(method, socket.id, data);
    console.log("Sending the event '" + method + "' to the valuator, from: " + socket.id);
}

function storyExists(id) {
    return fs.existsSync(pubpath + '/' + id) && fs.existsSync(unpubpath + '/' + id)
}

function storyPath(id) {
    if (fs.existsSync(pubpath + id)) {
        return pubpath + id;
    }
    else if (fs.existsSync(unpubpath + id)) {
        return unpubpath + id;
    }
    else {
        return '404'
    }
}
// function removePlayer(id) {
//by passing the socket id, this specific player will be removed from the story he's playing
// player_count--;
// stories_map.forEach((v, k) => {
//     if (v.players.includes(id)) {
//         v.players = v.players.filter((value) => {
//             return value !== id;
//         })
//         if (!v.players.length) {
//             //if there's no players for this story, delete it
//             stories_map.delete(k);
//             console.log("The story with ID " + k + " has no more players, deleting the record.");
//             //TODO signal the valuator that a story has been deleted due to players leaving
//         }
//     }
// }) MIGHT NOT NEED THIS ANYMORE
// }

io.on('connection', (socket) => {
    /* handling sockets for chat: I need to configure players and valuator separately
       sockets automatically join a room with his ID as its name
    */
    console.log("Connection: " + socket.id,)
    if (socket.handshake.query['type'] == 'player') {
        // if (stories_map.has(storysent.story_ID)) {
        //     //A player entered a game already instanciated, updating it
        //     let temp_game = stories_map.get(storysent.story_ID);
        //     temp_game.players.push(socket.id)
        //     stories_map.set(storysent.story_ID, temp_game);
        //     console.log("A new player arrived(" + temp_game.players.length + ") for the story: " + storysent.story_title);
        // } NO MULTIPLE STORIES
        // else {
        //     //A player entered with a new game, creating the record for it
        //     stories_map.set(storysent.story_ID, { story: storysent, players: [socket.id] })
        //     console.log("A new player arrived(1) for the new story: " + storysent.story_title + ", creating the record for it.");
        // }
        player_count++;
        player_per_group_count++;
        console.log("A new player arrived(" + player_count + ") for the story: " + storysent.story_title);
        //Set an array for the current player, so I can push activities data with /update.
        player_data.set(socket.id, []);
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
                player_count--;
                console.log("Removing history from this socket since it disconnected.")
                storedMessages = storedMessages.filter((value) => {
                    return value.id != socket.id;
                });
                storedJoins = storedJoins.filter((value) => {
                    return value != socket.id;
                })
                //removes the player(socket) from the story he's in, also decreasing the number of players for that story
                // removePlayer(socket.id);
            } else {
                //A valuator is disconnected
                valuatorID = undefined;
                console.log("A valuator disconnected. Setting valuatorID to undefined.")
            }
        }
        else {
            //Removing history from a player that connected, sent some messages and then disconnected while the valuator wasn't online
            player_count--;
            console.log("Removing history from this socket, since the valuator is still not connected or disconnected.")
            storedMessages = storedMessages.filter((value) => {
                return value.id != socket.id;
            });
            storedJoins = storedJoins.filter((value) => {
                return value != socket.id;
            })
        }
        if (player_count == 0) {
            console.log("Deleting the storysent since there's no more players connected.")
            storysent = undefined;
            story_name = undefined;
        }
    })
    socket.on('chat-message', (message, id_from, id_to) => {
        //handler for CHAT MESSAGES 
        if (valuatorID) {
            if (id_from != valuatorID) {
                console.log("The player " + id_from + " is sending the message: " + message);
                valuator_emit('chat-message', socket, message);
            }
            else {
                console.log("The valuator is sending the message: " + message + " | to: " + id_to);
                socket.to(id_to).emit('chat-message', message);
            }

        }
        else {
            console.log("Valuator is offline, storing the message.")
            storedMessages.push({ message: message, id: id });
        }

    })
    socket.on('validate-input-player', (question, answer, socketID) => {
        //handling input validation to the valuator
        if (valuatorID) {
            socket.to(valuatorID).emit('valuate-input', question, answer, socketID)
        }
        else {
            console.log("Valuator is offline, storing to be valued message.")
            storedMessages.push({ question: question, answer: answer, id: socketID });
        }
    })
    socket.on('validate-input-valuator', (nextActivity, score, socketID) => {
        //input validation was handled, sending the result back
        socket.to(socketID).emit('input-valued', nextActivity, score);
    })
    socket.on('player-end', (socketID) => {
        socket.to(valuatorID).emit('player-end', socketID)
    })
})
app.get('/player', function (req, res) {
    //handling GET request to /player
    var story = req.query.story;
    var testing = req.query.testing || false;
    console.log("Retrieving the player with the story " + story);
    //retrieving parameters in the URL since it's a GET request
    let path;
    if (testing) {
        path = unpubpath;
    }
    else {
        path = pubpath;
    }
    fs.readFile(path + story + "/" + "story.json", function (err, story_data) {
        //trying to read the story file specified in the query
        if (err) {
            if (err.code == "ENOENT") {
                console.log("An error accourred inside /player, story not found.")
                return res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Story not found." })).end();
                //the story wasn't found, so I answer with a 404 status response
            }
            else {
                console.log("An error accourred inside /player, while retrieving the story: " + err);
                return res.status(500).send(JSON.stringify(err)).end();

            }
        }
        else {
            console.log("Request for " + story + " received successfully. Returning the player and the story to be loaded.");
            //saving the current game
            let tempstory = JSON.parse(story_data);
            if (story_name != undefined && tempstory.story_title != story_name) {
                return res.status(500).send(JSON.stringify({ code: "BUSY", message: "Another story is being played." })).end();
            }
            if (recap) {
                return res.status(500).send(JSON.stringify({ code: "BUSY", message: "A recap for a story is being shown." })).end();
            }
            storysent = JSON.parse(story_data);
            story_name = storysent.story_title;
            fs.readFile('public/player/player.html', function (err, player_data) {
                if (err) {
                    if (err.code == "ENOENT") {
                        console.log("An error accourred inside /player, player not found. " + err);
                        return res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Player not found." })).end();
                    }
                    else {
                        console.log("An error accourred inside /player, while retrieving the player: " + err);
                        return res.status(500).send(JSON.stringify(err)).end();
                    }
                }
                else {
                    const $ = cheerio.load(player_data);
                    // $('head').append('<template id="story-name">' + story + '</template>'); NOT NEEDED ANYMORE
                    //appending to the body a template with the JSON to load
                    return res.status(200).send($.html()).end();
                    //sending back the player page
                }
            });
        }
    });
})

app.post('/player/activityUpdate', function (req, res) {
    console.log("/player/activityUpdate")
    var activity = req.body;
    var activityID = activity.ActivityID;
    var questID = activity.QuestID;
    var timeToAnswer = activity.TimeToAnswer;
    var chatMessages = activity.ChatMessages;
    var Score = activity.Score;
    var group = activity.Group;
    var socketID = activity.socketID || undefined;
    if (activityID && questID && chatMessages && timeToAnswer && Score && socketID) {
        player_data.get(socketID).push({ activityID: activityID, questID: questID, timeToAnswer: timeToAnswer, chatMessages: chatMessages, Score: Score, group: group });
        console.log("Sending an activityUpdate for: " + socketID)
        return res.status(200).end();
    }
    else {
        console.log("/player/activityUpdate BAD REQUEST, a parameter was not provided.")
        return res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "A parameter(time,help,socketID) was not provided." })).end();
    }
})

app.post('/player/playersActivities', function (req, res) {
    /*each player will send every n seconds the current activity situation(i.e. if the player is still in the same activity and for how long it has been)
    player will need to send {socket_id, story_ID, activity, time}, so I can check if the player is taking too long to answer the question.
    */
    var activity = req.body;
    var questID = activity.QuestID;
    var activityID = activity.ActivityID;
    var time_elapsed = activity.time_elapsed;
    if (questID && activityID && time_elapsed) {
        // var maximum_time = storysent.game.quests[quest_index].activities[activity_index].expected_time;
        let temp_quest;
        storysent.quests.forEach(quest => {
            if (quest.quest_id == questID) {
                temp_quest = quest;
            }
        })
        let maximum_time;
        let chrono;
        temp_quest.activities.forEach(activity => {
            if (activity.activity_id == activityID) {
                maximum_time = activity.expected_time;
                chrono = activity.GET_CHRONO;
            }
        })
        if (maximum_time && time_elapsed > maximum_time && chrono) {
            var socket_ID = activity.socket_ID
            let tempsocket = io.sockets.connected[socket_ID];
            if (valuatorID) {
                valuator_emit('player-warning', tempsocket, { id: socketID, time: time_elapsed - maximum_time });
                console.log("Sending a player warning for: " + socketID + ". Time elapsed: " + time_elapsed + ", Maximum time: " + maximum_time);
            }
            else {
                console.log("Valuator is offline, storing the warning message");
                storedMessages.push({ id: socketID, time: time_elapsed - maximum_time });
            }
            valuator_emit('player-warning', tempsocket, { id: socketID, time: time_elapsed - maximum_time });
            console.log("Sending a player warning for: " + socketID + ". Time elapsed: " + time_elapsed + ", Maximum time: " + maximum_time);
            return res.status(200).end();
        }
    } else {
        console.log("/player/playersActivities BAD REQUEST, a parameter was not provided.")
        return res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "A parameter(socket_id, story_ID, activity, time) was not provided." })).end();
    }
})


app.get('/editor', function (req, res) {
    fs.readFile('public/editor/editor.html', function (err, editor_data) {
        if (err) {
            if (err.code == "ENOENT") {
                console.log("An error accourred inside /editor, editor page not found.");
                return res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Editor page not found." })).end();
                //the story wasn't found, so I answer with a 404 status response
            }
            else {
                console.log("An error accourred inside /editor, while retrieving the editor: " + err);
                return res.status(500).send(JSON.stringify(err)).end();
            }
        }
        else {
            console.log("Request for the editor page received successfully. Returning the page.");
            const $ = cheerio.load(editor_data);
            return res.status(200).send($.html()).end();
        }
    })

});

app.get('/player/loadJSON', function (req, res) {
    //loads the story being played, shuffling quests when needed
    // console.log(player_count)
    // console.log(player_per_group_count)
    // console.log(storysent.players)
    if (storysent.players != undefined) {
        if (player_count == 1) {
            // console.log("player count is 1")
            groupstory = JSON.parse(JSON.stringify(storysent))// used to clone an object without reference;
            groupstory.groupID = group;
            //shuffle(groupstory.quests)

        }
        if (player_per_group_count > storysent.players) {
            // console.log("limit exceeded")
            player_per_group_count = 1;
            group++;
            groupstory.groupID = group;
            //shuffle(groupstory.quests)
        }
        return res.status(200).send(JSON.stringify(groupstory))
    }
    else {
        return res.status(200).send(JSON.stringify(storysent))
    }
})

// app.get('/editor/preview', function (req, res) {
//     let storyID = req.query.story_id;
//     let tempath = storyPath(storyID)
//     if (tempath != '404') {
//         if (tempath == pubpath + storyID) {
//             return res.status(500).send(JSON.stringify({ code: "BADPARAMETER", message: "Story is published. This call can only be done on published stories." }))
//         }
//         else {
//             fs.readFile(tempath, (err, data) => {
//                 if (data) {
//                     let tempstory = JSON.parse(data);
//                     data.testing = true;
//                     return res.status(200).send(JSON.stringify(tempstory)).end();
//                 }
//                 else {
//                     return res.status(500).send(JSON.stringify(err)).end()
//                 }
//             })
//         }
//     }
//     else {
//         console.log("An error occurred inside /editor/preview while reading the story " + storyID);
//         return res.status(500).send(JSON.stringify({ code: "ENOENT", message: "Story doesn't exist." }))
//     }
// })

app.post('/editor/duplicate', function (req, res) {
    console.log("duplicate request received.");
    let story_id = req.body.story_id;
    let path = storyPath(story_id);
    if (path == '404') {
        console.log("An error occurred while duplicating the story " + story_id + ", it doesn't exist");
        return res.status(500).send(JSON.stringify({ code: "ENOENT", message: "Story doesn't exist." }))
    }
    let new_id = UNF();
    if (fs.mkdirSync(unpubpath + new_id) != undefined) {
        console.log("An error occurred inside /editor/duplicate while creating the directory for the duplicated story: " + err);
        return res.status(500).send(JSON.stringify(err)).end();
    }
    else {
        ncp(path, unpubpath + new_id, err => {
            if (err) {
                console.log("An error occurred while duplicating the story ", err);
                return res.status(500).send(JSON.stringify(err)).end()
            }
            else {
                fs.readFile(unpubpath + new_id + '/' + 'story.json', (err, data) => {
                    if (data) {
                        let temp = JSON.parse(data);
                        temp.story_ID = new_id;
                        fs.writeFile(unpubpath + new_id + '/' + 'story.json', JSON.stringify(temp), { encoding: 'utf8', mode: 0o666 }, (err) => {
                            if (err) {
                                console.log("An error occurred while overwriting the story.json of the new duplicate story " + story_id + " to set it's story id")
                                return res.status(500).send(JSON.stringify(err)).end()
                            }
                            else {
                                console.log("story duplicated successfully with the id ", new_id)
                                return res.status(200).send(JSON.stringify(new_id)).end();
                            }
                        });
                    }
                    else {
                        console.log("An error occurred while reading the story.json of the new duplicate story " + story_id + " to set it's story id");
                        return res.status(500).send(JSON.stringify(err)).end()
                    }
                });
            }
        });
    }
})

app.get('/editor/getStories', function (req, res) {
    console.log("getStories request received.")
    var section = req.query.section;
    var any_error = false;
    if (section == 'Explorer') {
        let stories = {}; //returns an object of published stories and publishable ones
        let publishable = [];
        let published = [];
        let read1 = new Promise((resolve, reject) => {
            fs.readdir(unpubpath, (err, files) => {
                if (err) {
                    console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                    res.status(500).send(JSON.stringify(err)).end();
                    reject(false);
                }
                else {
                    files.forEach(file => {
                        if (fs.existsSync(unpubpath + file + '/' + 'story.json')) {
                            let data = fs.readFileSync(unpubpath + file + '/' + 'story.json');
                            if (!data)
                                any_error = true;
                            else {
                                data = JSON.parse(data);
                                if (data.publishable.ok)
                                    publishable.push({ id: file, title: data.story_title });
                            }
                        }
                        else
                            any_error = true;
                    })
                    resolve(true)
                }
            })
        })
        let read2 = new Promise((resolve, reject) => {
            fs.readdir(pubpath, (err, files) => {
                if (err) {
                    console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                    res.status(500).send(JSON.stringify(err)).end();
                    reject(false);
                }
                else {
                    files.forEach(file => {
                        if (fs.existsSync(pubpath + file + '/' + 'story.json')) {
                            let data = fs.readFileSync(pubpath + file + '/' + 'story.json');
                            if (!data)
                                any_error = true;
                            else {
                                data = JSON.parse(data);
                                published.push({ id: file, title: data.story_title })
                            }
                        }
                        else
                            any_error = true;
                    })
                    resolve(true)
                }
            })
        })
        Promise.all([read1, read2]).then(values => {
            if (values[0] && values[1]) {
                stories.publishable = publishable;
                stories.published = published;
                if (any_error)
                    stories.error_msg = "C'è stato qualche errore nel server, qualche storia potrebbe non essere stata reperita."
                console.log("Explorer stories", stories)
                return res.status(200).send(JSON.stringify(stories)).end();
            }
        });
    }
    else if (section == 'Qrcodes' || section == 'ChooseStoryToEdit') {
        let folder = pubpath;
        if (section == "ChooseStoryToEdit")
            folder = unpubpath;
        let stories = []; //returns an array of unpublished stories objects
        fs.readdir(folder, (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                return res.status(500).send(JSON.stringify(err)).end();
            }
            else {
                files.forEach(file => {
                    try {
                        let data = fs.readFileSync(folder + file + '/' + 'story.json');
                        stories.push({ id: file, title: JSON.parse(data).story_title });
                    }
                    catch (err) {
                        console.log("An error accourred inside /editor/getStories, while reading the JSON file." + err);
                        any_error = true;
                    }
                });
                console.log("stories: ", stories)
                let error_msg;
                if (any_error) //at least one story wasn't retrieved
                    error_msg = "Qualche storia non è stata reperita nel server.";
                return res.status(200).send(JSON.stringify({ error_msg: error_msg, stories: stories })).end();
            }
        });
    }
    else {
        console.log("An error accourred inside /editor/getStories, while retrieving stories: BAD REQUEST");
        return res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "'section' parameter must be ChooseStoryToEdit or Explorer." })).end();
    }
})

app.get('/editor/getStory', function (req, res) {
    console.log("getStory request received.")
    var story_id = req.query.story_id;
    let path = storyPath(story_id);
    console.log("Id ricevuto: ", story_id)
    if (path != '404') {
        let story_promise = new Promise((resolve, reject) => {
            fs.readFile(path + '/story.json', 'utf8', function (err, file) {
                if (err)
                    reject(err);
                else
                    resolve(file);
            });
        });
        //the css must be sent as well
        let css_promise = new Promise((resolve, reject) => {
            fs.readFile(path + '/css.json', 'utf8', function (err, file) {
                resolve(file);
            });
        });
        Promise.all([story_promise, css_promise]).then(file => {
            console.log("Story get successful., object sent: ", { story: file[0], css: file[1] })
            return res.status(200).send({ story: file[0], css: file[1] }).end();
        }).catch(err => {
            console.log("An error accourred inside /editor/getStory, while retrieving an unpublished story: ");
            return res.status(500).send("C'è stato un errore nel recupero dei file della storia").end();
        });
    }
    else if (story_id == undefined) {
        console.log("An error accourred inside /editor/getStory: BAD REQUEST");
        return res.status(400).send(JSON.stringify({ code: "BAD_REQUEST", message: "'story_id' parameter missing." })).end();
    }
    else if (path == '404') {
        console.log("An error accourred inside /editor/getStory: ENOENT");
        return res.status(500).send(JSON.stringify({ code: "BAD_REQUEST", message: "No such file or directory." })).end();
    }
})

function clean_folder(json, folder) {
    let json_media = [];
    json.quests.forEach(quest => {
        quest.activities.forEach(activity => {
            activity.activity_text.forEach(a_text => {
                if (a_text.type == "gallery") {
                    a_text.content.forEach(content => {
                        json_media.push(content.name);
                    });
                }
            });
        });
    });
    fs.readdir(folder, (err, files) => {
        if (!err) {
            let diff = files.filter(x => !json_media.includes(x));
            diff.forEach(file => {
                try {
                    if (!(file == "story.json" || file == "css.json")) {
                        fs.unlinkSync(folder + "/" + file);
                        console.log("file ", file, " deleted")
                    }
                }
                catch (err) {
                    console.log("something went wrong while deleting obsolete files", err)
                }
            });
        }
    });
}

app.post('/editor/saveStory', function (req, res) {
    var return_obj;
    var s = 200;
    var story_json = JSON.parse(req.fields.story_json);
    var published = story_json.published;
    var file_errors = [];
    var story_id = story_json.story_ID;
    var story_path;
    var css_error = false;
    var media_map = JSON.parse(req.fields.coordinates);
    console.log("saveStory request received.")
    console.log("published", published)
    if (published)
        story_path = pubpath;
    else
        story_path = unpubpath;
    let path = storyPath(story_json.story_ID)
    if (path == '404') {//id is undefined i.e. the story is new
        console.log("Creating the directory for the new story.")
        story_id = UNF();//overwrite the previously undefined id with the new one
        console.log("story path: ", story_path, " story id: ", story_id)
        if (fs.mkdirSync(story_path + story_id) != undefined) {
            console.log("An error occurred inside /editor/saveStory while creating the directory for a story: " + err);
            return res.status(500).send(JSON.stringify(err)).end();
        }
        else {
            console.log("The directory for the story " + story_json.story_title + " was created successfully.")
        }
    }
    else {
        if (path != story_path + story_id)
            fs.renameSync(path, story_path + story_id);
    }
    if (story_json.story_ID) {
        clean_folder(story_json, story_path + story_json.story_ID);
    }
    for (key in req.files) {
        console.log("path: ", req.files[key].path)
        try {
            if (fs.existsSync(req.files[key].path)) {
                let file_name = req.files[key].name;
                let index = 1;
                let actual_file_name = file_name;
                while (fs.existsSync(story_path + story_id + '/' + actual_file_name)) {
                    let pos = file_name.lastIndexOf(".");
                    actual_file_name = [file_name.slice(0, pos), "(" + index + ")", file_name.slice(pos)].join('');
                    index++;
                }
                if (actual_file_name != file_name) {
                    let coordinates = media_map[key];
                    if (coordinates)
                        story_json.quests[coordinates[0]].activities[coordinates[1]].activity_text[coordinates[2]].content[coordinates[3]].name = actual_file_name;
                }
                console.log("actual file name: ", actual_file_name)
                fs.renameSync(req.files[key].path, story_path + story_id + '/' + actual_file_name);
            }
            else {
                console.log("file ", req.files[key].name + " not found in project temp directory")
                file_errors.push({ name: req.files[key].name });
            }
        }
        catch (err) {
            console.log("error with file: ", req.files[key].name, err)
            file_errors.push({ name: req.files[key].name });
        }
    }
    console.log("file checking and moving completed")
    let css_err = fs.writeFileSync(story_path + story_id + '/css.json', req.fields.story_css, { encoding: 'utf8', mode: 0o666 });
    if (css_err != undefined) {
        console.log("error while css");
        css_error = true;
    }
    else {
        console.log("css saved successfully")
    }
    //add id field and write story json inside story directory
    story_json.story_ID = story_id;
    let err = fs.writeFileSync(story_path + story_id + '/story.json', JSON.stringify(story_json), { encoding: 'utf8', mode: 0o666 });
    if (err != undefined) {
        console.log("An error occurred inside /editor/saveStory while saving the JSON Story file of " + story_id + ": " + err);
        console.log("Deleting " + story_id + " folder...")
        rmdir(story_path + '/' + story_id, err => {
            if (err) {
                console.log("An error occurred inside /editor/saveStory while deleting the folder " + story_id + ": " + err)
            }
            else {
                console.log("Folder " + story_id + " deleted successfully.")
            }
        });
        return_obj = err;
        s = 500;
    }
    else {
        console.log("JSON Story file of " + story_id + " saved successfully.")
    }
    if (s == 200) {
        console.log("Story " + story_id + " saved successfully.")
        return_obj = { story_id: story_id, file_errors: file_errors, css_error: css_error };
    }
    return res.status(s).send(return_obj).end();
})

app.post('/editor/deleteStory', function (req, res) {
    var fb = { msgs: [] };//feedback object
    var story = req.body;
    var story_ids = story.story_ids;
    var promises = [];
    if (story_ids) {
        var s = 200;
        story_ids.forEach((story_id, index, arr) => {
            let path = storyPath(story_id);
            if (path != '404') {
                promises.push(new Promise((resolve, reject) => {
                    rmdir(path, (err) => {
                        if (err) {
                            console.log("An error occurred inside /editor/deleteStory while removing " + story_id + ": " + err);
                            fb.msgs.push({ msg: "Errore nell'eliminazione di " + story_id + ".", successful: false });
                            s = 500;
                        }
                        else {
                            console.log("Story " + path + " deleted successfully.")
                            fb.msgs.push({ msg: "La storia " + story_id + " è stata eliminata.", successful: true });
                        }
                        resolve();
                    });
                })
                );
            }
        })
        Promise.all(promises).then(() => {
            return res.status(s).send(JSON.stringify(fb)).end();
        })
    }
    else {
        console.log("/editor/deleteStory BAD REQUEST: story_ids parameter was not provided.")
        fb.msgs.push({ msg: "Nessuna storia è stata eliminata.", successful: false });
        return res.status(400).send(JSON.stringify(fb)).end();
        // { code: "BAD_REQUEST", message: "story_ids parameter was not provided." }
    }
})

app.post('/editor/publisher', function (req, res) {
    var fb = { msgs: [] };//feedback object
    var story_ids = req.body.story_ids;
    var promises = [];
    if (story_ids != undefined) {
        var s = 500;
        story_ids.forEach((story_id, index, arr) => {
            let from = unpubpath, to = pubpath, ita = "pubblicata", pub = true;
            if (story_id.published) {
                ita = "ritirata";
                from = pubpath;
                to = unpubpath;
                pub = false;
            }
            promises.push(new Promise((resolve, reject) => {
                console.log("published ", story_id.published)
                fs.rename(from + story_id.id, to + story_id.id, (err) => {
                    if (err) {
                        console.log("An error occurred inside /editor/publisher while moving " + story_id.id + ": " + err)
                        fb.msgs.push({ msg: "Errore: la storia " + story_id.id + " non è stata " + ita + ".", successful: false });
                    }
                    else {
                        try {
                            var data = fs.readFileSync(to + story_id.id + "/story.json");
                        } catch (err) {
                            console.log("error with sync reading json of story ", story_id.id)
                        }
                        if (data) {
                            let work = JSON.parse(data);
                            work.published = pub;
                            let w_err = fs.writeFileSync(to + story_id.id + "/story.json", JSON.stringify(work), { encoding: 'utf8', mode: 0o666 });
                            if (!w_err) {
                                console.log('The story ' + story_id.id + 'was moved.');
                                fb.msgs.push({ msg: "La storia " + story_id.id + " è stata " + ita + ".", successful: true });
                                s = 200;
                            }
                            else {
                                console.log('The story ' + story_id.id + 'was moved but json was not updated due to json read error.');
                                fb.msgs.push({ msg: "La storia " + story_id.id + " è stata " + ita + ", ma c'è stato un errore di aggiornamento, per favore contatta l'amministratore.", successful: false });
                            }
                        }
                        else {
                            console.log('The story ' + story_id.id + 'was moved but json was not updated due to json write error.');
                            fb.msgs.push({ msg: "La storia " + story_id.id + " è stata " + ita + ", ma c'è stato un errore di aggiornamento, per favore contatta l'amministratore.", successful: false });
                        }
                    }
                    resolve();
                })
            })
            );
        })
        Promise.all(promises).then(() => {
            return res.status(s).send(JSON.stringify(fb)).end();
        }
        );
    }
    else {
        console.log("/editor/publisher BAD REQUEST: story_ids parameter was not provided.")
        fb.msgs.push({ msg: "Nessuna storia è stata pubblicata o ritirata.", successful: false });
        return res.status(400).send(JSON.stringify(fb)).end();
    }
})

app.get('/valuator', function (req, res) {
    //reading valuator page
    if (valuatorID) {
        console.log("/valuator CONFLICT: A valuator is already in use");
        return res.status(409).send("Cannot GET /valuator, busy").end().end();
    }
    else {
        fs.readFile('public/valuator/valuator_page.html', function read(err, data) {
            if (err) {
                if (err.code == "ENOENT") {
                    console.log("An error accourred inside /valuator, valuator page not found.");
                    return res.status(404).send(JSON.stringify({ code: "ENOENT", message: "Valuator page not found." })).end();
                    //the story wasn't found, so I answer with a 404 status response
                }
                else {
                    console.log("An error accourred inside /valuator, while retrieving the valuator: " + err);
                    return res.status(500).send(JSON.stringify(err)).end();
                }
            }
            else {
                console.log("Request for the valuator page received successfully. Returning the page.");
                //returning the valuator, I'm using cheerio since it's handy...and it would be a waste not using loaded libraries ¯\_(ツ)_/¯
                const $ = cheerio.load(data);
                return res.status(200).send($.html()).end();
            }
        })
    }
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
        return res.status(200).send(JSON.stringify(data)).end();
    }
    else {
        //retrieve nothing in case no history was found
        return res.status(200).end();
    }
})

app.get('/valuator/return', function (req, res) {
    if (player_data.size > 0) {
        player_per_group_count = 0; //temp counter of players per group
        group = 0; //last group
        recap = true;
        res.status(200).send(JSON.stringify([...player_data])).end();
        player_data.clear();
        return;
    }
    else {
        console.log("An error accourred inside /valuator/return, player_data is empty");
        return res.status(500).end();
    }
})

app.post('/valuator/restore', function (req, res) {
    recap = false;
})

app.get('/valuator/activeStories', function (req, res) {
    //sending all current active games to the valuator
    // var activeStories = [];
    // stories_map.forEach((v, _k) => {
    //     activeStories.push({ story_name: v.story_name, story_ID: v.story_ID });
    // }) WON'T NEED THIS IF WE DON'T HANDLE MULTIPLE STORIES
    if (storysent) {
        return res.status(200).send(JSON.stringify(storysent)).end();
    }
    else {
        return res.status(404).send(JSON.stringify({ code: "NOTFOUND", message: "No active story was found." })).end();
    }

})

app.get('/valuator/activeStoryName', function (req, res) {
    if (story_name) {
        return res.status(200).send(JSON.stringify(story_name)).end();
    } else {
        return res.status(404).send(JSON.stringify({ code: "NOTFOUND", message: "No active story was found." })).end();
    }

})

http.listen(8000, () => {
    console.log('Listening on *:8000');
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
