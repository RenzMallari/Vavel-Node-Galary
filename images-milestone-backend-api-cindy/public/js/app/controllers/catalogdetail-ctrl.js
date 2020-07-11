(function () {

   angular.module("photographer").controller('catalogdetailsController', catalogdetailsController);

   function catalogdetailsController(configService, $scope, $http, $location, $routeParams, myAuth) {
      $scope.config = configService;
      $scope.loggedindetails = myAuth.getUserNavlinks();
      $scope.albumdetls = {};

      // Set title
      $('title').html(PAGE_TITLE);
      
      $scope.showDetails = function (galleryid, imageid) {
         $location.path("/details/" + galleryid + '/' + imageid);
      }
      $scope.getallcatalogdetails = function () {
         $http({
            method: "GET",
            url: myAuth.baseurl + "catalog/getcatalogdetails/" + $routeParams.keyword
         }).success(function (data) {
            if (data.type == 'success') {
               $scope.keywordname = $routeParams.keyword;
               $scope.noofphotos = data.msg.length;
               $scope.catalogphotos = data.msg.map(function (photo) {
                  //console.log(photo);
                  photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.imageid + '.' + (photo.fileExtension || 'jpg');
                  return photo;
               });
               if (data.msg.length > 0) {
                  $scope.nocatalogimage = true;
               }
               else {
                  $scope.nocatalogimage = false;
               }

               // Set title
               $('title').html($scope.keywordname + PAGE_TITLE_SUFFIX);
            }
            else {
               $location.path("/catalog");
            }
         });
      }
      $scope.getallcatalogdetails();

      $scope.open_collectionmodal = function (galleryid, photopublicid) {
         if ($scope.loggedindetails) {
            $('#mymodal-addcollection').modal('toggle');
            $scope.albumdetls.collectiongalleryid = galleryid;
            $scope.albumdetls.photopublicid = photopublicid;
         }
         else {
            $('#myModal-login').modal('toggle');
         }
      }

      $scope.addtocollection = function (collectionid) {
         var dataobj = { 'galleryid': $scope.albumdetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionid': collectionid, 'photopublicid': $scope.albumdetls.photopublicid };
         $http({
            method: "POST",
            url: myAuth.baseurl + "gallery/addalbumtocollection",
            data: dataobj,
            headers: { 'Content-Type': 'application/json' }
         }).success(function (data) {
            if (data.type == 'success') {
               $scope.allcollections = {};

               setTimeout(function () {
                  $scope.getallmycollections();
               }, 500);

            }
         });
      }

      $scope.collectionsubmit = function () {
         var dataobj = { 'galleryid': $scope.albumdetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionname': $scope.albumdetls.collectionname, 'photopublicid': $scope.albumdetls.photopublicid };

         $http({
            method: "POST",
            url: myAuth.baseurl + "gallery/addalbumcollection",
            data: dataobj,
            headers: { 'Content-Type': 'application/json' }
         }).success(function (data) {
            if (data.type == 'success') {
               $scope.albumdetls.collectionname = '';
               $scope.allcollections = {};
               setTimeout(function () {
                  $scope.getallmycollections();
               }, 500);
            }
         });
      }

      $scope.getallmycollections = function () {
         $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getcollections/" + $scope.loggedindetails._id
         }).success(function (data) {
            if (data.is_collection_exist == 0) {
               $scope.showcollections = false;
            }
            else {
               $scope.showcollections = true;
            }
            $scope.allcollections = data.allcollections;
         });
      }
      if ($scope.loggedindetails) {
         $scope.getallmycollections();
      }
   }
})();
