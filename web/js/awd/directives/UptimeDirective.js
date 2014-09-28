app.directive('wdaBarChart', function () {
    
    function getData(machines) {
        var data = [];

        for(var i = 0; i < machines.length; i++) {
            data.push({ machine: machines[i].sp_user_name,
                         uptime: machines[i].uptime});
        }

        return data;
    }

    return{
        restrict: 'A',
        replace: true,
        link: function(scope, elem, attrs){
            
            var bars = null;

            /*var options = {
                type: 'bar',
                height: 100,
                barColor: '#333',
                barWidth: 20,
                barSpacing: 5
            };*/
            
            // If the data changes somehow, update it in the chart
            scope.$watch(attrs.ngModel, function(machines){
                // Sometimes the machines are empty
                if(typeof machines == 'undefined') return;

                elem.context.innerHTML = "";  // Removes the current charts in the HTML

                bar = Morris.Bar({
                  element: elem,
                  data: getData(machines),
                  xkey: 'machine',
                  ykeys: ['uptime'],
                  labels: ['Uptime']
                });

                //bars = elem.sparkline(v, options);
                //elem.show();
            });
        }
    };
});