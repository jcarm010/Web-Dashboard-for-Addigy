/*
 * This controller handles functionality related to the single machine page
 */
app.controller('MachineCtrl', ['PubNub', 'DataRequest', '$location', '$routeParams', '$timeout','$interval','$rootScope',
    function(PubNub, DataRequest, $location, $routeParams, $timeout ,$interval,$rootScope) {
        var timeOut = 6000;
        var self = this;
        this.user = app.user;//user specific info as defined in awdapp.js
        this.machineId = $routeParams.machineId;//the machine id
        this.lastReported = 0;
        //tells whether the machine is online
        this.machineOnline = function(){
            return self.lastReported + timeOut > getCurrentTime();
        };
        //an object representing this machine's memory usage
        this.memory = {
            totalMemory: 16000,
            usedMemory: 400,
            usedPercent: function(){
                return parseInt(this.usedMemory * 100 / this.totalMemory);
            }
        };
        //an object representing this machine's cpu usage
        this.cpu = {
            used: 2000,
            max: 2600,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        //an object representing this object's network download usage
        this.networkDown = {
            used: 20,
            max: 1000,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        //an object representing this object's network upload usage
        this.networkUp = {
            used: 20,
            max: 1000,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        //a container that holds processes running on the machine
        this.processContainer = new ProcessContainer();
        //get the Pubnub keys and initialize pubnub
        DataRequest.getPubnubKeys().then(function(data){
            var keys = data;//the keys
            PubNub.init(keys);//initialize with keys
            var theChannel = self.machineId;//the channel si the machine id
            PubNub.ngSubscribe({ channel: theChannel });//listen on messages from this channel
            $rootScope.$on(PubNub.ngMsgEv(theChannel), onMessage);//call onMessage when received a message
            reportPresence();
        });
        //handles the event of receiving a message
        function onMessage (event, payload) {
            var msg = payload.message;//get the received message
            var type = msg.msgType;//get the type of message
            if(type === 'statistics' ){//when received statistics
                processStatistics(msg);//processes the statistics received
            }else if(type === 'singleProcess'){//when received single process data
                processSingleProcess(msg);//process the single process message
            }else if(type === 'reportRequest'){//if asked to report presence
                reportPresence();//report presence
            }else if(type === 'reportPresence'){//if someone reporting presence
                processPresenceReport(msg);
            }
        }
        function getCurrentTime(){
            return new Date().getTime();
        }
        function processPresenceReport(msg){
            if(msg.machineId === self.machineId){
                self.lastReported = currentTime();
            }
        }
        function sendReportRequest(){
            PubNub.ngPublish({//publish a message asking who is online
                channel: self.machineId,
                message: {msgType:"reportRequest"}
            });
        }
        //reports that this client is listening on this channel
        function reportPresence(){
            console.log("reporting presence");
            PubNub.ngPublish({//publish a message sayimg that i am listening
                channel: self.machineId,
                message: {msgType:"reportPresence",machineId:"web-listener"}
            });
        }
        //process a single process that has been received
        function processSingleProcess(msg){
            if(msg.timeStamp < self.processContainer.timeStamp) return;//check for old data
            self.lastReported = getCurrentTime();//set the current time
            var proc = msg.process;//get the proess data
            var process = new Process({//turn into process
                id:proc.PID,
                name:proc.COMM,
                cpu: proc.CPU,
                memory: proc.MEM,
                priority: proc.PRI,
                nice: proc.NI,
                user: proc.USER_NAME
            });
            //add process where it needs to be
            self.processContainer.insertProcess(process,msg.index,msg.total,msg.timeStamp);
        }
        //process the statistics sent by the machine
        function processStatistics(msg){
            if(msg.timeStamp < self.processContainer.timeStamp) return;//check that it is not old data
            self.lastReported = getCurrentTime();//set the time i received this data
            self.processContainer.clear();//clear the list of processes
            var processes = msg.processes;   
            for(var i = 0 ; i < processes.length ; i++){//go through the processes
                var proc = processes[i];//get one process of the list
                var process = new Process({//set the process data
                    id:proc.PID,
                    name:proc.COMM,
                    cpu: proc.CPU,
                    memory: proc.MEM,
                    priority: proc.PRI,
                    nice: proc.NI,
                    user: proc.USER_NAME
                });
                //add to the current list of processes
                self.processContainer.addLastProcess(process,msg.timeStamp);
            }
        }
        //chech that machine is online every timeout time
        $interval(function(){
            if(!self.machineOnline())
                sendReportRequest();
        },timeOut);
        function ProcessContainer(){
            var container = this;
            this.allSelected = false;
            this.timeStamp = 0;
            this.processes = [
//                {id:3445, name:'Process 1', cpu:20, memory:20, priority: 15, nice: 5, user: "john", selected: false},
//                {id:3445, name:'Process 1', cpu:20, memory:20, priority: 15, nice: 5, user: "john", selected: false},
//                {id:3445, name:'Process 1', cpu:20, memory:20, priority: 15, nice: 5, user: "john", selected: false}
            ];
            this.map = {};//map<string,int> - map from id to position in array
            this.toggleAllProcesses = function(){//toggles all processes to be selected or not selected
                //got through all processes
                for(var i = 0 ; i < container.processes.length; i++){
                    var curr = container.processes[i];
                    curr.selected = !container.allSelected;//toggle it
                }
            };
            //sends to kill all the selected processes
            this.killSelected = function(){
                for(var i = 0 ; i < container.processes.length;i++){
                    var proc = container.processes[i];
                    if(proc.id && !proc.selected) continue;//if it is selected
                        PubNub.ngPublish({//send request to kill
                            channel: self.machineId,
                            message: {msgType:"killRequest",pid:proc.id}
                        });
                }
            };
            //insert process in the list of processes
            this.insertProcess = function(process,index,outOf,timeStamp){
                if(timeStamp < this.timeStamp) return;//check for old data
                this.timeStamp = timeStamp;//set the time for this message
                //get the position of this process if existing
                var position = this.map[process.id];
                //modify the list of processes to be of size outOf
                modifyProcessesTo(outOf);
                //if process is not in the list
                if(!position && position!==0){//put the process at specified index
                    container.processes[index] = process;
                    container.map[process.id] = index;
                }else{//if process is already in the list
                    var pInList;
                    if(position >= container.processes.length)
                        pInList = process;
                    else{
                        pInList = container.processes[position];
                        pInList.update(process);
                    }
                    if(position !== index){
                        if(position < container.processes.length)
                            container.processes[position] = new Process(null);
                        container.processes[index] = pInList;
                        container.map[pInList.id] = index;
                    }
                }
            };
            this.addLastProcess = function(process,timeStamp){
                if(timeStamp < this.timeStamp) return;
                this.timeStamp = timeStamp;
                var position = this.map[process.id];
                if(!position && position!==0){//not in set
                    this.processes.push(process);
                    updateMap(this.processes.length-1, this.processes.length-1);
                }else{
                    var proc = this.processes[position];
                    proc.update(process);
                    this.processes.push(proc);
                    updateMap(position, this.processes.length-1);
                }
            };
            this.clear = function(){
                this.processes = [];
                this.map = {};
            };
            function updateMap(from,to){
                for(var i = from ; i <= to;i++){
                    var proc = container.processes[i];
                    container.map[proc.id] = i;
                }
            }
            function modifyProcessesTo(qty){
                if(qty>=container.processes.length){
                    while(container.processes.length < qty)
                        container.processes.push(new Process(null));
                }else {
                    while(container.processes.length >= 0 && container.processes.length > qty){
                        var toRemove = container.processes.length-1;
                        container.map[toRemove.id] = null;
                        container.processes.splice(container.processes.length-1,1);
                    }
                }
            }
        }
        function Process(init){
            var self = this;
            self.update = function(process){
                self.id = initOpt("id",process);
                self.name = initOpt("name",process);
                self.cpu = initOpt("cpu",process);
                self.memory = initOpt("memory",process);
                self.priority = initOpt("priority",process);
                self.nice = initOpt("nice",process);
                self.user = initOpt("user",process);
            };
            self.update(init);
            self.selected = false;
            self.setSelected = function(value){
                self.selected = value;
            };
            function initOpt(field, proc){
                return proc?proc[field]:proc;
            }
        }
        var pcount = 2000;
        $interval(setDummyData,1500);
        function setDummyData(){
            
            self.memory.usedMemory = parseInt(getRandomArbitrary(500,self.memory.totalMemory));
            $("#memory-usage-knob").trigger(
                'configure',{
                    "max":self.memory.totalMemory,
                    "fgColor":self.memory.usedPercent()>80?'#e06771':self.memory.usedPercent()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#memory-usage-knob").val(self.memory.usedMemory).trigger('change');

            self.cpu.used = parseInt(getRandomArbitrary(200,self.cpu.max));
            $("#cpu-usage-knob").trigger(
                'configure',{
                    "max":self.cpu.max,
                    "fgColor":self.cpu.usedPercent()>80?'#e06771':self.cpu.usedPercent()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#cpu-usage-knob").val(self.cpu.used).trigger('change');

            self.networkDown.used = parseInt(getRandomArbitrary(2,self.networkDown.max));
            $("#network-down-usage-knob").trigger(
                'configure',{
                    "max":self.networkDown.max,
                    "fgColor":self.networkDown.usedPercent()>80?'#e06771':self.networkDown.usedPercent()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#network-down-usage-knob").val(self.networkDown.used).trigger('change');

            self.networkUp.used = parseInt(getRandomArbitrary(2,self.networkUp.max));
            $("#network-up-usage-knob").trigger(
                'configure',{
                    "max":self.networkUp.max,
                    "fgColor":self.networkUp.usedPercent()>80?'#e06771':self.networkUp.usedPercent()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#network-up-usage-knob").val(self.networkUp.used).trigger('change');
        }
        setDummyData();
        function getRandomArbitrary(min, max) {
            return parseInt(Math.random() * (max - min) + min);
        }
    }]);