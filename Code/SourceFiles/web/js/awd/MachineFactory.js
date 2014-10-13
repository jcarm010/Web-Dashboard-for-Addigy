app.service('MachineFactory', ['DataRequest', function(DataRequest) {
	var me = this;
	me.machines;

	return {
		update: function( callback ) {
			DataRequest.getMachines().then( function(res) { 
				me.machines = res.data['@items']; 
				callback(me.machines) }
			);
		}
	}

}]);