app.directive('wdaUptimeChart', function () {
    return{
        restrict: 'AE',
        replace: true,
        link: function(scope, elem, attrs){
            
            var bars = null;

            // If the data changes somehow, update it in the chart
            scope.$watch(attrs.ngModel, function(machines){
                // Sometimes the machines are empty, 
                // in which case, don't update the chart with null data
                if(typeof machines == 'undefined') return;

                if(!bars) {
                    bars = Morris.Bar({
                      element: elem,
                      data: machines,
                      xkey: 'sp_user_name',
                      ykeys: ['uptime'],
                      labels: ['Uptime'],
                      barColors: ['#333'],
                      resize: true,
                      hideHover: true,
                      hoverCallback: function (index, options, content, machine) {
                        picture = (machine.uptime>100)?'avatar.png':'avatar2.png'; // Test
                        content = '<div class="morris-hover-row-label">Renan Han (renan)</div><div class="morris-hover-point" style="color: #333;"> Uptime: 173</div>';
                        return '<img class="left" src="/img/' + picture + '" style="height: 50px;">' +
                                '<br>' +
                                '<div class="right">Machine: ' + machine.sp_user_name + '</div>' +
                                '<div class="right">Uptime: ' + machine.uptime + ' days</div>';
                      }
                    });
                } else {
                    bars.setData(machines);
                }
            });
        }
    };

    function getData(machines) {
        var data = [];

        for(var i = 0; i < machines.length; i++) {
            data.push({ machine: machines[i].sp_user_name,
                         uptime: machines[i].uptime});
        }

        return data;
    }
});