/*
 * This controller handles login functionality
 */
app.controller('Login', ['DataRequest', '$location', function(DataRequest, $location) {
        var self = this;
        this.user = app.user;//user specific info as defined in awdapp.js
        this.username = "";
        this.login = function(){
            self.user.username = self.username;
            console.log(self.user);
            $location.path("/dashboard");
        };
    }]);