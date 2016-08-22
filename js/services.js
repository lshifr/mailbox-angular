mailbox.service('httpFacade', function ($http, $q) {
    var _baseURL = "http://127.0.0.1:8000/";
    var _url = path => _baseURL + path + '/';
    var _users;
    var _messages;
    var _needRequest = {users: true, messages: true};


    var _getCached = function (value) {
        var deferred = $q.defer();
        deferred.resolve(value);
        return deferred.promise;
    };

    var _getUsers = () => $http.get(_url('users'));

    var _getMessages = () => $http.get(_url('messages'));

    var _editUser = user => {
        return $http({
            method: "post",
            url: _url(`user/${user.id}/edit`),
            data: {
                'user': JSON.stringify(user)
            }
        });
    };


    var _updateUsers = () => {
        return _getUsers().then(response => {
            _users = response.data;
            _needRequest.users = false;
            return _users;
        });
    };

    var _updateMessages =
        () => _getMessages().then(response => {
            _messages = response.data;
            _needRequest.messages = false;
            return _messages
        });


    this.getUsers =
        () => _needRequest.users ? _updateUsers() : _getCached(_users);

    this.getMessages =
        () => _needRequest.messages ? _updateMessages() : _getCached(_messages);

    this.editUser = user => _editUser(user).then(
        response => {
            _needRequest.user = true;
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

    this.go = (state, params) => $state.go(state, params);
});