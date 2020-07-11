(function() {

  angular.module("photographer").controller('allalbumsController', allalbumsController);

  function allalbumsController(configService, $scope, $http, $filter, constSetting, $location, myAuth, $sce, $routeParams, $cookieStore, $rootScope) {
    $scope.config = configService;
    $scope.pagination = {
      curPage: 0,
      pageSize: 30,
      numberOfPages: 1,
      pageSizeList: [30, 50, 75, 100]
    };

    $scope.noalbum = true;
    $scope.updating = false;
    $scope.allalbums = [];
    $scope.filteredAlbums = [];
    $scope.tag = $routeParams.tag;
    // Set title
    $('title').html('Last Albums' + PAGE_TITLE_SUFFIX);

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    function distance(lat1 = 0, lon1 = 0, coords = [], lat2 = 0, lon2 = 0) {
      lat1 = Number(lat1)
      lon1 = Number(lon1)
      if (!coords) coords = $cookieStore.get('coords');
      let urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('lat') && urlParams.has('lng')) {
        lat2 = Number(urlParams.has('lat'))
        lon2 = Number(urlParams.has('lng'))
      }
      else if (coords) {
        lat2 = Number(coords[0])
        lon2 = Number(coords[1])
      }
      let R = 6371; // km (change this constant to get miles)
      let dLat = (lat2 - lat1) * Math.PI / 180;
      let dLon = (lon2 - lon1) * Math.PI / 180;
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      // if (d>1) return Math.round(d)+"km";
      // else if (d<=1) return Math.round(d*1000)+"m";
      return Math.round(d);
    }

    $scope.sortallmyalbums = function(data = {}) {
      let { coords, sort_by, country_filter, list = [] } = data;
      if (!coords && !sort_by && !country_filter) country_filter = $cookieStore.get('country')
      let urlParams = new URLSearchParams(window.location.search);
      let search = {};
      if (urlParams.has('country')) search.country = urlParams.get('country').toLowerCase();
      if (urlParams.has('city')) search.city = urlParams.get('city').toLowerCase();
      if (urlParams.has('size')) search.size = urlParams.get('size').toLowerCase();
      if (urlParams.has('time')) search.time = urlParams.get('time').toLowerCase();
      if (urlParams.has('lat')) search.lat = Number(urlParams.get('lat'));
      if (urlParams.has('lng')) search.lng = Number(urlParams.get('lng'));


      if (search.country) country_filter = search.country;

      if (list.length) $scope.allalbums = list

      if (search.time && search.time === 'custom-range' && urlParams.get('from') && urlParams.get('to')) {
        search.from = new Date(urlParams.get('from')).getTime();
        search.to = new Date(urlParams.get('to')).getTime();
      }
      if (urlParams.has('tag')) search.tag = urlParams.get('tag');

      let from, to = new Date().getTime();
      if (search.time) {
        let filterController = angular.element('#filter-controller').scope()
        let listFilterTime = filterController.listTime;
        let time = listFilterTime.find(e => e.value === search.time);
        if (time && !time.seconds) {

          //anytime
        }
        else {
          if (!time && search.time === 'custom-range' && search.from && search.to) {
            to = search.to;
            from = search.from
          }
          else if (time) {
            to = to;
            from = to - Number(time.seconds) * 1000
          }
        }
      }

      if (search.time && from && to) {
        $scope.allalbums = $scope.allalbums.filter(function(album) {
          let createdate = new Date(album.createdate).getTime()
          if (createdate > from && createdate <= to) {
            return album;
          }
        });
      }


      // console.log(data, coords, $cookieStore.get('default_country'))

      if (search.lat && search.lng) coords = [search.lat, search.lng]
      else if (sort_by === 'near') coords = $cookieStore.get('coords');

      if (coords) {
        $scope.allalbums = $scope.allalbums.map(function(album) {
          if (album.lat && album.lng) album.distance = distance(album.lat, album.lng, coords)
          else album.distance = null;
          return album;
        });
        $scope.allalbums = $filter('orderBy')($scope.allalbums, 'distance');

      }
      else if (sort_by === 'newest-country' && $cookieStore.get('default_country')) {
        let default_country = $cookieStore.get('default_country').toLowerCase()
        let match = $scope.allalbums.filter(e => default_country === e.albumcountry.toLowerCase())
        let not_match = $scope.allalbums.filter(e => default_country !== e.albumcountry.toLowerCase())
        $scope.allalbums = $filter('orderBy')(match, '-createdate');

        // console.log(match)
        $scope.allalbums = $scope.allalbums.concat(not_match);
      }
      else if (sort_by === 'newest') {
        $scope.allalbums = $filter('orderBy')($scope.allalbums, '-createdate');
      }

      if (country_filter && !search.lat && !search.lng && !sort_by) {
        let paramcountry = String(country_filter).toLowerCase();
        let country = constSetting.list_countries.find(function(e) {
          if (e.name.toLowerCase() === paramcountry || e.alpha3code.toLowerCase() === paramcountry || e.alpha2code.toLowerCase() === paramcountry) {
            return e
          }
        })

        if (country) {
          $scope.myCountry = paramcountry.toUpperCase()

          let match = [];
          let not_match = [];


          match = $scope.allalbums.filter((album) => {
            if (album.albumcountry && Object.values(country).find(e => e.toLowerCase() === album.albumcountry.toLowerCase())) {
              return album;
            }
          })

          match = $filter('orderBy')(match, '-createdate');
          if (search.city) {
            let match_city = [];
            let notmatch_city = [];
            match_city = match.filter((album) => album.albumcity && album.albumcity.toLowerCase() === search.city.toLowerCase())
            notmatch_city = match.filter((album) => !album.albumcity || album.albumcity.toLowerCase() !== search.city.toLowerCase())

            notmatch_city = $filter('orderBy')(notmatch_city, '-createdate');

            match = match_city.concat(notmatch_city);
          }

          not_match = $scope.allalbums.filter((album) => {
            if (!album.albumcountry || !Object.values(country).find(e => e.toLowerCase() === album.albumcountry.toLowerCase())) {
              return album;
            }
          })

          $scope.allalbums = match.concat(not_match);
        }
      }



      let tagController = angular.element('#tag-controller').scope();

      if (tagController && tagController.allalbums) {
        tagController.allalbums = $scope.allalbums
        if (($location.$$path === '/albums' || $location.$$path.indexOf("mainalbumdetails") >= 0) && tagController.gettags) {
          tagController.gettags({ list: tagController.allalbums, country_filter: country_filter })
        }
      }


      if (search.tag) {
        $scope.allalbums = $filter('filter')($scope.allalbums, function(item) {
          if (item.tags && item.tags.find(e => e.tag === search.tag)) return item;
        })
      }

      // console.log('sortallmyalbums', $scope.allalbums)
      $scope.updating = false;
      if (!$scope.allalbums.length) {
        $scope.noalbum = true;
      } else {
        $scope.noalbum = false;
      }
      $scope.filteredAlbums = $scope.allalbums.slice($scope.pagination.curPage, $scope.pagination.pageSize);
    };

    $scope.getallmyalbums = function() {
      const pagination = $scope.pagination;
      $scope.updating = true;

      const criteria = {
        page: pagination.curPage,
        limit: pagination.pageSize
      };

      let urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('tag')) criteria.tag = urlParams.get('tag');

      $http({
        method: "GET",
        url: myAuth.baseurl + "album/getnoofalbums",
        params: criteria
      }).success(function(data) {
        let sizes = [300, 305, 310, 320, 325, 330, 335, 340, 345, 350];
        let country_filter = $cookieStore.get('country');

        if (data.geolocation && data.geolocation.name && data.geolocation.name !== $cookieStore.get('default_country')) {
          $cookieStore.put('default_country', data.geolocation.name.toLowerCase())

          if (!country_filter) {
            country_filter = data.geolocation.name;
            console.log('first', country_filter)
          }
        }

        let sort_by;
        // if (!$cookieStore.get('sort_by')) {
        //   sort_by = 'newest-country'
        //   $cookieStore.put('sort_by', 'newest-country')
        // }
        $scope.allalbums = data.allalbums.map(function(album) {
          let randomSize = Math.floor(Math.random() * 10);
          album.width = sizes[randomSize];
          album.height = 200;
          if (album.thumbnail) album.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + album.thumbnail.publicid + '.' + album.thumbnail.fileExtension;

          return album;
        });

        $scope.pagination.numberOfPages = Math.ceil(data.count / $scope.pagination.pageSize);

        $scope.sortallmyalbums({ sort_by, list: $scope.allalbums, country_filter });

        document.body.scrollTop = document.documentElement.scrollTop = 0;
      });

    }

    if ($scope.noalbum && ($location.$$path === '/albums' || $location.$$path.indexOf("mainalbumdetails") >= 0)) {
      $scope.getallmyalbums();
    }

    $rootScope.$on("allmyalbums", function(event, data) {
      if (!$scope.noalbum && ($location.$$path === '/albums' || $location.$$path.indexOf("mainalbumdetails") >= 0)) {
        $scope.sortallmyalbums(data);
      }
    });

    $scope.showPage = (page) => {
      $scope.pagination.curPage = page;
      $scope.getallmyalbums();
    }


    $scope.$watch('pagination.pageSize', function(newVal, oldVal) {
      if (newVal === oldVal) return;

      $scope.getallmyalbums();
    });

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
