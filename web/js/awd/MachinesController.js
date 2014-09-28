var sampleMachine = {
  connectorid: 123123,
  uptime: 4,
  sp_user_name: "Jason Dettbarn (jason)",
  hostname: "jasons-air",
  sp_platform_uuid: "51103BF7-05AA-5988-99F8-EB6B2B867F00",
  sp_physical_memory: 8,
  sp_os_version: "OS X 10.9.4 (13E28)",
  sp_cpu_type: "Intel Core i7",
  sp_machine_name: "MacBook Air",
  sp_serial_number: "C2QLP009FMRW",
  macosx_productversion: "10.9.4",
  swapsize_mb: 2048.00, 
  swapfree_mb: 1445.00,
  timezone: "EDT",
  virtual: "physical",
  ipaddress: "192.168.1.145",
  fqdn: "addigy.com",
  apple_warranty: "November 25, 2014",
  location_lat: 25.7573634,
  location_long: -80.3761789,
  wan_ip: "73.46.14.233"
};

var updates = [
	"New bug fix available",
	"New network drivers available",
	"New security update available",
	"New printer update available"
];

function getHealth(num) {
	switch(num){
		case 0:
			return "good";
		case 1:
			return "warning";
		case 2:
			return "error";
		default:
			return "undefined";
	}
}

function getAuth(num) {
	var authentication;

	switch(num){
		case 0:
			authentication = "oauth";
			break;
		case 1:
			authentication = "manual";
			break;
		case 2:
			authentication = "remote";
			break;
	}

	return authentication;
}


var Machines = (function () {

	function getDummyMachines() {
		var machines = [];
		var machine;

		for(var i = 0; i < getRandomRange(5, 20); i++){
			machine = {
				connectorId: sampleMachine.connectorid + i,
				health: getHealth(getRandomRange(0,3)),
				encryption: getRandomRange(0,2),
				authentication: getAuth(getRandomRange(0,3)),
				uptime: getRandomRange(sampleMachine.uptime, sampleMachine.uptime + 100),
				hostname: sampleMachine.hostname,
				sp: {
					user_name: sampleMachine.sp_user_name,
					platform_uuid: sampleMachine.sp_platform_uuid,
					physical_memory: 4 + getRandomRange(0,24) % (24 - 4 + 1),	// Gets a random even number between [4 - 24]
					os_version: sampleMachine.sp_os_version,
					cpu_type: sampleMachine.sp_cpu_type,
					machine_name: sampleMachine.sp_machine_name,
					serial_number: sampleMachine.sp_serial_number
				},
				product_version: sampleMachine.macosx_productversion,
				swapsize: getRandomRange(sampleMachine.swapsize_mb, sampleMachine.swapsize_mb + 1000),
				swapfree: getRandomRange(sampleMachine.swapfree_mb, sampleMachine.swapfree_mb + 1000),
				timezone: sampleMachine.timezone,
				virtual: sampleMachine.virtual,
				ip: sampleMachine.ipaddress,
				fqdn: sampleMachine.fqdn,
				warranty: sampleMachine.apple_warranty,
				location: {
					latitude: getRandomRange(sampleMachine.location_lat - 2, sampleMachine.location_lat + 2),
					longitude: getRandomRange(sampleMachine.location_long - 2, sampleMachine.location_long + 2) 
				},
				wanIp: sampleMachine.wan_ip,
				updates: updates[getRandomRange(0,5)]
			};

			machines.push(machine);
		}

		return machines;
	}

	function getRandomRange(min, max) {
        return parseInt(Math.random() * (max - min) + min);
    }

	return {
		getMachines: function() {
			return getDummyMachines();
		},
		getEncrypted: function(macs) {
			var encrypted = 0;
			var non_encrypted = 0;
			var percent = 0;

			for(var i = 0; i < macs.length; i++) {
				console.log(macs[i]);
				encrypted += macs[i].encryption;
			}

			non_encrypted = macs.length - encrypted;

			percent = (encrypted / macs.length) * 100;

			return { encrypted: encrypted, non_encrypted: non_encrypted,
			percent: percent};
		}
	}
})();

/*
 * This controller handles functionality related to the multiple machines page
 */
app.controller('MachinesCtrl', ['MachineService', '$location', '$routeParams', '$interval','$rootScope',
    function(MachineService, $location, $routeParams, $interval,$rootScope) {
    	var self = this;
    	self.user = app.user;	//User info as defined in awdapp.js
		self.user.username = "javier";

		var flag = 0;

		// Gets the machines from the MachineService provider. The call back is needed because the value
		// the service use a PROMISE in order to fetch the data. The callback is then used inside of the
		// Service when the data is finally retrieved. (Thanks to JavaScript Asynchronous behavior... -_- )
		self.machines = MachineService.update(function(machines){ 
			self.machines = machines; 
			self.uptimes = getUptimes();
			
			self.changeUptimes = function() {
				self.uptimes = [];

				for(var i = 0; i < self.machines.length; i++) {
					if(flag == 0 && i%2 == 0) self.uptimes.push(self.machines[i].uptime);
					else if(flag == 1) self.uptimes.push(self.machines[i].uptime);
				}

				(flag == 0)?flag = 1:flag = 0;
			}

		});

		// Gets all of the machine uptimes
		function getUptimes() {
			var uptimeList = [];

			for(var i = 0; i < self.machines.length; i++) {
				uptimeList.push(self.machines[i].uptime);
			}

			return uptimeList;
		}
 }]);