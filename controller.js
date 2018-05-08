
angular.module('app', [])

.controller('dataController', ['$scope' , '$http' , function($scope, $http) {

    $scope.workout = [];
    $scope.exercises = [
        {name: "Press", weight: 135, rep: 5, time: new Date('4/28/16 18:16') },
        {name: "Bench", weight: 135, rep: 5, time: new Date('4/28/16 18:17') },
        {name: "Squat", weight: 135, rep: 5, time: new Date('4/28/16 18:19') }

    ];

    console.log("here")
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
            console.log(currentExDate.toLocaleDateString());

            if (convertedData[currentExDate.toLocaleDateString()] === undefined ? 
                convertedData[currentExDate.toLocaleDateString()] = [currentEx] :
                convertedData[currentExDate.toLocaleDateString()].push(currentEx)); 


            // if (convertedData[currentExDate.toLocaleDateString()] == undefined) {
            //     convertedData[currentExDate.toLocaleDateString()] = [currentEx];
            // }
            // else {
            //     convertedData[currentExDate.toLocaleDateString()].push(currentEx); 
            // }

            console.log(convertedData);
            $scope.convertedData = convertedData;
        }
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

        $http(postRequest).then(function successCallback(response) {
            console.log("Success");
            console.log(response);
        }, function errorCallback(response) {
            console.log("Fail");
            console.log(response);
        })

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


}]);
