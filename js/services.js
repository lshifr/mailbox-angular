mailbox.service('httpFacade', function ($http, $q) {
    var _baseURL = "http://127.0.0.1:8000/";
    var _url = path => _baseURL + path + '/';
    var _users;
    var _folders;
    var _needRequest = {users: true,  folders: true};


    var _getCached = function (value) {
        var deferred = $q.defer();
        deferred.resolve(value);
        return deferred.promise;
    };

    var _getUsers = () => $http.get(_url('users'));

    var _getMessages = folderName => $http.get(_url('messages/'+folderName.toLowerCase()));

    var _getFolders = () => $http.get(_url('folders'));

    var _editUser = user => {
        return $http({
            method: "post",
            url: _url(`user/${user.id}/edit`),
            data: {
                'user': JSON.stringify(user)
            }
        });
    };

    var _deleteContact = user => {
        return $http({
            method: "post",
            url: _url(`user/${user.id}/delete`),
            data: {
                'user': JSON.stringify(user)
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

    this.getUsers =
        () =>  _needRequest.users ? _updateUsers() : _getCached(_users);


    this.getMessages =
        folderName => _getMessages(folderName).then(response => response.data);  //Don't cache messages

    this.getFolders =
        () => _needRequest.folders ? _updateFolders() : _getCached(_folders);

    this.editUser = user => _editUser(user).then(
        response => {
            _needRequest.users = true;
            return response;
        }
    );

    this.deleteContact = user => _deleteContact(user).then(
        response => {
            _needRequest.users = true;
            _needRequest.messages = true;
            return response;
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

    this.findById = function(a, id) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].id == id) return a[i];
        }
        return null;
    }
});


mailbox.service('navigator', function($state){
    this.editUser = function(user, origin){
        $state.go('contacts.person.edit', {contactId: user.id, origin: origin});
    };

    this.goToContacts = () => $state.go('contacts.list');

    this.go = (state, params, opts) => $state.go(state, params, opts); // A proxy to $state.go
});