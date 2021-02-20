var activeStoryName; //known active stories
var story_played;
var defaultPageTitle = 'Ambiente Valutatore';
var defaultDescription = "Benvenuto. Qui avrai ha disposizione l'editor potenziato per le storie e l'applicazione per il supporto dei giocatori."
var pageLocation = 0;
var players_playing_arr = [];
let players_finished = [];
var socket;
let last_unused = [];
let json_to_return;
var story_map = new Map(); //story_id(key), {json,players} (value)
const PLAYER = 0;
const VALUATOR = 1;
//pagelocations: Home(0) | Support(1) | Editor(2) 


function renderSupport() {
    pageLocation = 1;
    $('#bottoneditor').fadeOut();
    $('#bottonesupport').fadeOut();
    //rendering the dropdown stories menu
    $.ajax({
        url: '/valuator/activeStories',
        method: 'GET',
        success: function (stories) {
            //TODO handling array of stories
            stories.forEach(story => {
                story_map.set(story.story.story_ID, { json: story.story, players: story.players })
            })
            story_played = JSON.parse(story);
            $('#support').fadeIn();
            $('#home').removeClass('active');
            $('#defaulth1').html(defaultPageTitle + ": Supporto")
            if (stories.length) {
                activeStoryName = story_played.story_title;
                $('#defaultdescription').html('Qui puoi fornire aiuto e vedere alcune statistiche riguardo alla storia che sta venendo giocata in questo momento.');
                showStoryChat();
            }
            else {
                $('#defaultdescription').html('Al momento non sono è attiva una storia. Puoi restare su questa schermata, in attesa che inizino.');
            }
        }
    })
}
function toHome() {
    if (pageLocation != 0) {
        switch (pageLocation) {
            //things to fade out
            case 1:
                $('#storyname').remove();
                $('#support').fadeOut();
                $('#chatrooms').fadeOut();
                $('#charts').fadeOut();
                $.post('/valuator/restore');
                break;

            case 2:
                $('#editor').fadeOut();
                $('#editor-description').fadeOut();
                $('#editor-tool').fadeOut();
                break;
        }
        $('#bottoneditor').fadeIn();
        $('#bottonesupport').fadeIn();
        $('#home').addClass('active');
        $('#defaulth1').html(defaultPageTitle);
        $('#defaultdescription').html(defaultDescription);
        pageLocation = 0;
    }
}
function timeStamp() {
    let time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let hours_string = "";
    let minutes_string = "";
    if (hours < 10) {
        hours_string += "0"
    }
    if (minutes < 10) {
        minutes_string += "0"
    }
    let timestamp = hours_string + hours + ":" + minutes_string + minutes;
    return timestamp;
}

function showStoryChat() {
    $('#support').prepend('<h2 id="storyname">Storia: ' + activeStoryName + '</h2>');
    $('#chatrooms').fadeIn();
}

function sendMessageToPlayer(id) {
    makeChatMessage($('#text-' + id).val(), id, VALUATOR)
    socket.emit('chat-message', $('#text-' + id).val(), socket.id, id);
    $('#text-' + id).val("");
}

function makeChatMessage(text, id, owner) {
    let message;
    if (owner == VALUATOR) {
        message = `  
        <div class="container-chat darker-chat overflow-auto" contenteditable="false">
  <p>`+ text + `</p>
  <span class="time-left-chat">`+ timeStamp() + `</span>
  </div>     
        `
    }
    else if (owner == PLAYER) {
        message = `  
        <div class="container-chat lighter-chat overflow-auto" contenteditable="false">
  <p>`+ text + `</p>
  <span class="time-left-chat">`+ timeStamp() + `</span>
  </div>     
        `
    }
    //message sent from me, this means that the container for the player already exist
    $('#text-' + id).before(message)
    //https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_chat
}

function valuateInput(socketID) {
    let score = $('#punt-' + socketID).val() || 0;
    let nextActivity = $('#att-' + socketID + ' :selected').val();
    socket.emit('validate-input-valuator', nextActivity, score, socketID)
    console.log('Input valued: ', socketID);
    $(`#val-` + socketID).html('<p style="color:orange">Risposta inviata con successo.</p>');
    setTimeout(function () {
        $(`#val-` + socketID).fadeOut(function () {
            $(`#val-` + socketID).remove();
        });
        $(`#warn-` + socketID).fadeOut(function () {
            $(`#warn-` + socketID).remove();
        });
        $('#' + socketID).css('color', 'white');
    }, 3000)
}


