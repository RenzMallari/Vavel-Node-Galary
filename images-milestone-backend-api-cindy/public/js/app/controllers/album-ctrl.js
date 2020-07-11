(function() {
  angular.module('photographer').controller('albumController', albumController);

  function albumController(configService, $scope, $http, myAuth, $location, $cookies, $cookieStore, $routeParams) {
    $scope.pagination = {
      curPage: 0,
      pageSize: 30,
      numberOfPages: 1,
      pageSizeList: [2, 30, 50, 75, 100]
    };
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.myalbum = myAuth.getUserNavlinks();
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();

    if ($scope.myalbum) {
      $scope.myalbum.albumpublicid = '';
      $scope.myalbum.albumwidthheight = '';
      $scope.myalbum.albumimageurls = '';
      $scope.myalbum.keyword = '';
      $scope.myalbum.price = '';
      $scope.myalbum.albumname = '';
    } else $scope.myalbum = {};

    $scope.total_selectedfile = 0;
    $scope.total_uploadedfile = 0;

    $scope.cloudinary_cloud_name = myAuth.cloudinary_cloud_name;
    $scope.cloudinary_upload_preset = myAuth.cloudinary_upload_preset;
    $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;

    $scope.isloggedin = false;
    if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;

    $scope.addalbum = function(galleryid) {
      $('#myModal-drag').modal('toggle');
      $('#submtbtn_layout').prop('disabled', false);
    };

    // Set title
    $('title').html(`My Albums${PAGE_TITLE_SUFFIX}`);

    $scope.getallmyalbums = function() {
      const pagination = $scope.pagination;

      const criteria = {
        page: pagination.curPage,
        limit: pagination.pageSize
      };

      $http({
        method: 'GET',
        url: `${myAuth.baseurl}album/getalbums/${$scope.loggedindetails._id}`,
        params: criteria
      }).success(function(data) {
        $scope.showalbums = data.is_album_exist;

        $scope.allalbums = [];
        data.allalbums = data.allalbums || [];
        data.allalbums.forEach(function(album) {
          const sizes = [300, 305, 310, 320, 325, 330, 335, 340, 345, 350];
          const randomSize = Math.floor(Math.random() * 10);
          album.width = sizes[randomSize];
          album.height = 200;
          const cover = album.images[0];
          if (cover) album.src = `https://stock.vavel.com/s/photoImages/bunch/h200_${cover.publicid}.${cover.fileExtension}`;

          $scope.allalbums.push(album);
        });

        $scope.pagination.numberOfPages = Math.ceil(data.count / $scope.pagination.pageSize);
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      });
    };
    if ($scope.loggedindetails) $scope.getallmyalbums();

    $scope.showPage = (page) => {
      $scope.pagination.curPage = page;
      $scope.getallmyalbums();
    };

    $scope.$watch('pagination.pageSize', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.getallmyalbums();
    });

    $scope.albumsubmit = function() {
      $scope.total_uploadedfile = 0;
      $scope.total_selectedfile = 0;
      $scope.myalbum.albumpublicid = $('#publicid').val();
      $scope.myalbum.albumwidthheight = $('#imageheightwidth').val();
      $scope.myalbum.albumimageurls = $('#imageurls').val();

      $scope.myalbum.watermark1 = ($scope.loggedindetails.watermark1 != '') ? $scope.loggedindetails.watermark1 : '';
      $scope.myalbum.watermark2 = ($scope.loggedindetails.watermark2 != '') ? $scope.loggedindetails.watermark2 : '';

      $scope.albumError = true;
      $scope.alert = myAuth.addAlert('success', 'Please wait. Uploading...');
      if ($scope.myalbum.keyword.length == 0 || $scope.myalbum.albumpublicid == 0 || $scope.myalbum.albumpublicid == '' || $scope.myalbum.price == '' || $scope.myalbum.albumname == '') {
        $scope.albumError = true;
        $scope.alert = myAuth.addAlert('danger', 'Please enter all the fields!');
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.albumError = false;
          });
        }, 3000);
      } else {
        alert('HI');
        $('#submtbtn').prop('disabled', true);
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}album/addalbum`,
          data: $scope.myalbum,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == 'error') {
            $scope.albumError = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.albumError = false;
                $('#submtbtn').prop('disabled', false);
              });
            }, 3000);
          } else {
            $scope.myalbum.albumpublicid = '';
            $scope.myalbum.albumwidthheight = '';
            $scope.myalbum.albumimageurls = '';
            $scope.myalbum.keyword = '';
            $scope.myalbum.price = '';
            $scope.myalbum.albumname = '';
            $scope.myalbum.albumwidthheight = '';
            $scope.albumError = true;
            $scope.alert = myAuth.addAlert('success', 'Your album added successfully');
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.albumError = false;
                $('#publicid').val('');
                $('#imageheightwidth').val('');
                $('#imageurls').val('');
                $('.dz-message').show();
                $('.dz-preview').remove();
                $('#submtbtn').prop('disabled', false);
                $('#myModal-drag').modal('toggle');
              });
            }, 3000);
            $scope.getallmyalbums();
          }
        });
      }
    };

    $scope.dropzoneConfig = {
      'options': {
        'url': '/upload'
      },
      'eventHandlers': {
        'sending'(file, formData, xhr) {
          $('.dz-message').hide();
          $scope.total_selectedfile = $scope.total_selectedfile + 1;
        },
        'success'(file, response) {
          const dataobj = {
            'filename': response.files[0].name
          };
          $http({
            method: 'POST',
            url: `${myAuth.baseurl}album/fileupload`,
            data: dataobj,
            headers: {
              'Content-Type': 'application/json'
            }
          }).success(function(data) {
            let publicid = $('#publicid').val();
            let imageheightwidth = $('#imageheightwidth').val();
            let imageurls = $('#imageurls').val();
            publicid += `${data.public_id},`;
            imageheightwidth += `${data.width},${data.height}@`;
            imageurls += `${data.url}@@`;
            $('#publicid').val(publicid);
            $('#imageheightwidth').val(imageheightwidth);
            $('#imageurls').val(imageurls);
            $scope.total_uploadedfile = $scope.total_uploadedfile + 1;
            if ($scope.total_uploadedfile != $scope.total_selectedfile) $('#submtbtn').prop('disabled', true);
            else $('#submtbtn').prop('disabled', false);

          });
        }
      }
    };
  }
})();
