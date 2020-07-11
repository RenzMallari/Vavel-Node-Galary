(function() {

  angular.module('photographer').controller('mycollectionController', mycollectionController);

  function mycollectionController(configService, $scope, $http, $location, $routeParams, myAuth) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();

    $scope.isloggedin = false;
    if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;

    $scope.pagination = {
      curPage: 0,
      pageSize: 2,
      numberOfPages: 1,
      pageSizeList: [2, 30, 50, 75, 100]
    };

    // Set title
    $('title').html(`My Collections${PAGE_TITLE_SUFFIX}`);

    $scope.getallmycollections = function() {
      const pagination = $scope.pagination;

      const criteria = {
        page: pagination.curPage,
        limit: pagination.pageSize
      };

      $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/getcollections/${$scope.loggedindetails._id}`,
        params: criteria
      }).success(function(data) {
        if (data.is_collection_exist == '0') $scope.showcollections = false;
        else $scope.showcollections = true;

        $scope.allcollections = data.allcollections.map(function(collection) {
          // console.log('Collection: ', collection);
          const sizes = [300, 305, 310, 320, 325, 330, 335, 340, 345, 350];
          const randomSize = Math.floor(Math.random() * 10);
          collection.width = sizes[randomSize];
          collection.height = 200;

          const cover = collection.images[0];
          if (cover) collection.src = `https://stock.vavel.com/s/photoImages/bunch/h200_${cover.publicid}.${cover.fileExtension}`;

          return collection;
        });
        // $scope.filteredCollections = $scope.allcollections.slice(0, $scope.pagination.pageSize);
        // $scope.pagination.numberOfPages = Math.ceil($scope.allcollections.length / $scope.pagination.pageSize);

        $scope.pagination.numberOfPages = Math.ceil(data.count / $scope.pagination.pageSize);
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      });
    };

    if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.getallmycollections();

    $scope.showPage = (page) => {
      $scope.pagination.curPage = page;
      $scope.getallmycollections();
    };

    $scope.$watch('pagination.pageSize', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.getallmycollections();
    });
  }
})();
