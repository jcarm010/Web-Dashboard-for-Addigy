app.directive('wdaWarrantyChart', function ($compile) {
	return {
	    restrict: 'AE', //attribute or element
	    scope: {
	      machines: '=',
	    },
	    templateUrl: '/pages/directives/warrantyDirective.html',
	    replace: true,
	    link: function(scope, elem, attrs, ctrl) {
	    }
	};
});