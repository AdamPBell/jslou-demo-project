"use strict";
var appName = "presentation";
angular.module(appName).controller("session.list.controller", ["$scope", "SessionService", function ($scope, SessionService) {
    $scope.alerts = [];
    SessionService.list(function (data) {
        $scope.sessions = data;
        console.log(data);
    }, function (err) {
        console.log(err);
        $scope.alerts.push({ type: "danger", msg: "Error retrieving sessions" });
    });


    $scope.removeSession = function removeSession(index) {
        var session = $scope.sessions[index];
        SessionService.delete({ id: session._id }, function (data) {
            session = $scope.sessions.splice(index, 1)[0];
            console.log(data, session);
            $scope.alerts.push({ type: "success", msg: "Session removed {" + session._id + "}" });
        }, function (err) {
            console.log(err);
            $scope.alerts.push({ type: "danger", msg: "Error removing session" });
        });
    };
}]);
  