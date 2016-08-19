angular.module('messages', []);
var module = angular.module('messages');

module.factory('messages', ['$http', function ($http) {
    return {
        getMessages: function () {
            //Return a promise
            return $http.get('user-messages.json')
        }
    }
}]);

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
        controller: ['messages', function (messages) {
            var self = this;
            messages.getMessages().then(function (response) {
                self.messages = response.data;
            });
        }
        ]
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