app.service('MachineFactory', ['DataRequest', function(DataRequest) {
	return DataRequest.getMachines();
}]);