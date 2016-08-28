mailbox.component('alert', {
    bindings: {
        topic: '@',
        showAlert: '=' //Note the bi-directional binding here
    },
    templateUrl: 'templates/alert.html',
    controller: function () {
        this.closeAlert = function () {
            this.showAlert = false;
        }
    },
    transclude: true,
    replace: true
});


mailbox.component('modalConfirm', {
    templateUrl: 'templates/modal.html',
    bindings: {
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
        this.getMessageSender = message => _userHash[message.sender];
        this.getMessageRecipient = message => _userHash[message.recipient];
        this.getPerson = message =>
            (message.type === 'received')
                ? this.getMessageSender(message)
                : this.getMessageRecipient(message);
        this.selectedMessages = () => this.messages.filter(msg => msg.selected);
        this.destinationFolders = mailboxUtils.getDestinationFolderList(
            this.currentFolder, this.folders
        );
        this.moveSelected = folderName => {
            var messagesToMove = this.selectedMessages().filter(
                msg => mailboxUtils.canMoveMessage(msg, folderName)
            );
            httpFacade.moveMessages(messagesToMove, folderName).then(() => {
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
    controller: function () {
    }
});


mailbox.component('messages', {
    templateUrl: 'templates/messages.html',
    bindings: {
        users: '<',
        messages: '<',
        getPerson: '&',
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
            navigator.go(_backState, {}, {reload: reload});
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
        this.cancelDeleteUser = () => {
        };
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
    controller: function (generalUtils, mailboxUtils, httpFacade, navigator, $state) {
        this.recipients = [];
        this.senders = [];
        this.messageText = '';

        this.checkMessage = () => {
            return this.messageText.trim().length > 0 && this.recipients.length > 0 && this.senders.length === 1;
        };

        this.sendMessage = () => {
            httpFacade.sendMessage(this.messageText, this.recipients, this.senders[0])
                .then(responseData => {
                        navigator.go('mailbox.folder', {}, {reload: true});
                    }
                ).catch(response => {
                    this.showAlert = true;
                    this.responseStatus = response.status;
                    this.errorText = response.statusText;
                });
        };
    }
});


mailbox.component('userPicker',{
    templateUrl: 'templates/user-picker.html',
    bindings: {
        users: '<',
        picked: '=',
        api: '=',
        pickLimit: '<'
    },
    controller: function(mailboxUtils, generalUtils){
        this.fullUserName = mailboxUtils.fullUserName;
        this.partitionedPicked = [];
        this.usersLocal = this.users;
        this.partitionedUsers = [];
        this.userName='';
        this.showSelectPanel = false;
        this.pickLimit = this.pickLimit || 10000;

        this.recomputeUserPool = () => {
            this.usersLocal = this.users.filter(
                contact => this.fullUserName(contact).toLowerCase().indexOf(this.userName.toLowerCase()) > -1
            );
            this.picked.forEach(rec => {
                this.usersLocal = this.usersLocal.filter(contact => contact.id !== rec.id);
            });
            this.partitionedUsers = generalUtils.partition(this.usersLocal, 3, 3, true);
        };

        this.refreshInput = closePanel => {
            this.userName = '';
            if (closePanel) {
                this.showSelectPanel = false;
            }
        };

        this.onInputKeyUp = event => {
            if (event.keyCode === 13 && this.usersLocal.length == 1) {
                this.pickUser(this.usersLocal[0]);
                this.refreshInput(true);
            } else {
                this.showSelectPanel = true;
                this.recomputeUserPool();
            }
        };

        this.recomputePicked = () => {
            this.partitionedPicked = generalUtils.partition(this.picked, 3, 3, true);
        };
        this.pickUser = user => {
            if (!mailboxUtils.findById(this.picked, user.id)) {
                if(this.pickLimit <= this.picked.length){
                    this.picked.pop();
                }
                this.picked.push(user);
                this.recomputePicked();
                this.recomputeUserPool();
                this.userName = '';
            }
        };
        this.removePicked = user => {
            this.picked = this.picked.filter(rec => rec.id !== user.id);
            this.recomputePicked();
            this.recomputeUserPool();
        };

        this.api = {
            refreshInput: this.refreshInput
        };

        this.recomputeUserPool();
    }

});


mailbox.component('userPanelSmall', {
    templateUrl: 'templates/user-panel-small.html',
    bindings: {
        user: '<',
        remove: '&',
        showRemoveButton: '<',
        onClick: '&'
    },
    controller: function (mailboxUtils) {
        this.fullUserName = mailboxUtils.fullUserName;
    }
});