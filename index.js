var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL = "mongodb://admin:Fitadmin@ds121696.mlab.com:21696/exercise-journal"

app.get("/", function(req, res) {
	res.sendfile("index.html");
});

app.get("/controller.js", function(req, res) {
	res.sendfile("controller.js");
});

app.get("/ex", function(req, res){ 
    MongoClient.connect(databaseURL, function(err, client) {

        if (client) {
            console.log("Connected to client");
            console.log(client);
            var db = client.db('exercise-journal');

            console.log("Database");
            console.log(db);

            var workoutCollection = db.collection("workouts");
            console.log("Collection");
            console.log(workoutCollection);

            workoutCollection.find({}).toArray(function(err, results) {
                if (results) {
                    console.log(results);
                }
            });
        }

        else {
            console.log("Error connecting to Database");
            console.log(err);
        }

    });
});


app.listen(3000);
