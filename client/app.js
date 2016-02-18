"use strict";
var appName = "presentation";
angular.module(appName, [
    "ngRoute",
    "ngResource",
    "ui.select",
    "ui.bootstrap",
    "smart-table",
    "ngSanitize",
    "ngCookies",
    "ngMessages"
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/login:token?", {
        templateUrl: 'auth/login.view.html',
        controller: 'auth.controller'
    }).when("/edit/:id?", {
        templateUrl: "user.edit.view.html",
        controller: "user.edit.controller"
    }).when("/list/", {
        templateUrl: "user.list.view.html",
        controller: "user.list.controller"
    }).when("/sessions/list/", {
        templateUrl: "session.list.view.html",
        controller: "session.list.controller"
    }).otherwise({
        redirectTo: "/login"
    });
}]);