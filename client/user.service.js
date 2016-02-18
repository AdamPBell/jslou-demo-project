"use strict";
var appName = "presentation";
angular.module(appName).service("UserService", [
    '$resource',
    function ($resource) {
        return $resource("http://localhost:3000/user/:action/:id", {},
            {
                create: { method: "POST", params: { action: "create" } },
                read: { method: "GET", params: { action: "read" } },
                update: { method: "POST", params: { action: "update" } },
                list: { method: "GET", params: { action: "list" }, isArray: true },
                delete: { method: "GET", params: { action: "delete" } }
            });
    }]);
