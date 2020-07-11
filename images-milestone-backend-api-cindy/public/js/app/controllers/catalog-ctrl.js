(function() {

  angular.module("photographer").controller('catalogController', catalogController);

  function catalogController(configService, $scope, $http, $location, myAuth, $sce) {
    $scope.config = configService;
    $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;
    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };


    // Set title
    $('title').html('Catalog' + PAGE_TITLE_SUFFIX);

    $scope.getallkeywords = function() {
      $http({
        method: "GET",
        url: myAuth.baseurl + "catalog/getallkeywords"
      }).success(function(data) {
        if (data.is_keyword_exist == "0") {
          $scope.nokeyword = true;
        } else {
          $scope.nokeyword = false;
        }
        $scope.allkeywords = [];
        for (var key in data.allkeywords) {
            var value = data.allkeywords[key];
            //console.log('Catalog for key '+key+': ',value);
            var keyword = {};
            if (value[0]) {
              keyword.name = key;
              keyword.width = value[0].width;
              keyword.height = value[0].height;
              keyword.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_'+ value[0].imageid+'.' + 'jpg';
              keyword.length = value.length;
              $scope.allkeywords.push(keyword);
            }
        }
      });
    }
    $scope.getallkeywords();

    $scope.gettrendingkeywords = function() {
      $http({
        method: "GET",
        url: myAuth.baseurl + "catalog/gettrendingkeywords"
      }).success(function(data) {
        if (data.is_keyword_exist == "0") {
          $scope.notrendingkeyword = true;
        } else {
          $scope.notrendingkeyword = false;
        }
        $scope.alltrendingkeywords = data.allkeywords;
      });
    }
    $scope.gettrendingkeywords();

    $scope.open_join_modal = function() {
      myAuth.updateUserinfo(myAuth.getUserAuthorisation());
      $scope.loggedindetails = myAuth.getUserNavlinks();
      if ($scope.loggedindetails) {
        window.location.href = '/myaccount/' + $scope.loggedindetails._id;
      } else {
        $('#myModal-join').modal('toggle');
      }
    }

    $scope.getbrandcontentbyid = function(obj) {
      $http({
        url: myAuth.baseurl + "brand/getcontentbyid/1",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data) {
          $scope.brandcms = data;
        }
      });
    }
    $scope.getbrandcontentbyid();

    $scope.listactivebrands = function() {
      $http({
        url: myAuth.baseurl + "brand/listactivebrands",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).success(function(data) {
        if (data) {
          $scope.allbrands = data;
        }
      });
    }
    $scope.listactivebrands();
  }
  /*=========================================================================*/
})();
