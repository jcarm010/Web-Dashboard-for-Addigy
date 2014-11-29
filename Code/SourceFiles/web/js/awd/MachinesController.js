/*
 * This controller handles functionality related to the multiple machines page
 */
app.controller('MachinesCtrl', ['MachineFactory', '$location', '$routeParams', '$interval','$rootScope', '$scope', '$q', '$timeout',
    function(MachineFactory, $location, $routeParams, $interval, $rootScope, $scope, $q, $timeout) {
    	var self = this;
    	self.user = app.user;	//User info as defined in awdapp.js
		self.user.username = "javier";
		self.shifted = false;
		var pdAdmin = "PRSETPR";

		var PDJS = new PDJSobj({
		  subdomain: "wda-dev",
		  token: "RLT51aJ1fzD9Lbrsr28g",
		});

		// Key command to check for a global shift
		$(document).on('keyup keydown', function(e){
			self.control = e.ctrlKey;
		});

		// Machines's Panel
		self.machinePanel = {
			machines: [],
			primary: "",
			secondary: "",
			suffix: "",
			lastClicked: ""
		}

		// Sets up Machines for panel
		self.updatePanel = function(machines, prim, secon, suffix, $event) {
			self.machinePanel.machines = machines;
			self.machinePanel.primary = prim;
			self.machinePanel.secondary = secon;
			self.machinePanel.suffix = suffix;
			self.machinePanel.lastClicked = $event.target;
			self.machineSingleView.view = false;

			if(self.control){
				var machine = _.sortBy(machines, function(machine){
					return machine[prim];
				});
				self.machineSingleView.machine = machine[0];
				self.toggleSingleView();
			}
		}

		self.showSingleMachineFromId = function(id) {
			if(!$scope.$$phase) {
				$scope.$apply();
			}

			for(var i = 0; i < self.machinesBackup.length; i++) {
				if(self.machinesBackup[i].connectorid == id){
					self.showSingleMachine(self.machinesBackup[i]);
					return;
				}
			}
		}

		self.showSingleMachine = function(machine) {
			self.machineSingleView.machine = machine;
			self.machineSingleView.view = true;
		}

		// Single Machine Panel
		self.machineSingleView = {
			machine: null,
			view: false
		}

		self.filterModule = {
			filters: [],
			options: []
		}

		filters = {
			pro: "",
			min: 0,
			max: 999999
		}

		self.addFilter = function() {

		}

		// Toggles the Single View side panel
		self.toggleSingleView = function() {
			self.machineSingleView.view = !self.machineSingleView.view;
		}

		// Sets up the single Machine for the panel
		self.getSingleMachine = function(id){
			for(var i = 0; i < self.machines.length; i++) {
				if(self.machines[i].connectorid === id){
					self.machineSingleView.machine = self.machines[i];
					self.toggleSingleView();
				}
			}
		}
		
		// Gets the image for the correct machine type
		self.getMachineImage = function(type){
			if(type == "MacBook Pro"){
				return "img/machines/macbookpro.png";
			} else if(type == "MacBook Air"){
				return "img/machines/macbookair.png";
			} else if(type == "Mac Mini"){
				return "img/machines/macmini.png";
			}

			return "";
		}

		//Machine Uptimes
		self.machineUptimes = {
			low: [],
			mid: [],
			high: []
		};

		// Machine Memory
		self.machineMemories = {
			low: [],
			mid: [],
			high: []
		};

		// Machine Disk Space
		self.machineDiskSpace = {
			low: [],
			mid: [],
			high: []
		}

		// Machine Warranty
		self.machineWarranty = {
			low: [],
			mid: [],
			high: []
		}

		// Machine Types
		self.machineType = {
			mini: [],
			pro: [],
			air: []
		}

		// Machine Encryption
		self.machineEncryption = {
			yes: [],
			no: []
		}

		// Error Alerts
		self.errorAlerts = {
			alerts: []
		}

		var flag = 0;

		// Gets the machines from the MachineService provider. The call back is needed because the value
		// the service use a PROMISE in order to fetch the data. The callback is then used inside of the
		// Service when the data is finally retrieved. (Thanks to JavaScript Asynchronous behavior... -_- )
		MachineFactory.then(function(res){ 
			self.machines = res.data['@items'];
			self.machinesBackup = self.machines;

			// check fo any errors in any of the machines
			detectMachineErrors(self.machines);

			updateData();
		});

		self.pdUsers = [];
		self.pdErrors = [];

		function updatePDErrors() {
			var errors = [];

			PDJS.api_all({
			  res: "incidents",
			  data: {
			  	status: "triggered",
			    fields: "id,incident_key,status,assigned_to,created_on,trigger_summary_data,escalation_policy,html_url"
			  },
			  final_success: function(data) {
			  	for(var i = 0; i < data.incidents.length; i++) {
			  		var error = {
			  			id: data.incidents[i].id,
						connectorid: data.incidents[i].incident_key,
						error: data.incidents[i].trigger_summary_data.description,
						assignedUserId: data.incidents[i].assigned_to[0].object.id,
						assignedUserName: data.incidents[i].assigned_to[0].object.name,
						htmlUrl: data.incidents[i].html_url
			  		}
			  		errors.push(error);
			  	}
			  }
			});

			return errors;
		}

		function detectMachineErrors(machines) {
			for(var i = 0; i < machines.length; i++) {
				if(_.has(machines[i], 'error')) {
					addDOMAlert(machines[i]);
				}
			}

			updateDataTimer(3000);
		}

		function addDOMAlert(machine) {
			// Check if the timestamp is newer that the one stored locally
			if(_.has(localStorage, machine.connectorid)) {
				if(new Date(machine.error.time) > new Date(localStorage[machine.connectorid])) {
					localStorage[machine.connectorid] = machine.error.time;
					pagerDutyReport(machine);
					//showDOMAlert(machine);
				}
			} else {
				localStorage.setItem(machine.connectorid, machine.error.time);
				pagerDutyReport(machine);
				//showDOMAlert(machine);
			}
		}

		function showDOMAlert(machine) {
			self.errorAlerts.alerts.push({ index: self.errorAlerts.alerts.length, machine: machine });
		}

		self.removeDOMAlert = function(index) {
			if(self.errorAlerts.alerts.length == 1) {
				self.errorAlerts.alerts = [];
			} else {
				self.errorAlerts.alerts.splice(index, 1);
			}
		}

		function pagerDutyReport(machine) {
			PDJS.trigger({
			  service_key: "b3fb6d8b4bd544d2a61b3643a48cddf0",
			  description: machine.error.description,
			  incident_key: machine.connectorid,
			  details: {
			    cause: machine.error.cause
			  }
			});
		}

		function retrievePdUsers() {
			var users = [];

			PDJS.api({
			  res: "users",
			  data: {
			  	requester_id: pdAdmin,
			  },
			  success: function (json) {
			  	for(var i = 0; i < json.users.length; i++) {
				  	var user = {
				  		id: json.users[i].id,
				  		name: json.users[i].name
				  	}

				  	users.push(user);
			  	}
			  }
			});

			return users;
		}

		self.acknowledgeError = function(id) {
			PDJS.api({
			  res: "incidents/"+ id +"/acknowledge",
			  type: "PUT",
			  data: {
			  	requester_id: pdAdmin,
			  },
			  success: function() {
			  	alert("Error was successfully acknowledged!");
			  }
			});

			updateDataTimer(2000);
		}

		self.resolveError = function(id) {
			PDJS.api({
			  res: "incidents/"+ id +"/resolve",
			  type: "PUT",
			  data: {
			  	requester_id: pdAdmin,
			  },
			  success: function() {
			  	alert("Error was successfully resolved!");
			  }
			});

			updateDataTimer(2000);
		}

		self.reassignError = function(user, id) {
			PDJS.api({
			  res: "incidents/"+id+"/reassign",
			  type: "PUT",
			  data: {
			  	requester_id: pdAdmin,
			  	assigned_to_user: user
			  },
			  success: function() {
			  	alert("Error was successfully reassigned!");
			  }
			});
		}

		function updateDataTimer(time) {
			setTimeout(function(){
				updateData();
			}, time);
		}

		function updateData() {
			self.machineUptimes = getUptimes();
			self.machineMemories = getMemory();
			self.machineDiskSpace = getDiskSpace();
			self.machineWarranty = getWarranty();
			self.machineType = getMachineTypes();
			self.machineEncryption = getEncryptions();
			self.pdErrors = updatePDErrors();
			self.pdUsers = retrievePdUsers();

			if(!$scope.$$phase) {
				$scope.$apply();
			}

			if(self.machinePanel.lastClicked){
				$timeout(function() {
					angular.element(self.machinePanel.lastClicked).trigger('click');
				}, 0);
			}

			self.updateMap();
		}

		function getUptimes() {
			var uptimes = { low: [], mid: [], high: [] };

			var lowDelta = { A: 0, B: 1 };
			var midDelta = { A: 1, B: 7 };
			//var highDelta = { A: 7, B: 9999999999 };

			for(var i = 0; i < self.machines.length; i++) {
				if(self.machines[i].uptime > lowDelta.A && self.machines[i].uptime < lowDelta.B) { 
					uptimes.low.push(self.machines[i])
				} else if (self.machines[i].uptime > midDelta.A && self.machines[i].uptime < midDelta.B) {
					uptimes.mid.push(self.machines[i])
				} else {
					uptimes.high.push(self.machines[i])
				}
			}

			return uptimes;
		}

		function getMemory() {
			var memory = { low: [], mid: [], high: [] };

			var lowDelta = { A: 1, B: 3 };
			var midDelta = { A: 4, B: 8 };
			//var highDelta = { A: 7, B: 9999999999 };

			for(var i = 0; i < self.machines.length; i++) {
				if(self.machines[i].sp_physical_memory > lowDelta.A && self.machines[i].sp_physical_memory < lowDelta.B) { 
					memory.low.push(self.machines[i])
				} else if (self.machines[i].sp_physical_memory > midDelta.A && self.machines[i].sp_physical_memory < midDelta.B) {
					memory.mid.push(self.machines[i])
				} else {
					memory.high.push(self.machines[i])
				}
			}

			return memory;
		}

		function getDiskSpace() {
			var disk = { low: [], mid: [], high: [] };

			var diskPercent = 0;

			var lowDelta = { A: 0, B: 80 };
			var midDelta = { A: 80, B: 90 };
			//var highDelta = { A: 7, B: 9999999999 };

			for(var i = 0; i < self.machines.length; i++) {
				diskPercent = (self.machines[i].swapfree_mb/self.machines[i].swapsize_mb)*100;

				if(diskPercent > lowDelta.A && diskPercent < lowDelta.B) { 
					disk.low.push(self.machines[i])
				} else if (diskPercent > midDelta.A && diskPercent < midDelta.B) {
					disk.mid.push(self.machines[i])
				} else {
					disk.high.push(self.machines[i])
				}
			}

			return disk;
		}

		function getWarranty() {
			var date = { low: [], mid: [], high: [] };

			var machineDate = new Date();
			var millisecondsInDay = 86400000;

			var low = { A: 30, B: 9999999};
			var mid = { A: 7, B: 30 };

			var lowDelta = { A: new Date(new Date().setTime(new Date().getTime()+millisecondsInDay*low.A)),
			                 B: new Date(new Date().setTime(new Date().getTime()+millisecondsInDay*low.B))};
			var midDelta = { A: new Date(new Date().setTime(new Date().getTime()+millisecondsInDay*mid.A)),
			                 B: new Date(new Date().setTime(new Date().getTime()+millisecondsInDay*mid.B))};
			//var highDelta = { A: 0, B: 7 };

			for(var i = 0; i < self.machines.length; i++) {
				machineDate = new Date(self.machines[i].apple_warranty);
				if(machineDate > lowDelta.A && machineDate < lowDelta.B) { 
					date.low.push(self.machines[i])
				} else if(machineDate > midDelta.A && machineDate < midDelta.B) { 
					date.mid.push(self.machines[i])
				} else {
					date.high.push(self.machines[i])
				}
			}

			return date;
		}


		function getMachineTypes() {
			machines = { pro: [], air: [], mini: [] };

			for(var i = 0; i < self.machines.length; i++) {
				if(self.machines[i].sp_machine_name == "MacBook Pro"){
					machines.pro.push(self.machines[i]);
				} else if(self.machines[i].sp_machine_name == "MacBook Air"){
					machines.air.push(self.machines[i]);
				} else if(self.machines[i].sp_machine_name == "Mac Mini"){
					machines.mini.push(self.machines[i]);
				}
			}

			return machines;
		}

		function getEncryptions() {
			var encryption = {yes: [], no: []};

			for(var i = 0; i < self.machines.length; i++) {
				if(!self.machines.swapencrypted){
					encryption.yes.push(self.machines[i]);
				} else {
					encryption.no.push(self.machines[i]);
				}
			}

			return encryption;
		}

		self.map;
		self.circles = [];
        var markers = [];
        self.circleSelected = false;

        self.updateMap = function() {
            // Sometimes the machines are empty, 
            // in which case, don't update the chart with null data
            if(typeof self.machines == 'undefined') return;

            if(!self.map) {
                var myOptions = {
                    zoom: 4,
                    center: new google.maps.LatLng(self.machines[0].location_lat, self.machines[0].location_long),
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                self.map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
            }

            clearMarkers();
            
			generateCircles()
        };

        function addMarkers(machines){
        	for(var i = 0; i < machines.length; i++) {
                addMarker(machines[i]);
            }
        }

        function addMarker(machine){
            var myLatlng = new google.maps.LatLng(machine.location_lat, machine.location_long);
            var icon = (_.has(machine, 'error'))?'img/machines/mac_desktop_error.png':'img/machines/mac_desktop.png';
            var marker = new google.maps.Marker({
                position: myLatlng, 
                map: self.map,
                title: machine.sp_user_name,
                icon: icon,
                animation: google.maps.Animation.DROP,
                machine: machine
            });

            google.maps.event.addListener(marker, 'click', function() {
                self.showSingleMachine(marker.machine);

                if(!$scope.$$phase) {
					$scope.$apply();
				}
            });

           markers.push(marker);
        }

        function clearMarkers(){
            if(markers.length != 0){ 
                for(var i = 0; i < markers.length; i++) {
                    markers[i].setMap(null); 
                }
            }

            if(self.circles.length != 0){ 
				for(var i = 0; i < self.circles.length; i++) {
                    self.circles[i].setMap(null); 
                }
			}
        }

        function addCircle(circle) {
        	var circ = new google.maps.Circle({
            	machines: circle.machines,
            	clickable: true,
            	strokeColor: circle.fillColor,
            	strokeOpacity: 0.8,
            	strokeWeight: 2,
            	fillColor: circle.fillColor,
            	fillOpacity: 0.35,
            	map: self.map,
            	center: new google.maps.LatLng(circle.center.lat, circle.center.lon),
            	radius: circle.radius
            });

			google.maps.event.addListener(circ, 'click', function() {
				if(self.control){
					var machine = _.sortBy(circ.machines, function(machine){
						return machine.connectorid;
					});
					self.machineSingleView.machine = machine[0];
					if(self.machineSingleView.view == false) {
						self.toggleSingleView();
					}
					$scope.$apply();
					return;
				}

				self.changeUptimes(circ.machines);
				clearMarkers();
				self.map.panTo(circ.center);
				addMarkers(circ.machines);
				smoothZoom(self.map, 19, self.map.getZoom(), true);
			});

			self.circles.push(circ);
        }

        function generateCircles(circle) {
        	var circles = generateMapCircles();

        	for(var i = 0; i < circles.length; i++) {
				addCircle(circles[i]);
        	}
        }

        function generateMapCircles() {
        	var mapCircles = [];
        	var machineGroups = [];
        	var machineGroupTreshhold = [];

        	// Go Through all of the machines in order to place them in groups
        	for(var i = 0; i < self.machines.length; i++) {
        		var inserted = false;

        		// Go trhough all of the group treshholds to figure out
        		// where to place the current machine based on location
        		for(var j = 0; j < machineGroupTreshhold.length; j++) {
        			if(machineGroupTreshhold[j].lat == parseInt(self.machines[i].location_lat) &&
        				machineGroupTreshhold[j].log == parseInt(self.machines[i].location_long)){
        					machineGroups[j].push(self.machines[i]);
        					inserted = true;
        			}
        		}

        		// If there are no groups currently, we must create one
        		if(!inserted) {
        			machineGroupTreshhold.push({
        				lat: parseInt(self.machines[i].location_lat),
        				log: parseInt(self.machines[i].location_long)
        			});

        			machineGroups.push([self.machines[i]]);
        		}
        	}

        	// Once the machines are sepparated into groups, we can determine the radius and center of
        	// the circle
        	for(var i = 0; i < machineGroups.length; i++){
        		var cord = { 
        			maxY: machineGroups[i][0].location_lat,
        			maxX: machineGroups[i][0].location_long,
        			minY: machineGroups[i][0].location_lat,
        			minX: machineGroups[i][0].location_long
        		};

        		// Error flag
        		var error = false;

        		// Check the boundaries for the X and Y coordinates
        		// Check for any errors in the current machines
        		for(var j = 0; j < machineGroups[i].length; j++){
        			if(cord.maxY < machineGroups[i][j].location_lat){ cord.maxY = machineGroups[i][j].location_lat }
    				if(cord.maxX < machineGroups[i][j].location_long){ cord.maxX = machineGroups[i][j].location_long }
    				if(cord.minY > machineGroups[i][j].location_lat){ cord.minY = machineGroups[i][j].location_lat }
					if(cord.minX > machineGroups[i][j].location_long){ cord.minX = machineGroups[i][j].location_long }

					// One of the machines in this group has an error
					if(_.has(machineGroups[i][j], 'error')) {
						error = true;
					}
        		}

        		// The coordinates for one group are done, now we figure out the radius and center
        		var y = cord.maxY - cord.minY;
        		var x = cord.maxX - cord.minX;
        		var center = { lon: cord.maxX - (x/2), lat: cord.maxY - (y/2) };
        		var radius = 0;
        		var offset = 105000;
        		var color = (error)?'#FF0000':'#008000';

        		if(y > x) { radius = y; }
        		else { radius = x; }

        		// Give it a bigger radius for usability
        		radius += offset;

        		var circle = {
        			machines: machineGroups[i],
        			fillColor: color,
        			center: center,
        			radius: radius
        		}

        		mapCircles.push(circle);
        	}

        	return mapCircles;
        }

        function smoothZoom (map, level, cnt, mode, callback) {
			// If mode is zoom in
			if(mode == true) {

				if (cnt >= level) {
					return;
				}
				else {
					var z = google.maps.event.addListener(map, 'zoom_changed', function(event){
						google.maps.event.removeListener(z);
						smoothZoom(map, level, cnt + 1, true);
					});
					setTimeout(function(){map.setZoom(cnt)}, 100);
				}
			} else {
				if (cnt <= level) {
					return;
				}
				else {
					var z = google.maps.event.addListener(map, 'zoom_changed', function(event) {
						google.maps.event.removeListener(z);
						smoothZoom(map, level, cnt - 1, false);
					});
					setTimeout(function(){map.setZoom(cnt)}, 100);
				}
			}
		}

		
		self.changeUptimes = function(machines) {
			self.map.setZoom(4);
			//smoothZoom(self.map, 2, self.map.getZoom(), false);
			newMachines = self.machinesBackup;

			if(typeof machines != 'undefined') {
				newMachines = machines;
			}

			self.machines = newMachines;
			updateData();

			/*if(!$scope.$$phase) {
				$scope.$apply();
			}*/
		};
}]);

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

var superSet = {
   github_login: "addigy",
   github_token: "8340f7ec9736e8b42ab53b3d97fdf577edcc5fd4",
   boxen_home: "/opt/boxen",
   boxen_srcdir: "/Users/jason/src",
   boxen_repodir:"/opt/boxen/repo",
   boxen_user: "jason",
   luser: "jason",
   architecture: "x86_64",
   kernel: "Darwin",
   macaddress: "84:38:35:4a:74:c0",
   osfamily: "Darwin",
   operatingsystem: "Darwin",
   facterversion: "1.7.3",
   hardwareisa: "i386",
   hardwaremodel: "x86_64",
   hostname: "jasons-air",
   id: "jason",
   interfaces: "lo0,gif0,stf0,en0,en2,bridge0,p2p0",
   ipaddress_lo0: "127.0.0.1",
   netmask_lo0: "255.0.0.0",
   mtu_lo0: "16384",
   mtu_gif0: "1280",
   mtu_stf0: "1280",
   ipaddress_en0: "192.168.1.149",
   macaddress_en0: "84:38:35:4a:74:c0",
   netmask_en0: "255.255.255.0",
   mtu_en0: "1500",
   macaddress_en2: "32:00:1b:eb:40:00",
   mtu_en2: "1500",
   macaddress_bridge0: "86:38:35:a4:87:00",
   mtu_bridge0: "1500",
   macaddress_p2p0: "06:38:35:4a:74:c0",
   mtu_p2p0: "2304",
   ipaddress: "192.168.1.149",
   kernelmajversion: "13.4",
   kernelrelease: "13.4.0",
   kernelversion: "13.4.0",
   sp_smc_version_system: "2.13f9",
   sp_boot_rom_version: "MBA61.0099.B12",
   sp_cpu_type: "Intel Core i7",
   sp_current_processor_speed: "1.7 GHz",
   sp_l2_cache_core: "256 KB",
   sp_l3_cache: "4 MB",
   sp_machine_model: "MacBookAir6,2",
   sp_machine_name: "MacBook Air",
   sp_number_processors: "2",
   sp_packages: "1",
   sp_physical_memory: "8 GB",
   sp_platform_uuid: "51103BF7-05AA-5988-99F8-EB6B2B867F00",
   sp_serial_number: "C2QLP009FMRW",
   sp_boot_mode: "normal_boot",
   sp_boot_volume: "Macintosh HD",
   sp_kernel_version: "Darwin 13.4.0",
   sp_local_host_name: "Jason’s MacBook Air",
   sp_os_version: "OS X 10.9.5 (13F34)",
   sp_secure_vm: "secure_vm_enabled",
   sp_uptime: "up 0:0:57:18",
   sp_user_name: "Jason Dettbarn (jason)",
   macosx_productname: "Mac OS X",
   macosx_productversion: "10.9.5",
   macosx_buildversion: "13F34",
   macosx_productversion_major: "10.9",
   macosx_productversion_minor: "5",
   productname: "MacBookAir6,2",
   memorysize: "8.00 GB",
   memoryfree: "3.50 GB",
   swapsize: "1024.00 MB",
   swapfree: "1024.00 MB",
   swapsize_mb: "1024.00",
   swapfree_mb: "1024.00",
   memorysize_mb: "8192.00",
   memoryfree_mb: "3587.45",
   swapencrypted: true,
   memorytotal: "8.00 GB",
   netmask: "255.255.255.0",
   network_lo0: "127.0.0.0",
   network_en0: "192.168.1.0",
   operatingsystemrelease: "13.4.0",
   path: "/opt/boxen/repo/.bundle/ruby/2.0.0/bin:node_modules/.bin:/opt/boxen/nodenv/shims:/opt/boxen/nodenv/bin:bin:/opt/boxen/rbenv/shims:/opt/boxen/rbenv/bin:/opt/boxen/rbenv/plugins/ruby-build/bin:/opt/boxen/bin:/opt/boxen/homebrew/bin:/opt/boxen/homebrew/sbin:/usr/local/heroku/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/Users/jason/.rvm/bin",
   processorcount: "4",
   ps: "ps auxwww",
   puppetversion: "3.3.1",
   rubysitedir: "/Library/Ruby/Site/2.0.0",
   rubyversion: "2.0.0",
   sshdsakey: "AAAAB3NzaC1kc3MAAACBAPkH3qEKuvoPfD9J4Y5sbVJVPL9TWx+THPKqxZfiznGj63O0rHEe+Hgad0OolMlYfNph5zIknR6RRnK6wNQvoTvdQUmhYo1BbGat3rV6oNn0E0ZCK75ZhO4Ho8hjCUGaybn1ShAkfnVgXOP1v9kOXCDIskbKsk9gmC2r/86MY5j3AAAAFQCjC1vT8tcrmSFj5wj2cxJDMtQzdwAAAIBlU1NZUzNpPpA/KiqO3LvQ5qj4/i2uQDtLU3rFNxagBosYh5THXXPK3HVVcN0OnP7NyFtbUk3urs36T/xMUkAl6XfSZ2U656dTP82LFAuJNmiWrf55lNhoMbrJoRje9p8mZNYNtvj9PL4qwjvPUxu9shOfcefQmSeVs+3epnhr1AAAAIEAoh35DrfQB3swy+iVQc974ECbzihh41tSdjloPuLS0vewIiJ92I9GbMM2FZFKRgXotOMpFSLlHO1/tLuq/Lx4vRm9P9lAu8fczJ2bWqeDYxnwR3NzWE8rZkhzClypNMtXPeFwY63wS6sqzND+HNJ5gz3H0NzMaMBAmeZKrnF7G/g=",
   sshfp_dsa: "SSHFP 2 1 5457c031a4f29ca326e00ee9bc2d080fd2d03917\nSSHFP 2 2 6276cb46c377974f85ba015512ea87a7b91be077ec6e31c191ad5a367c283e64",
   sshrsakey: "AAAAB3NzaC1yc2EAAAADAQABAAABAQCfPSVH62rYJ9pCq93QPAZWMCs7h0uvRG2vW2rq4p5S0BqrPubVXxfP5wlI9Ou85/38TyB0CX7eGIjppekpVeFaQylpMG8h0jxegRAxEbGLKu6u9K6XuaCujhu/yXfC2abbjYX8HxJxeILaltINwKTAoxWjp8CarpdCHY5m0XZQxfLGE7h5nN6ceslI3Bd7VAZk74GVxX4DTXkIEWW2GdWgX13mUxIIY9TRGWyk+y6NUX0h2EnW9NXY63STQHVdwYLyZfF0a8Ngi9YDgGxAC/HXnJTEePHQEyhehOWhk7bRDzgrOPGE8y3fkcDW6jx1uw+USrcSimdksRiZfqRb9Zw1",
   sshfp_rsa: "SSHFP 1 1 8052c3bc52d6f9c6831fa8cb0009dbb18bb98831\nSSHFP 1 2 5cae7ee6a6dd68edf9b52fe44d0ece8020ea7141fce7007ba95b9e361490bf3c",
   timezone: "EDT",
   uptime: "0:56 hours",
   uptime_days: 0,
   uptime_hours: 0,
   uptime_seconds: 3410,
   virtual: "physical",
   is_virtual: "false"
}