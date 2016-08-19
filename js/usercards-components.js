angular.module('users', [])
    .factory('users', ['$http', function($http){
        var baseURL = "http://127.0.0.1:8000/";
        return {
            getUsers: function(){
                return $http.get(baseURL+"users/")
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
            templateUrl: "user-card.html",
            controller: function(){
                this.fullName = function(user){
                    return user.firstName + '  '+ user.lastName;
                }
            }
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