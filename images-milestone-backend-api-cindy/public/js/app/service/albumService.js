angular.module('photographer').factory('albumService', function($http, $q, $cookieStore) {
  function baseUrl() {
    return '/api/album/';
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

  const albumService = {
    albumList(id) {
      return httpSend({
        url: `${baseUrl()}getalbums/${id}`,
        method: 'GET'
      });
    },
    deleteimage(data) {
      return httpSend({
        url: `${baseUrl()}deletealbumImage/`,
        method: 'post',
        data: {
          imageid: data.imageid,
          albumid: data.albumid
        }
      });
    },
    Updateimage(data) {
      return httpSend({
        url: '/api/gallery/addcaption/',
        method: 'post',
        data: {
          imageid: data.imageid,
          caption: data.caption,
          tags: data.tags,
          price: data.price,
          isthumbnail: data.isthumbnail,
          sellonetime: data.sellonetime
        }
      });
    },
    updateAlbum(data) {
      console.log(data);
      return httpSend({
        url: `${baseUrl()}renameAlbum/`,
        method: 'post',
        data: {
          userid: $cookieStore.get('users')._id,
          albumid: data._id,
          albumname: data.name,
          albumprice: data.price,
          albumkeyword: data.tags,
          albumaddress: data.albumaddress,
          albumcountry: data.albumcountry,
          albumcity: data.albumcity,
          lng: data.lng,
          lat: data.lat,
          date: data.date
        }
      });
    },
    deleteAlbum(data) {
      return httpSend({
        url: `${baseUrl()}deleteAlbum/`,
        method: 'post',
        data: {
          albumid: data._id
        }
      });
    },
    addAlbum(data) {

      return httpSend({
        url: `${baseUrl()}addalbum/`,
        method: 'post',
        data
      });
    }
  };

  return albumService;

});
