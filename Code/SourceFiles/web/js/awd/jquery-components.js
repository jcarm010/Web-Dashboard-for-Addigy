(function() {
	$(window).on('hashchange',function(){ 
    	resizeSidePanel();
	});
	
	$(window).resize(function() {
		resizeSidePanel();
	});

	function resizeSidePanel() {
		var deviceHeight = $(window).height();
		var header = $('.header').outerHeight() + $('.right-side').outerHeight();
		var contentPanel = $('.content-panel').outerHeight();

		if(contentPanel+header > deviceHeight) {
			$('.machines-panel').outerHeight(contentPanel);
		} else {
			$('.machines-panel').outerHeight(deviceHeight - header - 10);
		}
	}

})();