mailbox.component('alert', {
    bindings: {
        topic : '@',
        showAlert: '=' //Note the bi-directional binding here
    },
    templateUrl: 'templates/alert.html',
    controller: function(){
        this.closeAlert = function(){
            this.showAlert = false;
        }
    },
    transclude: true,
    replace: true
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
    controller: function ($state) {
        this.state = $state.current.name;
    }

});


mailbox.component('messageControls', {
    templateUrl: 'templates/message-controls.html'
});


mailbox.component('testMsg', {
    template: '<td>{{$ctrl.message.text}}</td>',
    bindings: {
        message: '<'
    },
    controller: function () {

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
    controller: function (mailboxUtils, $state) {
        this._SHOWN_LENGTH = 150;
        this.briefContents = mailboxUtils.cutString(this._SHOWN_LENGTH);
        this.state = $state.current.name;
    }
});


mailbox.component('contactsList', {
    templateUrl: 'templates/contacts-list.html',
    bindings: {
        contacts: '<'
    },
    controller: function (httpFacade, mailboxUtils, navigator, $state) {
        this.fullUserName = mailboxUtils.fullUserName;
        this.edit = navigator.editUser;
        this.state = $state.current.name;
    }
});


mailbox.component('userInfo', {
    templateUrl: 'templates/user-info.html',
    bindings: {
        user: '<',
        origin: '<'
    },
    controller: function (navigator, $state) {
        var _backState = this.origin ? this.origin : 'contacts.list';
        this.edit = navigator.editUser;
        this.state = $state.current.name;
        this.back = () => navigator.go(_backState);
        this.backBtnName = this.origin ? 'Back' : 'Back to contacts';
    }
});


mailbox.component('editUserInfo', {
    templateUrl: 'templates/edit-user-info.html',
    bindings: {
        user: '<',
        origin: '<'
    },
    controller: function (navigator) {
        var _self = this;
        var _testError = true;
        this.showAlert = false;
        this.back = state => navigator.go(state ? state : 'contacts.list');
        this.done = state => {
            console.log(this.user);
            if (_testError){
                this.showAlert = true;
            } else {
                _self.back(state);
            }
        }
    }
});