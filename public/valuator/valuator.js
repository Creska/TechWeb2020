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