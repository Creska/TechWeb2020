const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
// const ChatService = require('chat-service')
// const chatport = 8000

// function onConnect(service, id) {
//     // Assuming that auth data is passed in a query string.
//     let { query } = service.transport.getHandshakeData(id)
//     let { userName } = query
//     // Actually check auth data.
//     // ...
//     // Return a promise that resolves with a login string.
//     return Promise.resolve(userName)
// }

// const chatService = new ChatService({ chatport }, { onConnect })

// process.on('SIGINT', () => chatService.close().finally(() => process.exit()))

// chatService.hasRoom('default').then(hasRoom => {
//     if (!hasRoom) {
//         return chatService.addRoom('default', { owner: 'admin' })
//     }
// })

// app.use(bodyParser.urlencoded({ extended: true }));

app.get('/hello', function (req, res) {
    res.send('Hello World')
})

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

app.get('/player', function (req, res) {
    var game = req.query.game;
    //todo game handling
    fs.readFile("../games/" + game).then(file => {
    //loading the json data into the html. I actually don't know how.
    })

})

app.listen(3000, function () {
    console.log("Listening on port 3000!")
})