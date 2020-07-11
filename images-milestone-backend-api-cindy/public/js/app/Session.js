'use strict';

angular.module('photographyAppauth',[])
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });
