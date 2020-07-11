(function() {

    angular.module("photographer").controller('exploreController', exploreController);

    function exploreController(configService, $scope, $http, $location, myAuth, $sce) {
        $scope.config = configService;
        $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;
        $scope.noofpics = 0;
        var piccount = 0;
        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };
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

        // Set title
        $('title').html('Explore' + PAGE_TITLE_SUFFIX);

        $scope.open_join_modal = function() {
            myAuth.updateUserinfo(myAuth.getUserAuthorisation());
            $scope.loggedindetails = myAuth.getUserNavlinks();
            if ($scope.loggedindetails) {
                window.location.href = '/myaccount/' + $scope.loggedindetails._id;
            } else {
                $('#myModal-join').modal('toggle');
            }
        }

        $scope.join_as_user = function(usertype) {
            myAuth.updateUserinfo(myAuth.getUserAuthorisation());
            $scope.loggedindetails = myAuth.getUserNavlinks();
            if ($scope.loggedindetails) {
                window.location.href = '/myaccount/' + $scope.loggedindetails._id;
            } else {
                window.location.href = '/signup/' + usertype;
            }
        }

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

        $scope.getexplorecontentbyid = function(obj) {
            $http({
                url: myAuth.baseurl + "explore/getcontentbyid/1",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.explorecms = data;
                }
            });
        }
        $scope.getexplorecontentbyid();

        $scope.listactivephotographer = function() {
            $http({
                url: myAuth.baseurl + "getallactivephotographer",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.users = data;
                }
            });
        }
        $scope.listactivephotographer();

        $scope.getnoofalbums = function() {
            $http({
                url: myAuth.baseurl + "album/getnoofalbums",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.noofalbums = data.allalbums;
                    data.allalbums.forEach(function(val, index) {
                        piccount += val.images.length;
                    });
                    $scope.noofpics = piccount;
                }
            });
        }
        $scope.getnoofalbums();

        $scope.getnoofgallery = function() {
            $http({
                url: myAuth.baseurl + "gallery/getnoofgallery",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.noofpics += data.allgallery.length;
                }
            });
        }
        $scope.getnoofgallery();

        $scope.getfeaturedphotographer = function() {
            $http({
                url: myAuth.baseurl + "getfeaturedphotographer",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.featuredphotographer = {};
                    $scope.featuredphotographer.usrid = data._id;
                    $scope.featuredphotographer.username = data.username;
                    $scope.featuredphotographer.firstname = data.firstname;
                    $scope.featuredphotographer.lastname = data.lastname;
                    $scope.featuredphotographer.image = data.profileimage;
                    $scope.featuredphotographer.backgroundimage = myAuth.cloudinary_image_base_path + '' + data.coverimage;
                }
            });
        }
        $scope.getfeaturedphotographer();

        $scope.getsignaturecollection = function() {
            $http({
                url: myAuth.baseurl + "gallery/getsignaturecollection",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.signaturecollections = data.allcollections[0];
                    $scope.signaturecollectionsbelow = data.allcollections[1];
                }
            });
        }
        $scope.getsignaturecollection();

        $scope.getallcollections = function() {
            $http({
                method: "GET",
                url: myAuth.baseurl + "gallery/getrandomcollection"
            }).success(function(data) {
                if (data.is_collection_exist == "0") {
                    $scope.nocollection = true;
                } else {
                    $scope.nocollection = false;
                }
                $scope.allcollections = data.allcollections;
            });
        }
        $scope.getallcollections();

        $scope.getcatalogs = function() {
            var othercatalogsarray = [];
            $http({
                method: "GET",
                url: myAuth.baseurl + "catalog/getexplorekeywords"
            }).success(function(data) {
                if (data.is_keyword_exist == "0") {
                    $scope.nokeyword = true;
                } else {
                    $scope.nokeyword = false;
                }
                if (data.allkeywords.length > 0) {
                    $scope.higlightkeyworddata = data.allkeywords[0];
                    $scope.higlightkeywordimage = myAuth.cloudinary_image_base_path + '' + $scope.higlightkeyworddata[$scope.higlightkeyworddata.length - 1].imageid;
                    $scope.higlightkeyword = $scope.higlightkeyworddata[0].keyword;
                    for (var i = 1; i < data.allkeywords.length; i++) {
                        othercatalogsarray.push(data.allkeywords[i]);
                    }
                    $scope.hidecatalogs = othercatalogsarray;
                }
            });
        }
        $scope.getcatalogs();
    }
})();
