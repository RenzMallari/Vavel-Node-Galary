(function() {

  angular.module("photographer").controller('albumdetailsController', albumdetailsController);
  function albumdetailsController(configService, $scope, $http, $location, $routeParams, myAuth) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
    $scope.albumdetls = myAuth.getUserNavlinks();
    $scope.showRemove = true;
    $scope.showDone = false;
    $scope.page404 = false;

    // Set title
    $('title').html(PAGE_TITLE);

    $scope.open_collectionmodal = function(albumid, photopublicid) {
      if ($scope.loggedindetails) {
        $('#mymodal-addcollection').modal('toggle');
        $scope.albumdetls.collectiongalleryid = albumid;
        $scope.albumdetls.photopublicid = photopublicid;
      }
      else {
        $('#myModal-login').modal('toggle');
      }
    }

    $scope.showDetails = function(galleryid, imageid) {
      $location.path("/details/" + galleryid + '/' + imageid);
    }

    $scope.getallmycollections = function() {
      if ($scope.loggedindetails) {
        $http({
          method: "GET",
          url: myAuth.baseurl + "gallery/getcollections/" + $scope.loggedindetails._id
        }).success(function(data) {
          if (data.is_collection_exist == 0) {
            $scope.showcollections = false;
          }
          else {
            $scope.showcollections = true;
          }
          $scope.allcollections = data.allcollections;
        });
      }
      else {
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.page404 = true
          })
        }, 1000)
      }
    }
    $scope.getallmycollections();

    $scope.collectionsubmit = function() {
      var dataobj = { 'galleryid': $scope.albumdetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionname': $scope.albumdetls.collectionname, 'photopublicid': $scope.albumdetls.photopublicid };

      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/addalbumcollection",
        data: dataobj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'success') {
          $scope.albumdetls.collectionname = '';
          $scope.allcollections = {};
          setTimeout(function() {
            $scope.getallmycollections();
          }, 500);
        }
      });
    }

    $scope.addtocollection = function(collectionid) {
      var dataobj = { 'galleryid': $scope.albumdetls.collectiongalleryid, 'userid': $scope.loggedindetails._id, 'collectionid': collectionid, 'photopublicid': $scope.albumdetls.photopublicid };
      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/addalbumtocollection",
        data: dataobj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'success') {
          $scope.allcollections = {};

          setTimeout(function() {
            $scope.getallmycollections();
          }, 500);

        }
      });
    }

    $scope.getallmyalbumdetails = function() {
      $scope.noalbumimage = true;

      $http({
        method: "GET",
        url: myAuth.baseurl + "album/getalbumdetails/" + $routeParams.id
      }).success(function(data) {
        if (data.type == 'success') {

          $scope.albumname = data.albumname;
          $scope.noofphotos = data.msg.length;
          $scope.albumphotos = data.msg.map(function(photo) {
            //console.log(photo);
            photo.width = photo.imagewidth;
            photo.height = photo.imageheight;
            photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.publicid + '.' + photo.fileExtension;
            return photo;
          });
          $scope.price = data.albumprice;
          $scope.albumdetls.keyword = data.tags;
          $scope.albumdetls.editalbumname = data.albumname;
          $scope.albumdetls.price = data.albumprice;
          $scope.albmid = $routeParams.id;
          if (data.msg.length > 0) {
            $scope.noalbumimage = true;
          }
          else {
            $scope.noalbumimage = false;
          }

          if (data.albumname) {
            // Set title
            $('title').html('Images of ' + data.albumname + PAGE_TITLE_SUFFIX);
          }
        }
        else {
          $location.path("/myalbums");
        }
      });
    }
    $scope.getallmyalbumdetails();

    $scope.removePhotos = function() {
      $scope.showRemove = false;
      $scope.showDone = true;
      $scope.spnDeleteButton = true;
      $scope.spnAddCollection = true;
    }

    $scope.deleteSinglePhoto = function(imagepublicid) {
      var dataObj = {
        "imageid": imagepublicid,
        "albumid": $routeParams.id
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "album/deletealbumImage",
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == "error") {
        }
        else {
          $scope.getallmyalbumdetails();
        }
      });
    }

    $scope.closedeletemodal = function() {
      $('#delete-collection').modal('toggle');
    }

    $scope.closedeletemodal_img = function() {
      $('.delete-image_single').modal('toggle');
    }


    $scope.deletealbum = function() {
      var dataObj = {
        "albumid": $routeParams.id
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "album/deleteAlbum",
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == "error") {
        }
        else {
          $location.path("/myalbums");
        }
      });
    }

    $scope.changealbumname = function() {
      if (
        //$scope.albumdetls.keyword.length==0 ||
        $scope.albumdetls.price == '' ||
        $scope.albumdetls.editalbumname == ''
      ) {
        $scope.albumError = true;
        $scope.alert = myAuth.addAlert('danger', 'Please enter all the fields!');
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.albumError = false;
          });
        }, 3000);
      }
      else {
        var dataObj = {
          "albumid": $routeParams.id,
          "albumname": $scope.albumdetls.editalbumname,
          "albumprice": $scope.albumdetls.price,
          "currency": $scope.albumdetls.currency,
          "albumkeyword": $scope.albumdetls.keyword,
          'userid': $scope.loggedindetails._id,
        };
        $http({
          method: "POST",
          url: myAuth.baseurl + "album/renameAlbum",
          data: dataObj,
          headers: { 'Content-Type': 'application/json' }
        }).success(function(data) {
          if (data.type == "error") {

            $scope.albumError = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.albumError = false;
              });
            }, 3000);
            $scope.showRemove = true;
            $scope.showDone = false;
            $scope.spnDeleteButton = false;
            $scope.spnAddCollection = true;
          }
          else {
            $scope.alert = myAuth.addAlert('success', 'Your album updated successfully');
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.albumError = false;
                $('#myModal-drag').modal('toggle');
              });
            }, 3000);
            $scope.showRemove = true;
            $scope.showDone = false;
            $scope.spnDeleteButton = false;
            $scope.spnAddCollection = false;
            $scope.albumname = $scope.albumdetls.editalbumname;
            $scope.price = $scope.albumdetls.price;
          }
        });
      }
    }


  }
})();
