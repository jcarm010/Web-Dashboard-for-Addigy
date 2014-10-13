app.directive('map', function() {
    return {
        restrict: 'AE',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            var map;
            var markers = [];

            scope.$watch(attrs.ngModel, function(machines){
                // Sometimes the machines are empty, 
                // in which case, don't update the chart with null data
                if(typeof machines == 'undefined') return;

                if(!map) {
                    var myOptions = {
                        zoom: 4,
                        center: new google.maps.LatLng(machines[0].location_lat, machines[0].location_long),
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    map = new google.maps.Map(document.getElementById(attrs.id), myOptions);
                }

                clearMarkers();

                for(var i = 0; i < machines.length; i++) {
                    addMarker(machines[i]);
                }
            });

            function addMarker(machine){
                var myLatlng = new google.maps.LatLng(machine.location_lat, machine.location_long);
                var marker = new google.maps.Marker({
                    position: myLatlng, 
                    map: map,
                    title: machine.sp_user_name,
                    icon: '/img/machines/mac_desktop.png',
                    animation: google.maps.Animation.DROP,
                    machine: machine
                });

                var content = '<div id="content">'+
                                  '<div id="siteNotice"></div>'+
                                  '<h4 id="firstHeading" class="firstHeading"><b>'+machine.sp_user_name+'</b></h4>'+
                                  '<div id="bodyContent">'+
                                        '<p>'+machine.sp_cpu_type+'</p>'+
                                  '</div>'+
                              '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: content
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });

               markers.push(marker);
            }

            function clearMarkers(){
                if(markers.length != 0){ 
                    for(var i = 0; i < markers.length; i++) {
                        markers[i].setMap(null); 
                    }
                }
            }


            
            /*
            google.maps.event.addListener(map, 'click', function(e) {
                scope.$apply(function() {
                    addMarker({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  }); 
                    
                    console.log(e);
                });
    
            }); // end click listener*/
            
        }
    };
});