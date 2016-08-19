mailbox.service('httpFacade', function($http){
    var baseURL = "http://127.0.0.1:8000/";
    var url = path => baseURL + path + '/';

    this.getUsers = function(){
        return $http.get(url('users'));
    };
    
    this.getMessages = function(){
        return $http.get(url('messages'));
    };
});