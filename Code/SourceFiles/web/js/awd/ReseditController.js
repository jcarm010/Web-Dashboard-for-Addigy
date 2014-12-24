/*
 * This controller handles functionality related to editing the resource file
 */
Addigy.controller('ReseditCtrl', ['DataRequest','$scope',
    function(DataRequest,$scope) {
        var self = this;
        this.caskFilterValue = "";
        this.resourceFilterValue = "";
        this.resources = [];
        this.resourcesString = "";
        this.caskNames = [];
        loadResources();
        function loadResources(){
            //get resources
            DataRequest.getResources().then(function(data){
                console.log("Resources:");
                console.log(data);
                data.sort(function(first,second){return first.code.localeCompare(second.code);});
                for(var i = 0 ; i < data.length;i++){
                    self.resources.push(data[i]);
                    var code = data[i].code.toLowerCase();
                    self.resources[code] = true;//to speed up contains
                }
                loadCasks();
            });
        }
        function loadCasks(){
            DataRequest.listCasks().then(function(data){
                console.log("Casks:");
                console.log(data);
                if(!data.success){
                    console.log("Error getting casks: "+data.errmsg);
                    return;
                }
                for(var i = 0 ; i < data.casks.length;i++)
                    self.caskNames.push(data.casks[i]);
            });
        }
        
        $scope.caskNameFilter = function(name){
            return name.toLowerCase().indexOf(self.caskFilterValue.toLowerCase()) >=0;
        };
        $scope.resourceCodeFilter = function(res){
            return res.code.toLowerCase().indexOf(self.resourceFilterValue.toLowerCase()) >=0;
        };
        self.addCask = function(caskName){
            console.log("Adding cask: "+caskName);
            if(!self.resources[caskName.toLowerCase()])
                DataRequest.getCask(caskName).then(function(data){
                    if(!data.success){
                        console.log("Error getting cask: "+caskName.errmsg);
                        return;
                    }
                    console.log(data);
                    if(!self.resources[data.cask.code.toLowerCase()]){
                        self.resources.push(data.cask);
                        self.resources[data.cask.code.toLowerCase()] = true;
                    }
                });
        };
        self.removeResouce = function(res){
            console.log("Removing resource:");
            console.log(res);
            for(var i = 0 ; i < self.resources.length ;i++)
                if(self.resources[i]===res){
                    self.resources.splice(i, 1);
                    self.resources[res.code.toLowerCase()] = false;
                }
        };
        self.storeChanges = function(){
            DataRequest.storeResources(angular.toJson(self.resources),true).then(function(data){
               console.log(data); 
            });
        };
    }
    
]);

