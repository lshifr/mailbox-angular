angular.module('users', [])
    .factory('users', ['$http', function($http){
        return {
            getUsers: function(){
                return $http.get('users.json')
            }
        }
    }])
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
        controller: ['users', function(users){
            var self = this;
            users.getUsers().then(function(response) {
                self.users = response.data;
            });
        }]
    }
);