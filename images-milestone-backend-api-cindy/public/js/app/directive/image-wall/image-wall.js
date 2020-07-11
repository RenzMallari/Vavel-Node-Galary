angular.module('photographer').directive('imageWall', function(configService, $compile) {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			images : '=',
		},
		templateUrl: '/js/app/directive/image-wall/image-wall.html',
		compile: function(rawElement, $attr) {
			var html = rawElement.children().html();
			//console.log(html);

			return function(scope, element, attrs, fn) {
				var destination_id = 'imagewall-container';
				var album_div = document.getElementById(destination_id);
				var max_img_enlarge = 1.1;
				var last_width = 0;
				var photos = [];

				var max_pictures = attrs['maxPictures'] || 20;
				var row_height = attrs['rowHeight'] || 170;

				var itemName = attrs['item-name'] || 'item'; //this defines the name of the variable exposed in the scope

				scope.$watch('images', function(nv, ov) {
					//console.log('Images', nv);
					if (nv) {
						  photos = nv;
							refresh();
					}
				});

				var refresh = function(){

						var new_width = album_div.parentNode.clientWidth;
						if (new_width !== last_width) {
							$('#'+destination_id).css("width", new_width);
							showPhotos();
							setTimeout(function(){
								scope.$apply();
							},0);
							// since showPhotos destroys the contents of description_id element, we need to re-create the photoswipe, too :/
							//initPhotoSwipeFromDOM(destination_id);
							last_width = new_width;
						};
				};

				window.onresize = refresh;

				var showPhotos = function(){
					$('#'+destination_id).empty().justifiedImages({
						images : photos,
						rowHeight: row_height,
						maxRowHeight: row_height * 2,
						angularElement: element,
						thumbnailPath: function(photo, width, height){
							return 'https://stock.vavel.com/s/photoImages/bunch/h200_'+ photo.publicid+'.'+ photo.fileExtension;
						},
						getSize: function(photo){
							var width = photo.imagewidth / (photo.imageheight / 200);
							return {width: width, height: 200};
						},
						margin: 10,

						template: function(photo){
							var htmlString = "";
							//console.log('Building template. Photo: ', photo);
							var brickScope = scope.$new(true);
							brickScope.photo = photo;
							brickScope.hello = photo.src;

							var compiledHtml = $compile(html)(brickScope);
							var elem = angular.element(compiledHtml)[0];
							//var elem = angular.element(html)[0];
							var elem2 = angular.element(elem.parentNode)[0];
							var div = document.createElement('div');
							div.appendChild( elem2.cloneNode(true) );

							htmlString += '  <div class="photo-container" style="height:' + photo.displayHeight + 'px;margin-right:' + photo.marginRight + 'px;">';
							htmlString += '	   <div class="image-thumb" style="width:' + photo.displayWidth + 'px;height:' + photo.displayHeight + 'px;" >';
							//htmlString += '	      <img src="' + photo.src + '" style="width:100%;height:100%;" >';
							htmlString +=           div.innerHTML;
							htmlString += '    </div>';
							htmlString += '  </div>';
							return htmlString;
						},
						imageSelector: "image-thumb",
						imageContainer: "photo-container",

					});
		    }

		  }
		}
	};
});
