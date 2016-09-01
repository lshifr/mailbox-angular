mailbox.service('httpFacade', function ($http, $q, mailboxConfig) {
    var _baseURL = mailboxConfig.testMode? mailboxConfig.baseTestURL: mailboxConfig.baseProductionURL;
    var _url = path => _baseURL + path + '/';
    var _users;
    var _folders;
    var _needRequest = {users: true, folders: true};


    var _getCached = function (value) {
        var deferred = $q.defer();
        deferred.resolve(value);
        return deferred.promise;
    };

    var _getUsers = () => $http.get(_url('users'));

    var _getMessages = folderName => $http.get(_url('messages/' + folderName.toLowerCase()));

    var _getMessage = messageId => $http.get(_url('message/' + messageId));

    var _getFolders = () => $http.get(_url('folders'));

    var _make_user_method = urlFun =>
        user =>
            $http({
                method: "post",
                url: urlFun(user),
                data: {
                    'user': JSON.stringify(user)
                }
            });

    var _editUser = _make_user_method(user => _url(`user/${user.id}/edit`));

    var _deleteContact = _make_user_method(user => _url(`user/${user.id}/delete`));

    var _moveMessages = (messages, folderName) => {
        return $http({
            method: "post",
            url: _url(`messages/${folderName.toLowerCase()}/move`),
            data: {
                'messageIds': JSON.stringify(messages.map(msg => msg.id))
            }
        });
    };

    var _sendMessage = (text, recipients, sender) => {
        return $http({
            method: "post",
            url: _url('messages/send'),
            data: {
                'messageInfo': JSON.stringify({
                    'text': text,
                    'recipients': recipients.map( rec => rec.id),
                    'senderId': sender.id
                })
            }
        });
    };

    var _updateUsers = () => _getUsers().then(response => {
        _users = response.data;
        _needRequest.users = false;
        return _users;
    });

    var _updateFolders = () => _getFolders().then(response => {
        _folders = response.data;
        _needRequest.folders = false;
        return _folders;
    });


    /* ==============================  PUBLIC INTERFACE ============================== */

    this.getUsers = () =>
        _needRequest.users ? _updateUsers() : _getCached(_users);


    this.getMessages = folderName =>
        _getMessages(folderName).then(response => response.data); //Don't cache messages

    this.getMessage = messageId => _getMessage(messageId).then(response => response.data);

    this.getFolders = () =>
        _needRequest.folders ? _updateFolders() : _getCached(_folders);

    this.editUser = user => _editUser(user).then(
        response => {
            _needRequest.users = true;
            return response;
        }
    );

    this.deleteContact = user => _deleteContact(user).then(
        response => {
            _needRequest.users = true;
            return response;
        }
    );

    this.moveMessages = (messages, folderName) => _moveMessages(messages, folderName).then(
        response => {
            _needRequest.folders = true;
            return response.data;
        }
    );

    this.sendMessage = (text, recipients, sender) => _sendMessage(text, recipients, sender).then(
        response => {
            _needRequest.folders = true; //Message count changes
            return response.data;
        }
    )

});


mailbox.service('mailboxUtils', function () {
    this.collectionIdHash = function (coll) {
        var hash = {};
        coll.forEach(item => hash[item.id] = item);
        return hash;
    };

    this.fullUserName = user => user.firstName + '  ' + user.lastName;

    this.cutString = cutLength => msg => (msg.length <= cutLength) ? msg : msg.substring(0, cutLength) + '...';

    this.findById = function (a, id) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].id == id) return a[i];
        }
        return null;
    };

    this.getDestinationFolderList = (currentFolderName, allFolders) => {
        var exclusions = {
            'inbox': ['sent'],
            'sent' : ['inbox']
        };
        var lequals = (fst, sec) => fst.toLowerCase() === sec.toLowerCase();
        var lcontains = (folders, name) =>
            folders.map(nm => nm.toLowerCase()).indexOf(name.toLowerCase()) !== -1;
        return allFolders
            .filter(folder => !lequals(folder.name, currentFolderName))
            .filter(folder => !lcontains(exclusions[currentFolderName.toLowerCase()] || [], folder.name));
    };

    this.canMoveMessage = (message, destinationFolderName) => {
        if(message.type === 'received' && destinationFolderName.toLowerCase() === 'sent'){
            return false;
        } else if(message.type === 'sent' && destinationFolderName.toLowerCase() === 'inbox'){
            return false;
        }
        return true;
    };

    this.formatDate = date => date.toLocaleTimeString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
});


mailbox.service('navigator', function ($state) {
    this.editUser = function (user, origin) {
        $state.go('contacts.person.edit', {contactId: user.id, origin: origin});
    };

    this.goToContacts = () => $state.go('contacts.list');

    this.go = (state, params, opts) => $state.go(state, params, opts); // A proxy to $state.go
});


mailbox.service('generalUtils', function(){
    this.partition = function (lst, size, step, tail) {
        if (step === undefined) {
            step = size;
        }
        var plen = Math.floor((lst.length - size) / step) + 1;
        var res = [];
        for (var i = 0; i < plen; i++) {
            res[i] = lst.slice(step * i, step * i + size)
        }
        if (tail && (plen * size < lst.length)) {
            res.push(lst.slice(plen * size, lst.length))
        }
        return res
    };
});


mailbox.service('authService', function(){
    var _userIsAuthenticated = false;

    var _login = 'test';
    var _password = 'test';

    this.login = (login, password) => {
        if(login === _login && password === _password){
            _userIsAuthenticated = true;
            return true;
        } else {
            return false;
        }
    };

    this.logout = () => {
        _userIsAuthenticated = false;
    };

    this.isLoggedIn = () => _userIsAuthenticated;
});