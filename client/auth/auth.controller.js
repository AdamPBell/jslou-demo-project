"use strict";
var appName = "presentation";
angular.module(appName)
.factory('httpRequestInterceptor', ['$cookies','$location','$q',  function ($cookies, $location, $q) {
    return {
        request: function (config) {
            var currentUser = $cookies.getObject("currentUser") || {};
            config.headers.Authorization = "Bearer " + currentUser.token || null;
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                $location.path("/login").search('returnTo', $location.path());
            }
            return $q.reject(rejection);
        }
    };
}]);

angular.module(appName).config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
});


angular.module(appName)
    .controller("auth.controller",
    ["$scope","AuthService", '$cookies', '$routeParams',
        function ($scope, AuthService, $cookies, $routeParams) {
            $scope.login = function login() {
                AuthService.login({
                    username: $scope.userId, password: $scope.password
                }, function (result) {
                    $scope.currentUser = {userId: $scope.userId, token:result.token};
                    $cookies.putObject('currentUser', $scope.currentUser);
                    window.location.replace("#/list");
                }, function (httpResponse) {
                    if (httpResponse.status === 401) {
                        window.location.replace("#/login");
                    }
                })
            }
        }]);