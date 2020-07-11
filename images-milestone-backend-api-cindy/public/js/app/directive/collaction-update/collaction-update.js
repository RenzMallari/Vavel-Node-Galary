angular.module('photographer').directive('collactionUpdate', function(collectionService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			data: "=",
			update: '&',
			delete: '&'
		},
		templateUrl: '/js/app/directive/collaction-update/collaction-update.html',
		link: function(scope, element, attrs, fn) {
			scope.updateCollaction = function(){
				collectionService.updateCollaction(scope.data)
				.then(function(coll){
					if (coll.type == "success"){
						scope.update({data: {col:scope.data,reload:true}});
					}else{
						//console.log(coll);
					}
				});

			}

			scope.deleteCollaction = function(){
				collectionService.deleteCollaction(scope.data)
				.then(function(rez){

					if (rez.type == "success"){
						scope.delete({data: scope.data});
					}else{
						//console.log(rez);
					}

				});

			}
		}
	};
});
