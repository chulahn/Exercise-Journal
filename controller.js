
angular.module('app', [])

.controller('dataController', ['$scope' , '$http' , function($scope, $http) {

    $scope.workout = [];
    $scope.exercises = [
        {name: "Press", weight: 135, rep: 5, time: new Date('4/28/16 18:16') },
        {name: "Bench", weight: 135, rep: 5, time: new Date('4/28/16 18:17') },
        {name: "Squat", weight: 135, rep: 5, time: new Date('4/28/16 18:19') }

    ];

    $scope.addExercise = function(data) {
        data = 0;
        var newExercise = {};
        newExercise.name = $scope.exerciseName;
        newExercise.weight = $scope.exerciseWeight || 0;
        newExercise.rep = $scope.exerciseRep || 0;
        newExercise.time = new Date($scope.exerciseTime) || new Date();
        console.log(newExercise)
        $scope.exercises.push(newExercise);
    }
    
}]);
