(function () {

  angular.module("photographer").controller('collectiondetailsController', collectiondetailsController);

  function collectiondetailsController(configService, $scope, $http, $location, $routeParams, myAuth) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
    $scope.collectiondetls = myAuth.getUserNavlinks();
    $scope.showRemove = true;
    $scope.showDone = false;
    $scope.collectionId = $routeParams.id;

    // Set title
    $('title').html(PAGE_TITLE);

    $scope.getallmycollectiondetails = function () {
      $http({
        method: "GET",
        url: myAuth.baseurl + "gallery/getcollectiondetails/" + $routeParams.id
      }).success(function (data) {
        if (data.type == 'success') {
          $scope.collectionname = data.collectionname;
          $scope.collectiondetls.editcollectionname = data.collectionname;
          $scope.noofphotos = data.msg.length;
          $scope.collectionphotos = data.msg.map(function (photo) {
            return {
              width: photo.imagewidth,
              height: photo.imageheight,
              src: 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.publicid + '.' + photo.fileExtension
            }
          });
          if (data.msg.length > 0) {
            $scope.nocollectionimage = true;
          }
          else {
            $scope.nocollectionimage = false;
          }

          // Set title
          if ($scope.collectionname) {
            $('title').html($scope.collectionname + ' Collection' + PAGE_TITLE_SUFFIX);
          }
        }
        else {
          $location.path("/mycollection");
        }
      });
    }
    $scope.getallmycollectiondetails();

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
    $scope.getallmycollections();

    $scope.open_collectionmodal = function (galleryid, photopublicid) {
      $('#mymodal-addcollection').modal('toggle');
      $scope.collectiondetls.collectiongalleryid = galleryid;
      $scope.collectiondetls.photopublicid = photopublicid;
    }

    $scope.collectionsubmit = function () {
      var dataobj = { 'galleryid': $scope.collectiondetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionname': $scope.collectiondetls.collectionname, 'photopublicid': $scope.collectiondetls.photopublicid };

      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/addalbumcollection",
        data: dataobj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function (data) {
        if (data.type == 'success') {
          $scope.collectiondetls.collectionname = '';
          $scope.allcollections = {};
          setTimeout(function () {
            $scope.getallmycollections();
          }, 500);
        }
      });
    }

    $scope.addtocollection = function (collectionid) {
      var dataobj = { 'galleryid': $scope.collectiondetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionid': collectionid, 'photopublicid': $scope.collectiondetls.photopublicid };
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



    $scope.showDetails = function (galleryid, imageid) {
      $location.path("/details/" + galleryid + '/' + imageid);
    }

    $scope.removePhotos = function () {
      $scope.showRemove = false;
      $scope.showDone = true;
      $scope.spnDeleteButton = true;
      $scope.spnAddCollection = true;
    }

    $scope.deleteSinglePhoto = function (imagepublicid) {
      var dataObj = {
        "imageid": imagepublicid,
        "collectionid": $routeParams.id
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/deletecollectionImage",
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function (data) {
        if (data.type == "error") {
        }
        else {
          $scope.getallmycollectiondetails();
          $scope.getallmycollections();
        }
      });
    }

    $scope.closedeletemodal = function () {
      $('#delete-collection').modal('toggle');
    }

    $scope.deletecollection = function () {
      var dataObj = {
        "collectionid": $routeParams.id
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/deleteCollection",
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function (data) {
        if (data.type == "error") {
        }
        else {
          $location.path("/mycollection");
        }
      });
    }

    $scope.changecollectionname = function () {
      var dataObj = {
        "collectionid": $routeParams.id,
        "collectionname": $scope.collectiondetls.editcollectionname,
        'userid': $scope.loggedindetails._id
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/renameCollection",
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.showRemove = true;
          $scope.showDone = false;
          $scope.spnDeleteButton = false;
          $scope.spnAddCollection = false;
        }
        else {
          $scope.showRemove = true;
          $scope.showDone = false;
          $scope.spnDeleteButton = false;
          $scope.spnAddCollection = false;
          $scope.collectionname = $scope.collectiondetls.editcollectionname;
        }
      });
    }


  }
})();
