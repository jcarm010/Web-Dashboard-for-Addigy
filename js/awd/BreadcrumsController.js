/*
 * This controller handles functionality in the breadcrums
 */
app.controller('Breadcrums', ['DataRequest', '$location', function(DataRequest, $location) {
        this.user = app.user;//user specific info as defined in awdapp.js
        this.pageTitle = function(){
            var path = $location.path();
            if(path === "/login")
                return "Login";
            else if(path === "/dashboard")
                return "Dashboard";
        };
        
    }]);