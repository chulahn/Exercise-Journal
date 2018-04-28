var express = require("express");
var app = express();

app.get("/", function(req, res) {
	res.sendfile("index.html");
});

app.get("/controller.js", function(req, res) {
	res.sendfile("controller.js");
});


app.listen(3000);
