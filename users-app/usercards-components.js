angular.module('users', [])
    .component(
        'userAvatar',
        {
            bindings: {
                url: "<"
            },
            templateUrl: "user-avatar.html"
        }
    )
    .component('userCard',
        {
            bindings:{
                user: "<"
            },
            templateUrl: "user-card.html"
        }
    ).component('allUserCards',
    {
        templateUrl: "all-user-cards.html",
        controller: function($http){
            var self = this;
            $http.get('users.json').then(function(response) {
                self.users = response.data;
            });
        }
    }
);