/**
 * This establishes the mapping from the address after # in the URL to a partial
 * page in the partials file. The content of the partials file goes in the
 * <ng-view> element of index.html
 * @param array Array with the $routeProvider variable from angular
 */
app.config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {
//        $locationProvider.html5Mode(true);
    //The content in the when clause is to be matched to the content of the
    //url after the '#' character ex. http://panthertext.com/#/home
    $routeProvider.
        when('/login',//Redirect if root
        {
            templateUrl: function(){
                return "./pages/login.html";
            }
        }).when('/dashboard',
        {
            templateUrl: function(){
                return "./pages/dashboard.html";
            }
        }).when('/machine/:machineId',
        {
            templateUrl: function(){
                return "./pages/machine.html";
            }
        }).otherwise({
            redirectTo: (function() {
                return function(){
                    if(app.user.hasLoggedIn())
                        return "/dashboard";
                    return "/login";
                };
        })()
    });
}]);