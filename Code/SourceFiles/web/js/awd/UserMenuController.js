/*
 * This controller handles functionality related to the user menu
 */
Addigy.controller('UserMenu', ['DataRequest', '$location', function(DataRequest, $location) {
        this.user = Addigy.user;//user specific info as defined in awdapp.js
    }]);