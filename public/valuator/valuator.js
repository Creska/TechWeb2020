var activeStoryName; //known active stories
var story_played;
var defaultPageTitle = 'Ambiente Valutatore';
var defaultDescription = "Benvenuto. Qui avrai ha disposizione l'editor potenziato per le storie e l'applicazione per il supporto dei giocatori."
var pageLocation = 0;
let players = new Map(); //key: socket.id, value: player number
var player_count = 0;
var socket;
let last_unused = [];
const PLAYER = 0;
const VALUATOR = 1;
//pagelocations: Home(0) | Support(1) | Editor(2) 
function renderEditor() {
    pageLocation = 2;
    $('#bottoneditor').fadeOut();
    $('#bottonesupport').fadeOut();
    $('#editor').fadeIn();
    $('#home').removeClass('active');
    $('#defaulth1').html(defaultPageTitle + ": Editor")
    $('#defaultdescription').html("Qui è presente un editor potenziato, rispetto all'ambiente editore, con cui potrai gestire le storie e crearne di nuove.");
    //rendering the editor
}
function renderSupport() {
    pageLocation = 1;
    $('#bottoneditor').fadeOut();
    $('#bottonesupport').fadeOut();
    //rendering the dropdown stories menu
    $.ajax({
        url: '/valuator/activeStories',
        method: 'GET',
        success: function (story) {
            story_played = JSON.parse(story);
            console.log(story_played);
            if (story_played) {
                activeStoryName = story_played.story_title;
                $('#support').fadeIn();
                $('#home').removeClass('active');
                $('#defaulth1').html(defaultPageTitle + ": Supporto")
                $('#defaultdescription').html('Qui puoi fornire aiuto e vedere alcune statistiche riguardo alla storia che sta venendo giocata in questo momento.');
                showStoryChat();
            }
            else {
                $('#defaultdescription').html('Al momento non sono è attiva una storia. Puoi restare su questa schermata, in attesa che inizi.');
            }
        },
        error: function (error) {
            //TODO error handling
            console.error(error);
            $('#defaulth1').html(defaultPageTitle + ": Supporto")
            $('#defaultdescription').html('Errore durante il caricamento delle storie, si prega di ritornare nel menù principale e di riprovare.');
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
                break;

            case 2:
                $('#editor').fadeOut();
                break;
        }
        $('#bottoneditor').fadeIn();
        $('#bottonesupport').fadeIn();
        $('#home').addClass('active');
        $('#defaulth1').html(defaultPageTitle);
        $('#defaultdescription').html(defaultDescription);
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
    let nextActivity = $('#att-' + socketID).val();
    console.log("the score is", score, "\nthe nextActivity is", nextActivity);
    socket.emit('validate-input-valuator', nextActivity, score, socketID)
    $(`#val-` + socketID).html('<p style="color:orange">Risposta inviata con successo.</p>');
    setTimeout(function () {
        $(`#val-` + socketID).fadeOut();
        $(`#warn-` + socketID).fadeOut();
        $('#' + socketID).css('color', 'white');
    }, 3000)
}


function makeWarningMessage(socketID, time) {
    //probably won't use time
    if ($('#warn-' + socketID) == undefined) {
        let message = ` <div id="warn-` + socketID + `" style="border: 1px solid red">
        <div class="container-chat darker-chat overflow-auto" contenteditable="false">
        <p>Attenzione: questo player ha superato il tempo previsto per rispondere all'attività corrente.</p>
        </div>
        </div>`
        $('#form-' + socketID).before(message);
    }
}

function makeValuatorMessage(question, answer, socketID) {
    let message = `  
    <div id="val-`+ socketID + `" style="border: 1px solid orange">
    <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false"">
<p style="color: orange"><b>System Message: Valuation Required</b><br>Domanda: `+ question + `<br>Risposta: ` + answer + `</p>
</div>     
<label for="risposta">Punteggio della risposta</label><br>
<input id="punt-`+ socketID + `" type="number" name="risposta"><br>
<label for="attivita">Prossima attività</label><br>
<input id="att-`+ socketID + `" type="text" name="attivita" maxlength="8" size="8"><br>
<button type="button" onclick="valuateInput(`+ `'` + socketID + `'` + `)">Conferma valutazione</button>
</div>
`
    $('#' + socketID).css('color', 'orange');
    $('#form-' + socketID).before(message);
}


function makeContainer(id) {
    let player_id;
    if (last_unused.length > 0) {
        player_id = last_unused.pop();
    }
    else {
        player_count++;
        player_id = player_count

    }
    players.set(id, player_count);
    $('#chatrooms').append('<div id="' + id + '" class="chatroom col-sm-4" contenteditable="true" style="margin-right: 10px; margin-left: 10px; margin-bottom: 10px;overflow-y: auto"><h3>Player ' + player_id + '</h3></div>')
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
    $('#' + id).fadeOut();
}

$(function () {
    socket = io.connect('', { query: "type=valuator" });
    //TODO actually store the messages
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
                    makeChatMessage(element.message, element.id, PLAYER)
                    console.log("Received a chat message from " + element.id + ": " + element.message);
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
        makeWarningMessage(data.socketID, data.time);
    })

    socket.on('user-joined', (id) => {
        console.log("User  " + id + " has joined.");
        makeContainer(id);
    })
    socket.on('user-left', (id) => {
        players.delete(id);
        last_unused.push(player_count);
        player_count--;
        console.log("User  " + id + " left.");
        let message = `  
        <div class="container-chat darker-chat col-sm overflow-auto" contenteditable="false">
    <p style="color: yellow">`+ 'System Message: User left.' + `</p>
    </div>     
        `
        $('#form-' + id).before(message);
        setTimeout(function () {
            $('#' + id).fadeOut();
        }, 5000)
        if (player_count == 0) {
            story_played = undefined;
            activeStoryName = undefined;
        }

    })
    socket.on('valuate-input', (question, answer, socketID) => {
        makeValuatorMessage(question, answer, socketID);
    })
})