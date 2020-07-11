angular.module('photographer').directive('imgBox', function(configService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			img : '=',
			deleteImg: '&',
		},
		templateUrl: '/js/app/directive/img-box/img-box.html',
		link: function(scope, element, attrs, fn) {
			scope.config = configService;


			scope.deleteSinglePhoto = function(id){

				scope.deleteImg({ data : id });
			}
		}
	};
});
