
angular.module('messages', []);
var module = angular.module('messages');

module.component(
    'userMessage', {
        bindings: {
            message: "<"
        },
        templateUrl: "user-message.html"
    }
);

module.component(
    'messageBox',
    {
        templateUrl: "mailbox.html",
        controller: function ($http) {
            var self = this;
            $http.get('user-messages.json').then(function(response) {
                self.messages = response.data;
            });
        }
    }
);

module.component(
    'userAvatar',
    {
        bindings: {
            url: "<"
        },
        templateUrl: "user-avatar.html"
    }
);