(function() {
  angular.module("photographer").controller('filterController', filterController);
  function jsCapitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  function filterController(localService, $route, configService, $scope, paymentService, constSetting, $cookieStore, $http, $location, $routeParams, myAuth) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.address = {}

    const componentForm = {
      street_number: 'long_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'long_name',
      country: 'long_name',
      postal_code: 'long_name'
    };
    $scope.filterSize = '';
    $scope.filterTime = '';
    $scope.listTime = [
      {
        label: 'Any Time',
        value: 'any-time',
      },
      {
        label: 'Past 24 hour',
        value: 'past-24-hour',
        seconds: 24 * 60 * 60 //s
      },
      {
        label: 'Past week',
        value: 'past-week',
        seconds: 7 * 24 * 60 * 60 //s
      },
      {
        label: 'Past month',
        value: 'past-month',
        seconds: 30 * 24 * 60 * 60 //s
      },
      {
        label: 'Past year',
        value: 'past-year',
        seconds: 365 * 24 * 60 * 60 //s
      },
    ];

    $scope.listSize = [{
      label: 'Large',
      value: 'large'
    }, {
      label: 'Medium',
      value: 'medium'
    }, {
      label: 'Small',
      value: 'small'
    }];

    $scope.listFilter = ['size', 'country', 'city', 'time', 'lat', 'lng'];
    $scope.location = $location;
    $scope.address = {};
    $scope.listChipLocation = [];
    $scope.redirectURL = function(key, value = null) {
      $location.search(key, value);
    };

    $scope.getFilter = function() {
      let location_list = [];
      let urlParams = new URLSearchParams(window.location.search);
      $scope.listFilter.forEach(e => {
        if (urlParams.get(e)) {

          if (e === 'country' || e === 'city' || e === 'lat' || e === 'lng') {
            location_list.push({
              key: e,
              label: e === 'lat' ? 'Latitude' : e === 'lng' ? 'Longtitude' : urlParams.get(e),
              value: urlParams.get(e)
            })
          }
          $scope.redirectURL(e, urlParams.get(e));
        }
      })
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.listChipLocation = location_list
        });
      }, 500);
    }
    $scope.getFilter();
    $scope.selectTime = function(value = '') {
      let urlParams = new URLSearchParams(window.location.search);
      let time = value || urlParams.get('time') || '';
      time = jsCapitalize(time);

      $scope.filterTime = time;
      if (time) {
        if (time === 'custom-range') $(`#myModal-time`).modal('show');
        $scope.redirectURL('time', time);
      }

    }
    $scope.rangeDate = function() {
      $scope.alert = {};
      $scope.rangeError = false;
      try {
        let from = $scope.from
        let to = $scope.to
        if (!to || !from || new Date(to) < new Date(from)) {
          $scope.rangeError = true;
          $scope.alert = myAuth.addAlert('danger', "Invalid date range");
        }
        else {
          $scope.redirectURL('to', to)
          $scope.redirectURL('from', from)
          $(`#myModal-time`).modal('hide');
        }
      }
      catch (err) {
        $scope.rangeError = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
      }
    }
    $scope.showModal = function(name) {
      console.log(name)
      $(`#${name}`).modal('show')
    }
    $scope.selectSize = function(value = '') {

      let urlParams = new URLSearchParams(window.location.search);
      let size = value || urlParams.get('size') || '';
      size = jsCapitalize(size);

      $scope.filterSize = size;

      if (size) $scope.redirectURL('size', size);
    }
    $scope.selectTime()
    $scope.selectSize();

    $scope.removeChipLocation = function(key) {
      if (key) {
        $scope.listChipLocation = $scope.listChipLocation.filter(e => e.key !== key)
        $scope.redirectURL(key, null)
      }
      else {
        $scope.filterLocation = '';

        $scope.listChipLocation.forEach(e => {
          $scope.redirectURL(e.key, null)
        })
        $scope.listChipLocation = []
      }
    }
    $scope.$watch('filterLocation', function(v) {
      $scope.listChipLocation = [];
      if (v && v.formatted_address) {
        var address_components = v.address_components || [];
        // console.log(address_components)
        var country = address_components.find(e => e.types && e.types.find(i => i === 'country'))
        var city = address_components.find(e => e.types && e.types.find(i => i === "administrative_area_level_1"))
        if (country && country.long_name) {
          $scope.address.country = {
            label: country.long_name,
            value: country.long_name
          };
          $scope.listChipLocation = [{
            key: 'country',
            label: country.long_name,
            value: country.long_name
          }]
        }
        else $scope.address.country = '';

        if (city && city.long_name) {
          $scope.address.city = {
            label: city.long_name,
            value: city.long_name
          };

          $scope.listChipLocation.push({
            key: 'city',
            label: city.long_name,
            value: city.long_name
          })
        }
        else $scope.address.city = '';


        $scope.address.lat = v.geometry.location.lat();
        $scope.address.lng = v.geometry.location.lng();
        if ($scope.address.lat) {
          $scope.listChipLocation.push({
            key: 'lat',
            label: 'Latitude',
            value: $scope.address.lat
          })
        }
        if ($scope.address.lng) {
          $scope.listChipLocation.push({
            key: 'lng',
            label: 'Longtitude',
            value: $scope.address.lng
          })
        }
        $scope.address.full_address = v.formatted_address;

      } else {
        $scope.address.city = '';
        $scope.address.country = '';
        $scope.address.lat = '';
        $scope.address.lng = '';
      }

      $scope.listChipLocation.forEach(e => {
        if (e.value) $scope.redirectURL(e.key, e.value)
      })
    })

  }
})();
