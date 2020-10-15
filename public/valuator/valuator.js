var storyNameTimer; //global timer to retrieve active stories
var storyDataTimer; //global timer tor retrieve information for the stories
var activeStories; //known active stories
var defaultPageTitle = 'Ambiente Valutatore';
var defaultDescription = "Benvenuto. Qui avrai ha disposizione l'editor potenziato per le storie e l'applicazione per il supporto dei giocatori."
var pageLocation = 0;
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
        url: 'localhost:3000/valuator/activeStoriesNames',
        method: 'GET',
        success: function (data) {
            activeStories = data;
            $('#support').fadeIn();
            $('#home').removeClass('active');
            $('#defaulth1').html(defaultPageTitle + ": Supporto")
            if (data.length) {
                makeDropdown(data);
            }
            else {
                $('#defaultdescription').html('Al momento non sono attive storie. Puoi restare su questa schermata, in attesa che inizino.');
            }
            $('#defaultdescription').html('Qui puoi fornire aiuto e vedere alcune statistiche riguardo a tutte le storie che stanno venendo giocate in questo momento.<br>Il gioco attualmente selezionato è quello postfisso al simbolo ":" nel dropdown.');
            startNameTimer();
        },
        error: function (error) {
            //TODO error handling
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
                $('#support').fadeOut();
                stopNameTimer();
                stopDataTimer();
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
function makeDropdown(data) {
    var stories_dropdowns = "";
    data.forEach((item) => {
        stories_dropdowns += "<a class='dropdown-item' id='" + item.story_ID + " onclick='updateDropdown(this.id,'" + item.story_name + "')'>" + item.story_name + "</a>"
    })
    $('#dropdownstories').html(stories_dropdowns);
}
function updateDropdown(id, story_name) {
    $('#dropdownbutton').html("Storie:" + story_name);
    //TODO I have to decide how to show the information for the story.
    //activate the story timer only for this specific story, disable the precedent one
}

function startNameTimer() {
    storyNameTimer = setInterval(() => {
        $.ajax({
            url: 'localhost:3000/valuator/activeStoriesNames',
            method: 'GET',
            success: function (data) {
                if (data.length) {
                    if (activeStories.length) {
                        makeDropdown(data);
                    }
                    else {
                        //it's 0, so there were no active stories before, different message
                        $('#defaultdescription').html('Delle storie stanno ora venendo giocate. Qui puoi fornire aiuto e vedere alcune statistiche riguardo a tutte le storie che stanno venendo giocate in questo momento.<br>Il gioco attualmente selezionato è quello postfisso al simbolo ":" nel dropdown.');
                        activeStories = data;
                        makeDropdown(data);
                    }
                }
            },
            error: function (error) {
                //TODO error handling
            }
        })
    }, 5000);
}

function startDataTimer() {
    storyDataTimer = setInterval(() => {
        //TODO data handling
    }, 5000)
}
function stopNameTimer() {
    clearInterval(storyNameTimer)
}
function stopDataTimer() {
    clearInterval(storyDataTimer)
}

function valuateInput(answer_is_right, socketID) {
    //the answer was valuated, sending whether or not it is right to the server, and then to the player
    socket.emit('validate-input-valuator', answer_is_right, socketID);
}
$(function () {
    var socket = io.connect('', { query: "type=valuator" });
    $.get("/valuator/history", function (data) {
        if (data) {
            if (data.joins) {
                console.log("History joins found.");
                data.joins.forEach(element => {
                    console.log("User of room " + element + " has joined.");
                });
            }
            if (data.messages) {
                console.log("History messages found.");
                data.messages.forEach(element => {
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
    })
})