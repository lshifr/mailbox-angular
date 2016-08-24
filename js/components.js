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


mailbox.component('modalConfirm',{
    templateUrl: 'templates/modal.html',
    bindings:{
        modalId: '@',
        modalTitle: '@',
        modalBody: '@',
        cancelAction: '&',
        confirmAction: '&',
        okButtonStyle: '@'
    }
});


mailbox.component('mailbox', {
    bindings: {
        messages: '<',
        users: '<'
    },
    templateUrl: 'templates/mailbox.html',
    controller: function (httpFacade, mailboxUtils) {
        var _userHash = mailboxUtils.collectionIdHash(this.users);
        this.messageSearchCriteria = '';
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
    templateUrl: 'templates/message-controls.html',
    bindings: {
        searchCriteria: '='  // Need this to pass the change to parent scope
    }
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
        fullUserName: '&',
        searchCriteria: '<'

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
        this.confirmModal = user => {
            this.contactToDelete = user;
            $('#confirmDeleteUser').modal();
        };
        this.deleteUser = () => {
            $('#confirmDeleteUser').removeClass('fade'); //Need to do this manually due to a bug in Bootstrap modals: http://stackoverflow.com/a/22101894
            httpFacade.deleteContact(this.contactToDelete)
                .then(response => {
                    $state.reload();
                })
                .catch(response => {
                    this.showAlert = true;
                    this.responseStatus = response.status;
                    this.errorText = response.statusText;
                });

        };
        this.cancelDeleteUser = () => {
            this.contactToDelete = undefined;
        }

    }
});


mailbox.component('userInfo', {
    templateUrl: 'templates/user-info.html',
    bindings: {
        user: '<',
        origin: '<'
    },
    controller: function (navigator, $state, httpFacade) {
        var _backState = this.origin ? this.origin : 'contacts.list';
        this.edit = navigator.editUser;
        this.state = $state.current.name;
        this.back = (reload = false) => {
            navigator.go(_backState,{}, { reload : reload });
        };
        this.backBtnName = this.origin ? 'Back' : 'Back to contacts';
        this.confirmModal = () => {
            $('#confirmDeleteUser').modal();
        };
        this.deleteUser = () => {
            $('#confirmDeleteUser').removeClass('fade'); //Need to do this manually due to a bug in Bootstrap modals: http://stackoverflow.com/a/22101894
            httpFacade.deleteContact(this.user)
                .then(response => {
                    /* Destination state reloading is essential here, to update the data in the ctrl/view */
                    this.back(true);
                })
                .catch(response => {
                    this.showAlert = true;
                    this.responseStatus = response.status;
                    this.errorText = response.statusText;
                });

        };
        this.cancelDeleteUser = () => {};
    }
});


mailbox.component('editUserInfo', {
    templateUrl: 'templates/edit-user-info.html',
    bindings: {
        user: '<',
        origin: '<'
    },
    controller: function (navigator, httpFacade) {
        this.showAlert = false;

        this.back = (reload = false) => {
            navigator.go(this.origin ? this.origin : 'contacts.list', {origin: null}, {reload: reload});
        };
        
        this.done = () => {
            httpFacade.editUser(this.user)
                .then(response => {
                    /* Destination state reloading is essential here, to update the data in the ctrl/view  */
                    this.back(true);
                })
                .catch(response => {
                    this.showAlert = true;
                    this.responseStatus = response.status;
                    this.errorText = response.statusText;
                });
        }
    }
});