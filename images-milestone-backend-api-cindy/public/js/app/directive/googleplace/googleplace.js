
angular
    .module('photographer')
    .directive('googleplace', function ($timeout) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, model) {
                var options = {
                    types: ['establishment', 'geocode'],
                    //componentRestrictions: {}
                };
                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
                scope.gPlace.addListener('place_changed', fillInAddress);

                function fillInAddress() {
                    $timeout(function () {
                        model.$setViewValue(scope.gPlace.getPlace());
                    });
                }
            }
        };
    });


