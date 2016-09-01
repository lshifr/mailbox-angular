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

    var _getUser = userId => $http.get(_url('user/'+userId));

    var _getDeletedUsers = () => $http.get(_url('users/deleted'));

    var _getMessages = folderName => $http.get(_url('messages/' + folderName.toLowerCase()));

    var _getMessage = messageId => $http.get(_url('message/' + messageId));

    var _getFolders = () => $http.get(_url('folders'));

    var _createFolder = fname => $http.post(_url('folder/create/'+fname));

    var _deleteFolder = fname => $http.post(_url('folder/delete/'+fname));

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

    var _activateContact = _make_user_method(user => _url(`user/${user.id}/activate`));

    var _addUser = _make_user_method(user => _url(`user/add`));

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

    var _flushUsersCache = response => {
        _needRequest.users = true;
        return response;
    };


    /* ==============================  PUBLIC INTERFACE ============================== */

    this.getUsers = () =>
        _needRequest.users ? _updateUsers() : _getCached(_users);

    this.getUser = userId => _getUser(userId).then(response => response.data);

    this.getDeletedUsers = () => _getDeletedUsers().then(response => response.data);




    this.getMessages = folderName =>
        _getMessages(folderName).then(response => response.data); //Don't cache messages

    this.getMessage = messageId => _getMessage(messageId).then(response => response.data);

    this.getFolders = () =>
        _needRequest.folders ? _updateFolders() : _getCached(_folders);


    this.editUser = user => _editUser(user).then(_flushUsersCache);

    this.deleteContact = user => _deleteContact(user).then(_flushUsersCache);

    this.activateContact = user => _activateContact(user).then(_flushUsersCache);

    this.addUser = user => _addUser(user).then(_flushUsersCache);

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
    );

    this.createFolder = fname => _createFolder(fname).then(
        response => { _needRequest.folders = true; return response;}
    );

    this.deleteFolder = fname => _deleteFolder(fname).then(
        response => { _needRequest.folders = true; return response;}
    );

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

    this.goToContacts = () => $state.go('contacts.list.current');

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


mailbox.service('cookies', function(){
    function _setCookie(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }

    function _deleteCookie(name) {
        _setCookie(name, "", {
            expires: -1
        })
    }

    function _getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    return {
        getCookie: _getCookie,
        setCookie: _setCookie,
        deleteCookie: _deleteCookie
    }
});


mailbox.service('authService', function(cookies, mailboxConfig){
    var _userIsAuthenticated = false;

    var _login = mailboxConfig.login;
    var _password = mailboxConfig.password;

    this.login = (login, password) => {
        if(login === _login && password === _password){
            _userIsAuthenticated = true;
            cookies.setCookie('mailboxAuthenticated', 'true', { expires: mailboxConfig.sessionTimeout});
            return true;
        } else {
            return false;
        }
    };

    this.logout = () => {
        _userIsAuthenticated = false;
        cookies.deleteCookie('mailboxAuthenticated');
    };

    this.isLoggedIn = () => {
        if(_userIsAuthenticated){
            return true;
        }
        _userIsAuthenticated = (cookies.getCookie('mailboxAuthenticated')  === 'true');
        return _userIsAuthenticated;
    }
});