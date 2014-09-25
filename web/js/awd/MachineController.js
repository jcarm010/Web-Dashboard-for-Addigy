/*
 * This controller handles functionality related to the single machine page
 */
app.controller('MachineCtrl', ['PubNub', 'DataRequest', '$location', '$routeParams', '$interval','$rootScope',
    function(PubNub, DataRequest, $location, $routeParams, $interval,$rootScope) {
        var self = this;
        this.user = app.user;//user specific info as defined in awdapp.js
        this.user.username = "javier";
        this.machineId = $routeParams.machineId;
        this.memory = {
            totalMemory: 16000,
            usedMemory: 400,
            usedPercent: function(){
                return parseInt(this.usedMemory * 100 / this.totalMemory);
            }
        };
        this.cpu = {
            used: 2000,
            max: 2600,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        this.networkDown = {
            used: 20,
            max: 1000,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        this.networkUp = {
            used: 20,
            max: 1000,
            usedPercent: function(){
                return parseInt(this.used * 100 / this.max);
            }
        };
        //todo: toggle processes
        this.processContainer = new ProcessContainer();
        DataRequest.getPubnubKeys().then(function(data){
            var keys = data;
            PubNub.init(keys);
            var theChannel = self.machineId;
            PubNub.ngSubscribe({ channel: theChannel });    
            $rootScope.$on(PubNub.ngMsgEv(theChannel), onMessage);
        });
        
        function onMessage (event, payload) {
            // payload contains message, channel, env...
//            console.log("Message: ");
//            console.log(payload);
            var msg = payload.message;
            var type = msg.msgType;
            if(type === 'statistics' )
                processStatistics(msg);
            if(type === 'singleProcess')
                processSingleProcess(msg);
        }
        function processSingleProcess(msg){
//            console.log('Updating Process: ');
//            console.log(msg);
            if(msg.timeStamp < self.processContainer.timeStamp) return;
            var proc = msg.process;
            var process = new Process({
                id:proc.PID,
                name:proc.COMM,
                cpu: proc.CPU,
                memory: proc.MEM,
                priority: proc.PRI,
                nice: proc.NI,
                user: proc.USER_NAME
            });
            self.processContainer.insertProcess(process,msg.index,msg.total,msg.timeStamp);
        }
        function processStatistics(msg){
            if(msg.timeStamp < self.processContainer.timeStamp) return;
            console.log("Updating statistics");
            self.processContainer.clear();
            var processes = msg.processes;   
            processes.timeStamp = msg.timeStamp;
            for(var i = 0 ; i < processes.length ; i++){
                var proc = processes[i];
                var process = new Process({
                    id:proc.PID,
                    name:proc.COMM,
                    cpu: proc.CPU,
                    memory: proc.MEM,
                    priority: proc.PRI,
                    nice: proc.NI,
                    user: proc.USER_NAME
                });
                self.processContainer.addLastProcess(process,msg.timeStamp);
            }
            self.processes = processes;
        }
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
            this.toggleAllProcesses = function(){
                for(var i = 0 ; i < container.processes.length; i++){
                    var curr = container.processes[i];
                    curr.selected = !container.allSelected;
                }
            };
            this.killSelected = function(){
                console.log("Halting selected");
                for(var i = 0 ; i < container.processes.length;i++){
                    var proc = container.processes[i];
                    console.log(proc);
                    if(proc.id && !proc.selected) continue;
                    console.log("Ending pid: "+proc.id);
                    
                    PubNub.ngPublish({
                        channel: self.machineId,
                        message: {msgType:"killRequest",pid:proc.id}
                    });
                    
                }
            };
            this.insertProcess = function(process,index,outOf,timeStamp){
                if(timeStamp < this.timeStamp) return;
                this.timeStamp = timeStamp;
                var position = this.map[process.id];
                modifyProcessesTo(outOf);
                if(!position && position!==0){
                    container.processes[index] = process;
                    container.map[process.id] = index;
                }else{
                    var pInList = container.processes[position];
                    pInList.update(process);
                    if(position !== index){
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