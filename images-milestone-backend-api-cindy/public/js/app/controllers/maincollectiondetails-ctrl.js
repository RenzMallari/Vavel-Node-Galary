(function () {

angular.module("photographer").controller('maincollectiondetailsController', maincollectiondetailsController);

function maincollectiondetailsController (configService ,$scope, $http, $location, $routeParams, myAuth) {
   $scope.config = configService;
  $scope.loggedindetails= myAuth.getUserNavlinks();
   $scope.collectiondetls={};
   $scope.showDetails=function(galleryid,imageid){
      $location.path("/details/"+galleryid+"/"+imageid);
   }

    // Set title
    $('title').html(PAGE_TITLE);

   $scope.getallmycollectiondetails = function () {
        $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getcollectiondetails/" + $routeParams.id
        }).success(function (data) {
            if (data.type == 'success') {
                $scope.collectionname = data.collectionname;
                $scope.noofphotos = data.msg.length;
                $scope.collectionphotos = data.msg.map(function(photo) {
                  return {
                    width: photo.imagewidth,
                    height: photo.imageheight,
                    src: 'https://stock.vavel.com/s/photoImages/bunch/h200_'+ photo.publicid+'.'+ photo.fileExtension
                  }
                });
                $scope.usrdetls = data.usrdetls;

                if (data.msg.length > 0) {
                    $scope.nocollectionimage = true;
                }
                else {
                    $scope.nocollectionimage = false;
                }

              if ($scope.collectionname) {
                $('title').html($scope.collectionname + PAGE_TITLE_SUFFIX);
              }
            }
            else {
                $location.path("/collections");
            }
        });
    }
    $scope.getallmycollectiondetails();

    $scope.open_collectionmodal=function(galleryid,photopublicid){
        if($scope.loggedindetails)
        {
          $('#mymodal-addcollection').modal('toggle');
          $scope.collectiondetls.collectiongalleryid=galleryid;
          $scope.collectiondetls.photopublicid=photopublicid;
        }
        else
        {
          $('#myModal-login').modal('toggle');
        }
    }

    $scope.addtocollection=function(collectionid){
      var dataobj={'galleryid':$scope.collectiondetls.collectiongalleryid,'userid':$scope.loggedindetails._id,'collectionid':collectionid,'photopublicid':$scope.collectiondetls.photopublicid};
        $http({
            method: "POST",
            url: myAuth.baseurl + "gallery/addalbumtocollection",
            data: dataobj,
            headers: { 'Content-Type': 'application/json' }
	}).success(function(data){
	   if(data.type=='success')
	   {
	       $scope.allcollections={};

	       setTimeout(function ()
               {
                  $scope.getallmycollections();
               },500);

	   }
	});
    }

    $scope.collectionsubmit=function(){
      var dataobj={'collectionname':$scope.collectiondetls.collectionname};

        $http({
            method: "POST",
            url: myAuth.baseurl + "gallery/addalbumcollection",
            data: dataobj,
            headers: { 'Content-Type': 'application/json' }
	}).success(function(data){
	   if(data.type=='success')
	   {
	       $scope.collectiondetls.collectionname='';
	       $scope.allcollections={};
	       setTimeout(function ()
               {
                  $scope.getallmycollections();
               },500);
	   }
	});
     }

   $scope.getallmycollections=function(){
     $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getcollections/"+$scope.loggedindetails._id
	}).success(function(data){
	if(data.is_collection_exist==0)
	{
           $scope.showcollections=false;
	}
	else
	{
	   $scope.showcollections=true;
	}
	$scope.allcollections=data.allcollections;
     });
    }
    if($scope.loggedindetails)
    {
      $scope.getallmycollections();
    }
}
})();
