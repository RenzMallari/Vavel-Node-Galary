(function() {

    angular.module("photographer").controller('headerController', headerController);

    function headerController(configService, $scope, $rootScope, $http, $location, myAuth, $cookies, $cookieStore, Facebook, $window, $element, $routeParams, $sce, $anchorScroll) {

        $scope.config = configService;
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.cloudinary_cloud_name = myAuth.cloudinary_cloud_name;
        $scope.cloudinary_upload_preset = myAuth.cloudinary_upload_preset;
        $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;

        $scope.showFilter = false;
        myAuth.updateUserinfo(myAuth.getUserAuthorisation());
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.$on("update_parent_controller", function(event, message) {
            $scope.loggedindetails = message;
        });

        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        $scope.$watchCollection('$stateParams', function($location, $anchorScroll, $scope, $stateParams) {
        $window.scrollTo(0, 0);
        });

        $scope.getsettingsbyid = function(obj) {
            $http({
                url: myAuth.baseurl + "settings/getsettingsbyid/1",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.settingsheader = data;
                }
            });
        }
        $scope.getsettingsbyid();

        $scope.checkUser = function() {
            if ($scope.loggedindetails) {
                $scope.submissionSuccess = true;
                $scope.showMyaccount = true;
                if ($scope.loggedindetails.usertype == "3") {
                    $scope.showMyalbum = true;
                } else {
                    $scope.showMyalbum = false;
                }
            } else {
                $scope.submissionSuccess = false;
                $scope.showMyaccount = false;
                $scope.showMyalbum = false;
            }
        }
        $scope.$root.cartcount = 0;
        $scope.getcartInfo = function() {
            // alert($scope.loggedindetails._id);
            $scope.$root.cartcount = 0;
            if ($scope.loggedindetails) {
                $http({
                    method: "GET",
                    url: myAuth.baseurl + "album/getcountcart/" + $scope.loggedindetails._id
                }).success(function(data) {
                    if (data.type == 'success') {
                        $scope.$root.cartcount = data.cartcount;
                    } else {
                        $scope.$root.cartcount = 0;
                    }
                });

            } else {
                $scope.$root.cartcount = 0;
            }
        }
        $scope.getcartInfo();
        $scope.$on('reloadCart', function(event, data) {
            $scope.getcartInfo();
        });


        $scope.gotoSignup = function(usertype) {
            $('#myModal-join').modal('toggle');
            $location.path("/signup/" + usertype);
        }

        $scope.getClass = function(path) {
            if ($location.path().substr(0, path.length) == path) {
                val = "active";
                if (path == '/myaccount' || path == '/mycollection' || path == '/settings') {
                    val = "active";
                }
            } else {
                val = "";
            }
            return val;
        }


        if ($scope.loggedindetails) {
            if ($scope.loggedindetails.usertype == "3") {
                $scope.showMyalbum = true;
            }
            $scope.submissionSuccess = true;
            $scope.getgallery = function() {
                $http({
                    method: "GET",
                    url: myAuth.baseurl + "gallery/getgalleryimagebyuserid/" + $scope.loggedindetails._id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data) {
                    var noofphotos = data.msg.length;
                    if (noofphotos > 0) {
                        $scope.showMyaccount = false;
                    } else {

                        $scope.getallmyalbums();
                    }
                });
            }
            $scope.getallmyalbums = function() {
                $http({
                    method: "GET",
                    url: myAuth.baseurl + "album/getalbums/" + $scope.loggedindetails._id
                }).success(function(dataalbum) {
                    if (dataalbum.is_album_exist == 0) {
                        $scope.showMyaccount = true;
                    } else {
                        $scope.showMyaccount = false;
                    }
                });
            }
            $scope.getgallery();
        } else {
            $scope.submissionSuccess = false;
        }

        $scope.fblogin = function() {
            Facebook.login(function(response) {
                $scope.fbme();
            });
        }

        $scope.getFbLoginStatus = function() {
            Facebook.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    $scope.loggedIn = true;
                } else {
                    $scope.loggedIn = false;
                }
            });
        }

        $scope.fbme = function() {
            Facebook.api('/me', function(response) {
                $scope.user = response;
                var data = {
                    'firstname': response.first_name,
                    'middlename': response.middle_name,
                    'lastname': response.last_name,
                    'facebookid': response.id,
                }
                $http({
                    method: "POST",
                    data: data,
                    url: myAuth.baseurl + "facebooksignuplogin",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(data) {
                    if (data.type == "error") {
                        $scope.submissionError = true;
                        $scope.alert = myAuth.addAlert('danger', 'Invalid facebook login !');
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.submissionError = false;
                            });
                            $scope.ishide = false;
                        }, 3000);
                    } else {
                        $scope.user = {};
                        $cookieStore.put('users', data.msg);
                        if (data.msg.roleid == 3) {
                            $scope.showMyalbum = true;
                        } else {
                            $scope.showMyalbum = false;
                        }
                        $scope.loginSuccess = true;
                        $scope.alert = myAuth.addAlert('success', 'You have successfully logged in!');
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $http({
                                    method: "GET",
                                    url: myAuth.baseurl + "gallery/getgalleryimagebyuserid/" + data.msg._id,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }).success(function(data) {
                                    var noofphotos = data.msg.length;
                                    if (noofphotos > 0) {
                                        $scope.showMyaccount = false;
                                    } else {

                                        $http({
                                            method: "GET",
                                            url: myAuth.baseurl + "album/getalbums/" + data.msg._id,
                                            headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            }
                                        }).success(function(dataalbum) {
                                            if (dataalbum.is_album_exist == 0) {
                                                $scope.showMyaccount = true;
                                            } else {
                                                $scope.showMyaccount = false;
                                            }
                                        });
                                    }
                                });

                                $scope.loginSuccess = false;
                                $('#myModal-login').modal('toggle');
                                $scope.submissionSuccess = true;
                                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                                $scope.loggedindetails = myAuth.getUserNavlinks();
                                $location.path("/settings");
                            });
                        }, 3000);
                    }

                });

            });
        }

        $scope.forgotpassword = function() {
            var data = {
                'email': $scope.user.email
            }
            $http({
                method: "POST",
                data: data,
                url: myAuth.baseurl + "forgotpassword",
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                if (data.type == "error") {
                    $scope.submissionError = true;
                    $scope.alert = myAuth.addAlert('danger', data.msg);
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.submissionError = false;
                        });
                        $scope.ishide = false;
                    }, 3000);
                } else {
                    $scope.user = {};
                    $cookieStore.put('users', data);
                    $scope.forgetpasswordsuccess = true;
                    $scope.alert = myAuth.addAlert('success', data.msg);
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.forgetpasswordsuccess = false;
                            $('#myModal-forgotpass').modal('hide');
                        });
                    }, 2000);
                }

            });
        }





        $scope.login = function() {
            var pathname = window.location.pathname;
            var url = window.location.href;

            $scope.alert = {};
            $http({
                method: "POST",
                url: myAuth.baseurl + "userlogin",
                data: $.param($scope.user),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data.error) {
                    $scope.submissionError = true;
                    $scope.alert = myAuth.addAlert('danger', 'Invalid email/password !');
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.submissionError = false;
                        });
                        $scope.ishide = false;
                    }, 3000);
                } else {
                    $cookieStore.put('users', data);
                    $cookieStore.put('currency', data.currency || 'USD');
                    $scope.loginSuccess = true;
                    $scope.alert = myAuth.addAlert('success', 'You have successfully logged in!');
                    //setTimeout(function () {
                    //    myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                    //    $scope.loggedindetails= myAuth.getUserNavlinks();
                    window.location.href = url;
                    window.location.reload();
                    //}, 1000);
                }
            });
        }


        $scope.logout = function() {
            $cookieStore.put('users', null);
            $scope.loggedindetails = null;
            $scope.submissionSuccess = false;
            window.location.href = '/explore';
            window.location.reload();
        }

        $scope.redirect = function(pageslug) {
            window.location.href = '/' + pageslug;
            window.location.reload();
        }

        $scope.redirectwithid = function(pageslug, id) {
            window.location.href = '/' + pageslug + '/' + id;
            window.location.reload();
        }


        $scope.getcontentbyid = function(obj) {
            $http({
                url: myAuth.baseurl + "joinus/getcontentbyid/1",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data) {
                if (data) {
                    $scope.joinus = data;
                }
            });
        }
        $scope.getcontentbyid();

        $scope.searchTrending = function(keyword) {
            var dataObj = {
                'keyword': keyword
            };
            var addkeyword = false;

            $('title').html(keyword + ' - Search' + PAGE_TITLE_SUFFIX);

            $http({
                method: "POST",
                url: myAuth.baseurl + "album/searchkeywords_new",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                addkeyword = true;
                $http({
                    method: "POST",
                    url: myAuth.baseurl + "catalog/searchkeywords_new",
                    data: dataObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(dataimage) {
                    addkeyword = true;
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "album/searchkeywordsuser_new",
                        data: dataObj,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(userimage) {
                        addkeyword = true;
                        $http({
                            method: "POST",
                            url: myAuth.baseurl + "album/searchcollections_new",
                            data: dataObj,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(usercollections) {
                            addkeyword = true;

                            if (usercollections.type == 'success') {
                                $scope.usercollections = usercollections.collections;
                                $scope.collectionexist = true;
                            } else {
                                $scope.usercollections = null;
                                $scope.collectionexist = false;
                            }


                        });


                        if (userimage.type == 'success') {
                            $scope.alluserfind = userimage.userimage;
                            $scope.userexist = true;
                        } else {
                            $scope.alluserfind = null;
                            $scope.userexist = false;
                        }


                    });

                    if (dataimage.type == 'success') {
                        $scope.allkeywords = dataimage.albumkeywords;
                        $scope.nokeyword = true;
                    } else {
                        $scope.allkeywords = null;
                        $scope.nokeyword = false;
                    }
                });
                if (data.type == 'success') {
                    $scope.search_album = data.album;
                    $scope.search_album_exist = true;
                } else {
                    $scope.search_album_exist = false;
                    $scope.search_album = null;
                }
                window.location.href = '/search';

            });

        }

        $scope.searchimage = function() {
            var dataObj = {
                'keyword': $scope.searchkeyword
            };

            $('title').html($scope.searchkeyword + ' - Search' + PAGE_TITLE_SUFFIX);

            $http({
                method: "POST",
                url: myAuth.baseurl + "album/searchkeywords",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                if (data.msg == 1) {
                    if ($scope.loggedindetails && $scope.loggedindetails.loginstatus) {
                        var userid = $scope.loggedindetails._id;
                    } else {
                        var userid = '0';
                    }
                    var newdata = {
                        'userid': userid,
                        'keyword': $scope.searchkeyword
                    };
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "gallery/addkeywords",
                        data: newdata,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(getaddresponse) {

                    });
                    setTimeout(function() {
                        window.location.href = '/mainalbumdetails/' + data.albumid;
                    }, 2000);
                } else {
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "searchkeywords",
                        data: dataObj,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(datauser) {
                        if (datauser.msg == 1) {
                            window.location.href = '/myaccount/' + datauser.userid;
                        } else {
                            $http({
                                method: "POST",
                                url: myAuth.baseurl + "catalog/searchkeywords",
                                data: dataObj,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).success(function(dataimage) {
                                /**************Add to relevant***************/
                                if ($scope.loggedindetails && $scope.loggedindetails.loginstatus) {
                                    var userid = $scope.loggedindetails._id;
                                } else {
                                    var userid = '0';
                                }
                                if (dataimage.type == "success") {
                                    if (dataimage.msg.length > 0) {
                                        var newdata = {
                                            'userid': userid,
                                            'keyword': $scope.searchkeyword
                                        };
                                        $http({
                                            method: "POST",
                                            url: myAuth.baseurl + "gallery/addkeywords",
                                            data: newdata,
                                            headers: {
                                                'Content-Type': 'application/json'
                                            }
                                        }).success(function(getaddresponse) {

                                        });
                                    }
                                }
                                $scope.$broadcast('update_search_controller', {
                                    result: dataimage
                                });
                                window.location.href = '/search';
                            });
                        }
                    });
                }
            });
        }


        $scope.searchimage_autoload = function() {
            var keyvalue = $("#search_key").val().trim();
            if (keyvalue == '') {
                $('#loadsearch').hide();
                return false;
            }
            var dataObj = {
                'keyword': keyvalue
            };
            var loaddata = '';
            $('#loadsearch').show();
         //   $('#loadsearch').html('<img src="/img/loaddingg.gif" style="width:100%">');
            $http({
                method: "POST",
                url: myAuth.baseurl + "catalog/searchkeywords_load",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(datacatelog) { 
                if (datacatelog.msg) {
                    //var names = ["Mike","Matt","Nancy","Adam","Jenny","Nancy","Carl"];
                    var uniqueNames = [];
                    $.each(datacatelog.albumkeywords, function(i, el) {
                        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                    });
                    loaddata += '<div class="autocomplete-bg"><h3 class="autocomplete-title">Keywords</h3>';
                    for (var i = 0; i < uniqueNames.length; i++) {

                        loaddata += '<div><hr style="height: 1px;padding: 0;margin: 5px 0; border-bottom: 1px solid #CCC;""><a href="/catalogdetails/'+uniqueNames[i]+'"  onclick="$(\'#loadsearch\').toggle()"><h3 class="grey-bold">'+uniqueNames[i]+'</h3></a></div>';
                    }
                    loaddata += '</div>';
                }
                $http({
                    method: "POST",
                    url: myAuth.baseurl + "album/searchkeywords_album_load",
                    data: dataObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(dataalbum) {
                    if (dataalbum.msg) {
                        loaddata += '<div class="autocomplete-bg"><h3 class="autocomplete-title">Albums</h3>';
                        for (var i = 0; i < dataalbum.albums.length; i++) {
                            var mix_array = dataalbum.albums[i].split('_');
                            loaddata += '<div><hr style="height: 1px;padding: 0;margin: 5px 0; border-bottom: 1px solid #CCC;""><a href="/mainalbumdetails/'+mix_array[1]+'" onclick="$(\'#loadsearch\').toggle()"><h3 class="grey-bold">'+mix_array[0]+'</h3></a></div>';
                             }
                        loaddata += '</div>';
                    }
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "album/searchkeywordsuser_load",
                        data: dataObj,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(datauser) {
                        if (datauser.msg) {
                            loaddata += '<div class="autocomplete-bg"><h3 class="autocomplete-title">Users</h3>';
                                for( var i = 0; i < datauser.user.length; i++ ) {
                                    var mix_array =  datauser.user[i].split('_');
                                    loaddata += '<div><hr style="height: 1px;padding: 0;margin: 5px 0;"><a href="/myaccount/'+mix_array[1]+'" onclick="$(\'#loadsearch\').toggle()"><h3 class="grey-bold">'+mix_array[0]+'</h3></a></div>';
                                }
                            loaddata += '</div>';
                        }
                        $http({
                            method: "POST",
                            url: myAuth.baseurl + "album/searchkeywords_collections_load",
                            data: dataObj,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(data) {
                            if (data.msg) {
                                 loaddata += '<div class="autocomplete-bg"><h3 class="autocomplete-title">Collections</h3>';
                                 for (var i = 0; i < data.collections.length; i++) {
                                    var mix_array = data.collections[i].split('_');
                                    loaddata += '<div><hr style="height: 1px;padding: 0;margin: 5px 0;"><a href="/maincollectiondetails/'+mix_array[1]+'" onclick="$(\'#loadsearch\').toggle()"><h3 style="color: #fff;">'+mix_array[0]+'</h3></a></div>';
                                    }
                                loaddata += '</div>';
                            }

                            $('#loadsearch').show();
                            $('#loadsearch').html(loaddata);
                        });

                    });
                });
            });
        }

        $scope.searchimage_new = function() {
            console.log('searchimage_new')
            if (!~$location.path().indexOf('/search')) {
                window.location.href = '/#/search/' + $scope.searchkeyword;
            }

            $scope.searchkeyword = $scope.searchkeyword || $routeParams.keyword;

            $('title').html($scope.searchkeyword + ' - Search' + PAGE_TITLE_SUFFIX);

            var dataObj = {
                'keyword': $scope.searchkeyword
            };
            var addkeyword = false;
            $scope.showFilter = true;
            // setTimeout(function () {
            //     $scope.$apply(function(){
            //         $scope.showFilter = true;
            //     });
            // }, 100);
            $http({
                method: "POST",
                url: myAuth.baseurl + "album/searchkeywords_new",
                data: dataObj,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data) {
                addkeyword = true;

                $http({
                    method: "POST",
                    url: myAuth.baseurl + "catalog/searchkeywords_new",
                    data: dataObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(dataimage) {
                    addkeyword = true;
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "album/searchkeywordsuser_new",
                        data: dataObj,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(userimage) {
                        addkeyword = true;
                        $http({
                            method: "POST",
                            url: myAuth.baseurl + "album/searchcollections_new",
                            data: dataObj,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(usercollections) {
                            addkeyword = true;
                            console.log('usercollections.collections', usercollections.collections)
                            if (usercollections.type == 'success') {
                                $scope.usercollections = usercollections.collections;
                                $scope.collectionexist = true;
                            } else {
                                $scope.usercollections = null;
                                $scope.collectionexist = false;
                            }


                        });

                        console.log('userimage.userimage', userimage.userimage)

                        if (userimage.type == 'success') {
                            $scope.alluserfind = userimage.userimage;
                            $scope.userexist = true;
                        } else {
                            $scope.alluserfind = null;
                            $scope.userexist = false;
                        }


                    });

                    console.log('dataimage.albumkeywords', dataimage.albumkeywords)
                    if (dataimage.type == 'success') {
                        $scope.allkeywords = dataimage.albumkeywords;
                        $scope.nokeyword = true;
                    } else {
                        $scope.allkeywords = null;
                        $scope.nokeyword = false;
                    }
                });

                console.log('data.album', data.album)
                if (data.type == 'success') {
                    $scope.search_album = data.album;
                    $scope.search_album_exist = true;
                } else {
                    $scope.search_album_exist = false;
                    $scope.search_album = null;
                }

                if (addkeyword == true) {

                    if ($scope.loggedindetails && $scope.loggedindetails.loginstatus) {
                        var userid = $scope.loggedindetails._id;
                    } else {
                        var userid = '0';
                    }

                    var newdata = {
                        'userid': userid,
                        'keyword': $scope.searchkeyword
                    };
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "gallery/addkeywords",
                        data: newdata,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(getaddresponse) {

                        // window.location.href = '/search';
                    });
                }
            });
        }

        $scope.navSingleImgUp = function() {
            $('#myModal-upload').modal('toggle');
            $('#myModal-fileupload').modal('toggle');
        }

        if ($scope.loggedindetails) {
            $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
            if ($scope.isUserLoggedIn) {
                $scope.loggedindetails = myAuth.getUserNavlinks();

                $scope.myalbum = myAuth.getUserNavlinks();
                $scope.myalbum.albumpublicid = '';
                $scope.myalbum.albumwidthheight = '';
                $scope.myalbum.albumimageurls = '';
                $scope.myalbum.keyword = '';
                $scope.myalbum.price = '';
                $scope.myalbum.albumname = '';
                $scope.total_selectedfile = 0;
                $scope.total_uploadedfile = 0;


            }
        }
        $scope.albumsubmit = function() {
            $scope.total_uploadedfile = 0;
            $scope.total_selectedfile = 0;
            $scope.myalbum.albumpublicid = $('#publicid').val();
            $scope.myalbum.albumwidthheight = $('#imageheightwidth').val();
            $scope.myalbum.albumimageurls = $('#imageurls').val();

            $scope.myalbum._id = $scope.loggedindetails._id;

            $scope.myalbum.watermark1 = ($scope.loggedindetails.watermark1 != '') ? $scope.loggedindetails.watermark1 : '';
            $scope.myalbum.watermark2 = ($scope.loggedindetails.watermark2 != '') ? $scope.loggedindetails.watermark2 : '';

            $scope.albumError = true;
            $scope.alert = myAuth.addAlert('success', 'Please wait. Uploading...');
            if (
                $scope.myalbum.price == '' || $scope.myalbum.albumname == '') {
                $scope.albumError = true;
                $scope.alert = myAuth.addAlert('danger', 'Please enter all the fields!');
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.albumError = false;
                    });
                }, 3000);
            } else {

                $('#submtbtn_layout').prop('disabled', false);
                $http({
                    method: "POST",
                    url: myAuth.baseurl + "album/addalbum",
                    data: $scope.myalbum,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(data) {
                    if (data.type == "error") {
                        $scope.albumError = true;
                        $scope.alert = myAuth.addAlert('danger', data.msg);
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.albumError = false;
                                $('#submtbtn_layout').prop('disabled', false);
                            });
                        }, 3000);
                    } else {

                        $scope.myalbum.album_id = data.album_id;
                        $http({
                            method: "POST",
                            url: myAuth.baseurl + "album/addalbumtags",
                            data: $scope.myalbum,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).success(function(data1) {

                            $scope.myalbum.albumpublicid = '';
                            $scope.myalbum.albumwidthheight = '';
                            $scope.myalbum.albumimageurls = '';
                            $scope.myalbum.keyword = '';
                            $scope.myalbum.price = '';
                            $scope.myalbum.albumname = '';
                            $scope.myalbum.albumwidthheight = '';
                            $scope.albumError = true;
                            $scope.alert = myAuth.addAlert('success', 'Your album added successfully');
                            setTimeout(function() {
                                $scope.$apply(function() {
                                    $scope.albumError = false;
                                    $('#publicid').val('');
                                    $('#imageheightwidth').val('');
                                    $('#imageurls').val('')
                                    $('.dz-message').show();
                                    $('.dz-preview').remove();
                                    $('#submtbtn_layout').prop('disabled', false);
                                    $('#myModal-drag').modal('toggle');
                                    window.location.href = '/myalbums';
                                    window.location.reload();
                                });
                            }, 3000);

                        });



                    }
                });
            }
        }

        $scope.navaddalbum = function() {
            $('#myModal-upload').modal('toggle');
            $('#myModal-drag').modal('toggle');
            $('#submtbtn_layout').prop('disabled', false);
        }

        $scope.dropzoneConfig = {
            'options': {
                'url': '/api/album/uploader/56cdc43f337e037129f52a00'
            },
            'eventHandlers': {
                'sending': function(file, formData, xhr) {
                    $('.dz-message').hide();
                    $scope.total_selectedfile++;
                },
                'success': function(file, response) {}
            }
        };

        $scope.widget = $(".cloudinary_galleryupload")
            .unsigned_cloudinary_upload(myAuth.cloudinary_upload_preset, {
                tags: 'mygalleryphoto',
                context: 'photo='
            }, {
                dropZone: "#direct_upload",
                start: function(e) {
                    $scope.status = "Starting upload...";
                    $scope.$apply();
                },
                fail: function(e, data) {
                    $scope.status = "Upload failed";
                    $scope.$apply();
                }
            })
            .on("cloudinaryprogressall", function(e, data) {
                $scope.gallerySuccess = true;
                $scope.progress = Math.round((data.loaded * 100.0) / data.total);
                $scope.status = "Uploading... " + $scope.progress + "%";
                $scope.$apply();
            })
            .on("cloudinarydone", function(e, data) {
                $scope.gallerySuccess = false;
                $scope.status = "Image uploaded successfully";

                var editoriallicense = $('#editoriallicense').val();
                var commerciallicense = $('#commerciallicense').val();
                var albumaddress = $('#albumaddress').val();

                var dataObj = {
                    public_id: data.result.public_id,
                    height: data.result.height,
                    width: data.result.width,
                    userid: $scope.loggedindetails._id,
                    url: data.result.url,
                    editoriallicense: editoriallicense,
                    commerciallicense: commerciallicense,
                    albumaddress: albumaddress

                };

                $http({
                    method: "POST",
                    url: myAuth.baseurl + "gallery/uploadgalleryimage",
                    data: dataObj,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).success(function(data) {
                    $('#myModal-fileupload').modal('toggle');
                    if (data.type == "error") {

                    } else {
                        setTimeout(function() {
                            window.location.href = '/myaccount/' + $scope.loggedindetails._id;
                        }, 500);
                    }
                });
            });

    }
})();

