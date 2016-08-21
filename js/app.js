var mailbox = angular.module('mailbox', ['ui.router']);

mailbox.run(
    ['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]
);

mailbox.config($stateProvider => {
    $stateProvider.state('home', {
            url: '/',
            template: '<h2 class="welcome well">Welcome to the mailbox app!</h2>'
        }
    );

    $stateProvider.state('mailbox', {
            url: '/mailbox',
            resolve:{
                messages: function(httpFacade){
                    return httpFacade.getMessages()
                },
                users: function(httpFacade){
                    return httpFacade.getUsers()
                }
            },
            controller: function($scope, messages, users){
                $scope.messages = messages;
                $scope.users = users;
            },
            template: '<mailbox messages="messages" users="users"></mailbox>'
        }
    );

    $stateProvider.state('contacts', {
        url: '/contacts',
        abstract: true,
        template: '<ui-view/>'
    });

    $stateProvider.state('contacts.list',{
        url: '',
        resolve:{
            users: function(httpFacade){
                return httpFacade.getUsers()
            }
        },
        controller: function($scope, users){
            $scope.users = users;
        },
        template: '<contacts-list users="users"></contacts-list>'
    });

});