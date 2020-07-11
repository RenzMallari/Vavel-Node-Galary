// 'use strict';

/**
 * Manage header
 * @param $route
 * @returns {{hideHeader: service.hideHeader}}
 */
function headerService($route) {

    var service = {
        /**
         * Manage header visibility
         * @returns {Object|*|d|d.params|Function|boolean}
         */
        hideHeader: function() {
            return $route.current && $route.current.$$route && $route.current.$$route.params && $route.current.$$route.params.header === false;
        }
    };
    return service;
};
headerService.$inject = ['$route'];
angular.module("photographer").factory('headerService', headerService);