function makeWarningMessage(socketID, time) {
    if ($('#warn-' + socketID) == undefined) {
        let message = ` <div id="warn-` + socketID + `" style="border: 1px solid red">
        <div class="container-chat darker-chat overflow-auto" contenteditable="false">
        <p>Attenzione: questo player ha superato il tempo previsto per rispondere all'attività corrente.</p>
        </div>
        </div>`
        $('#form-' + socketID).before(message);
    }
}

function makeValuatorMessage(activityID, question, answer, socketID) {
    let message = `  
    <div id="val-`+ socketID + `" style="border: 1px solid orange">
    <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false"">
<p style="color: orange"><b>System Message: Valuation Required</b><br>Domanda: `+ question + `<br>Risposta: ` + answer + `<br>Attività: ` + activityID + `</p>
</div>     
<label for="risposta" contenteditable="false">Punteggio della risposta</label><br>
<input id="punt-`+ socketID + `" type="number" name="risposta"><br>
<label for="attivita" contenteditable="false">Prossima attività</label><br>
<select name="attivita" id="att-`+ socketID + `">
`;
    story_played.quests.forEach(quest => {
        quest.activities.forEach(activity => {
            message += `<option value="` + activity.activity_id + `">` + activity.activity_id + `</option>`
        })
    })
    message += `
</select>
<button type="button" onclick="valuateInput(`+ `'` + socketID + `'` + `)">Conferma valutazione</button>
</div>
`
    $('#' + socketID).css('color', 'orange');
    $('#form-' + socketID).before(message);
}


function makeContainer(id, story_ID) {
    players_playing_arr.push(id);
    $('#chatrooms').append('<div id="' + id + '" class="chatroom col-sm-4" contenteditable="true" style="margin-right: 10px; margin-left: 10px; margin-bottom: 10px;overflow-y: auto"><h3>Player ' + id + '</h3></div>')
    let message = `  
    <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false">
<p style="color: yellow">`+ '<b>System Message: User joined.</b>' + `</p>
</div>     
    `
    $('#' + id).append(`  <div id="form-` + id + `" class="form-group"  contenteditable="false">
    <textarea id="text-` + id + `" class="form-control" rows="3"></textarea>
  </div>`)
    $('#' + id).append('<button type="button" class="btn btn-dark" contenteditable="false" onclick="sendMessageToPlayer(' + `'` + id + `'` + ')">Invia</button>')
    $('#form-' + id).before(message);

}

function deleteContainer(id) {
    $('#' + id).fadeOut(function () {
        $('#' + id).remove();
    });
}

function saveRecap() {
    var blob = new Blob([json_to_return], { type: "text/plain;charset=utf-8" });
    json_to_return = "";
    saveAs(blob, "recap.json");
}

