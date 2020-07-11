angular.module('photographer').directive('albumUpdate', function ($q, albumService, myAuth, constSetting, $http, configService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			data: "=",
			update: '&',
			delete: '&',
		},
		templateUrl: '/js/app/directive/album-update/album-update.html',
		link: function (scope, element, attrs, fn) {
			scope.myaccount = myAuth.getUserNavlinks();
			scope.object_currencies = constSetting.list_currencies;
			scope.list_currencies = Object.values(constSetting.list_currencies);
		
			scope.getCurrency = constSetting.getCurrency;
			scope.convert = constSetting.convert;

			function ifKeywordExists(array, keyword) {
				return array.some(item => item.tag.toLowerCase() === keyword.toLowerCase());
			}

			scope.loadTags =  function(tag) {
				var deferred = $q.defer();
				if (!tag) return
				var dataObj = {
					'keyword': tag
				};
				$http({
					method: "POST",
					url: myAuth.baseurl + "catalog/searchkeywords_load",
					data: dataObj,
					headers: {
						'Content-Type': 'application/json'
					}
				}).success(function(datacatelog) {
					if (datacatelog.msg) {
						var uniqueElements = [];
						$.each(datacatelog.albumkeywords, function(i, el) {
							if (!ifKeywordExists(uniqueElements, el.keyword)) {
								const data = { 
									tag: el.keyword,
									isofficial: el.isofficial,
									logo: el.logo ? `${configService.ftpFullPath}/${el.logo}`: null								};
								uniqueElements.push(data);
							}
						});
						return deferred.resolve(uniqueElements);
					} else {
						return deferred.resolve([]);
					}
				});
				return deferred.promise;
			}
			
			scope.$watch('data.price', function(v) {
				if(scope.data && scope.data.price && scope.price !== scope.data.price 
					&& scope.getCurrency().is_converting
					&& v && scope.getCurrency().currency !== 'USD' ) {
					scope.price = scope.convert(v, 'USD', scope.getCurrency().currency);
				}
			}) 
			
			scope.$watch('data.albumaddress', function (v) {
				scope.albumaddress = scope.data && scope.data.albumaddress ? scope.data.albumaddress : ""
			})
			scope.$watch('albumaddress', function (v) {
				if (v && v.formatted_address) {
					scope.data = Object.assign(scope.data, {
						albumaddress: v.formatted_address
					})
					var address_components = v.address_components || [];
					var country = address_components.find(e => e.types && e.types.find(i => i === 'country'))
					var city = address_components.find(e => e.types && e.types.find(i => i === "administrative_area_level_1"))
					if (country && country.long_name) {
						scope.data = Object.assign(scope.data, {albumcountry: country.long_name})
					}
					if (city && city.long_name) {
						scope.data = Object.assign(scope.data, {albumcity: city.long_name})
					}
					let lat = v.geometry.location.lat();
					let lng = v.geometry.location.lng();
					if (lat) {
						scope.data = Object.assign(scope.data, {lat: lat})
					}
					if (lng) {
						scope.data = Object.assign(scope.data, {lng: lng})
					}
					// console.log(scope.data)

				} else {
					if(v && v !== scope.data.albumaddress) {
						scope.data = Object.assign(scope.data, {
							albumaddress: v,
							albumcity: '',
							albumcountry: '',
							lat: null,
							lng: null
						})
					}
					else scope.albumaddress = scope.data && scope.data.albumaddress ? scope.data.albumaddress : ""
				}
			});
			scope.updateAlbum = function () {
				scope.updating = true;
				scope.showError = false;
				scope.showSuccess = false;
				// var onlyNumbersPattern = /^\d+$/;
				let onlyNumbersPattern = /^-?\d*\.?\d*$/
				if (scope.data.price && scope.price && !onlyNumbersPattern.test(scope.price)) {
					scope.price = scope.price.replace(',','.')
					scope.alert = myAuth.addAlert('danger', 'The price for album must be numeric');
					setTimeout(function () {
						scope.$apply(function () {
							scope.showError = true;
							scope.updating = false;
						});
					}, 1000);
				}
				else {
					if(scope.data.price && scope.getCurrency().currency !== 'USD') {
						scope.data.price = scope.convert(scope.price, scope.getCurrency().currency, 'USD')
					}
					albumService.updateAlbum(scope.data)
						.then(function (data) {
							if (data.type == "success") {
								scope.alert = myAuth.addAlert('success', data.msg);
								scope.update({ data: scope.data });
								setTimeout(function() {
									scope.$apply(function() {
										scope.showSuccess = true;
										scope.updating = false;
									})
								}, 1000)
							} else {
								scope.alert = myAuth.addAlert('danger', data.msg);	
								setTimeout(function() {
									scope.$apply(function() {
										scope.showError = true;
										scope.updating = false;
									})
								}, 1000)
							}
						}).catch(err => {

							scope.alert = myAuth.addAlert('danger', err.message);
							setTimeout(function () {
								scope.$apply(function () {
									scope.showError = true;
									scope.updating = false;
								});
							}, 1000);
						});;
					}

			}

			scope.deleteAlbum = function () {
				albumService.deleteAlbum(scope.data)
					.then(function (data) {

						if (data.type == "success") {
							scope.delete({ data: scope.data });
						} else {
							//console.log(data);
						}
					});

			}
		}
	};
});
