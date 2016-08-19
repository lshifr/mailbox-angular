mailbox.component('folderList', {
    templateUrl: 'templates/folders.html',
    bindings: {},
    controller: function(){
        this.folderNames = ['Входящие','Исходящие', 'Удаленные', 'Спам'];
    }
});

mailbox.component('userList', {
    templateUrl: 'templates/user-list.html',
    bindings: {},
    controller: function(httpFacade) {
        var self = this;
        this.updateUsers = function(){
            return httpFacade.getUsers().then(response => self.users = response.data);
        };

        this.fullName = function(user){
            return user.firstName + '  '+ user.lastName;
        };

        this.updateUsers().then(() => console.log(self.users));

    }

});

mailbox.component('messages', {
   templateUrl: 'templates/messages.html',
    bindings: {},
    controller: function(httpFacade){
        var self = this;

        this.updateUsers = function(){
            return httpFacade.getUsers().then(response => self.users = response.data);
        };

        this.updateMessages = function(){
            return httpFacade.getMessages().then(response => self.messages = response.data);
        };

        this.fullName = function(user){
            return user.firstName + '  '+ user.lastName;
        };

        this.buildUserHash = function(){
            this.userHash = {};
            this.users.forEach(user => self.userHash[user.id] = user);
            console.log(this.userHash);
        };

        this.getUser = function(message){
            //console.log(message);
            return this.userHash[message.sender];
        };

        this.briefContents = function(msg){
            var SHOWN_LENGTH = 150;
            return (msg.length <= SHOWN_LENGTH)? msg : msg.substring(0, SHOWN_LENGTH) + '...';
        };

        /*

        this.testAvatars = function(){
            this.messages.forEach(message => console.log(self.getUser(message).avatarUrl))
        };

        */

        this.updateUsers().then(
            () => self.buildUserHash()
        ).then(
            ()=> self.updateMessages()
        );

    }
});