"use strict";
var appName = "presentation";
angular.module(appName).service("AuthService", [
    '$resource',
    function ($resource) {
        return $resource("http://localhost:3000/:action", {},
            {
                login: { method: "POST", params:{ action:"login" } },
                logout: { method: "GET", params:{ action:"logout" } }
            }
        );
    }]);
