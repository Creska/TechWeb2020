const express = require('express');
var bodyParser = require('body-parser'); //parsing JSON requests in the body
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public')) //this makes the content of the 'public' folder available for static loading. This is needed since the player loads .css and .js files
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const fs = require('fs');
const cheerio = require('cheerio')
const crypto = require('crypto');
var storedJoins = []; //storing the join event of the player in case the valuator is still not connected
var storedMessages = []; //storing messages of the player in case the valuator is still not connected
var player_data = new Map(); //stores some player data, need this to be able to do a game summary
var storysent = undefined; //the last game that was requested, so I can know where to put the new player.
var story_name = undefined; //name of the story sent
var valuatorID = undefined; //valuatorID, managing all games. There can be only one valuator online at a time.
var stories_map = new Map(); //game_id(key), (value) : {story: parsed json story, players: array of sockets.id of the players playing this story}. DELETE IF WE DON'T HANDLE MULTIPLE STORIES
const pubpath = 'public/player/stories/published/';
const unpubpath = 'public/player/stories/unpublished/';
var player_count = 0; //players online
var player_per_group_count = 0; //temp counter of players per group
let group = 0; //last group
let groupstory = undefined; //last shuffled group story

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

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
=> removing the story once all sockets leave
=> add a number for each group (groupID)
=> check story coherence before writing them(coherence field inside the JSON)
=> loadPlayer with specific JSON (?)
=> randomize the order of missions before sending them back to the client
=> warning about players stopped for too long on a game's specific phase
=> test to-be-valuated handling
=> Return a JSON with the game summary, I think it'll have to contain:
    -Rankings
    -For each activity, minumum, maximum and average time needed to answer(maybe some questions are too hard?)
    -For each activity, minimum, maximum and average of how many time the help chat was used(maybe some questions are too hard?)
*/
function stringToBool(string) { return string === 'true' }

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

