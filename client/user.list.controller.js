"use strict";
var appName = "presentation";
angular.module(appName).controller("user.list.controller", ["$scope", "UserService", function ($scope, UserService) {
    $scope.alerts = [];
    UserService.list(function (data) {
        console.log(data);
        $scope.users = data;
    }, function (err) {
        console.log(err);
        $scope.alerts.push({ type: "danger", msg: "Error retrieving users" });
    });


    $scope.removeUser = function removeUser(index) {
        var user = $scope.users[index];
        UserService.delete({ id: user._id }, function (data) {
            user = $scope.users.splice(index, 1)[0];
            console.log(data, user);
            $scope.alerts.push({ type: "warning", msg: "User removed {" + user._id + "}" });
        }, function (err) {
            console.log(err);
            $scope.alerts.push({ type: "danger", msg: "Error removing user" });
        });
    };
}]);
  