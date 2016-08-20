var mailbox = angular.module('mailbox', ['ui.router']);

mailbox.config($stateProvider => {
    $stateProvider.state('home', {
            url: '/',
            template: '<h2 style="margin-top: 200px; text-align: center">Welcome to the mailbox app!</h2>'
        }
    );

    $stateProvider.state('mailbox', {
            url: '/mailbox',
            template: '<mailbox></mailbox>'
        }
    );
});