(function() {

  angular.module('photographer').controller('mygalleryController', mygalleryController);

  function mygalleryController(configService, $scope, $http, myAuth, $location, $cookies, $cookieStore, $routeParams, $sce) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.closeeditprofile = false;
    let isempty = false;
    $scope.isloggedin = false;
    if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;

    $scope.pagination = {
      curPage: 0,
      pageSize: 30,
      numberOfPages: 1,
      pageSizeList: [30, 50, 75, 100]
    };

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    $scope.getsettingsbyid = function(obj) {
      $http({
        url: `${myAuth.baseurl}settings/getsettingsbyid/1`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data) $scope.settingsfootergallery = data;

      });
    };
    $scope.getsettingsbyid();

    // Set title
    $('title').html(`My Galleries${PAGE_TITLE_SUFFIX}`);

    $scope.getuserdetails = function() {
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/getuserdetails/${$routeParams.id}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data.type == 'error') window.location.href = '/explore';
        else {
          $scope.mygallery = data.msg;
          $scope.backgroundimage = data.msg.coverimage;

          // Set title
          if ($scope.mygallery) $('title').html(`${$scope.mygallery.fullname} photos portfolio${PAGE_TITLE_SUFFIX}`);

        }
      });
    };
    $scope.getuserdetails();

    if ($scope.loggedindetails) if ($scope.loggedindetails._id == $routeParams.id) {
      $scope.isauthor = true;
    } else {
      $scope.isauthor = false;
    }
    else $scope.isauthor = false;

    $scope.removePhotos = function() {
      $scope.showRemove = false;
      $scope.showDone = true;
      $scope.spnDeleteButton = true;
      $scope.spnAddCollection = true;
    };

    $scope.donePhotos = function() {
      if (isempty == true) $scope.showSingleAdd = true;
      else $scope.showRemove = true;

      $scope.showDone = false;
      $scope.spnDeleteButton = false;
      $scope.spnAddCollection = false;
    };

    $scope.deleteSinglePhoto = function(galleryid, imagepublicid) {
      const dataObj = {
        'imageid': imagepublicid
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/deleteImage`,
        data: dataObj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type == 'error') { } else {
          $http({
            method: 'GET',
            url: `${myAuth.baseurl}gallery/getgalleryimagebyuserid/${$routeParams.id}`,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).success(function(data) {
            $scope.galleriimageses = data.msg;
            const noofphotos = data.msg.length;
            $scope.noofphotos = noofphotos;
            if (noofphotos > 0) $scope.showPhotos = true;
            else {
              $scope.showPhotos = false;
              isempty = true;
            }
          });
          $scope.getallmycollections();
        }
      });
    };

    $scope.getgallery = function() {
      const pagination = $scope.pagination;

      const criteria = {
        page: pagination.curPage,
        limit: pagination.pageSize
      };

      let urlParams = new URLSearchParams(window.location.search);
      if(urlParams.has('year')) criteria.year = urlParams.get('year');
      if(urlParams.has('month')) criteria.month = urlParams.get('month');

      $http({
        method: 'GET',
        url: `${myAuth.baseurl}album/getalbumsimages/${$routeParams.id}`,
        params: criteria
      }).success(function(data) {
        $scope.images = data.images.map(function(photo) {
          photo.width = photo.imagewidth;
          photo.height = photo.imageheight;
          photo.src = `https://stock.vavel.com/s/photoImages/bunch/h200_${photo.imagepublicid}.${photo.fileExtension}`;
          return photo;
        });

        $scope.noofphotos = data.count;
        $scope.showPhotos = !!data.count;
        $scope.showRemove = !!data.count;
        $scope.showSingleAdd = !data.count;

        // $scope.filteredGallery = $scope.images.slice(0, $scope.pagination.pageSize);
        // $scope.pagination.numberOfPages = Math.ceil($scope.images.length / $scope.pagination.pageSize);

        $scope.pagination.numberOfPages = Math.ceil(data.count / pagination.pageSize);
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      });
    };

    $scope.getgallery();

    $scope.$watch('pagination.pageSize', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.getgallery();
    });

    $scope.showPage = (page) => {
      $scope.pagination.curPage = page;
      $scope.getgallery();
    };

    $scope.removeImage = function(imageid) {
      $.cloudinary.api.delete_resources([imageid],
        function(result) {
          // console.log(result);
        });
    };

    $scope.showDetails = function(galleryid, imageid) {
      $location.path(`/details/${galleryid}/${imageid}`);
    };

    $scope.openedit = function() {
      $scope.closeeditprofile = true;
    };

    $scope.closeedit = function() {
      $scope.closeeditprofile = false;
    };

    $scope.profilesubmit = function() {
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}changeprofile`,
        data: $.param($scope.mygallery),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data.type == 'error') {

        } else {
          $cookieStore.put('users', data.userdata);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.closeeditprofile = false;
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              $scope.mygallery = myAuth.getUserNavlinks();
            });
          }, 3000);
        }
      });
    };

    $scope.dropzoneConfigAvatar = {
      'options': {
        'url'() {
          return `${myAuth.baseurl}uploadAvatar/`;
        },
        'maxFilesize': 1.5
      },
      'eventHandlers': {
        'sending'(file, formData, xhr) {
          $('.dz-message').hide();
        },
        'success'(file, response) {
          if (response.profileimage) {
            const user = $cookieStore.get('users');
            user.profileimage = response.profileimage;
            $cookieStore.put('users', user);

            setTimeout(function() {
              $scope.$apply(function() {
                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                $scope.loggedindetails = myAuth.getUserNavlinks();
                $scope.mygallery = myAuth.getUserNavlinks();
              });
            }, 3000);
            $('.dz-message').show();
            $('#myModal-avatarupload').modal('toggle');
            $(file.previewTemplate).detach();
          }
        }
      }
    };

    $scope.dropzoneConfigCover = {
      'options': {
        'url'() {
          return `${myAuth.baseurl}uploadCover/`;
        },
        'maxFilesize': 1.5
      },
      'eventHandlers': {
        'sending'(file, formData, xhr) {
          $('.dz-message').hide();
        },
        'success'(file, response) {
          if (response.coverimage) {

            const user = $cookieStore.get('users');
            user.coverimage = response.coverimage;
            $cookieStore.put('users', user);

            setTimeout(function() {
              $scope.$apply(function() {
                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                $scope.loggedindetails = myAuth.getUserNavlinks();
                $scope.mygallery = myAuth.getUserNavlinks();
              });
            }, 3000);
            $('.dz-message').show();
            $('#myModal-backgroundupload').modal('toggle');
            $(file.previewTemplate).detach();
          }
        }
      }
    };

    if ($scope.loggedindetails) {
      $scope.getallmycollections = function() {
        $http({
          method: 'GET',
          url: `${myAuth.baseurl}gallery/getcollections/${$scope.loggedindetails._id}`
        }).success(function(data) {

          if (data.is_collection_exist == 0) $scope.showcollections = false;
          else $scope.showcollections = true;

          $scope.allcollections = data.allcollections;
        });
      };
      $scope.getallmycollections();
    }

    $scope.open_collectionmodal = function(galleryid, photopublicid) {
      if ($scope.loggedindetails) {
        $('#mymodal-addcollection').modal('toggle');
        $scope.mygallery.collectiongalleryid = galleryid;

        $scope.albumdetls1 = {
          photopublicid
        };
      } else $('#myModal-login').modal('toggle');

    };

    $scope.collectionsubmit = function() {
      const dataobj = {
        'collectionname': $scope.mygallery.collectionname
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/addalbumcollection`,
        data: dataobj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type == 'success') {
          $scope.mygallery.collectionname = '';
          $scope.allcollections = {};
          setTimeout(function() {
            $scope.getallmycollections();
          }, 500);
        }
      });
    };

    $scope.addtocollection = function(collectionid) {
      const dataobj = {
        photopublicid: $scope.albumdetls1.photopublicid,
        galleryid: $scope.mygallery.collectiongalleryid,
        userid: $scope.loggedindetails._id,
        collectionid
      };

      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/addalbumtocollection`,
        data: dataobj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type === 'success') {
          $scope.allcollections = {};

          setTimeout(function() {
            $scope.getallmycollections();
          }, 500);
        }
      });
    };

    $scope.getsales = function(obj) {
      $http({
        url: `${myAuth.baseurl}sale/getsales/${$routeParams.id}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data) {
          let totalimagessold = 0;
          let totalalbumssold = 0;

          if (data.type == 'success') if (data.is_sale_exist == 0) { } else {
            data.sales.forEach(function(sale, index) {
              if (sale.type == 'Album') totalalbumssold = totalalbumssold + 1;
              else if (sale.type == 'Image') totalimagessold = totalimagessold + 1;

            });
          }
          else { }
          $scope.totalimagessold = totalimagessold;
          $scope.totalalbumssold = totalalbumssold;
        }
      });
    };
    $scope.getsales();

  }
})();
