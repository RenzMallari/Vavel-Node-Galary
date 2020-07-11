angular.module('photographer').directive('albumAdd', function(albumService, myAuth, constSetting, $cookieStore) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			add: '&'
		},
		templateUrl: '/js/app/directive/album-add/album-add.html',
		link: function(scope, element, attrs, fn) {
			scope.getCurrency = constSetting.getCurrency;
			scope.convert = constSetting.convert;

			scope.myaccount = myAuth.getUserNavlinks();
			scope.list_currencies = Object.values(constSetting.list_currencies);

			
			$('#add-album-error').hide();
			
			scope.addAlbum = function(){
				scope.updating = true;
				if(scope.getCurrency().currency !== 'USD') {
					scope.myalbum.price = scope.convert(scope.myalbum.price, scope.getCurrency().currency, 'USD')
				}
				$('#add-album-error').hide();
				if (scope.myalbum.albumname &&
					scope.myalbum.price &&
					scope.myalbum.editoriallicense &&
					scope.myalbum.commerciallicense &&
					scope.myalbum.albumaddress){
					// var onlyNumbersPattern = /^\d+$/;
					let onlyNumbersPattern = /^-?\d*\.?\d*$/;

					if (!onlyNumbersPattern.test(scope.myalbum.price)) {
						scope.myalbum.price = scope.myalbum.price.replace(',','.')
						$('#add-album-error').show();
						$('#add-album-error').text('The price for album must be numeric');
						setTimeout(function() {
							scope.$apply(function() {
								scope.updating = false;
							})
						}, 1000)
						// return false;
					}
					else {
						
						// console.log('directive album add', scope.myalbum)
						albumService.addAlbum(scope.myalbum)
						.then(function(data){
							if (data.type == "success"){
								scope.add({data: data});
								$("#add-album").modal('hide');

							} else{
								// console.log(data);
								$('#add-album-error').show();
								$('#add-album-error').text(data.msg || 'Something went wrong')
							}
							setTimeout(function() {
								scope.$apply(function() {
									scope.updating = false;
								})
							}, 1000)
						}).catch(err => {
							$('#add-album-error').show();
							$('#add-album-error').text(err.message || 'Something went wrong');

							setTimeout(function() {
								scope.$apply(function() {
									scope.updating = false;
								})
							}, 1000)
						})
					}
				}
				else{
					$('#add-album-error').show();
					setTimeout(function() {
						scope.$apply(function() {
							scope.updating = false;
						})
					}, 1000)
				}

			}

			scope.$watch('albumaddress', function(v) {
				if(scope.myalbum) {

					if (v && v.formatted_address) {
						var address_components = v.address_components || [];
						
						var country = address_components.find(function(e) {
							if(e.types && e.types.find(i => i === 'country')) {
								return e;
							}
						})

						var city = address_components.find(function(e) {
							if(e.types && e.types.find(i => i === 'administrative_area_level_1')) {
								return e;
							}
						})

						if(country && country.long_name) scope.myalbum.albumcountry = country.long_name;
						else scope.myalbum.albumcountry = '';

						if(city && city.long_name) scope.myalbum.albumcity = city.long_name;
						else scope.myalbum.albumcity = '';

						scope.myalbum.albumaddress = v.formatted_address;
						scope.myalbum.lat = v.geometry.location.lat();
						scope.myalbum.lng = v.geometry.location.lng();
					} else {
						scope.myalbum.albumaddress = '';
						scope.myalbum.albumcountry = '';
						scope.myalbum.albumcity = '';

					}
				}
			})
		}
	};
});
