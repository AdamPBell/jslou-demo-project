"use strict";
var appName = "presentation";
angular.module(appName).controller("user.edit.controller", ["$scope", "$routeParams","$location", "UserService", function ($scope, $routeParams, $location,UserService) {
    $scope.alerts = [];

    $scope.activeUserId = $routeParams.id;
    $scope.createOrEdit = $scope.activeUserId ? "edit" : "create";
    if ($scope.activeUserId) {
        UserService.read({ id: $scope.activeUserId }, function (data) {
            $scope.user = data;
        });
    }

    $scope.saveUser = function saveUser() {

        var updateOrCreateFn = $scope.createOrEdit === "create" ? UserService.create : UserService.update;
        updateOrCreateFn($scope.user, function (data) {
            $scope.user = data;
            $scope.alerts.push({ type: "success", msg: "User saved successfully", dismissOnTimeout: 1000 });
            $location.search({ id: $scope.user._id });
        }, function (response) {
            console.log(response);
            $scope.errors = {};
            $scope.alerts.push({ type: "danger", msg: response.data.message || "Error saving user" });
            var errors = response.data.errors;
            if (errors) {
                Object.keys(errors).forEach(function (key) {
                    var error = errors[key];
                    error[error.kind] = true;
                    $scope.errors[error.path] = error;
                    $scope.alerts.push({ type: "danger", msg: error.message.replace("Path ", "") });
                });
            }
        });
    };

    $scope.closeAlert = function closeAlert(index) {
        var alert = $scope.alerts.splice(index, 1);
        console.log("dismissing alert...", alert);
    };


}]);