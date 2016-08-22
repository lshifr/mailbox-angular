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
            templateUrl: 'templates/welcome.html'
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
        template: '<ui-view/>',
        resolve:{
            users: function(httpFacade){
                return httpFacade.getUsers()
            }
        }

    });

    $stateProvider.state('contacts.list',{
        url: '',
        controller: function($scope, users){
            $scope.users = users;
        },
        template: '<contacts-list contacts="users"></contacts-list>'
    });

    $stateProvider.state('contacts.person', {
        url: '/{contactId:[0-9]{1,4}}',
        params: {
            origin: null
        },
        resolve: {
            user: function($stateParams, users, mailboxUtils){
                return mailboxUtils.findById(users, $stateParams.contactId)
            },
            origin: function($stateParams){
                return $stateParams.origin;
            }
        },
        controller: function($scope, user, origin){
            $scope.user = user;
            $scope.origin = origin;
        },
        template: '<user-info user="user" origin="origin"></user-info>'
    });

    $stateProvider.state('contacts.person.edit', {
        url: '/edit',
        params: {
            origin: null
        },
        views:{
            /* We basically replace the content of the parent state view here */
            '@contacts' : {
                resolve:{
                    origin: function($stateParams){
                        return $stateParams.origin;
                    }
                },
                controller: function($scope, user, origin){
                    $scope.user =  angular.copy(user);
                    $scope.origin = origin;
                },
                template: '<edit-user-info user="user" origin="origin"></edit-user-info>'
            }
        }
    });

});