/*
 * This controller handles functionality related to the user menu
 */
app.controller('UserMenu', ['DataRequest', '$location', function(DataRequest, $location) {
        this.user = app.user;//user specific info as defined in awdapp.js
    }]);