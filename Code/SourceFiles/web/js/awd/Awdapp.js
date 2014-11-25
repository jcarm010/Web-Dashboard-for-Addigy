//Initialize the panthertext front end app
var Addigy = angular.module("awdapp", ['pubnub.angular.service','ngRoute']);
Addigy.user = new User();
function User(){
    var self = this;
    self.username = "";
    /**
     * Tells whether a user has logged in or not
     * @returns {Boolean} True if a user has logged in, false otherwise
     */
    self.hasLoggedIn = function(){
        return self.username !== "";
    };
}