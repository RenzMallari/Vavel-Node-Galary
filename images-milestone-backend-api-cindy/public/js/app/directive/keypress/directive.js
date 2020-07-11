// Directive
function keypress() {
    return function(scope, element, attrs) {
        var validKeyCodes = {
            enter: 13
        };

        element.bind('keydown keypress', function(event) {
            if (!attrs.key || event.which === validKeyCodes[attrs.key]) {
                scope.$apply(function() {
                    scope[attrs.ngOnKeyPress] && scope[attrs.ngOnKeyPress]();
                });
                event.preventDefault();
            }
        });
    };
}
angular.module('photographer').directive('ngOnKeyPress', keypress);
