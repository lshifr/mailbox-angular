mailbox.component('mailbox', {
    templateUrl: 'templates/mailbox.html',
    controller: function (httpFacade) {
        var self = this;

        this.buildUserHash = function () {
            this.userHash = {};
            this.users.forEach(user => self.userHash[user.id] = user);
        };

        this.updateUsers = function () {
            return httpFacade.getUsers().then(response => {
                self.users = response.data;
                self.buildUserHash();
            });
        };

        this.updateMessages = function () {
            return httpFacade.getMessages().then(response => self.messages = response.data);
        };

        this.getMessageSender = function (message) {
            return this.userHash[message.sender];
        };

        this.fullUserName = function (user) {
            //console.log(user);
            return user.firstName + '  ' + user.lastName;
        };

        this.updateUsers().then(()=> self.updateMessages());
    }
});


mailbox.component('folderList', {
    templateUrl: 'templates/folders.html',
    bindings: {},
    controller: function () {
        this.folderNames = ['Inbox', 'Sent', 'Trash', 'Spam'];
    }
});


mailbox.component('userList', {
    templateUrl: 'templates/user-list.html',
    bindings: {
        users: "<",
        fullUserName: "&"
    },
    controller: function () {

    }

});


mailbox.component('messageControls', {
    templateUrl: 'templates/message-controls.html'
});


mailbox.component('messages', {
    templateUrl: 'templates/messages.html',
    bindings: {
        users: '<',
        messages: '<',
        getMessageSender: '&',
        fullUserName: '&'

    },
    controller: function (httpFacade) {

        this.briefContents = function (msg) {
            var SHOWN_LENGTH = 150;
            return (msg.length <= SHOWN_LENGTH) ? msg : msg.substring(0, SHOWN_LENGTH) + '...';
        };

    }
});