var allWorkouts;
$(document).ready(function() {


  if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    if (localStorage.allWorkouts) {
      console.log("Has workout.  Loading");
      console.log(localStorage.allWorkouts);
      allWorkouts = JSON.parse(localStorage.allWorkouts);
      //display Previous workouts

      var outputHTML = "";
      for (var i=0; i<allWorkouts.length; i++) {
        //display date
        var thisDate = new Date(allWorkouts[i].date);
        var dateHTML = "<tr><td>";
        dateHTML += thisDate.toDateString();
        dateHTML += "</td></tr>";

        //display exercises
        var exercises = allWorkouts[i].exercises;
        var exHTML = "";
        for(var j=0; j<exercises.length; j++) {
          var currentEx = exercises[j];

          exHTML += "<tr><td>";
          exHTML += currentEx.name;
          exHTML += "</td><td>"
          exHTML += currentEx.weight;
          exHTML += "</td></tr>";
        }
        outputHTML += dateHTML + exHTML;
      }
      $('.exerciseList').append(outputHTML);

    } else {
      console.log("No workouts");
      localStorage.allWorkouts = JSON.stringify([]);

    }

  } else {
    // Sorry! No Web Storage support..
  }

  $('#addWorkout').click(function() {
    //console.log("Button clicked");

    //Get values
    var name = $('#exerciseName').val();
    var weight = $('#exerciseWeight').val();

    //Create HTML only if both values are entered
    //Search if date is already added then add in that slot, else new entry.
    if (name !== "" && weight !== "") {

      //Create exercise object to be added
      var thisExercise = {};
      thisExercise.name = name;
      thisExercise.weight = weight;

      //Search if current date already has exercises.
      //create new Date again to remove Time
      var thisDate = new Date();
      thisDate = new Date(thisDate.toDateString());

      var dateIndex = _.findIndex(JSON.parse(localStorage.allWorkouts), function(o) {
        console.log(o);
        console.log(new Date(JSON.parse(o).date));
        return new Date(JSON.parse(o).date).getTime() == thisDate.getTime();
      });
      console.log("date index : " + dateIndex);

      //That Date has no exercises yet, add date and exercise to localStorage.
      //each workout has a Date, and array of exercise Objects with name and weight.
      if (dateIndex === -1) {
        var workout = {};
        workout.date = thisDate;

        workout.exercises = [];
        workout.exercises.push(thisExercise);

        var a = JSON.parse(localStorage.allWorkouts)
        //Stringify object
        a.push(JSON.stringify(workout));
        console.log(a);
        //Stringify array again.
        localStorage.allWorkouts = JSON.stringify(a);

      }
      //Date has exercises, just push thisExercise
      else {
        var a = JSON.parse(localStorage.allWorkouts);
        //console.log(a);

        //localStorage[dateIndex]
        var b = a[dateIndex];
        b = JSON.parse(b);
        //console.log(b);
        b.exercises.push(thisExercise);
        //console.log(b.exercises);
        //console.log(b);
        //console.log(a[dateIndex]);

        //a[dateIndex] = b
        a[dateIndex] = b;
        //console.log(a);
        localStorage.allWorkouts = JSON.stringify(a);
        //console.log(JSON.parse(localStorage.allWorkouts));
      }

      var outputHTML = "<tr><td>";
      outputHTML += name;
      outputHTML += "</td><td>"
      outputHTML += weight;
      outputHTML += "</td></tr>";

      //Add HTML to Table
      $('.exerciseList').append(outputHTML);
    }
    else {
      //Highlight in red;
    }
  });

  $('#clearWorkouts').click(function() {
    localStorage.removeItem("allWorkouts");
  });


});
