angular
  .module("app", [])

  .controller("dataController", [
    "$scope",
    "$http",
    function($scope, $http) {
      // Default Exercises
      $scope.exercises = [
        { name: "Press", weight: 135, rep: 5, time: new Date("4/28/16 18:16") },
        { name: "Bench", weight: 135, rep: 5, time: new Date("4/28/16 18:17") },
        { name: "Squat", weight: 135, rep: 5, time: new Date("4/28/16 18:19") },
        { name: "Squat", weight: 135, rep: 5, time: new Date("4/8/16 18:19") },
        { name: "Squat", weight: 135, rep: 5, time: new Date("4/18/16 18:19") }
      ];
      $scope.days = [];

      $scope.editMode = false;
      $scope.deleteMode = false;

      // Get data from database and set $scope.exercises.  Then try to resync
      // If no connection, load localStorage
      initializeData = function() {
        $http
          .get("/ex")
          .success(function(data) {
            console.log("Successful connect ", data);
            $scope.exercises = data;
            $scope.convertData(data);

            var unsyncedObject = $.parseJSON(localStorage.getItem("unsynced"));
            if (unsyncedObject && unsyncedObject.exercisesToAdd) {
              resync(unsyncedObject);
            }

            // If LocalStorage isnt set, set it
            if (localStorage.getItem("localData") == null) {
              localStorage.setItem("localData", JSON.stringify(data));
              console.log("LocalData was null. Set localData");
            }
          })
          .error(function(data) {
            // Use local data :UNTESTED
            alert("Failed initial connected: Using LocalData");
            console.log("Non successful initial connect");

            var localData = $.parseJSON(localStorage.getItem("localData"));
            if (
              localData &&
              localData.length > 0 &&
              typeof localData === "object"
            ) {
              console.log("localData: ", localData);
              $scope.exercises = localData;
              $scope.convertData(localData);
            }
          });
      };

      // Private method called after successful Add/Delete/Edit exercise
      // Reloads and converts data again
      reloadAndConvertData = function() {
        $http
          .get("/ex")
          .success(function(data) {
            $scope.exercises = data;
            $scope.convertData(data);
          })
          //TODO: THINK ABOUT THIS CASE
          .error(function(data) {
            console.log("reloadAndConvertData");
            console.log(data);
          });
      };

      initializeData();

      // If there are exercises that havent been added to the database but added to localStorage, add them
      // TODO: Also remove them
      resync = function(unsyncedObject) {
        for (var i = 0; i < unsyncedObject.exercisesToAdd.length; i++) {
          var ex = unsyncedObject.exercisesToAdd[i];
          addUnsyncedExercise(ex, unsyncedObject);
        }
      };

      // Add unsynced exercises
      // Remove them from unsyncedObject
      // Update localStorage with new database data.
      // If no connection, they are still unsynced
      addUnsyncedExercise = function(exercise, unsyncedObject) {
        console.log("addUnsyncedExercise: ", exercise);
        var postRequest = {
          method: "POST",
          url: "/ex",
          data: exercise
        };

        $http(postRequest)
          .success(function(data) {
            console.log("Success addUnsyncedExercise ", data);
            $http
              .get("/ex")
              .success(function(data) {
                for (var i = 0; i < unsyncedObject.exercisesToAdd.length; i++) {
                  var ex = unsyncedObject.exercisesToAdd[i];
                  if (ex == exercise) {
                    unsyncedObject.exercisesToAdd.splice(i, 1);
                    console.log("Removing ", unsyncedObject);
                    alert("Removed");
                    localStorage.setItem(
                      "unsynced",
                      JSON.stringify(unsyncedObject)
                    );
                  }
                }
                localStorage.setItem("localData", JSON.stringify(data));
                $scope.exercises = data;
                $scope.convertData(data);
              })
              .error(function(data) {
                console.log("Non successful:add reload");
                console.log(data);
              });
          })
          .error(function(data) {
            // When connection lost, store in localStorage exercises to add
            // So when internet is available, the resync method will be called.
            console.log("No connection when addUnsyncedExercise");
          });
      };

      // Convert data so that each day is an object in the array with its own exercises array.
      $scope.convertData = function(data) {
        // Data
        // [ {_id: "5ae9f96bfb38c52b4626458a", name: "Squat", weight: 100, rep: 5, time: "2018-05-02T17:46:19.664Z", …} ,
        // {_id: "5aea0fb3402dd82cd77c2418", name: "Bench", weight: 100, rep: 5, time: "2018-05-02T19:21:23.590Z", …} ]
        // convertedData
        // {5/2/2018 : {date: Wed May 02 2018 13:46:19 GMT-0400 (Eastern Daylight Time), exercises: Array(2), $$hashKey: "object:3", collapsed: true}}
        // mapped
        // [{date: Wed May 02 2018 13:46:19 GMT-0400 (Eastern Daylight Time), exercises: Array(2), $$hashKey: "object:3", collapsed: true}]

        var convertedData = {};

        // For each exercise
        // Get the date and set as Key
        // If it doesnt exist, create new exercises array
        // else push exercise
        for (var i = 0; i < data.length; i++) {
          var currentEx = data[i];
          var currentExDate = new Date(currentEx.time);
          //eg. currentEx.date = "5/2/2018"
          currentEx.date = currentExDate.toLocaleDateString();

          if (convertedData[currentExDate.toLocaleDateString()] === undefined) {
            var dayData = {};
            dayData.date = currentExDate;
            dayData.exercises = [];
            dayData.exercises.push(currentEx);

            convertedData[currentExDate.toLocaleDateString()] = dayData;
          } else {
            convertedData[currentExDate.toLocaleDateString()].exercises.push(
              currentEx
            );
          }
        }

        $scope.convertedData = convertedData;
        console.log($scope.convertedData);

        $scope.days = Object.keys($scope.convertedData).map(function(key) {
          // Take Date Key 5/2/2018
          // Create Array of Objects with date and exercises
          // console.log(key)
          // console.log($scope.convertedData[key])
          return $scope.convertedData[key];
        });
        console.log($scope.days);
      };

      // Called when Add Exercise button is clicked
      // Gets Input and creates new Exercise Object
      // Adds to database, and reloads data
      // If no connection, add to unsyncedObject
      $scope.addExercise = function() {
        var newExercise = {};
        newExercise.name = $scope.exerciseName;
        newExercise.weight = $scope.exerciseWeight || 0;
        newExercise.rep = $scope.exerciseRep || 0;
        if (
          $scope.exerciseTime != null
            ? (newExercise.time = new Date($scope.exerciseTime))
            : (newExercise.time = new Date())
        )
          console.log("Exercise to add: ", newExercise);
        $scope.exercises.push(newExercise);
        $scope.convertData($scope.exercises);

        var postRequest = {
          method: "POST",
          url: "/ex",
          data: newExercise
        };

        $http(postRequest)
          .success(function(data) {
            console.log("Success add ", data);
            reloadAndConvertData();
          })
          .error(function(data) {
            // When connection lost, store in localStorage exercises to add
            // So when internet is available, the resync method will be called.
            console.log("Error");
            var unsyncedObject = $.parseJSON(localStorage.getItem("unsynced"));

            if (!unsyncedObject) {
              unsyncedObject = {};
              unsyncedObject.exercisesToAdd = [];
            }
            console.log("unsyncedObject: ", unsyncedObject);

            unsyncedObject.exercisesToAdd.push(newExercise);
            unsyncedObject.lastEdited = new Date();
            localStorage.setItem("unsynced", JSON.stringify(unsyncedObject));
            console.log("added exercise: ", unsyncedObject);
          });
      };

      // Debugging method.  Useless
      $scope.logData = function() {
        console.log($scope.exercises);

        var text = JSON.stringify($scope.exercises);
        console.log(text);

        console.log($.parseJSON(text));
      };

      // Toggles Edit Mode.
      // Clicking Edit a second time turns off green header, deselects edit-selected, and clears Input
      // Clicking Edit from delete mode, deselects delete-selected, and clearsInput
      $scope.toggleEdit = function() {
        $scope.editMode = !$scope.editMode;

        if (!$scope.editMode) {
          $(".edit-selected").removeClass("edit-selected");
          clearExerciseInputs();
        }

        if ($scope.deleteMode) {
          $scope.deleteMode = false;
          $(".delete-selected").removeClass("delete-selected");
          clearExerciseInputs();
        }
      };

      // Same as Toggle Edit
      $scope.toggleDelete = function() {
        $scope.deleteMode = !$scope.deleteMode;

        if (!$scope.deleteMode) {
          $(".delete-selected").removeClass("delete-selected");
          clearExerciseInputs();
        }

        if ($scope.editMode) {
          $scope.editMode = false;
          $(".edit-selected").removeClass("edit-selected");
          clearExerciseInputs();
        }
      };

      // Depending on edit or delete mode
      // Newly clicked item will be highlighted
      // and have information filled so $scope.addExercise() is ready to be called.
      $scope.fillExerciseInfo = function(ex, $event) {
        if ($scope.editMode) {
          $(".edit-selected").removeClass("edit-selected");
          $($event.currentTarget).addClass("edit-selected");
        } else if ($scope.deleteMode) {
          $(".delete-selected").removeClass("delete-selected");
          $($event.currentTarget).addClass("delete-selected");
        }

        if ($scope.editMode || $scope.deleteMode) {
          $scope.exerciseName = ex.name;
          $scope.exerciseWeight = ex.weight;
          $scope.exerciseRep = ex.rep;
          $scope.exerciseTime = ex.time;

          //fill hidden input
          $scope.exerciseId = ex._id;
        } else {
          console.log("Not in edit mode");
        }
      };

      // Private helper method for toggleEdit/toggleDelete
      function clearExerciseInputs() {
        $scope.exerciseName = null;
        $scope.exerciseWeight = null;
        $scope.exerciseRep = null;
        $scope.exerciseTime = null;

        //clear hidden input
        $scope.exerciseId = null;
      }

      // Private helper method for $scope.editExercise/$scope.deleteExercise
      // Creates exercise object from inputs.
      function composeExercise() {
        var exercise = {};
        exercise.name = $scope.exerciseName;
        exercise.weight = $scope.exerciseWeight;
        exercise.rep = $scope.exerciseRep;
        exercise.time = $scope.exerciseTime;

        return exercise;
      }

      // Updates exercise in database with new information
      // TODO: INTEGRATE WITH resync()
      $scope.editExercise = function() {
        var editedExericise = composeExercise();

        var postRequest = {
          method: "POST",
          url: "/update/" + $scope.exerciseId,
          data: editedExericise
        };
        $http(postRequest)
          .success(function(data) {
            console.log("Success ", data);
            reloadAndConvertData();
          })
          .error(function(data) {
            // TODO: Add unsyncObject logic
            console.log("Error editingExercise");
          });
      };

      // Deletes exercise in database
      // TODO: INTEGRATE WITH resync();
      $scope.deleteExercise = function() {
        var exerciseToDelete = composeExercise();

        var postRequest = {
          method: "POST",
          url: "/delete/" + $scope.exerciseId,
          data: exerciseToDelete
        };
        $http(postRequest)
          .success(function(data) {
            console.log("Success ", data);
            reloadAndConvertData();
          })
          .error(function(data) {
            // TODO: Add unsyncObject logic
            console.log("Error deletingExercise");
          });
      };

      // Function that is called when day tableHeader is clicked.
      // Saves in localStorage whether that day should be expanded on next visit.
      $scope.saveCollapseToggle = function(day) {
        var expandedDays = localStorage.getItem("expandedDays");
        if (!expandedDays) {
          expandedDays = [];
          expandedDays.push(day.date.toString());
        } else {
          expandedDays = $.parseJSON(expandedDays);
          for (var i = 0; i < expandedDays.length; i++) {
            var thisDay = expandedDays[i];
            if (thisDay === day.date.toString()) {
              expandedDays.splice(i, 1);
              localStorage.setItem(
                "expandedDays",
                JSON.stringify(expandedDays)
              );
              return;
            }
          }
          expandedDays.push(day.date.toString());
        }
        localStorage.setItem("expandedDays", JSON.stringify(expandedDays));
      };

      // Function that is called in ng-init of day tableHeader to determine whether or not to expand
      $scope.checkLastExpanded = function(day, $last) {
        var expandedDays = localStorage.getItem("expandedDays");
        if (expandedDays) {
          expandedDays = $.parseJSON(expandedDays);
          if (typeof expandedDays === "object" && expandedDays.length > 0) {
            for (var i = 0; i < expandedDays.length; i++) {
              if (expandedDays[i] === day.date.toString()) {
                return true;
              }
            }
          }
        }

        if ($last) {
          return true;
        }
      };

      $scope.addUser = function() {

        var user = {};
        user.email = $scope.emailInput;
        user.user_name = $scope.usernameInput;
        user.password = $scope.passwordInput;

        var postRequest = {
          method: "POST",
          url: "/register",
          data: user
        };
        
        $http(postRequest)
          .success(function(data) {
            console.log("Success add ", data);
          })
          .error(function(data) {
            console.log("Error");
          });
        
      }
    }
  ]);
