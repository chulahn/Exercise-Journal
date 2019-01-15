var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL =
  "mongodb://admin:Fitadmin@ds121696.mlab.com:21696/exercise-journal";
var ObjectId = require("mongodb").ObjectId;

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.get("/", function(req, res) {
  res.sendfile("index.html");
});

app.get("/style.css", function(req, res) {
  res.sendfile("style.css");
});

app.get("/controller.js", function(req, res) {
  res.sendfile("controller.js");
});

app.get("/jan14update/", function(req, res) {
  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        console.log("Connected to client");
        //console.log(client);
        var db = client.db("exercise-journal");

        var workoutCollection = db.collection("workouts");

        var userCollection = db.collection("users");

        var firstUser = {};

        firstUser.id = 0;
        firstUser.user_name = "admin";
        firstUser.email = "ADMIN";
        firstUser.created = new Date();
        firstUser.exercises = [];

        var secondUser = Object.assign({}, firstUser);

        secondUser.id = 1;
        secondUser.user_name = "chulahn";
        secondUser.email = "ahn.chul@gmail.com";
        secondUser.created = new Date();

        res.json(firstUser);

        // firstUser has been altered from secondUser's calls.

        // userCollection.insert(firstUser, function(err, results) {
        //   if (err) {
        //     console.log("Insert firstUser error");
        //     console.log(err);
        //     res.status(400).send(err);
        //   } else {
        //     console.log("Successful insert");
        //     console.log(results);
        //     res.send(req.body);
        //   }
        // });
      }
    }
  );
});

// Return's all workouts for a users.
// Called by controller initially, to load data.
app.get("/ex", function(req, res) {
  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        console.log("Connected to client");
        //console.log(client);
        var db = client.db("exercise-journal");

        console.log("Database");
        //console.log(db);

        var workoutCollection = db.collection("workouts");
        console.log("Collection");
        //console.log(workoutCollection);

        workoutCollection.find({}).toArray(function(err, results) {
          if (results) {
            console.log(results);
            res.send(results);
          }
        });
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    }
  );
});

// Insert a workout
app.post("/ex", function(req, res) {
  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        console.log("---POST:Connected to client");

        var db = client.db("exercise-journal");
        var workoutCollection = db.collection("workouts");

        console.log(req.body);
        workoutCollection.insert(req.body, function(err, results) {
          if (err) {
            console.log("Insert workout error");
            console.log(err);
            res.status(400).send(err);
          } else {
            console.log("Successful insert");
            console.log(results);
            res.send(req.body);
          }
        });
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    }
  );
});

// Update a workout.  Called when Updating, or resyncing.
app.post("/update/:exId", function(req, res) {
  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        console.log("---POST:Connected to client");

        var db = client.db("exercise-journal");
        var workoutCollection = db.collection("workouts");

        var copy = req.body;
        delete copy._id;
        var o_id = new ObjectId(req.params.exId);

        workoutCollection.update({ _id: o_id }, { $set: copy }, function(
          err,
          results
        ) {
          if (err) {
            console.log("Edit Search workout error");
            console.log(err);
            res.status(400).send(err);
          } else {
            console.log("Successful edit search");
            console.log(results);
            res.send(copy);
          }
        });
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    }
  );
});

// Deletes an exercise.
app.post("/delete/:exId", function(req, res) {
  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        console.log("---POST:Connected to client");

        var db = client.db("exercise-journal");
        var workoutCollection = db.collection("workouts");

        var o_id = new ObjectId(req.params.exId);

        workoutCollection.deleteOne({ _id: o_id }, function(err, results) {
          if (err) {
            console.log("Edit Search workout error");
            console.log(err);
            res.status(400).send(err);
          } else {
            console.log("Successful edit search");
            console.log(results);
            res.send(results);
          }
        });
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    }
  );
});

app.listen(process.env.PORT || 3000);
