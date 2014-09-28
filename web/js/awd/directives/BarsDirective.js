app.directive('wdaBarChart', function () {
    
    return{
        restrict: 'A',
        link: function(scope, elem, attrs){
            
            var bars = null,
                options = {
                type: 'bar',
                height: 100,
                barColor: '#333',
                barWidth: 20,
                barSpacing: 5
              };    
            
            // If the data changes somehow, update it in the chart
            scope.$watch(attrs.ngModel, function(v){
                bars = elem.sparkline(v, options);
                elem.show();
            });
        }
    };
});