(function () {

   angular.module("photographer").controller('homeController', homeController);
   function homeController(configService, $scope, $http, $location, myAuth, $sce) {



      $scope.config = configService;
      $scope.loggedindetails = myAuth.getUserNavlinks();
      $scope.albumdetls = {};
      $scope.isloggedin = false;

      $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;

      $scope.showDetails = function (galleryid, imageid) {
         $location.path("/details/" + galleryid + '/' + imageid);
      }

      // Set title
      $('title').html('Home' + PAGE_TITLE_SUFFIX);

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

      $scope.getgallery = function () {
         $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getgalleryimagebyuserid/" + $scope.loggedindetails._id,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }).success(function (data) {
            $scope.galleries = data.msg;
            if (data.msg.length > 0) {
               $scope.noimage = true;
            }
            else {
               $scope.noimage = false;
            }
         });
      }
      $scope.getfollowings = function () {
         $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getlikeimages/" + $scope.loggedindetails._id,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }).success(function (data) {
            $scope.followings = data.likedimages;
            if (data.likedimages.length > 0) {
               $scope.nolikeimage = true;
            }
            else {
               $scope.nolikeimage = false;
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
         $scope.getgallery();
         $scope.getfollowings();
         $scope.isloggedin = true;
      }

      $scope.trustAsHtml = function (string) {
         return $sce.trustAsHtml(string);
      };
      $scope.getsignaturecollection = function () {
         $http({
            url: myAuth.baseurl + "gallery/getsignaturecollection",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }).success(function (data) {
            if (data) {
               $scope.signaturecollections = data.allcollections;
               if (data.allcollections.length > 0) {
                  $scope.nosignature = true;
               }
               else {
                  $scope.nosignature = false;
               }
            }
         });
      }
      $scope.getsignaturecollection();

      $scope.listallusers = function () {
         $http({
            url: myAuth.baseurl + "getallusers",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
         }).success(function (data) {
            if (data) {
               $scope.users = data;
            }
         });
      }

      $scope.getallcollections = function () {
         var rightcollectionarray = [];
         $scope.listallusers();
         $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getrandomcollection"
         }).success(function (data) {
            if (data.is_collection_exist == "0") {
               $scope.nocollection = true;
            }
            else {
               $scope.nocollection = false;
            }
            $scope.leftcollection = data.allcollections[0];
            $scope.leftbackimage = myAuth.cloudinary_image_base_path + '' + data.allcollections[0].images[$scope.leftcollection.images.length - 1].publicid;
            for (var i = 1; i < data.allcollections.length; i++) {
               rightcollectionarray.push(data.allcollections[i]);
            }
            $scope.rightcollections = rightcollectionarray;
         });
      }
      $scope.getallcollections();
   }
})();
