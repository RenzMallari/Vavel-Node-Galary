angular.module('photographer').factory('envService', function($http, $q) {
  
    function baseUrl() {
      return '/api/';
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
  
    const envService = {
      getEnvVariables() {
        return httpSend({
          url: `${baseUrl()}getenv`,
          method: 'GET'
        });
      }
    };
  
    return envService;
});
  