/*
 * This controller handles functionality in the breadcrums
 */
Addigy.controller('Breadcrums', ['DataRequest', '$location', function(DataRequest, $location) {
        this.user = Addigy.user;//user specific info as defined in awdapp.js
        this.pageTitle = function(){
            var path = $location.path();
            if(path === "/login")
                return "Login";
            else if(path === "/dashboard")
                return "Dashboard";
            else if(path.indexOf("/machine")===0)
                return "Machine";
        };
        
    }]);