$(function () {
    socket = io.connect('', { query: "type=valuator", reconnection: false });
    $.ajax({
        url: '/valuator/activeStories',
        method: 'GET',
        success: function (story) {
            story_played = JSON.parse(story);
            if (story_played) {
                activeStoryName = story_played.story_title;
            }

        },
        error: function (error) {
            console.log("No player connected before the valuator.")
        }
    })
    $.get("/valuator/history", function (history) {
        history = JSON.parse(history)
        if (history) {
            if (history.joins) {
                console.log("History joins found.");
                history.joins.forEach(element => {
                    makeContainer(element)
                    console.log("User of room " + element + " has joined.");
                });
            }
            if (history.messages) {
                console.log("History messages found.");
                history.messages.forEach(element => {
                    if (element.question) {
                        makeValuatorMessage(element.activityID, element.question, element.answer, element.id)
                        console.log("Received a to be valued message from " + element.id + ": " + element.answer);
                    }
                    else if (element.time) {
                        console.log("Received warning message from " + element.id + ": " + element.message);
                        makeWarningMessage(element.id, element.time);
                    }
                    else {
                        console.log("Received message from " + element.id + ": " + element.message);
                        makeChatMessage(element.message, element.id, PLAYER)
                    }
                })
            }
        } else {
            console.log("History was found empty.")
        }
    })
    socket.on('chat-message', (id, message) => {
        console.log("Received a chat message from " + id + ": " + message);
        makeChatMessage(message, id, PLAYER);
    })
    socket.on('player-warning', (data) => {
        console.log("Received a warning message from " + data.socketID + ": " + data.time);
        makeWarningMessage(data.socketID, data.time);
    })

    socket.on('user-joined', (id, story) => {
        console.log("User  " + id + " has joined the story " + story.story_ID);
        if (!story_map.has(story.story_ID)) {
            story_map.set(story.story_ID, { json: story, players: [id] })
        }
        makeContainer(id, story.story_ID);
    })
    socket.on('user-left', (id) => {
        console.log("User  " + id + " left.");
        let index = players_playing_arr.indexOf(id);
        players_playing_arr.splice(index, 1);
        let message = `  
        <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false">
    <p style="color: yellow">`+ '<b>System Message: User left.<b>' + `</p>
    </div>     
        `
        $('#form-' + id).before(message);
        setTimeout(function () {
            deleteContainer(id)
        }, 5000)
        if (players_playing_arr.length == 0) {
            story_played = undefined;
            activeStoryName = undefined;
            players_finished = [];
        }
    })
    socket.on('player-end', (socketID) => {
        players_finished.push(socketID);
        let index = players_playing_arr.indexOf(socketID);
        players_playing_arr.splice(index, 1);
        console.log("User  " + socketID + " has finished.");
        let message = `  
        <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false">
    <p style="color: yellow">`+ '<b>System Message: User finished the story.<b>' + `</p>
    </div>     
        `
        $('#form-' + socketID).before(message);
        setTimeout(function () {
            deleteContainer(socketID)
        }, 5000)
        if (players_playing_arr.length == 0 && players_finished.length > 0) {
            //ending
            $('#defaultdescription').html(`Tutti i player hanno concluso la storia con successo.`);
            $.get("/valuator/return", function (player_data) {
                //stats per socket(local, per activity)
                let temp_player_map = new Map(JSON.parse(player_data));
                //stats per socket(total)
                let socket_stats = new Map();
                let groups = [];
                let quests = [];
                let activities = [];
                //key: socket, value: array of activities
                temp_player_map.forEach((v, k) => {
                    let temp_score = 0;
                    let temp_tta = 0;
                    let temp_cm = 0;
                    v.forEach(activity => {
                        if (!groups.includes(activity.group)) {
                            groups.push(activity.group)
                        }
                        if (!quests.includes(activity.questID)) {
                            quests.push(activity.questID)
                        }
                        if (!activities.includes(activity.activityID)) {
                            activities.push(activity.activityID)
                        }
                        temp_score += parseInt(activity.Score);
                        temp_tta += parseInt(activity.timeToAnswer);
                        temp_cm += parseInt(activity.chatMessages);
                    })
                    socket_stats.set(k, { totalScore: temp_score, totalTimeToAnswer: temp_tta, totalChatMessages: temp_cm, averageScore: (temp_score / v.length), averageTimeToAnswer: temp_tta / v.length, averageChatMessages: temp_cm / v.length })
                })
                //key: group, value: array of activities
                let group_helper = new Map();
                groups.forEach(group => {
                    temp_player_map.forEach((v, k) => {
                        v.forEach(activity => {
                            if (group == activity.group) {
                                if (!group_helper.has(group)) {
                                    group_helper.set(group, [activity])
                                }
                                else {
                                    let temp_array = group_helper.get(group);
                                    temp_array.push(activity);
                                    group_helper.set(group, temp_array)
                                }
                            }
                        })

                    })
                })
                //stats per group
                let group_stats = new Map();
                group_helper.forEach((v, k) => {
                    let temp_g_score = 0;
                    let temp_g_tta = 0;
                    let temp_g_cm = 0;
                    v.forEach(activity => {
                        temp_g_score += parseInt(activity.Score);
                        temp_g_tta += parseInt(activity.timeToAnswer);
                        temp_g_cm += parseInt(activity.chatMessages);
                    })
                    group_stats.set(k, { totalScore: temp_g_score, totalTimeToAnswer: temp_g_tta, totalChatMessages: temp_g_cm, averageScore: (temp_g_score / v.length), averageTimeToAnswer: temp_g_tta / v.length, averageChatMessages: temp_g_cm / v.length })
                })
                let quest_helper = new Map();
                quests.forEach(quest => {
                    temp_player_map.forEach((v, k) => {
                        v.forEach(activity => {
                            if (quest == activity.questID) {
                                if (!quest_helper.has(quest)) {
                                    quest_helper.set(quest, [activity])
                                }
                                else {
                                    let temp_array = quest_helper.get(quest);
                                    temp_array.push(activity);
                                    quest_helper.set(quest, temp_array);
                                }
                            }
                        })
                    })
                })
                //stats per quest
                let quests_stats = new Map();
                quest_helper.forEach((v, k) => {
                    let temp_q_score = 0;
                    let temp_q_tta = 0;
                    let temp_q_cm = 0;
                    v.forEach(activity => {
                        temp_q_score += parseInt(activity.Score);
                        temp_q_tta += parseInt(activity.timeToAnswer);
                        temp_q_cm += parseInt(activity.chatMessages);
                    })
                    quests_stats.set(k, { totalScore: temp_q_score, totalTimeToAnswer: temp_q_tta, totalChatMessages: temp_q_cm, averageScore: (temp_q_score / v.length), averageTimeToAnswer: temp_q_tta / v.length, averageChatMessages: temp_q_cm / v.length })
                })
                let activity_helper = new Map();
                activities.forEach(activity => {
                    temp_player_map.forEach((v, k) => {
                        v.forEach(sub_activity => {
                            if (activity == sub_activity.activityID) {
                                if (!activity_helper.has(activity)) {
                                    activity_helper.set(activity, [sub_activity])
                                }
                                else {
                                    let temp_array = activity_helper.get(activity);
                                    temp_array.push(sub_activity);
                                    activity_helper.set(activity, temp_array);
                                }
                            }
                        })
                    })
                })
                let activity_stats = new Map();
                activity_helper.forEach((v, k) => {
                    let temp_a_score = 0;
                    let temp_a_tta = 0;
                    let temp_a_cm = 0;
                    v.forEach(activity => {
                        temp_a_score += parseInt(activity.Score);
                        temp_a_tta += parseInt(activity.timeToAnswer);
                        temp_a_cm += parseInt(activity.chatMessages);
                    })
                    activity_stats.set(k, { totalScore: temp_a_score, totalTimeToAnswer: temp_a_tta, totalChatMessages: temp_a_cm })
                })
                var ctx1 = document.getElementById('chart1').getContext('2d');
                ctx_labels = [];
                ctx1_points = [];
                ctx2_points = [];
                ctx3_points = [];
                ctx_colors = [];
                ctx_bcolors = []
                activity_stats.forEach((v, k) => {
                    ctx_labels.push(k);
                    ctx1_points.push(v.totalScore);
                    ctx2_points.push(v.totalTimeToAnswer);
                    ctx3_points.push(v.totalChatMessages);
                    ctx_colors.push('rgb(255,255,255)');
                    ctx_bcolors.push('rgb(211,211,211)');
                })
                var scoreChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ctx_labels,
                        datasets: [{
                            label: 'totalScore',
                            data: ctx1_points,
                            backgroundColor: ctx_colors,
                            borderColor: ctx_bcolors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
                var ctx2 = document.getElementById('chart2').getContext('2d');
                var ttaChart = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ctx_labels,
                        datasets: [{
                            label: 'TimeToAnswer',
                            data: ctx2_points,
                            backgroundColor: ctx_colors,
                            borderColor: ctx_bcolors,
                            borderWidth: 2
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
                var ctx3 = document.getElementById('chart3').getContext('2d');
                var cmChart = new Chart(ctx3, {
                    type: 'bar',
                    data: {
                        labels: ctx_labels,
                        datasets: [{
                            label: 'chatMessages',
                            data: ctx3_points,
                            backgroundColor: ctx_colors,
                            borderColor: ctx_bcolors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
                $('#charts').fadeIn();
                let recap_object = new Object();
                recap_object.perSocketActivityStats = [...temp_player_map];
                recap_object.perSocketGlobalStats = [...socket_stats];
                //test if the order is correct
                recap_object.perSocketGlobalStats.sort((a, b) => a.temp_score > b.temp_score ? 1 : -1);
                recap_object.perGroupStats = [...group_stats];
                recap_object.perQuestStats = [...quests_stats]
                json_to_return = JSON.stringify(recap_object)
                $('#storyname').remove();
                $('#defaultdescription').html(`Tutti i player hanno concluso la storia con successo. Clicca sul pulsante sottostante per scaricare informazioni sulla partita in formato JSON.<br><button type="button"
                    class="btn btn-dark" onclick="saveRecap()">Salva</button>`);
            })
            story_played = undefined;
            activeStoryName = undefined;
            players_finished = [];
        }
    })
    socket.on('valuate-input', (activityID, question, answer, socketID) => {
        console.log("Input to be valued received: ", activityID, question, answer)
        makeValuatorMessage(activityID, question, answer, socketID);
    })
})