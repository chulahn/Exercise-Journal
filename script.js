$(document).ready(function() {
  console.log("Page loaded");

  $('#addWorkout').click(function() {
    //console.log("Button clicked");

    //Get values
    var name = $('#exerciseName').val();
    var weight = $('#exerciseWeight').val();

    //Create HTML only if both values are entered
    if (name !== "" && weight !== "") {
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
});
