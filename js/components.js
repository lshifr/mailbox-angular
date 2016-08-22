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
    controller: function(httpFacade, mailboxUtils, navigator, $state){
        this.fullUserName = mailboxUtils.fullUserName;
        this.edit = navigator.editUser;
        this.state = $state.current.name;
    }
});


mailbox.component('userInfo', {
    templateUrl: 'templates/user-info.html',
    bindings: {
        user: '<'
    },
    controller: function(navigator, $state){
        this.edit = navigator.editUser;
        this.state = $state.current.name;
        this.contactsState = 'contacts.list';
        this.go = navigator.go;
    }
});


mailbox.component('editUserInfo',{
    templateUrl: 'templates/edit-user-info.html',
    bindings: {
        user: '<',
        origin: '<'
    },
    controller: function(navigator){
        this.cancel = state => navigator.go(state?state:'contacts.list');
    }
});