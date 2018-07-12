
angular.module('app', [])

.controller('dataController', ['$scope' , '$http' , function($scope, $http) {

    $scope.exercises = [
        {name: "Press", weight: 135, rep: 5, time: new Date('4/28/16 18:16') },
        {name: "Bench", weight: 135, rep: 5, time: new Date('4/28/16 18:17') },
        {name: "Squat", weight: 135, rep: 5, time: new Date('4/28/16 18:19') },
        {name: "Squat", weight: 135, rep: 5, time: new Date('4/8/16 18:19') },
        {name: "Squat", weight: 135, rep: 5, time: new Date('4/18/16 18:19') }

    ];
    $scope.mapped = [];

    $scope.editMode = false;
    $scope.deleteMode = false;

    $http.get("/ex")
        .success(function(data) {
            console.log("Successful connect")
            console.log(data);
            $scope.exercises = data;
            $scope.convertData(data);
        })
        .error(function(data) {
            console.log("Non successful");
            console.log(data);
        })

    $scope.convertData = function(data) {

        var convertedData = {};

        //for each exercise
        //get the date
        //if Date already exists, push
        //else create new Date
        for (var i=0; i<data.length; i++) {
            var currentEx = data[i];
            var currentExDate = new Date(currentEx.time);

            //eg. currentEx.date = "5/2/2018"
            currentEx.date = currentExDate.toLocaleDateString();

            // if (convertedData[currentExDate.toLocaleDateString()] === undefined ? 
            //     convertedData[currentExDate.toLocaleDateString()] = [currentEx] :
            //     convertedData[currentExDate.toLocaleDateString()].push(currentEx)); 

            //if key does not exist, make a key with value objData.
            //objData has date and an array of exercise with the one exercise
            if (convertedData[currentExDate.toLocaleDateString()] === undefined) {
                var objData = {};
                objData.date = currentExDate;
                objData.exercises = [];
                objData.exercises.push(currentEx);

                convertedData[currentExDate.toLocaleDateString()] = objData;
            }

            //else add the exercise to the value exercises array.
            else {
                // console.log(convertedData[currentExDate.toLocaleDateString()])
                convertedData[currentExDate.toLocaleDateString()].exercises.push(currentEx);
            }
        }

        $scope.convertedData = convertedData;

        $scope.mapped = Object.keys($scope.convertedData).map(function(key){
            return $scope.convertedData[key]
        })

        console.log($scope.mapped);
    }

    $scope.addExercise = function() {
        var newExercise = {};
        newExercise.name = $scope.exerciseName;
        newExercise.weight = $scope.exerciseWeight || 0;
        newExercise.rep = $scope.exerciseRep || 0;
        if ($scope.exerciseTime != null ? newExercise.time = new Date($scope.exerciseTime) : newExercise.time = new Date() )
        // newExercise.time = new Date($scope.exerciseTime) || new Date();
        console.log(newExercise)
        $scope.exercises.push(newExercise);
        $scope.convertData($scope.exercises);

        var postRequest = {
            method: "POST",
            url: "/ex",
            data: newExercise
        };

        $http(postRequest).success(function(data) {
            console.log("Success add");
            console.log(data);
            $http.get("/ex")
                .success(function(data) {
                    $scope.exercises = data;
                    $scope.convertData(data);
                })
                .error(function(data) {
                    console.log("Non successful:add reload");
                    console.log(data);
                })

        })
        .error(function(data) {
            console.log("Error");
            console.log(data);
        });

    }
    $scope.logData = function() {
        console.log($scope.exercises);

        var text = JSON.stringify($scope.exercises);
        console.log(text);

        console.log($.parseJSON(text));
    }

    $scope.sortDateTime = function(exercise) {
        var dateTime = new Date(exercise.time);
        return dateTime;
    }

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
    }

    $scope.toggleDelete = function() {
        $scope.deleteMode = !$scope.deleteMode;

        //when delete clicked again, remove selected red
        if (!$scope.deleteMode) {
            $(".delete-selected").removeClass("delete-selected");
            clearExerciseInputs();
        }

        //if switching from edit, remove selected green and clear
        if ($scope.editMode) {
            $scope.editMode = false;
            $(".edit-selected").removeClass("edit-selected");
            clearExerciseInputs();

        }

    }

    $scope.fillExerciseInfo = function(ex, $event) {
        
        if ($scope.editMode) {
            $(".edit-selected").removeClass("edit-selected");
            $($event.currentTarget).addClass("edit-selected");
        }

        else if ($scope.deleteMode) {
            $(".delete-selected").removeClass("delete-selected")
            $($event.currentTarget).addClass("delete-selected");
        }


        if ($scope.editMode || $scope.deleteMode) {
            $scope.exerciseName = ex.name;
            $scope.exerciseWeight = ex.weight;
            $scope.exerciseRep = ex.rep;
            $scope.exerciseTime = ex.time;

            //fill hidden input
            $scope.exerciseId = ex._id;   
        }
        else {
            console.log("Not in edit mode");
        }
    }

    function clearExerciseInputs() {
        $scope.exerciseName = null;
        $scope.exerciseWeight = null;
        $scope.exerciseRep = null;
        $scope.exerciseTime = null;

        //fill hidden input
        $scope.exerciseId = null; 
    }

    function composeExercise() {
        var exercise = {};
        exercise.name = $scope.exerciseName;
        exercise.weight = $scope.exerciseWeight;
        exercise.rep = $scope.exerciseRep;
        exercise.time = $scope.exerciseTime;

        return exercise;

    }

    $scope.editExercise = function() {
        var editedExericise = composeExercise();

        var postRequest = {
            method: "POST",
            url: "/update/" + $scope.exerciseId,
            data: editedExericise
        };
        $http(postRequest).success(function(data) {
            console.log("Success");
            console.log(data);

            //reload
            $http.get("/ex")
                .success(function(data) {
                    $scope.exercises = data;
                    $scope.convertData(data);
                })
                .error(function(data) {
                    console.log("Non successful:edit reload");
                    console.log(data);
                })
        })
        .error(function(data) {
            console.log("Error");
            console.log(data);
        });
    }


    $scope.deleteExercise = function() {
        var exerciseToDelete = composeExercise();

        var postRequest = {
            method: "POST",
            url: "/delete/" + $scope.exerciseId,
            data: exerciseToDelete
        };
        $http(postRequest).success(function(data) {
            console.log("Success");
            console.log(data);

            //reload
            $http.get("/ex")
                .success(function(data) {
                    $scope.exercises = data;
                    $scope.convertData(data);
                })
                .error(function(data) {
                    console.log("Non successful:edit reload");
                    console.log(data);
                })
        })
        .error(function(data) {
            console.log("Error");
            console.log(data);
        });
    }
}]);
