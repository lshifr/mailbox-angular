/* This is used to redirect from 'mailbox' state. Could not make it abstract, because I
 * needed to set the default child state.
 *
 * Link: http://stackoverflow.com/a/29491412/565518
 *
 * */
mailbox.run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (evt, to, params) {
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

/* Login */

mailbox.run(function($rootScope, navigator, authService){
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (toState.name !== 'login' && toState.data.requireLogin && !authService.isLoggedIn()) {
            event.preventDefault();
            navigator.go('login', {origin: toState.name});
        }
    });

    $rootScope.logged=authService.isLoggedIn();

    $rootScope.logout = () => {
        authService.logout();
        $rootScope.logged = false;
        navigator.go("login");
    };
});


mailbox.config($stateProvider => {

    $stateProvider.state('home', {
            url: '/',
            templateUrl: 'templates/welcome.html',
            data: {
                requireLogin: false
            }
        }
    );


    $stateProvider.state('login',{
        url: '/login',
        templateUrl: 'templates/login.html',
        params: {
            origin: null
        },
        resolve: {
            origin: $stateParams => $stateParams.origin
        },
        controller: function($scope, navigator, authService, origin, $rootScope){
            $scope.logged = authService.isLoggedIn();
            $scope.badCredentials = false;
            $scope.origin = origin? origin: 'home';
            $scope.submit = () => {
                $scope.logged = authService.login($scope.username, $scope.password);
                $scope.badCredentials =!$scope.logged;
                if($scope.logged){
                    $rootScope.logged = true;
                    navigator.go($scope.origin, {}, {reload: true})
                }
            }
        }

    });

    $stateProvider.state('mailbox', {
            url: '/mailbox',
            redirectTo: 'mailbox.folder',
            data: {
                requireLogin: true
            },
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

    $stateProvider.state('mailbox.compose', {
        url: '/compose',
        views: {
            '': {
                controller: function ($scope, users) {
                    $scope.users = users;
                },
                template: `<message-compose users="users"></message-compose>`
            },
            'folders': {
                controller: function ($scope, folders) {
                    $scope.currentFolder = null; //Doesn't have a well-defined value here
                    $scope.folders = folders;
                },
                template: `<folder-list folders="folders" current-folder="currentFolder"></folder-list>`
            }
        }
    });


    $stateProvider.state('mailbox.messageview', {
        url: '/view/{messageId}',
        views: {
            '': {
                resolve: {
                    message: (httpFacade, $stateParams) => httpFacade.getMessage($stateParams.messageId)
                },
                controller: function ($scope, message, users, folders, mailboxUtils) {
                    $scope.message = message;
                    $scope.sender = mailboxUtils.findById(users, message.sender);
                    $scope.recipient = mailboxUtils.findById(users, message.recipient);
                    $scope.folder = mailboxUtils.findById(folders, message.folderId);
                },
                template: `<message-view 
                                message="message" 
                                sender="sender" 
                                recipient="recipient" 
                                folder="folder"
                           ></message-view>`
            },
            'folders': {
                controller: function ($scope, folders) {
                    $scope.currentFolder = null; //Doesn't have a well-defined value here
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
        data: {
            requireLogin: true
        },
        resolve: {users: httpFacade => httpFacade.getUsers()}
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


    $stateProvider.state('contacts.add', {
        url: '/add',
        params: {
            origin: null
        },
        resolve: {
            origin: $stateParams => $stateParams.origin
        },
        controller: function ($scope, origin) {
            $scope.origin = origin;
        },
        template: '<user-add origin="origin"></user-add>'
    });
});