function storyFolder(id) {
    if (fs.existsSync(pubpath + id)) {
        return 'pubpath'
    }
    else if (fs.existsSync(unpubpath + id)) {
        return 'unpubpath'
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
        //Set an array for the current player, so I can push activities data with /update. I know that [0] is the game name
        // player_data.set(socket.id, [storysent.story_ID]); MIGHT NOT NEED THIS ANYMORE
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
            player_count--;
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
    socket.on('validate-input-valuator', (nextQuest, number, score, socketID) => {
        //input validation was handled, sending the result back
        socket.to(socketID).emit('input-valued', nextQuest, number, score);
    })
})
app.get('/player', function (req, res) {
    //handling GET request to /player
    var story = req.query.story;
    console.log("Retrieving the player with the story " + story);
    //retrieving parameters in the URL since it's a GET request
    fs.readFile('public/player/stories/published/' + story + "/" + "story.json", function (err, story_data) {
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
    /*Every time an activity is finished, I send the time spent, how many time a help message was sent and the ID of the socket.
    I know that [0] cointains the game name, and every push is an activity(so I know the flow of the game)
    This is needed for the summary, NOT for the warnings
    */
    var activity = req.body;
    var questNumber = activity.QuestN;
    var activityN = activity.ActivityN;
    var questID = activity.QuestID;
    var timeToAnswer = activity.TimeToAnswer;
    var chatMessages = activity.ChatMessages;
    var Score = activity.Score;
    var socketID = activity.socket || undefined;
    if (time && help && socketID) {
        //TODO saving player information
        // player_data.get(socketID).push({ time: time, help: help });
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
    // var story_ID = activity.QuestID;
    // var quest_index = activity.quest_index;
    // var activity_index = activity.activity_index;
    // var time_elapsed = activity.time_elapsed;
    var questID = activity.QuestID;
    var activity = activity.ActivityN;
    var time_elapsed = activity.time_elapsed;
    if (story_ID && activity_index && time_elapsed) {
        var maximum_time = stories_map.get(story_ID).game.quests[quest_index].activities[activity_index].expected_time;
        if (time_elapsed > maximum_time) {
            var socket_ID = activity.socket_ID
            let tempsocket = io.sockets.connected[socket_ID];
            // valuator_emit('player-warning', tempsocket, { id: socketID, time: time_elapsed });
            // console.log("Sending a player warning for: " + socketID + ". Time elapsed: " + time_elapsed + ", Maximum time: " + maximum_time);
            // why the fuck did I do it this way?
            return res.status(200).end();
        }
    } else {
        console.log("/player/playersActivities BAD REQUEST, a parameter was not provided.")
        //TODO notify valuator of this error
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
    console.log(player_count)
    console.log(player_per_group_count)
    console.log(storysent.players)
    if (storysent.players != undefined) {
        if (player_count == 1) {
            console.log("player count is 1")
            groupstory = JSON.parse(JSON.stringify(storysent))//try used to clone an object without reference;
            groupstory.groupID = group;
            shuffle(groupstory.quests)

        }
        if (player_per_group_count > storysent.players) {
            console.log("limit exceeded")
            player_per_group_count = 1;
            group++;
            groupstory.groupID = group;
            shuffle(groupstory.quests)
        }
        return res.status(200).send(JSON.stringify(groupstory))
    }
    else {
        return res.status(200).send(JSON.stringify(storysent))
    }
})

app.get('/editor/getStories', function (req, res) { 
    console.log("getStories request received.")
    var section = req.query.section;
    var any_error = false;
    if (section == 'ChooseStoryToEdit') {
        let stories = []; //returns an array of unpublished stories objects
        fs.readdir(unpubpath, (err, files) => {
            if (err) {
                console.log("An error accourred inside /editor/getStories, while retrieving all the unpublished stories: " + err);
                return res.status(500).send(JSON.stringify(err)).end();
            }
            else {  
                files.forEach( file => {
                    try {
                        let data = fs.readFileSync(unpubpath + file + '/' + 'story.json');
                        stories.push({ id: file, title: JSON.parse(data).story_title });
                    }
                    catch(err) {
                        console.log("An error accourred inside /editor/getStories, while reading the JSON file." + err);
                        any_error = true;
                        //return res.status(500).send(JSON.stringify(err)).end();
                    }
                })
            }
            console.log("stories: ",stories)//this happens before the forEach for some reason
            let error_msg;
            if( any_error ) //at least one story wasn't retrieved
                error_msg = "Qualche storia non è stata reperita nel server."   
            return res.status(200).send(JSON.stringify({error_msg: error_msg,stories:stories})).end();
        })
    }
    else if (section == 'Explorer') {
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
                        if( fs.existsSync(unpubpath + file + '/' + 'story.json') ) {
                            let data = fs.readFileSync(unpubpath + file + '/' + 'story.json');
                            if(!data)
                                any_error = true;
                            else {
                                data = JSON.parse(data);
                                if ( data.publishable.ok ) 
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
                        if( fs.existsSync(pubpath + file + '/' + 'story.json') ) {
                            let data = fs.readFileSync(pubpath + file + '/' + 'story.json');
                            if( !data)
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
                if(any_error)
                    stories.error_msg = "C'è stato qualche errore nel server, qualche storia potrebbe non essere stata reperita."
                console.log("Explorer stories", stories)
                return res.status(200).send(JSON.stringify(stories)).end();
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
    console.log("Id ricevuto: ",story_id)
    if (path != '404') {
        let story_promise = new Promise( (resolve,reject) => {
            fs.readFile(path + '/story.json', 'utf8', function (err, file) {
                if(err)
                    reject(err);
                else
                    resolve(file);
            });
        });
        let css_promise = new Promise( (resolve,reject) => {
            fs.readFile(path + '/css_file.json', 'utf8', function (err, file) {
                if(err)
                    reject(err);
                else
                    resolve(file);
            });
        });
        Promise.all([story_promise, css_promise]).then( file => {
            console.log("Story get successful., object sent: ",{story:file[0],css:file[1]})
            return res.status(200).send({story:file[0],css:file[1]}).end();
        }).catch( err => {
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


app.post('/editor/saveStory', function (req, res) {
    //NOTE: this will always overwrite
    var story = req.body;
    console.log("story: ",story) 
    var story_json = story.story_json; //JSON story file object
    var story_data = story.story_data; //array [{name: string, data: value, native: true if utf8, tostringify: true if JSON.stringify() is needed}]

    var published = story.published;
    
    var story_id = story_json.story_ID;
    var story_path;
    console.log("saveStory request received.")
    if (published) {
        story_path = pubpath;
    }
    else {
        story_path = unpubpath;
    }
    let path = storyPath(story_json.story_ID)
    if (path == '404') {//id is undefined i.e. the story is new
        console.log("Creating the directory for the new story.") 
        //it looks like crypto can generate / as a character which
        //leads to errors and apparently is not that uncommon, also is there any guarantee that ids
        //are actually unique?
        story_id = crypto.randomBytes(16).toString('base64');//overwrite the previously undefined id with the new one
        console.log("story path: ",story_path ," story id: ",story_id)
        if (fs.mkdirSync(story_path + story_id) != undefined) {
            console.log("An error occurred inside /editor/saveStory while creating the directory for a story: " + err);
            return res.status(500).send(JSON.stringify(err)).end();
        } 
        else {
            console.log("The directory for the story " + story_json.story_title + " was created successfully.")
        } 
    }
    if(story_data){//write files inside story directory
        story_data.forEach(file => {
            let options = undefined;
            if (file.native) {
                options = 'utf8'
            }
            if (file.tostringify) {
                //stringify is executed assuming file.data is an object
                //which would be true if the json sent is automatically
                //reconverted which i think is not, that's why this step
                //needs to be checked out
                file.data = JSON.stringify(file.data)
            }
            let err = fs.writeFileSync(story_path + story_id + '/' + file.name, file.data, options);//data was changed in data.file
            if (err != undefined) {
                console.log("An error occurred inside /editor/saveStory while saving " + file.name + " of " + story_id + ": " + err);
            }
            else {
                console.log("Element " + file.name + " of " + story_id + " saved successfully.")
            }
        })
    }
    //add id field and write story json inside story directory
    story_json.story_ID = story_id;
    let err = fs.writeFileSync(story_path + story_id + '/story.json', JSON.stringify(story_json), 'utf8');
    if (err != undefined) {
        console.log("An error occurred inside /editor/saveStory while saving the JSON Story file of " + story_id + ": " + err);
    } 
    else {
        console.log("JSON Story file of " + story_id + " saved successfully.")
    }
    console.log("Story " + story_id + " saved successfully.")
    return res.status(200).send(story_id).end();
})

app.post('/editor/deleteStory', function (req, res) {
    var fb = {msgs: []};//feedback object
    var story = req.body; 
    var story_ids = story.story_ids;
    var promises = [];
    if (story_ids) {
        var s= 200;
        story_ids.forEach( (story_id,index,arr) => {
            let path = storyPath(story_id);
            if (path != '404') {
                promises.push( new Promise( (resolve,reject) =>{
                    fs.rmdir(path, { recursive: true }, (err) => {
                        if (err) {
                            console.log("An error occurred inside /editor/deleteStory while removing " + story_id + ": " + err);
                            fb.msgs.push({msg:"Errore nell'eliminazione di "+story_id+ " è .", successful: false});
                            s = 500;
                        }
                        else {
                            console.log("Story " + path + " deleted successfully.")
                            fb.msgs.push({msg:"La storia "+story_id+ " è stata eliminata.", successful: true});
                        }
                        resolve();
                    });
                })
                );
            }
        })
        Promise.all(promises).then( () => {
            //console.log("pre return: ",fb)
            return res.status(s).send(JSON.stringify(fb)).end();
        })
    }
    else {
        console.log("/editor/deleteStory BAD REQUEST: story_ids parameter was not provided.")
        fb.msgs.push({msg:"Nessuna storia è stata eliminata.", successful: false});
        return res.status(400).send(JSON.stringify(fb)).end();
       // { code: "BAD_REQUEST", message: "story_ids parameter was not provided." }
    }
})

app.post('/editor/publisher', function (req, res) {
    var fb = {msgs: []};//feedback object
    var story_ids = req.body.story_ids;
    var promises = [];
    if (story_ids != undefined) {
        var s = 200;
        story_ids.forEach( (story_id,index,arr) => {
            let path = storyFolder(story_id);
            if (path == 'pubpath') {
                promises.push( new Promise( (resolve,reject) => {
                        fs.rename(pubpath + story_id, unpubpath + story_id, (err) => {
                            if (err) {
                                console.log("An error occurred inside /editor/publisher while unpublishing " + story_id + ": " + err)
                                fb.msgs.push({msg:"Errore nel ritiro della storia "+story_id+".", successful: false});
                                s = 500;
                            }
                            else {
                                console.log('The story ' + story_id + 'was unpublished.');
                                //console.log("pre push: ",fb)
                                fb.msgs.push({msg:"La storia "+story_id+ " è stata ritirata.", successful: true});
                                //console.log("post push: ",fb)                 
                            }
                            resolve();
                        })
                    })
                );
            }
            else if (path == 'unpubpath') {
                promises.push( new Promise( (resolve,reject) => {
                        fs.rename(unpubpath + story_id, pubpath + story_id, (err) => {
                            if (err) {
                                console.log("An error occurred inside /editor/publisher while publishing " + story_name + ": " + err)
                                fb.msgs.push({msg:"Errore nella pubblicazione di "+story_id+ ".", successful: false});
                                s = 500; 
                            }
                            else {
                                console.log('The story ' + story_id + 'was published.');
                                fb.msgs.push({msg:"La storia "+story_id+ " è stata pubblicata.", successful: true});
                            }
                            resolve();
                        })
                    })
                );
            }
        })
        Promise.all(promises).then( () => {
                return res.status(s).send(JSON.stringify(fb)).end();
            }
        );
    }
    else {
        console.log("/editor/publisher BAD REQUEST: story_ids parameter was not provided.")
        fb.msgs.push({msg:"Nessuna storia è stata pubblicata o ritirata.", successful: false});
        return res.status(400).send(JSON.stringify(fb)).end();
    }
})



app.get('/valuator', function (req, res) {
    //reading valuator page
    if (valuatorID) {
        console.log("/valuator CONFLICT: A valuator is already in use");
        return res.status(409).send(JSON.stringify({ code: "CONFLICT", message: "A valuator is already in use" })).end();
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
        return res.status(200).send(JSON.stringify(data)).end();
    }
    else {
        //retrieve nothing in case no history was found
        return res.status(200).end();
    }
})

app.post('/valuator/return', function (req, res) {
    //TODO ending summary, I have to decide what to do with player_data
})

app.get('/valuator/activeStories', function (req, res) {
    //sending all current active games to the valuator
    // var activeStories = [];
    // stories_map.forEach((v, _k) => {
    //     activeStories.push({ story_name: v.story_name, story_ID: v.story_ID });
    // }) WON'T NEED THIS IF WE DON'T HANDLE MULTIPLE STORIES
    return res.status(200).send(JSON.stringify(storysent)).end();
    //TODO err handling?
})

app.get('/valuator/activeStoryName', function (req, res) {
    return res.status(200).send(JSON.stringify(story_name)).end();
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