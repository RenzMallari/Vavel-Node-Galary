(function() {

    angular.module("photographer").controller('headerController', headerController);

    function headerController(configService, localService, $scope, $rootScope, $http, $location, myAuth, $cookies, $cookieStore, Facebook, $window, $element, $routeParams, $sce, $anchorScroll, constSetting) {

        $scope.config = configService;
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.cloudinary_cloud_name = myAuth.cloudinary_cloud_name;
        $scope.cloudinary_upload_preset = myAuth.cloudinary_upload_preset;
        $scope.cloudinary_image_base_path = myAuth.cloudinary_image_base_path;
        $scope.routeParams = $routeParams;
        $scope.pagination = {};
        $scope.pagination.curPage = $routeParams.page ?  Number($routeParams.page) - 1 : 0;
        $scope.pagination.pageSize = 50;
        if($scope.pagination.curPage) $scope.pagination.numberOfPages = 1;
        else $scope.pagination.numberOfPages = 0;
        
        $scope.pagination.pageSizeList = [20, 30, 50, 75, 100];
        
        myAuth.updateUserinfo(myAuth.getUserAuthorisation());
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.$on("update_parent_controller", function(event, message) {
            $scope.loggedindetails = message;
        });

        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };
        
        // $scope.$watchCollection('$stateParams', function() {
        //     $location.hash('top');
        //     $anchorScroll();
        // });

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
        $scope.$root.updatingCart = false;
        $scope.getcartInfo = function() {
            $scope.$root.cartcount = 0;
            const id = $scope.loggedindetails ? $scope.loggedindetails._id : localService.createLocalUser()._id;
            if (id) {
                $http({
                    method: "GET",
                    url: myAuth.baseurl + "album/getcountcart/" + id
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

        $scope.addClass = function(path) {
            var pathnext = '/myaccount';
            if ($location.path().substr(0, path.length) == '/explore' || $location.path().substr(0, pathnext.length) == '/myaccount') {
                return "navbar-transparent";
            } else {
                return "";
            }
        }

        var lastscroll = 0;

        angular.element($window).bind("scroll", function(e) {
            var path = '/explore';
            var pathnext = '/myaccount';
            if ($location.path().substr(0, path.length) == '/explore' || $location.path().substr(0, pathnext.length) == '/myaccount') {
                if ($window.pageYOffset > lastscroll) {
                    $element.find('#header-menu').removeClass("navbar-transparent");
                } else {
                    if ($window.pageYOffset == 0) {
                        $element.find('#header-menu').addClass("navbar-transparent");
                    } else {
                        $element.find('#header-menu').removeClass("navbar-transparent");
                    }
                }
                lastscroll = $window.pageYOffset;
            }
        });

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

        //Add by playerthong@gmail.com 6/July/2019
        $scope.loginFacebook = function() {
            var url = window.location.href;
            Facebook.login(function(response) {
                if (response.status == 'connected') {
                    $http({
                        method: "POST",
                        url: myAuth.baseurl + "fblogin",
                        data: response.authResponse,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).success(function(data) {
                        if (data.error) {
                            $scope.submissionError = true;
                            $scope.alert = myAuth.addAlert('danger', 'Can not login via Facebook');
                            setTimeout(function() {
                                $scope.$apply(function() {
                                    $scope.submissionError = false;
                                });
                                $scope.ishide = false;
                            }, 3000);
                        }else{
                            $cookieStore.put('users', data);
                            $cookieStore.put('currency', data.currency || 'USD');
                            $scope.loginSuccess = true;
                            $scope.alert = myAuth.addAlert('success', 'You have successfully logged in!');
                            //setTimeout(function () {
                            //    myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                            //    $scope.loggedindetails= myAuth.getUserNavlinks();
                            window.location.href = url;
                            window.location.reload();
                        }
                    });
                } else {
                    $scope.submissionError = true;
                    $scope.alert = myAuth.addAlert('danger', 'Can not login Facebook');
                    setTimeout(function() {
                        $scope.$apply(function() {
                            $scope.submissionError = false;
                        });
                        $scope.ishide = false;
                    }, 3000);
                }
              });

        }

        $scope.getProfileFacebook = function() {
            Facebook.api('/me', function(response) {
                console.log("Get Profile",response);


            });

        }


        $scope.logout = function() {
            $cookieStore.put('users', null);
            $scope.loggedindetails = null;
            $scope.submissionSuccess = false;
            localService.destroy();
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


                        if (userimage.type == 'success' && userimage.userimage && userimage.userimage.length) {
                            $scope.alluserfind = userimage.userimage;
                            $scope.userexist = true;
                        } else {
                            $scope.alluserfind = null;
                            $scope.userexist = false;
                        }


                    });

                    if (dataimage.type == 'success' && dataimage.albumkeywords && dataimage.albumkeywords.length) {
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

        $(document).on('click', function(e) {   
            if (e.target.id != 'search_key') {
                $("#loadsearch").hide();
            }
        });

        $(document).on('click', '#myNavbar a:not(.icon-nav-item)', function (e) {
            var $toggle = $('.navbar-toggle');

            if ($toggle.is(':visible')) {
                $toggle.click();
            }
        });

        function ifKeywordExists(array, keyword) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].keyword === keyword) return true;
            }
            return false;
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
                    var uniqueElements = [];
                    $.each(datacatelog.albumkeywords, function(i, el) {
                        if (!ifKeywordExists(uniqueElements, el.keyword)) uniqueElements.push(el);
                    });
                    loaddata += '<div class="autocomplete-bg"><h3 class="autocomplete-title">KeyWords</h3>';
                    for (var i = 0; i < uniqueElements.length; i++) {

                        loaddata += 
`<div>
    <hr style="height:1px;padding:0;margin:5px 0;border-bottom: 1px solid #CCC;">
    <a href="/catalogdetails/${uniqueElements[i].keyword}" onclick="$('#loadsearch').toggle()" style="display:flex;justify-content:space-between;align-items:center;">
        <h3 class="grey-bold">${uniqueElements[i].keyword}</h3>
        ${uniqueElements[i].logo ?
            `<img src="${$scope.config.ftpFullPath}${uniqueElements[i].logo}" alt="${uniqueElements[i].keyword}-logo" style="height:35px;margin-left:5px;border-radius:50%;">`
            :
            ''
        }
    </a>
</div>`;
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
                            loaddata += '<div><hr style="height: 1px;padding: 0;margin: 3px 0;"><a href="/mainalbumdetails/'+mix_array[1]+'" onclick="$(\'#loadsearch\').toggle()"><h3 class="grey-bold">'+mix_array[0]+'</h3></a></div>';
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
                                    const item =  datauser.user[i];
                                    loaddata += 
`<div><hr style="height: 1px;padding: 0;margin: 5px 0;">
    <a href="/myaccount/${item.id}" onclick="$('#loadsearch').toggle()" style="display:flex;justify-content:space-between;align-items:center;">
        <h3 class="grey-bold">${item.name}</h3>
        <img src="${$scope.config.ftpAvatarPath}${item.image}" alt="${item.name}-avatar" style="height:35px;margin-left:5px;border-radius:50%;">
    </a>
</div>`;
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

        $scope.page404 = false;
        $scope.searchimage_new = function() {
            if($routeParams.page && Number($routeParams.page) && ($scope.searchkeyword || $routeParams.keyword)) {
                // $scope.page404 = false;
            } else {
                setTimeout(function() {
                    $scope.$apply(function() {
                        $scope.page404 = true
                    })
                }, 1000)
            }
            if (!~$location.path().indexOf('/search')) {
                window.location.href = '/search/' + $scope.searchkeyword + '/1';
            }
            
            let page = $routeParams.page ?  Number($routeParams.page) - 1 : 0;
            
            $scope.pagination.curPage = page;
            
            let begin = ($scope.pagination.curPage * $scope.pagination.pageSize)
                , end = begin + $scope.pagination.pageSize;

            $scope.searchkeyword = $scope.searchkeyword || $routeParams.keyword;
            $('title').html($scope.searchkeyword + ' - Search' + PAGE_TITLE_SUFFIX);

            var dataObj = {
                'keyword': $scope.searchkeyword
            };
            var addkeyword = false;
            $scope.search_allalbumimage = [];
            let urlParams = new URLSearchParams(window.location.search);
            let search = {}
            if (urlParams.has('country')) search.country = urlParams.get('country').toLowerCase();
            if (urlParams.has('city')) search.city = urlParams.get('city').toLowerCase();
            if (urlParams.has('size')) search.size = urlParams.get('size').toLowerCase();
            if (urlParams.has('time')) search.time = urlParams.get('time').toLowerCase();
            if(search.time && search.time==='custom-range' && urlParams.get('from') && urlParams.get('to')) {
                search.from = new Date(urlParams.get('from')).getTime();
                search.to = new Date(urlParams.get('to')).getTime();
            }
            if (urlParams.has('tag')) search.tag = urlParams.get('tag');
            if (urlParams.has('lat')) search.lat = Number(urlParams.get('lat'));
            if (urlParams.has('lng')) search.lng = Number(urlParams.get('lng'));

            let from, to = new Date().getTime();
            
            if (search.time) {
                let filterController = angular.element('#filter-controller').scope()
                let listFilterTime = filterController.listTime;
                let time = listFilterTime.find(e => e.value === search.time);
                if(time && !time.seconds){
                    console.log('get any-time')
                }
                else {
                   
                    if(!time && search.time==='custom-range' && search.from && search.to) {
                        to = search.to;
                        from = search.from
                    }
                    else if(time){
                        to = to;
                        from = to - Number(time.seconds)*1000
                    }
                }
            }


            let country = search.country;
            let city = search.city;

            if(country) {
                country = country.toLowerCase()
                let find = constSetting.list_countries.find(function (e) {
                    if (e.name.toLowerCase() === country || e.alpha3code.toLowerCase() === country || e.alpha2code.toLowerCase() === country) {
                        return e
                    }
                })
                country = find ? Object.values(find).map(i => i.toLowerCase()) : []
            }
            else {
                country = []
            }
            
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

                            // console.log('usercollections.collections copy', usercollections.collections)
                            if (usercollections.type == 'success' && !city && !country) {
                                $scope.usercollections = usercollections.collections;
                                // $scope.usercollections_backup = usercollections.collections;
                                if(page === 0) {
                                    $scope.collectionexist = true;
                                }
                                else {
                                    $scope.collectionexist = false;
                                }
                            } else {
                                $scope.usercollections = null;
                                $scope.collectionexist = false;
                            }


                        });


                        // console.log('userimage.userimage copy', userimage.userimage)
                        if(userimage.type == 'success') {
                            if(search.time && from && to) {
                                userimage.userimage = userimage.userimage.filter(e => {
                                    e.createdate = new Date(e.createdate).getTime()
                                    if(e.createdate > from && e.createdate <= to) {
                                        return e
                                    }
                                })
                                
                            }
                            
                            if(country.length && userimage.userimage) {
                                userimage.userimage = userimage.userimage.filter(e => {
                                    if(e.country && country.find(i => i === e.country)) {
                                        return e
                                    }
                                })
                            }
                            if(city && userimage.userimage) {
                                userimage.userimage = userimage.userimage.filter(e => e.city === city)
                            }
                            
                        }

                        if (userimage.type == 'success' && userimage.userimage.length) {
                            $scope.alluserfind = userimage.userimage;
                            if(page === 0) {
                                $scope.userexist = true;
                            }
                            else {
                                $scope.userexist = false;
                            }
                        } else {
                            $scope.alluserfind = null;
                            $scope.userexist = false;
                        }


                    });


                    // console.log('dataimage.albumkeywords copy', dataimage.albumkeywords)
                    if (dataimage.type == 'success') {

                        if(search.time && from && to) {
                            Object.keys(dataimage.albumkeywords).forEach(key => {
                                dataimage.albumkeywords[key] = dataimage.albumkeywords[key].filter(e => {
                                    if(e.date > from && e.date <= to) {
                                        return e
                                    }
                                })
                                
                            })
                        }
                        if(!city && !country.length) {
                            Object.values(dataimage.albumkeywords).forEach(images => {
                                $scope.search_allalbumimage = $scope.search_allalbumimage.concat(images.filter(e => {
                                    e.publicid = e.imageid;
                                    e.url = $scope.cloudinary_image_base_path + $scope.config.crop200 + e.publicid + '.' + (e.fileExtension || 'jpg')
                                    return e;
                                }))
                            })

                            $scope.search_albumimage = $scope.search_allalbumimage.slice(begin, end);
                            $scope.pagination.numberOfPages = Math.ceil($scope.search_allalbumimage.length / $scope.pagination.pageSize);
                            $scope.allkeywords = dataimage.albumkeywords;
                            if($scope.search_allalbumimage && $scope.search_allalbumimage.length && page < $scope.pagination.numberOfPages) {
                                $scope.search_albumimage_exist = true;
                            }
                            else {
                                $scope.search_albumimage_exist = false;
                            }
                            

                            if(page === 0) {
                                $scope.nokeyword = true;
                            }
                            else {
                                $scope.nokeyword = false;
                            }

                        }
                    } else {
                        $scope.allkeywords = null;
                        $scope.nokeyword = false;
                    }
                });
                // console.log('data.album copy', data);

                if (data.type == 'success') {
                    if(search.time && from && to) {
                        data.album = data.album.filter(e => {
                            if(e.createdate > from && e.createdate <= to) {
                                return e
                            }
                        })
                    }
                    data.album = data.album.filter(e => {
                        if(e.thumbnail || (e.images && e.images[0])) {
                            if(!e.thumbnail) e.thumbnail = e.images[0];

                    
                            e.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + e.thumbnail.publicid + '.' + e.thumbnail.fileExtension;
                            return e
                        }
                    })
                    $scope.search_album = data.album;
                    // $scope.search_album_backup = data.album;
                    
                    data.album.forEach(e => {
                        $scope.search_allalbumimage = $scope.search_allalbumimage.concat(e.images.filter(i => {
                            i.galleryid = e._id;

                            i.url = $scope.cloudinary_image_base_path + $scope.config.crop200 + i.publicid + '.' + (i.fileExtension || 'jpg')
                            return i;
                        }))
                    });


                    if(search.lat) {
                        $scope.search_allalbumimage = $scope.search_allalbumimage.filter(e => e.lat === search.lat)
                    }
                    if(search.lng) {
                        $scope.search_allalbumimage = $scope.search_allalbumimage.filter(e => e.lng === search.lng)
                    }

                    $scope.search_albumimage = $scope.search_allalbumimage.slice(begin, end);
                    // $scope.search_albumimage = $scope.search_allalbumimage.slice(page, $scope.pagination.pageSize);
                    $scope.pagination.numberOfPages = Math.ceil($scope.search_allalbumimage.length / $scope.pagination.pageSize);

                    // console.log('search_albumimage', $scope.search_albumimage)
                    if($scope.search_allalbumimage && $scope.search_allalbumimage.length && page < $scope.pagination.numberOfPages) {
                        $scope.search_albumimage_exist = true;
                    }
                    else {
                        $scope.search_albumimage_exist = false;
                    }
                    


                    if(page === 0) {
                        $scope.search_album_exist = true;
                    }
                    else {
                        $scope.search_album_exist = false;
                    }

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
                        // console.log('getaddresponse', getaddresponse)
                        // window.location.href = '/search';
                    });
                
                
                }
            });
        }
        $scope.changePage = function(page) {
            let begin = (page || $scope.pagination.curPage * $scope.pagination.pageSize)
                , end = begin + $scope.pagination.pageSize;
                
            if ($scope.search_allalbumimage) {
                $scope.search_albumimage = $scope.search_allalbumimage.slice(begin, end);
                $scope.pagination.numberOfPages = Math.ceil($scope.search_allalbumimage.length / $scope.pagination.pageSize);
            }
            if ($scope.pagination.curPage > $scope.pagination.numberOfPages - 1 && !$routeParams.page) {
                $scope.pagination.curPage = 0;
            }

            if($scope.pagination.curPage !== 0) {
                $scope.search_album_exist = false;
                $scope.nokeyword = false;
                $scope.userexist = false;
            }
            else {
                // if($scope.searchkeyword) window.location.href = '/search/' + $scope.searchkeyword;
                $scope.search_album_exist = true;
                $scope.nokeyword = true;
                $scope.userexist = true;
            }
        }
        $scope.$watch('pagination.curPage + pagination.pageSize', function () {

            // $scope.pagination.curPage = $routeParams.page ?  Number($routeParams.page) - 1 : 0;
            $scope.changePage();
            

        });
        $scope.changeURL = function(page) {
            page = Number(page)
            $scope.pagination.curPage = page;
            
            $scope.changePage(page)
            history.pushState({}, 'Last Photos | Photos', '/search/' + $scope.searchkeyword + '/' + (page + 1));
            // window.location.href = '/search/' + $scope.searchkeyword + '/' + (page + 1);

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

