angular.module('photographer').factory('gapiService', function($http, $q) {
  
    function baseUrl() {
      return '/api/gapi/';
    }
  
    function httpSend(property) {
      const deferred = $q.defer();
      $http(property)
        .success(function(data, status, headers, config, statusText) {
          deferred.resolve(data, status, headers, config, statusText);
        })
        .error(function(data, status, headers, config, statusText) {
          deferred.reject(data, status, headers, config, statusText);
        });
  
      return deferred.promise;
    }
  
    const gapiService = {
      getAccessToken() {
        return httpSend({
          url: `${baseUrl()}getauthtoken`,
          method: 'GET'
        });
      },
      queryAnalyticsData(query) {
        return httpSend({
          method: 'POST',
          url: `${baseUrl()}queryAnalyticsData`,
          data: query,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      },
      getCurrentUser(params) {
        return httpSend({
          headers: {
            authenticaion: params.authentication
          },
          method: 'GET',
          url: `https://content.googleapis.com/analytics/v3/data/realtime?ids=${params.ids}&metrics=rt%3AactiveUsers`
        });
      }
    };
  
    return gapiService;
});
  