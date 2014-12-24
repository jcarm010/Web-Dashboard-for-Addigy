/**
 * A request factory for the different types of requests that the app requieres
 * @param string factoryName The name of the factory
 * @param factory The function that defines all types of requests
 */
Addigy.factory('DataRequest', function($http) {
    var self = this;
    //Setup the format for all http request
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    /**
     * Parses a server response into a javascript readable object
     * @param string result The server's response
     * @returns {Array|Object|Boolean} False if invalid response or the server's response as an object
     */
    self.parseResponse = function(result) {
        //if the response is not a string it means that it has been interpreted as a javascript object already
        if (typeof result.data === 'string') {//if response is a string
            var jsonResponse;
            try {
                jsonResponse = JSON.parse(result.data);//try to parse the string into a javascript object (json)
            } catch (err) {//if could not parse the string
                console.log("invalid json response:");//the server gave us something unexpected
                console.log(result.data);//log the data
                jsonResponse = false;//specify invalid server response
            }
            return jsonResponse;
        }
        return result.data;
    };
    /**
     * Makes a request to the server app with the specified parameters
     * @param string appUrl The url to the app
     * @param string params String with the parameters
     * @returns The server response as a json object. True if valid, False if invalid, String if error message.
     */
    self.POST = function(url, params){
        return $http.post(url, params);
    };

    self.GET = function(url) {
        return $http.get(url);
    };

    // Legacy compatability
    self.makeRequest = function(url, params) {
        return $http.post(url, params)//Make request
            .then(function(result) {//Server response in the result variable
                return self.parseResponse(result);//parse the response into javascript
            });
    };

    //functions to make the requests
    return {
        dummy: function() {
            return $http.post("some/url","arg1=value1" + "&arg2=value2")
                .then(function(result) {
                    return true;//return true and ignore results
                });
        },
        storeResources:function(resourcesStr){
            return self.makeRequest("./scripts/StoreResources.php","res="+resourcesStr);
        },
        getCask:function(caskName){
            return self.makeRequest("./scripts/GetCask.php","caskName="+caskName);
        },
        listCasks: function() {
            return self.makeRequest("./scripts/ListCasks.php", "");
        },
        getResources: function() {
            return self.makeRequest("./resources/resources.json", "");
        },
        getPubnubKeys: function() {
            return self.makeRequest("./resources/pubnub-keys.php", "");//resources/pubnub-keys.php
        },
        getMachines: function() {
            return self.GET("resources/dummyMachines.json"); //resources/dummyMachines.json
        }
    };
});