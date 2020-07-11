angular.module("photographer").factory('collectionService', function($http,$q, $cookieStore) {
  function baseUrl() {
    return '/api/gallery/';
  };

  function httpSend(property) {
    var deferred = $q.defer();
    $http(property)
    .success(function(data, status, headers, config, statusText) {
      deferred.resolve(data, status, headers, config, statusText);
    })
    .error(function(data, status, headers, config, statusText) {
      deferred.reject(data, status, headers, config, statusText);
    });

    return deferred.promise;
  };

  var collectionService = {
    collectionList : function(id) {
      return httpSend({
        url: baseUrl() + "getcollections/" + id,
        method : 'GET'
      });
    },
    deleteimage : function(data) {
      return httpSend({
        url: baseUrl() + "/deletecollectionImage/",
        method : 'post',
        data: {
          imageid: data.imageid,
          collectionid: data.collectionid
        }
      });
    },
    addCollaction : function(data) {
      return httpSend({
        url: baseUrl() + "/addalbumcollection/",
        method : 'post',
        data: data
      });
    },
    updateCollaction : function(data) {
      return httpSend({
        url:  baseUrl() + "renameCollection/",
        method : 'post',
        data: {
          userid :$cookieStore.get('users')._id,
          collectionid: data._id,
          collectionname: data.name
        }
      });
    },
    deleteCollaction : function(data) {
      return httpSend({
        url:  baseUrl() + "deleteCollection/",
        method : 'post',
        data: {
          collectionid: data._id,
        }
      });
    },
    addImgToCollaction : function(data,collectionid) {
      return httpSend({
        url:  baseUrl() + "addalbumtocollection/",
        method : 'post',
        data: {
          userid: $cookieStore.get('users')._id,
          collectionid: collectionid,
          photopublicid: data
        }
      });
    },
  }

  return collectionService;

});