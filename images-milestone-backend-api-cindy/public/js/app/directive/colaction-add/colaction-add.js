angular.module('photographer').directive('colactionAdd', function(collectionService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			add: '&'
		},
		templateUrl: '/js/app/directive/colaction-add/colaction-add.html',
		link: function(scope, element, attrs, fn) {

 			$('#add-collection-error').hide();
			scope.mycollection = {};
			scope.addCollection = function(){
				if (scope.mycollection.collectionname ){

					collectionService.addCollaction(scope.mycollection)
					.then(function(data){

						if (data.type == "success"){

							$("#add-collaction").modal('hide');
							scope.add({data: data});

	 						$('#add-collection-error').hide();
 						}else{
							//console.log(data);
						}
					});
				}
				else{
					$('#add-collection-error').show();
				}

			}
		}
	};
});
