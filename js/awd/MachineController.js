/*
 * This controller handles functionality related to the single machine page
 */
app.controller('MachineCtrl', ['DataRequest', '$location', '$routeParams', '$interval',
    function(DataRequest, $location, $routeParams, $interval) {
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
        this.processes = [
//            {id:3445, name:'Process 1', cpu:20, memory:20, networkDown: 15, networkUp: 5},
//            {id:3446, name:'Process 2', cpu:20, memory:20, networkDown: 15, networkUp: 5},
//            {id:3447, name:'Process 3', cpu:20, memory:20, networkDown: 15, networkUp: 5}
        ];
        var pcount = 2000;
        $interval(setDummyData,1500);
        function setDummyData(){
            var toMod = getRandomArbitrary(0,10);
            if(toMod%2){
                for(var i = 0 ; i < toMod;i++)
                    self.processes.push({
                        id:pcount,
                        name:'Process '+pcount++,
                        cpu: getRandomArbitrary(0,100),
                        memory: getRandomArbitrary(0,100),
                        networkDown: getRandomArbitrary(0,100),
                        networkUp: getRandomArbitrary(0,100)
                    });
            }else{
                while(self.processes.length+2 > 0 && toMod-->0){
                    self.processes.splice(getRandomArbitrary(0,self.processes.length),1);
                }
            }

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