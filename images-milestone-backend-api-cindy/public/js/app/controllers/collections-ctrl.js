(function () {

angular.module("photographer").controller('collectionsController', collectionsController);

function collectionsController (configService ,$scope, $http, $location,myAuth,$sce) {
     $scope.config = configService;
  $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
     };
    $scope.getallcollections = function () {
        $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getallcollection"
        }).success(function (data) {
            if (data.is_collection_exist == "0") {
                $scope.nocollection = true;
            }
            else
            {
                $scope.nocollection = false;
            }
            $scope.allcollections = data.allcollections.map(function(collection) {
                //console.log('Collection: ',collection);
                var sizes = [300, 305, 310, 320, 325, 330, 335, 340, 345, 350];
                var randomSize = Math.floor(Math.random()*10);
                collection.width = sizes[randomSize];
                collection.height = 200;
                if (collection.images[0]) {
                  collection.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_'+ collection.images[0].publicid+'.'+ collection.images[0].fileExtension
                }
                return collection;
            });
        });
    }
    $scope.getallcollections();

    // Set title
  $('title').html('Last Collections' + PAGE_TITLE_SUFFIX);

    $scope.open_join_modal=function(){
      myAuth.updateUserinfo(myAuth.getUserAuthorisation());
      $scope.loggedindetails= myAuth.getUserNavlinks();
      if($scope.loggedindetails)
      {
         window.location.href='/myaccount/'+$scope.loggedindetails._id;
      }
      else
      {
        $('#myModal-join').modal('toggle');
      }
    }

    $scope.getbrandcontentbyid=function(obj){
          $http({
		url: myAuth.baseurl+"brand/getcontentbyid/1",
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	  }).success(function(data){
		if(data){
		   $scope.brandcms=data;
		}
	  });
    }
    $scope.getbrandcontentbyid();

    $scope.listactivebrands=function(){
	   $http({
		   url: myAuth.baseurl+"brand/listactivebrands",
		   headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		 }).success(function(data){
		 if(data){
		   $scope.allbrands=data;
		 }
            });
     }
     $scope.listactivebrands();
}
})();
