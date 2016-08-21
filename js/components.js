mailbox.component('main',{

});


mailbox.component('mailbox', {
    bindings: {
        messages: '<',
        users: '<'
    },
    templateUrl: 'templates/mailbox.html',
    controller: function (httpFacade, mailboxUtils) {
        var _userHash = mailboxUtils.collectionIdHash(this.users);
        this.fullUserName = mailboxUtils.fullUserName;
        this.getMessageSender = message => {
            return _userHash[message.sender];
        };
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



mailbox.component('testMsg', {
    template: '<td>{{$ctrl.message.text}}</td>',
    bindings: {
        message:'<'
    },
    controller: function(){

    }
});


mailbox.component('messages', {
    templateUrl: 'templates/messages.html',
    bindings: {
        users: '<',
        messages: '<',
        getMessageSender: '&',
        fullUserName: '&'

    },
    controller: function (mailboxUtils) {
        this._SHOWN_LENGTH = 150;
        this.briefContents = mailboxUtils.cutString(this._SHOWN_LENGTH);
    }
});


mailbox.component('contactsList',{
    templateUrl: 'templates/contacts-list.html',
    bindings: {
        contacts: '<'
    },
    controller: function(httpFacade, mailboxUtils){
        this.fullUserName = mailboxUtils.fullUserName;
    }
});


mailbox.component('userInfo', {
    templateUrl: 'templates/user-card.html',
    bindings: {
        user: '<'
    },
    controller: function(mailboxUtils){
        this.fullName = mailboxUtils.fullUserName;
    }
});