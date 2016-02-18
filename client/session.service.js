"use strict";
var appName = "presentation";
angular.module(appName).service("SessionService", [
    '$resource',
    function ($resource) {
        return $resource("http://localhost:3000/session/:action/:id", {},
            {
                list: { method: "GET", params: { action: "list" }, isArray: true },
                delete: { method: "GET", params: { action: "delete" } }
            });
    }]);
