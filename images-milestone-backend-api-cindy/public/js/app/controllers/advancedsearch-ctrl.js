(function() {

    angular.module("photographer").controller('advancesearchController', advancesearchController);

    function advancesearchController(configService, $scope, $http, $location, $routeParams, myAuth) {
        $scope.config = configService;
        $scope.albumdetls = {};
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.showDetails = function(galleryid, imageid) {
            $location.path("/details/" + galleryid + '/' + imageid);
        }
        $scope.advanced = '';

        // Set title
         $('title').html('Advanced Search' + PAGE_TITLE_SUFFIX);

        $scope.search = function() {
            var dataObj = {
                'keyword': $scope.advanced
            };

            $http({
                method: "POST",
                url: myAuth.baseurl + "catalog/searchkeywords",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                if (data.type == "error") {
                    $scope.searchimage = false;
                    $scope.searchnoofimages = 0;
                    $scope.searchtype = '';
                } else if (data.type == "success") {
                    if (data.msg.length == 0) {
                        $scope.searchimage = false;
                        $scope.searchnoofimages = 0;
                        $scope.searchtype = '';
                    } else {
                        $scope.searchimage = true;
                        $scope.searchnoofimages = data.msg.length;
                        $scope.searchresultimages = data.msg.map(function(photo) {
                            //console.log(photo);
                            var sizes = [200, 215, 230, 250, 265, 280, 295, 305, 315, 325];
                            var randomSize = Math.floor(Math.random() * 10);
                            photo.width = sizes[randomSize];
                            photo.height = 150;
                            photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.imageid + '.' + 'jpg';
                            return photo;
                        });
                        $scope.searchtype = '';
                    }
                }
            });
        }
        $scope.search();

        $scope.selectimage = function() {
            if ($scope.searchkey == "relevant") {
                //$scope.tempkeys = [];
                //if($scope.loggedindetails && $scope.loggedindetails.loginstatus)
                //{
                //    var userid = $scope.loggedindetails._id;
                //}
                //else
                //{
                //    var userid = '0';
                //}
                //var dataObj = {'userid':userid};
                // $http({
                //    method: "POST",
                //    url: myAuth.baseurl + "gallery/getkeywords",
                //    data: dataObj,
                //    headers: { 'Content-Type': 'application/json' }
                //  }).success(function(data){
                //        if(data)
                //        {
                //            angular.forEach(data.keywords,function(val,key){
                //                $scope.tempkeys.push( val._id);
                //            });
                //            var dataObj = {'keyword':$scope.tempkeys};
                //            $http({
                //               method: "POST",
                //               url: myAuth.baseurl + "catalog/searchinkeyword",
                //               headers: { 'Content-Type': 'application/json' }
                //             }).success(function(rdata){
                //                 var tempdata=[];
                //                 angular.forEach(rdata.msg,function(v,k){
                //                      angular.forEach($scope.tempkeys,function(tv,tk){
                //                         if(v.keyword.search(new RegExp(tv,'i'))!=-1)
                //                         {
                //                             tempdata.push(v);
                //                         }
                //                      });
                //                });
                //
                //                 var retdata=[];
                //                 if(tempdata.length>0)
                //                 {
                //                     retdata['type'] = 'success';
                //                     retdata['msg']  = tempdata;
                //                 }
                //                 else
                //                 {
                //                     retdata['type'] = 'error';
                //                     retdata['msg']  = [];
                //                 }
                //                 $scope.filtersearch(retdata);
                //            });
                //        }
                //
                //  });
            } else {
                var dataObj = {
                    'keyword': $scope.advanced
                };
                $http({
                    method: "POST",
                    url: myAuth.baseurl + "catalog/searchkeywords",
                    data: dataObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(data) {
                    $scope.filtersearch(data);
                });
            }
        }

        $scope.filtersearch = function(data) {
            if (data.type == "error") {
                $scope.searchimage = false;
                $scope.searchnoofimages = 0;
                $scope.searchkeyword = '';
                $scope.searchtype = '';
            } else if (data.type == "success") {

                if (data.msg.length == 0) {
                    $scope.searchimage = false;
                    $scope.searchnoofimages = 0;
                    $scope.searchtype = '';
                } else {
                    var filterimages = [];
                    if ($scope.searchtype == 'small') {
                        var width = 800;
                        var height = 600;
                        data.msg.forEach(function(imagedata, index) {
                            if ((parseInt(imagedata.width) < 800 && parseInt(imagedata.height) < 600) || parseInt(imagedata.width) < 600 && parseInt(imagedata.height) < 800) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else if ($scope.searchtype == 'medium') {
                        var width = 1600;
                        var height = 1200;
                        data.msg.forEach(function(imagedata, index) {
                            if ((parseInt(imagedata.width) >= 800 && parseInt(imagedata.width) < 1600) || (parseInt(imagedata.height) >= 600 && parseInt(imagedata.height) < 1200) || (parseInt(imagedata.height) >= 800 && parseInt(imagedata.height) < 1600) || (parseInt(imagedata.width) >= 600 && parseInt(imagedata.width) < 1200)) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else if ($scope.searchtype == 'large') {
                        var width = 2800;
                        var height = 2000;
                        data.msg.forEach(function(imagedata, index) {
                            if ((parseInt(imagedata.width) >= 1600 && parseInt(imagedata.height) >= 1200) || (parseInt(imagedata.width) >= 1200 && parseInt(imagedata.height) >= 1600)) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else if ($scope.searchtype == 'square') {
                        data.msg.forEach(function(imagedata, index) {
                            if (parseInt(imagedata.height) == parseInt(imagedata.width)) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else if ($scope.searchtype == 'portrait') {
                        data.msg.forEach(function(imagedata, index) {
                            if (parseInt(imagedata.height) > parseInt(imagedata.width)) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else if ($scope.searchtype == 'landscape') {
                        data.msg.forEach(function(imagedata, index) {
                            if (parseInt(imagedata.height) < parseInt(imagedata.width)) {
                                filterimages.push(imagedata);
                            }
                        });
                    } else {
                        filterimages = data.msg;
                    }


                    if ($scope.searchorder == 'recent') {
                        filterimages = filterimages.sort(function(a, b) {
                            return parseInt(b.date) - parseInt(a.date)
                        });
                    }

                    $scope.searchnoofimages = filterimages.length;
                    $scope.searchresultimages = filterimages.map(function(photo) {
                        //console.log(photo);
                        photo.width = photo.imagewidth;
                        photo.height = photo.imageheight;
                        photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.publicid + '.' + photo.fileExtension;
                        return photo;
                    });
                    if (filterimages.length == 0) {
                        $scope.searchimage = false;
                    } else {
                        $scope.searchimage = true;
                    }
                }
            }
        }

        $scope.$on("update_search_controller", function(event, data) {
            $scope.searchtype = '';
            if (data.result.type == "error") {
                $scope.searchimage = false;
                $scope.searchnoofimages = 0;
            } else if (data.result.type == "success") {
                if (data.result.msg.length == 0) {
                    $scope.searchimage = false;
                    $scope.searchnoofimages = 0;
                } else {
                    $scope.searchimage = true;
                    $scope.searchnoofimages = data.result.msg.length;
                    $scope.searchresultimages = data.result.msg.map(function(photo) {
                        //console.log(photo);
                        photo.width = photo.imagewidth;
                        photo.height = photo.imageheight;
                        photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.imageid + '.jpg';
                        return photo;
                    });
                }
            }
        });


        $scope.open_collectionmodal = function(galleryid, photopublicid) {
            if ($scope.loggedindetails) {
                $('#mymodal-addcollection').modal('toggle');
                $scope.albumdetls.collectiongalleryid = galleryid;
                $scope.albumdetls.photopublicid = photopublicid;
            } else {
                $('#myModal-login').modal('toggle');
            }
        }

        $scope.addtocollection = function(collectionid) {
            var dataobj = {
                'galleryid': $scope.albumdetls.collectiongalleryid,
                'userid': $scope.loggedindetails._id,
                'collectionid': collectionid,
                'photopublicid': $scope.albumdetls.photopublicid
            };
            $http({
                method: "POST",
                url: myAuth.baseurl + "gallery/addalbumtocollection",
                data: dataobj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                if (data.type == 'success') {
                    $scope.allcollections = {};

                    setTimeout(function() {
                        $scope.getallmycollections();
                    }, 500);

                }
            });
        }

        $scope.collectionsubmit = function() {
            var dataobj = {
                'galleryid': $scope.albumdetls.collectiongalleryid,
                'userid': $scope.loggedindetails._id,
                'collectionname': $scope.albumdetls.collectionname,
                'photopublicid': $scope.albumdetls.photopublicid
            };
            $http({
                method: "POST",
                url: myAuth.baseurl + "gallery/addalbumcollection",
                data: dataobj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                if (data.type == 'success') {
                    $scope.albumdetls.collectionname = '';
                    $scope.allcollections = {};
                    setTimeout(function() {
                        $scope.getallmycollections();
                    }, 500);
                }
            });
        }

        $scope.getallmycollections = function() {
            $http({
                method: "GET",
                url: myAuth.baseurl + "gallery/getcollections/" + $scope.loggedindetails._id
            }).success(function(data) {
                if (data.is_collection_exist == 0) {
                    $scope.showcollections = false;
                } else {
                    $scope.showcollections = true;
                }
                $scope.allcollections = data.allcollections;
            });
        }
        if ($scope.loggedindetails) {
            $scope.getallmycollections();
        }

    }
})();
