var storyNameTimer; //global timer to retrieve active stories
var storyDataTimer; //global timer tor retrieve information for the stories
var activeStoryName; //known active stories
var defaultPageTitle = 'Ambiente Valutatore';
var defaultDescription = "Benvenuto. Qui avrai ha disposizione l'editor potenziato per le storie e l'applicazione per il supporto dei giocatori."
var pageLocation = 0;
let players = new Map(); //key: socket.id, value: player number
var player_count = 0;
//pagelocations: Home(0) | Support(1) | Editor(2) 
/** TODO
 * => remove story when it gets closed 
 * => dynamic load of story
 * 
 * 
 */
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
        url: '/valuator/activeStoryName',
        method: 'GET',
        success: function (name) {
            let data = JSON.parse(name);
            if (data) {
                activeStoryName = data;
                $('#support').fadeIn();
                $('#home').removeClass('active');
                $('#defaulth1').html(defaultPageTitle + ": Supporto")
                $('#defaultdescription').html('Qui puoi fornire aiuto e vedere alcune statistiche riguardo alla storia che sta venendo giocata in questo momento.');
                showStoryChat(data);
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

function makeChatMessage(text, owner) {
    //owner is the socket ID
    if (owner == "self") {
        let message = `  
        <div class="container-chat darker-chat">
  <p>`+ text + `</p>
  <span class="time-left-chat">`+ timeStamp() + `</span>
  </div>     
        `
        //message sent from me, this means that the container for the player already exist
        $('#' + owner).append(message)
    }
    else {
        let message = `
        <div class="container-chat">
  <p>`+ text + `</p>
  <span class="time-right-chat">`+ timeStamp() + `</span>
 </div>
        `
        //message sent from someone else
        if (!$('#' + owner)) {
            //the chat container for that socket doesn't exists
            makeContainer(owner);
        }
        $('#' + owner).append(message)
    }
    //https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_chat
}


function makeWarningMessage(socketID, time) {
    //TODO render chat message
    //the idea is that there will be only one warning message at a time, rendered above all else
}

function makeValuatorMessage(question, answer, socketID) {
    //TODO render messages to be valued, they will be shown as special chat messages
}


function makeContainer(id) {
    player_count++;
    players.set(id, player_count);
    $('#chatrooms').append('<div id="' + id + '" class="chatroom" style="margin-right: 10px; margin-left: 10px"><h3>Player ' + player_count + '</h3></div>')
    let message = `  
    <div class="container-chat darker-chat col-sm overflow-auto">
<p style="color: yellow">`+ 'System Message: User joined.' + `</p>
</div>     
    `
    $('#' + id).append(message)
}

function deleteContainer(id) {
    $('#' + id).fadeOut();
}

function valuateInput() {
    //TODO still don't know where to get nextQuest, number and score
    socket.emit('validate-input-valuator', nextQuest, number, score, socketID);
}
$(function () {
    var socket = io.connect('', { query: "type=valuator" });
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
                    makeChatMessage(element.message, element.id)
                    console.log("Received a chat message from " + element.id + ": " + element.message);
                })
            }
        } else {
            console.log("History was found empty.")
        }
    })
    $('form').submit(function (e) {
        e.preventDefault();
        console.log(socket.id);
        socket.emit('valuator-message', $('#message').val());
        $('#message').val('');
        return false;
    })
    socket.on('chat-message', (message, id) => {
        //maybe adding chat ack
        console.log("Received a chat message from " + id + ": " + message);
    })
    socket.on('player-warning', (data) => {
        makeWarningMessage(data.socketID, data.time);
    })

    socket.on('user-joined', (id) => {
        console.log("User  " + id + " has joined.");
        //TODO creating a chat-room div for that room
    })
    socket.on('user-left', (id) => {
        console.log("User  " + id + " left.");
        //TODO removing the chat-room div of that room
    })
    socket.on('valuate-input', (question, answer, socketID) => {
        /*TODO creating input field for the answer to be valued
        It will show the question of the activity and the answer given by the player
        Dynamically creating a prompt with jQuery for that, that will execute a function
        I do this because I can't do callbacks between clients with socket.io, so I need
        something to hold the values for this specific answer
        this fragment will execute valuateInput()
        */
        makeValuatorMessage(question, answer, socketID);
    })
})