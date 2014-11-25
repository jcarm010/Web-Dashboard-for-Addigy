/*
 * This controller handles login functionality
 */
Addigy.controller('Login', ['DataRequest', '$location', function(DataRequest, $location) {
        var self = this;
        this.user = Addigy.user;//user specific info as defined in awdapp.js
        this.username = "";
        this.login = function(){
            self.user.username = self.username;
            console.log(self.user);
            $location.path("/dashboard");
        };
    }]);