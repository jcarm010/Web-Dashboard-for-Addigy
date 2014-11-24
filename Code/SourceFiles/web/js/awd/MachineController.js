/*
 * This controller handles functionality related to the single machine page
 */
app.controller('MachineCtrl', ['PubNub', 'DataRequest', '$location', '$routeParams', '$timeout','$interval','$rootScope','$scope',
    function(PubNub, DataRequest, $location, $routeParams, $timeout ,$interval,$rootScope,$scope) {
        
        var timeOut = 10000;
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
            totalMemory: 0,
            usedMemory: 0,
            freeMemory: 0,
            buffersMemory: 0,
            usagePercent: function(){
                return toFixed(this.usagePercentNum(), 2);
            },
            usagePercentNum: function(){
                return this.usedMemory*100/this.totalMemory;
            }
        };
        //an object representing this machine's cpu usage
        this.cpu = {
            used: 0,
            systemUsed:0,
            usagePercent: function(){
                return toFixed(this.used, 2);
            },
            sysUsagePercent: function(){
                return toFixed(this.systemUsed, 2);
            }
        };
        
        this.swap = {
            totalSwap: 0,
            usedSwap: 0,
            freeSwap: 0,
            cachedSwap: 0,
            usagePercent: function(){
                return toFixed(this.usagePercentNum(), 2);
            },
            usagePercentNum: function(){
                return this.usedSwap*100/this.totalSwap;
            }
        };
        this.round = function(value,precision){ return toFixed(value,precision);};
        function toFixed(value, precision) {
            var precision = precision || 0,
            neg = value < 0,
            power = Math.pow(10, precision),
            value = Math.round(value * power),
            integral = String((neg ? Math.ceil : Math.floor)(value / power)),
            fraction = String((neg ? -value : value) % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');

            return precision ? integral + '.' +  padding + fraction : integral;
        }
        function processSysStats(msg){
            self.cpu.systemUsed = msg.SYS_CPU_PERCENT;
            self.cpu.used = msg.CPU;
            
            self.memory.buffersMemory = msg.SYS_MEM_BUFFERS;
            self.memory.freeMemory = msg.SYS_MEM_FREE;
            self.memory.totalMemory = msg.SYS_MEM_TOTAL;
            self.memory.usedMemory = msg.SYS_MEM_USED;
            
            self.swap.cachedSwap = msg.SYS_SWAP_CACHED;
            self.swap.totalSwap = msg.SYS_SWAP_TOTAL;
            self.swap.freeSwap = msg.SYS_SWAP_FREE;
            self.swap.usedSwap = msg.SYS_SWAP_USED;
            
            refreshKnobs();
        }
        function drawRow(msg){
            self.lastReported = getCurrentTime();
            var num = msg.num;
            var row = msg.row;
            var c = document.getElementById("myCanvas");
            var ctx = c.getContext("2d");
            for(var i = 0 ; i < row.length ;i++){
                ctx.fillStyle = row[i];
                ctx.fillRect(i,num,1,1);
            }
        }
        function refreshKnobs(){
            $("#swap-knob").trigger(
                'configure',{
                    "max":self.swap.totalSwap/1000,
                    "fgColor":self.swap.usagePercentNum()>80?'#e06771':self.swap.usagePercentNum()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#swap-knob").val(self.swap.usedSwap/1000).trigger('change');
            
            $("#memory-usage-knob").trigger(
                'configure',{
                    "max":self.memory.totalMemory/1000,
                    "fgColor":self.memory.usagePercentNum()>80?'#e06771':self.memory.usagePercentNum()>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#memory-usage-knob").val(self.memory.usedMemory/1000).trigger('change');
            
            $("#cpu-usage-knob").trigger(
                'configure',{
                    "max":100,
                    "fgColor":self.cpu.used>80?'#e06771':self.cpu.used>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#cpu-usage-knob").val(self.cpu.used).trigger('change');
            
            $("#sys-cpu-usage-knob").trigger(
                'configure',{
                    "max":100,
                    "fgColor":self.cpu.systemUsed>80?'#e06771':self.cpu.systemUsed>60?'#e0b153':'#3c8dbc'
                }
            );
            $("#sys-cpu-usage-knob").val(self.cpu.systemUsed).trigger('change');
        }
        //a container that holds processes running on the machine
        this.processContainer = new ProcessContainer();
        //get the Pubnub keys and initialize pubnub
        DataRequest.getPubnubKeys().then(function(data){
            var keys = data;//the keys
            PubNub.init(keys);//initialize with keys
            var theChannel = self.machineId;//the channel si the machine id
            PubNub.ngSubscribe({ channel: theChannel });//listen on messages from this channel
            $rootScope.$on(PubNub.ngMsgEv(theChannel), onMessage);//call onMessage when received a message
            PubNub.ngSubscribe({ channel: theChannel+"-stream" });//listen on messages from this channel
            $rootScope.$on(PubNub.ngMsgEv(theChannel+"-stream"), onMessage);//call onMessage when received a message
            reportPresence({machineId:"reporter"});
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
                reportPresence(msg);//report presence
            }else if(type === 'reportPresence'){//if someone reporting presence
                processPresenceReport(msg);
            }else if(type === 'sysStats'){
                processSysStats(msg);
            }
            //else if(type === 'thumbRow'){//depricating this feature: too slow
            //    drawRow(msg);
            //}
            else if(type === 'chatMsg'){
                self.chat.messageReceived(msg);
            }else if(type === 'sshot'){
                loadNewSShot(msg);
            }else if(type === 'cmdout'){
                self.command.cmdOutput(msg);
            }else if(type === 'reportPort'){
                self.netStats.addPort(msg);
            }
        }
        function loadNewSShot(msg){
            var path = "http://wda-dev.cis.fiu.edu/uploads/"+msg.path;
            $('#sshot').attr("src", path);
        }
        //gets the current time of the system
        function getCurrentTime(){
            return new Date().getTime();
        }
        //processes a request to report presence
        function processPresenceReport(msg){
            if(msg.machineId === self.machineId){
                self.lastReported = currentTime();
            }
        }
        //sends a request for computers listening to report
        function sendReportRequest(){
            PubNub.ngPublish({//publish a message asking who is online
                channel: self.machineId,
                message: {msgType:"reportRequest",machineId:"web-listener"}
            });
        }
        //reports that this client is listening on this channel
        function reportPresence(msg){
            if(msg.machineId!=="web-listener"){
                PubNub.ngPublish({//publish a message sayimg that i am listening
                    channel: self.machineId,
                    message: {msgType:"reportPresence",machineId:"web-listener"}
                });
            }
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
            //adds process to the end of the processes list
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
            //clears the lsit of processes
            this.clear = function(){
                this.processes = [];
                this.map = {};
            };
            //update the map with the processes indexes
            function updateMap(from,to){
                for(var i = from ; i <= to;i++){
                    var proc = container.processes[i];
                    container.map[proc.id] = i;
                }
            }
            //shrinks or extends the list of processes to a size of qty
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
        self.chat = {
            messages: [],
            msgContainer: new Chat(),
            showing: false,
            expanded: false,
            message: "",
            sendMessage: function(){
                var theMsg = this.message;
                this.message="";
                PubNub.ngPublish({//publish a message asking who is online
                    channel: self.machineId,
                    message: {msgType:"chatMsg",sender:"Admin",msg:theMsg}
                });
            },
            messageReceived: function(msg){
                var currTime = getCurrentTime();
                var date = new Date;
                date.setTime(currTime);
                var minutes = date.getMinutes();
                var hour = date.getHours();
                var ampm = "am";
                if(hour>12){
                    hour = hour%12;
                    ampm = "pm";
                }
                msg.time = hour+":"+(minutes>9?minutes:"0"+minutes)+""+ampm;
                this.msgContainer.addMessage(msg);
            },
            keyPressed: function(event){
                if(event.keyCode === 13)//enter was pressed
                    this.sendMessage();
            }
        };
        self.command = {
            showing: false,
            expanded: false,
            cmd:"",
            cmdOutput: function(msg){
                var line = $('<div class="item"><span>'+msg.stamp+'</span> > '+msg.line+'</div>');
                $('#cmdout').append(line);
                scrollDown("#commandWindow");
            },
            sendCmd:function(){
                var cmd = this.cmd.trim();
                this.cmd = "";
                PubNub.ngPublish({//publish a message with command
                    channel: self.machineId,
                    message: {msgType:"runcmd",cmd:cmd}
                });
                var line = $('<div class="item"><span></span> > '+cmd+'</div>');
                $('#cmdout').append(line);
                scrollDown("#commandWindow");
            },
            keyPressed: function(event){
                if(event.keyCode === 13)//enter was pressed
                    this.sendCmd();
            }
        };
        
        this.netStats = {
            showing: false,
            expanded: false,
            ports: [],
            expandWindow: function(evt){
                evt.preventDefault();
                evt.stopPropagation();
                this.expanded = !this.expanded;
            },
            toggleShow: function(){
                this.showing = !this.showing;
                if(this.ports.length===0) this.fetchNew();
            },
            refresh: function(evt){
                console.log("refreshing");
                evt.preventDefault();
                evt.stopPropagation();
                this.fetchNew();
            },
            fetchNew: function(){
                this.ports = [];
                PubNub.ngPublish({//publish a message asking who is online
                    channel: self.machineId,
                    message: {msgType:"reqnetstats"}
                });
            },
            addPort: function(msg){
                this.ports.push(msg);
            }
            
        };
        
        self.expandWindows = function(evt){
            evt.preventDefault();
            evt.stopPropagation();
            self.chat.expanded = !self.chat.expanded;
            self.command.expanded = !self.command.expanded;
        };
        scrollDown("#commandWindow");
        scrollDown("#chatWindow");
        function scrollDown(selector){
            var scrollTo_val = $(selector).prop('scrollHeight') + 'px';
            $(selector).slimScroll({ scrollTo : scrollTo_val });
        }
        //describes a process
        function Process(init){
            var self = this;
            //updates this process with the fields of process
            self.update = function(process){
                self.id = initOpt("id",process);
                self.name = initOpt("name",process);
                self.cpu = initOpt("cpu",process);
                self.memory = initOpt("memory",process);
                self.priority = initOpt("priority",process);
                self.nice = initOpt("nice",process);
                self.user = initOpt("user",process);
            };
            //start this processes with the fields in init
            self.update(init);
            self.selected = false;
            //marks this process as selected or unselected
            self.setSelected = function(value){
                self.selected = value;
            };
            //returns the value for the field names field of proc
            function initOpt(field, proc){
                return proc?proc[field]:proc;
            }
        }
        //the single page chat
        function Chat(){
            this.msgContainer = $('#chatWindow div').eq(0);
            this.addMessage = function(msg){
                var item = getChatItem(msg);
                this.msgContainer.append(item);
                scrollDown("#chatWindow");
            };
            function getSender(msg){
                var link = $('<a href="" class="name"></a>');
                link.html('<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> '+msg.time+'</small>'+msg.sender);
                return link;
            }
            function getMessageHolder(msg){
                var holder = $('<p class="message"></p>');
                holder.append(getSender(msg));
                holder.html(holder.html()+msg.msg);
                return holder;
            }
            function getProfileImage(){
                return $('<img src="img/man.png" alt="user image" class="online">');
            }
            function getChatItem(msg){
                var item =  $('<div class="item"></div>');
                item.append(getProfileImage());
                item.append(getMessageHolder(msg));
                return item;
            }
        }
    }]);