const express = require('express');
const app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/hello', function (req, res) {
    res.send('Hello World')
})

app.post('/login', function (req, res) {
    console.log("Username:" + req.body.user);
    console.log("Password:" + req.body.pwd);
    res.send("<p>POST Done!</p>")
});

app.get('/login', function (req, res) {
    console.log("Username:" + req.query.user);
    console.log("Password:" + req.query.pwd);
    res.send("<p>GET Done!</p>")
});


app.listen(3000, function () {
    console.log("Listening on port 3000!")
})