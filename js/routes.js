/* This is used to redirect from 'mailbox' state. Could not make it abstract, because I
 * needed to set the default child state.
 *
 * Link: http://stackoverflow.com/a/29491412/565518
 *
 * */
mailbox.run(function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function(evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params, {location: 'replace'});
        }
    });
});


/*
 *  Redirects
 */
mailbox.config($urlRouterProvider => {
    $urlRouterProvider
        .when('/mailbox/', '/mailbox/folder/inbox')
        .otherwise('/');
});


mailbox.config($stateProvider => {

    $stateProvider.state('home', {
            url: '/',
            templateUrl: 'templates/welcome.html'
        }
    );


    $stateProvider.state('mailbox', {
            url: '/mailbox',
            redirectTo: 'mailbox.folder',
            resolve: {
                users: httpFacade => httpFacade.getUsers(),
                folders: httpFacade => httpFacade.getFolders()
            },
            controller: function ($scope, users, folders) {
                $scope.users = users;
                $scope.folders = folders;
            },
            template: `<mailbox  
                            users="users" 
                            folders="folders" 
                       ></mailbox>`
        }
    );


    $stateProvider.state('mailbox.folder', {
        url: '/folder/{folder}',
        views: {
            '': {
                resolve: {
                    currentFolder: $stateParams => {
                        if (!$stateParams.folder) {
                            $stateParams.folder = 'Inbox';
                        }
                        return $stateParams.folder
                    },
                    messages: (httpFacade, currentFolder) => httpFacade.getMessages(currentFolder)
                },
                controller: function ($scope, messages, currentFolder, users, folders) {
                    $scope.currentFolder = currentFolder;
                    $scope.messages = messages;
                    $scope.users = users;
                    $scope.folders = folders;
                },
                template: `<mailbox-folder 
                        messages="messages" 
                        current-folder="currentFolder"
                        users="users"
                        folders="folders"
                   ></mailbox-folder>`
            }
            ,
            'folders': {
                resolve: {
                    currentFolder: $stateParams => {
                        if (!$stateParams.folder) {
                            $stateParams.folder = 'Inbox';
                        }
                        return $stateParams.folder
                    }
                },
                controller: function ($scope, currentFolder, folders) {
                    $scope.currentFolder = currentFolder;
                    $scope.folders = folders;
                },
                template: `<folder-list folders="folders" current-folder="currentFolder"></folder-list>`
            }
        }
    });


    $stateProvider.state('contacts', {
        url: '/contacts',
        abstract: true,
        template: '<ui-view/>',
        resolve: { users: httpFacade => httpFacade.getUsers() }
    });


    $stateProvider.state('contacts.list', {
        url: '',
        controller: function ($scope, users) {
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
            user: function ($stateParams, users, mailboxUtils) {
                return mailboxUtils.findById(users, $stateParams.contactId)
            },
            origin: $stateParams => $stateParams.origin
        },
        controller: function ($scope, user, origin) {
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
        views: {
            /* We basically replace the content of the parent state view here */
            '@contacts': {

                /* Note: rely on parent state resolve for <origin> parameter here,
                 * so we don't need explicit resolve in this state */

                controller: function ($scope, user, origin) {
                    $scope.user = angular.copy(user);
                    $scope.origin = origin;
                },
                template: '<edit-user-info user="user" origin="origin"></edit-user-info>'
            }
        }
    });
});