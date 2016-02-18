"use strict";
var appName = "presentation";

angular.module(appName).controller("menubar.controller", 
    ["$scope", "$rootElement","$rootScope", "$location","$window","$document",  "$cookies", "AuthService",
    function ($scope, $rootElement, $rootScope, $location, $window, $document, $cookies, AuthService) {
        $scope.title = $rootElement.attr("ng-app")
            .replace(".", " ")
            .replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}); // Title Case
        $document[0].title = $scope.title;           
        $scope.showIfNotOnPath = function (viewLocation) {
            return viewLocation !== $location.path();
        };

        $scope.logout = function logout() {
            var currentUser = $cookies.getObject("currentUser");
            AuthService.logout(function (data) {
                $cookies.remove("currentUser");
                $location.path("/Login");
            });
        };
}]);
