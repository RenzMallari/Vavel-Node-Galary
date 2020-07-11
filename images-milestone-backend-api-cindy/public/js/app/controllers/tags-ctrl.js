
(function() {
    angular.module("photographer").controller('tagsController', tagsController);

    function tagsController(localService, $route, configService, $scope, paymentService, constSetting, $cookieStore, $http, $location, $routeParams, myAuth) {
        $scope.config = configService;
        $scope.loggedindetails = myAuth.getUserNavlinks();
        $scope.location = $location;
        $scope.allalbums = [];
        $scope.allphotos = [];
        $scope.favoritetags = [];
        $scope.alllisttags = [];
        $scope.showtag = false;
        $scope.tagisphoto = true;
        $scope.urlParams = {};
        $scope.getall = false;
        $scope.link = 'https://stock.vavel.com/s/photoImages/bunch/';
        $scope.selectedTag = '';
        $scope.dateFilters = [];
        $scope.displayDatesFilter = true;
        $scope.currentPath = '';
        $scope.userid = null;
        $scope.$on('$routeChangeStart', function($event, next, current) { 
            $scope.setUrlParams();
            $scope.dateFilters = [];
            $scope.selectedTag = $scope.urlParams.tag;
            $scope.currentPath = next.$$route.originalPath;
            $scope.displayDatesFilter = $scope.currentPath === '/';
            $scope.userid = next.params.id;
            $scope.getYears();
            $scope.gettags({ params: next.params, path: next.$$route.originalPath });
          });

        $scope.selectTag = tag => {
            $scope.selectedTag = tag.tag;
            $scope.dateFilters = [];
            $scope.getYears();
        }
        $scope.selectAllTags = () => {
            $scope.selectedTag = null;
            $scope.dateFilters = [];
        }
        $scope.selectDate = tag => {
            setTimeout(() => {
                $scope.dateFilters = $scope.dateFilters.map(filter => {
                    const {year, month} = filter
                    const className = $route.current.params.month == month && $route.current.params.year == year ? 'active': '';
                    return { ...filter, class: className };
                });
                $scope.setUrlParams();
            });
        }
        $scope.selectAllDates = () => {
            $scope.dateFilters = $scope.dateFilters.map(filter => ({ ...filter, class:'' }));
            $scope.setUrlParams();
        }
        $scope.setUrlParams = () => {
            let urlParams = new URLSearchParams(window.location.search);
            let search = {}
            if (urlParams.has('country')) search.country = urlParams.get('country').toLowerCase();
            if (urlParams.has('tag')) search.tag = urlParams.get('tag');
            if (urlParams.has('year')) search.year = urlParams.get('year');
            if (urlParams.has('month')) search.month = urlParams.get('month');
            $scope.urlParams = search;
        }

        function mapMonthName(month) {
            switch (month) {
                case 1: return 'Jan';
                case 2: return 'Feb';
                case 3: return 'Mar';
                case 4: return 'Apr';
                case 5: return 'May';
                case 6: return 'Jun';
                case 7: return 'Jul';
                case 8: return 'Aug';
                case 9: return 'Sept';
                case 10: return 'Oct';
                case 11: return 'Nov';
                case 12: return 'Dec';
                default: return '';
            }
        }

        $scope.getYears = () => {
            const params = { tag: $scope.selectedTag };
            if($scope.currentPath === '/myaccount/:id') {
                params.userid = $scope.userid;
            }
            $http({
                method: 'GET',
                url: `${myAuth.baseurl}album/lastphotos-by-year`,
                params
              }).success(function(data) {
                if (data.type == 'success') {
                    $scope.setUrlParams();
                    const {results} = data;
                    $scope.dateFilters = results.map(data => {
                        const { year, month } = data;
                        return {
                            ...data,
                            monthName: `${mapMonthName(month)} ${year}`,
                            class: $route.current.params.month == month && $route.current.params.year == year ? 'active': ''
                        };
                    });
                }
            }).catch(err => {
                console.log(err)
            })
        }

        $scope.getList = function() {
            $scope.alllisttags = [];
            $scope.getall = false
            $http({
                method: "GET",
                url: myAuth.baseurl + "tag/listtags"
            }).success(function(data) {
                if (data.type == 'success') {
                    data.listtags = data.listtags || [];
                    data.listtags = data.listtags.map(e => {
                        if(e.tag && e.tag.logo) e.logo = $scope.link + e.tag.logo
                        else {
                            let find = e.list_tags.find(i => i.logo) 
                            if(find) {
                                e.logo = $scope.link + find.logo
                            }
                        }
                        return e;
                    })
                    $scope.alllisttags = data.listtags;
                    $scope.getall = true;
                }
            }).catch(err => {
                console.log(err)
            })
        }
        if(!$scope.getall) {
            $scope.getList()
        }
        $scope.getLogo = function(keyword) {
            let find = $scope.alllisttags.find(e => e._id === keyword && e.logo) 
            if(find) return find.logo;
            else return false
        }
        $scope.gettags = function({list, country_filter, params, path}) {
            let tags = [];
            let array = [];
            $scope.setUrlParams();

            if($location.$$path !== '/albums' && $location.$$path.indexOf("mainalbumdetails") === -1) {
                $scope.tagisphoto = true;
                
                if(list) $scope.allphotos = list;
                

                $scope.allphotos.forEach(album => {
                    if(album.images.tags) {
                        album.images.tags = album.images.tags.map(e => {
                            e.country = (album.albumcountry || '').toLowerCase()
                            return e;
                        })
                        tags = tags.concat(album.images.tags)
                    }
                })

            }
            else {
                $scope.tagisphoto = false;
                if(list) $scope.allalbums = list;
                $scope.allalbums.forEach(album => {
                    if(album.tags) {
                        album.tags = album.tags.map(e => {
                            e.country = (album.albumcountry || '').toLowerCase()
                            return e
                        })
                        tags = tags.concat(album.tags)
                    }
                })
            }

            // if(!$scope.getall) {
            //     $scope.getList();
            // }
            tags.forEach(e => {
                // let find = $scope.alllisttags.find(e1 => e1._id === e.tag && e1.logo);
                // if(find) {
                //     e.logo = find.logo
                // }
                if(array.find(a => a.tag === e.tag)) {
                    array.find(a => a.tag === e.tag).count++;
                    if(e.country) array.find(a => a.tag === e.tag).country.push(e.country.toLowerCase())
                    
                }
                else {
                    let json = {
                        tag: e.tag,
                        // logo: e.logo,
                        count: 1,
                        country: [],
                        class: $scope.urlParams.tag === e.tag ? 'active': ''
                    }
                    if(e.country) json.country = [e.country.toLowerCase()]

                    array.push(json)
                }
            })
            array = array.sort(function(a,b) {
                return a.count < b.count ? 1 : -1
            })
            if(country_filter) {
                let paramcountry = country_filter.toLowerCase();
                let country = constSetting.list_countries.find(function (e) {
                  if (e.name.toLowerCase() === paramcountry || 
                    e.alpha3code.toLowerCase() === paramcountry 
                    || e.alpha2code.toLowerCase() === paramcountry) {
                    return e
                  }
                })
                if(country) {
                    let after = [], before = [];
                    array.forEach(e => {
                        if(e.country.find(i => i === country.name.toLowerCase() || i === country.alpha3code.toLowerCase() 
                        || i === country.alpha2code.toLowerCase())) {
                            before.push(e)
                        }
                        else {
                            after.push(e);
                        }
                    })
                    
                    array = before.concat(after)
                }
            }
            $scope.favoritetags = [];
            
            $scope.favoritetags = array;

            if($scope.favoritetags.length === 0 && path === '/details/:galleryid/:id') {
                $http({
                    method: 'GET',
                    url: `${myAuth.baseurl}gallery/getimagedetails/${params.galleryid}/${params.id}`
                  }).success(function(data) {
                    if (data.msg) {
                        $scope.favoritetags = data.msg.tags;
                    }
                  });
            }
            
            if(array.length > 0) {
                $scope.showtag = true;
            }
            else {
                $scope.showtag = false;
            }       
            setTimeout(function() {
                $scope.$apply(function() {
                    
                });
            }, 1000);
            
        }
        
        
        // $scope.gettags();
        

        $scope.stringifyPath = function(tag, date, topLevel) {
            let urlParams = new URLSearchParams(window.location.search);
            let search = {};
            if(urlParams.has('country')) search.country = urlParams.get('country');
            if(urlParams.has('lng')) search.lng = urlParams.get('lng');
            if(urlParams.has('lat')) search.lat = urlParams.get('lat');
            if(urlParams.has('tag')) search.tag = urlParams.get('tag');
            if(tag) search.tag = tag;
            else delete search.tag;

            if (date) {
                search.year = date.year;
                search.month = date.month;
            }
            let string = '';
            Object.keys(search).forEach((e, i) => {
                if(i !== 0) {
                    string += '&'
                }
                string += `${e}=${search[e]}`
            })
            if(string) {
                string = `?${string}`
            }
            if(!topLevel && $scope.currentPath === '/myaccount/:id') {
                return `/myaccount/${$scope.userid}` + string;
            }
            return `${$scope.tagisphoto ? '/' : '/albums'}` + string;
        }

        

    }
})();
