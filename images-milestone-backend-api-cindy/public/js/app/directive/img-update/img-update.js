angular.module('photographer').directive('imgUpdate', function ($q, constSetting, myAuth, albumService, collectionService, $http, configService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			// uploading: false,
			imglist: '=',
			imgBanch: "=",
			collactions: '=',
			data: '=',
			album: '=',
			update: '&',
			addImgToCollactionClient: "&"
		},
		templateUrl: '/js/app/directive/img-update/img-update.html',
		link: function (scope, element, attrs, fn) {
			scope.list_currencies = Object.values(constSetting.list_currencies);
			
			scope.getCurrency = constSetting.getCurrency;
			scope.convert = constSetting.convert;
			
			scope.list_currencies = constSetting.list_currencies;

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

			scope.$watch('data.price.small', function(v) {
				
				if(scope.data && scope.data.price && scope.data.price.small) {
					scope.small = scope.convert(scope.data.price.small, 'USD', scope.getCurrency().currency);
					// if(scope.getCurrency().currency !== 'USD' ) {
					// 	scope.data.price.small = scope.convert(scope.data.price.small, 'USD', scope.getCurrency().currency)
					// }
				}
			}) 
			scope.$watch('data.price.medium', function(v) {
				if(scope.data && scope.data.price && scope.data.price.medium) {
					// if(scope.getCurrency().currency !== 'USD') {
					// 	scope.data.price.medium = scope.convert(scope.data.price.medium, 'USD', scope.getCurrency().currency)
					// }

					scope.medium = scope.convert(scope.data.price.medium, 'USD', scope.getCurrency().currency);				}
			}) 
			scope.$watch('data.price.large', function(v) {
				if(scope.data && scope.data.price && scope.data.price.large) {
					scope.large = scope.convert(scope.data.price.large, 'USD', scope.getCurrency().currency);
					// if(scope.getCurrency().currency !== 'USD' && scope.data && scope.data.price && scope.data.price.large) {
					// 	scope.data.price.large = scope.convert(scope.data.price.large, 'USD', scope.getCurrency().currency)
					// }
				}
			}) 

			scope.updateImg = function () {
				// var onlyNumbersPattern = /^\d+$/;
				let onlyNumbersPattern = /^-?\d*\.?\d*$/;
				scope.updating = true;
				scope.showError = false;
				scope.showSuccess = false;
				scope.data = scope.data || {}
        scope.data.price = {
          small: Number(scope.small) || 0,
          medium: Number(scope.medium) || 0,
          large: Number(scope.large) || 0,
        }

				if (scope.small && !onlyNumbersPattern.test(scope.small)) {
					// alert('The price for small size must be numeric');
					scope.small = scope.small.replace(',','.')

					scope.alert = myAuth.addAlert('danger', 'The price for small size must be numeric');
					setTimeout(function () {
						scope.$apply(function () {
							scope.showError = true;
							scope.updating = false;
						});
					}, 1000);	
				}

				else if (scope.medium && !onlyNumbersPattern.test(scope.medium)) {
					scope.medium = scope.medium.replace(',','.')
					scope.alert = myAuth.addAlert('danger', 'The price for medium size must be numeric');	
					setTimeout(function () {
						scope.$apply(function () {
							scope.showError = true;
							scope.updating = false;
						});
					}, 1000);
					// alert('The price for medium size must be numeric');
				}

				else if (scope.large && !onlyNumbersPattern.test(scope.large)) {
					scope.large = scope.large.replace(',','.')
					scope.alert = myAuth.addAlert('danger', 'The price for large size must be numeric');
					setTimeout(function () {
						scope.$apply(function () {
							scope.showError = true;
							scope.updating = false;
						});
					}, 1000);	
					// alert('The price for large size must be numeric');
					
				}
				else {
					scope.data.imageid = scope.imglist;
					if(scope.data && scope.data.price && scope.getCurrency().currency !== 'USD') {
						if(scope.medium) scope.data.price.medium = scope.convert(scope.medium, scope.getCurrency().currency, 'USD')
						if(scope.large) scope.data.price.large = scope.convert(scope.large, scope.getCurrency().currency, 'USD')
						if(scope.small) scope.data.price.small = scope.convert(scope.small, scope.getCurrency().currency, 'USD')

					}
					albumService.Updateimage(scope.data)
						.then(function (rez) {
							if (rez.type == "success") {

								scope.alert = myAuth.addAlert('success', rez.msg);
								scope.update({ data: scope.data });
								setTimeout(function () {
									scope.$apply(function () {
										scope.showSuccess = true;
										scope.updating = false;
									});
								}, 1000);
							} else {

								scope.alert = myAuth.addAlert('danger', rez.msg);
								setTimeout(function () {
									scope.$apply(function () {
										scope.showError = true;
										scope.updating = false;
									});
								}, 1000);
							}
						}).catch(err => {

							scope.alert = myAuth.addAlert('danger', err.message);
							setTimeout(function () {
								scope.$apply(function () {
									scope.showError = true;
									scope.updating = false;
								});
							}, 1000);
						});
					}
			}

			scope.collectionSelect = {
				_id: '-',
				name: "Select collection"
			};

			scope.addImgToCollaction = function () {
				if (scope.collectionSelect._id != "-") {
					collectionService.addImgToCollaction(scope.imglist, scope.collectionSelect._id)
						.then(function (coll) {
							if (coll.type == "success") {
								scope.addImgToCollactionClient({ data: { col: coll.collaction, reload: false } });
							} else {
								//console.log(coll);
							}
						});
				}
			}
		}
	};
});
