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
        users: '<',
        folders: '<'
    },
    templateUrl: 'templates/mailbox.html',
    controller: function (httpFacade, mailboxUtils, $state) {
        this.fullUserName = mailboxUtils.fullUserName;
    }
});


mailbox.component('mailboxFolder', {
    bindings: {
        messages: '<',
        users: '<',
        folders: '<',
        currentFolder: '<'
    },
    templateUrl: 'templates/mailbox-folder.html',
    controller: function (httpFacade, mailboxUtils, $state) {
        var _userHash = mailboxUtils.collectionIdHash(this.users);
        this.messageSearchCriteria = '';
        this.fullUserName = mailboxUtils.fullUserName;
        this.getMessageSender = message => {
            return _userHash[message.sender];
        };
        this.selectedMessages = () => this.messages.filter( msg => msg.selected );
        this.destinationFolders = mailboxUtils.getDestinationFolderList(
            this.currentFolder, this.folders
        );
        this.moveSelected = folderName => {
            httpFacade.moveMessages(this.selectedMessages(), folderName).then(() => {
                $state.reload();
            })
        };
    }
});


mailbox.component('folderList', {
    templateUrl: 'templates/folders.html',
    bindings: {
        folders: '<',
        currentFolder: '<'
    },
    controller: function () {
        this.folderNames = this.folders.map(folder => folder.name);
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
        searchCriteria: '=',  // Need this to pass the change to parent scope
        destinationFolders: '<',
        moveSelected: '&'
    },
    controller: function(){ }
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


mailbox.component('messageCompose', {
    templateUrl: 'templates/message-compose.html',
    bindings: {
        users: '<'
    },
    controller: function(generalUtils, mailboxUtils){
        this.fullUserName = mailboxUtils.fullUserName;
        this.recipients = [];
        this.partitionedRecipients = [];
        this.recipientName='';
        this.recomputeContacts = () => {
            this.contacts = this.users.filter(
                contact => this.fullUserName(contact).toLowerCase().indexOf(this.recipientName.toLowerCase()) > -1
            );
            this.recipients.forEach(rec => {
                this.contacts = this.contacts.filter(contact => contact.id !== rec.id);
            });
            this.partitionedContacts = generalUtils.partition(this.contacts, 3, 3, true);
        };

        this.refreshInput = closePanel  => {
            this.recipientName = '';
            if(closePanel){
                this.showSelectPanel=false;
            }
        };

        this.onInputKeyUp = event => {
            if(event.keyCode === 13 && this.contacts.length == 1){
                this.addRecipient(this.contacts[0]);
                this.refreshInput(true);
            } else {
                this.showSelectPanel = true;
                this.recomputeContacts();
            }
        };

        this.recomputeRecipients = () => {
            this.partitionedRecipients = generalUtils.partition(this.recipients, 3, 3, true);
        };
        this.addRecipient = user => {
            if (!mailboxUtils.findById(this.recipients, user.id)){
                this.recipients.push(user);
                this.recomputeRecipients();
                this.recipientName = '';
            }
        };
        this.removeRecipient = user => {
            this.recipients = this.recipients.filter(rec => rec.id !== user.id);
            this.recomputeRecipients()
        };

        this.recomputeContacts();
    }
});