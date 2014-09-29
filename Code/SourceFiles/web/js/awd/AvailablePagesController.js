/*
 * This controller handles functionality in the available pages widget
 */
app.controller('AvailablePages', ['DataRequest', '$location', function(DataRequest, $location) {
        this.user = app.user;//user specific info as defined in awdapp.js
    }]);