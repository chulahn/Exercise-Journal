var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL = "mongodb://admin:Fitadmin@ds121696.mlab.com:21696/exercise-journal"

// var bodyParser = require('body-parser')
// app.use( bodyParser.json() );       // to support JSON-encoded bodies
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//     extended: true
// }));

// app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies


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
                    res.send(results)
                }
            });
        }

        else {
            console.log("Error connecting to Database");
            console.log(err);
        }

    });
});

app.post("/ex", function(req,res) {
    MongoClient.connect(databaseURL, function(err, client) {

        if (client) {
            console.log("---POST:Connected to client");
            
            var db = client.db('exercise-journal');
            var workoutCollection = db.collection("workouts");
            
            console.log(req.body);
            workoutCollection.insert(req.body, function(err,results) {
                if (err) {
                    console.log("Insert workout error");
                    console.log(err);
                }
                else {
                    console.log("Successful insert");
                    console.log(results);
                }
            })
        }

        else {
            console.log("Error connecting to Database");
            console.log(err);
        }
    });
});


app.listen(3000);
