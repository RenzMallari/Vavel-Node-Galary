PAGE_TITLE = 'PHOTOS.image';
PAGE_TITLE_SUFFIX = ' | Photos';
const photographerApp = angular.module('photographer', ['chart.js', 'ngAnalytics', 'tawani.utils', 'variableSettingServices', 'ngMap', 'ngRoute', 'ngAnimate', 'myUtils', 'ngSanitize', 'ngCookies', 'facebook', 'photoAlbumServices', 'ngTagsInput', 'dropzone', 'angularUtils.directives.dirPagination', 'vcRecaptcha']);
const mycontrollers = {};

photographerApp.config(function($routeProvider, $locationProvider, FacebookProvider) {
  // facebook provider
  FacebookProvider.init('169320175188');

  // use the HTML5 History API
  $locationProvider.html5Mode(true);

  const uploadimg = {
    templateUrl: 'partials/uploadimg.html',
    controller: 'uploadImgController',
    resolve: {
      // eslint-disable-next-line object-shorthand
      albums: function($cookieStore, albumService) {
        const userData = $cookieStore.get('users');

        if (userData) return albumService.albumList(userData._id);
      },
      // eslint-disable-next-line object-shorthand
      collections: function($cookieStore, collectionService) {
        const userData = $cookieStore.get('users');

        if (userData) return collectionService.collectionList(userData._id);
      }
    }
  };

  $routeProvider
    .when('/home', {
      controller: 'homeController',
      templateUrl: 'partials/home.html'
    })
    .when('/explore', {
      controller: 'exploreController',
      templateUrl: 'partials/explore.html'
    })
    .when('/catalog', {
      controller: 'catalogController',
      templateUrl: 'partials/catalog.html'
    })
    .when('/collections', {
      controller: 'collectionsController',
      templateUrl: 'partials/collections.html'
    })
    .when('/maincollectiondetails/:id', {
      controller: 'maincollectiondetailsController',
      templateUrl: 'partials/maincollectiondetails.html'
    })
    .when('/mainalbumdetails/:id', {
      controller: 'mainalbumdetailsController',
      templateUrl: 'partials/mainalbumdetails.html'
    })
    .when('/pricing', {
      controller: 'pricingController',
      templateUrl: 'partials/pricing.html'
    })
    .when('/settings', {
      controller: 'settingsController',
      templateUrl: 'partials/settings.html'
    })
    .when('/myaccount/:id', {
      controller: 'mygalleryController',
      templateUrl: 'partials/mygallery.html'
    })
    .when('/contact', {
      controller: 'contactController',
      templateUrl: 'partials/contact.html'
    })
    .when('/team', {
      controller: 'aboutusController',
      templateUrl: 'partials/aboutus.html'
    })
    .when('/cms/:name', {
      controller: 'cmsController',
      templateUrl: 'partials/cms.html'
    })
    .when('/faq', {
      controller: 'faqController',
      templateUrl: 'partials/faq.html'
    })
    .when('/mycollection', {
      controller: 'mycollectionController',
      templateUrl: 'partials/mycollection.html'
    })
    .when('/signup/:type', {
      controller: 'signupController',
      templateUrl: 'partials/signup.html',
      params: {
        header: false
      }
    })
    .when('/details/:galleryid/:id', {
      controller: 'photodetailsController',
      templateUrl: 'partials/details.html'
    })
    .when('/collectiondetails/:id', {
      controller: 'collectiondetailsController',
      templateUrl: 'partials/collectiondetails.html'
    })
    .when('/catalogdetails/:keyword', {
      controller: 'catalogdetailsController',
      templateUrl: 'partials/catalogdetails.html'
    })
    .when('/albumdetails/:id', {
      controller: 'albumdetailsController',
      templateUrl: 'partials/albumdetails.html'
    })
    .when('/myalbums', {
      controller: 'albumController',
      templateUrl: 'partials/myalbum.html'
    })
    .when('/mymetrics', {
      controller: 'mymetricsController',
      templateUrl: 'partials/mymetrics.html',
      resolve: {
        accessToken: function(gapiService) {
            return gapiService.getAccessToken();
        },
        envVariables: function(envService) {
            return envService.getEnvVariables();
        }
      }
    })
    .when('/mymetrics/:id', {
      controller: 'metricsdetailController',
      templateUrl: 'partials/metricsdetail.html',
      resolve: {
        accessToken: function(gapiService) {
            return gapiService.getAccessToken();
        },
        envVariables: function(envService) {
            return envService.getEnvVariables();
        }
      }
    })
    .when('/search', {
      controller: 'searchController',
      templateUrl: 'partials/search.html'
    })
    .when('/search/:keyword', {
      controller: 'searchController',
      templateUrl: 'partials/search.html'
    })
    .when('/search/:keyword/:page', {
      controller: 'searchController',
      templateUrl: 'partials/search.html'
    })
    .when('/search/:keyword/:page/:other', {
      templateUrl: 'partials/error_404.html'
    })
    .when('/advancesearch', {
      controller: 'advancesearchController',
      templateUrl: 'partials/advancesearch.html'
    })
    .when('/sale', {
      controller: 'saleController',
      templateUrl: 'partials/sale.html'
    })
    .when('/buy', {
      controller: 'buyController',
      templateUrl: 'partials/buy.html'
    })
    .when('/checkout', {
      controller: 'checkoutController',
      templateUrl: 'partials/checkout.html'
    })
    .when('/success/:albumid', {
      controller: 'paypalController',
      templateUrl: 'partials/thankyou.html'
    })
    .when('/success_cart', {
      controller: 'paypalCartController',
      templateUrl: 'partials/thankyou.html'
    })
    .when('/downloads', {
      controller: 'downloadsController',
      templateUrl: 'partials/downloads.html'
    })
    .when('/upload/:part/:id', uploadimg)
    .when('/upload', uploadimg)
    .when('/widget/:username', {
      controller: 'profileController',
      templateUrl: 'partials/profile.html'
    })
    .when('/', {
      controller: 'lastphotosController',
      templateUrl: 'partials/lastphotos.html'
    })
    .when('/albums', {
      controller: 'allalbumsController',
      templateUrl: 'partials/albums.html'
    })
    .otherwise({
      templateUrl: 'partials/error_404.html'
    });
});

angular.module('photographer').factory('_', function() {
  return window._;
});

mycontrollers.signupController = function(configService, constSetting, $scope, $http, $location, myAuth, $cookies, $cookieStore, Facebook, $window, $routeParams, $sce, recaptchaService) {
  $scope.config = configService;
  $scope.list_countries = constSetting.list_countries;
  myAuth.updateUserinfo(myAuth.getUserAuthorisation());
  $scope.loggedindetails = myAuth.getUserNavlinks();
  if ($scope.loggedindetails) window.location.href = `/myaccount/${$scope.loggedindetails._id}`;
  $scope.recaptchaPublicKey = recaptchaService.getPublicKey();
  
  const usertype = $routeParams.type;
  if (usertype == 'buyer') $scope.signupheading = 'Affordable, authentic images for your creative projects.';
  else $scope.signupheading = 'The future of photography is in your hands.';
  $scope.signup = function() {
    const recaptchaResponse = recaptchaService.getResponse();

    if (!recaptchaResponse) {
      $scope.registrationError = true;
      $scope.alert = myAuth.addAlert('danger', 'Please fill captcha to sign up');
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.registrationError = false;
        });
        $scope.ishide = false;
      }, 3000);
      return;
    }

    const dataObj = {
      'firstname': $scope.userregistration.firstname,
      'lastname': $scope.userregistration.lastname,
      'paypalemail': $scope.userregistration.paypalemail,
      'country': $scope.userregistration.country,
      'email': $scope.userregistration.email,
      'password': $scope.userregistration.password,
      'g-recaptcha-response': recaptchaResponse,
      usertype
    };

    $http({
      method: 'POST',
      url: `${myAuth.baseurl}registration`,
      data: dataObj,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      if (data.type === 'error') {
        $scope.registrationError = true;
        $scope.alert = myAuth.addAlert('danger', data.msg);
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.registrationError = false;
          });
          $scope.ishide = false;
        }, 3000);
        recaptchaService.reload();
      } else if (data.type === 'validate') {
        $scope.registrationError = true;
        $scope.alert = myAuth.addAlert('danger', data.msg);
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.registrationError = false;
          });
          $scope.ishide = false;
        }, 3000);
        recaptchaService.reload();
      } else {
        $scope.userregistration = {};
        $cookieStore.put('users', data.msg);
        $scope.registrationSuccess = true;
        $scope.alert = myAuth.addAlert('success', 'You have registered successfully!');
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.registrationSuccess = false;
            myAuth.updateUserinfo(myAuth.getUserAuthorisation());
            $scope.loggedindetails = myAuth.getUserNavlinks();
            $scope.$emit('update_parent_controller', $scope.loggedindetails);
            window.location.href = '/settings';
            window.location.reload();
          });
        }, 2000);
      }
    });
  };

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}joinus/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.joinus = data;

    });
  };
  $scope.getcontentbyid();
};

mycontrollers.footercontroller = function(configService, $scope, $http, myAuth, $location, $cookies, $cookieStore, $sce) {
  $scope.config = configService;
  $scope.checkfooter = function() {
    const pathnext = '/myaccount';
    const pathnextsearch = '/myaccount';
    if ($location.path().substr(0, pathnext.length) == '/myaccount' || ~$location.path().indexOf('/search')) $scope.footershow = false;
    else $scope.footershow = true;

  };
  $scope.$watch(
    function(scope) {
      $scope.checkfooter();
    }
  );

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.getsettingsbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}settings/getsettingsbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.settingsfooter = data;

    });
  };
  $scope.getsettingsbyid();
};

mycontrollers.pricingController = function(configService, $scope, $http, $location, myAuth, $sce) {
  $scope.config = configService;
  $scope.loggedindetails = myAuth.getUserNavlinks();
  $scope.subscription = {};
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };
  $scope.listallsubscriptionfaqs = function() {
    $http({
      url: `${myAuth.baseurl}subscription/getallsubscriptionfaqs`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.allsubscriptionfaqs = data;

    });
  };
  $scope.listallsubscriptionfaqs();

  $scope.open_join_modal = function() {
    myAuth.updateUserinfo(myAuth.getUserAuthorisation());
    $scope.loggedindetails = myAuth.getUserNavlinks();
    if ($scope.loggedindetails) window.location.href = `/myaccount/${$scope.loggedindetails._id}`;
    else $('#myModal-join').modal('toggle');

  };

  $scope.listallsubscriptions = function() {
    $http({
      url: `${myAuth.baseurl}subscription/getallsubscriptionslist`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.allsubscriptions = data;

    });
  };
  $scope.listallsubscriptions();

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}subscription/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) {
        $scope.subscriptioncms = {};
        $scope.subscriptioncms.title = data.title;
        $scope.subscriptioncms.subtitle = data.subtitle;
        $scope.subscriptioncms.backgroundimage = `${myAuth.cloudinary_image_base_path}${data.image}`;
      }
    });
  };
  $scope.getcontentbyid();

  $scope.getbrandcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}brand/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.brandcms = data;

    });
  };
  $scope.getbrandcontentbyid();

  $scope.listactivebrands = function() {
    $http({
      url: `${myAuth.baseurl}brand/listactivebrands`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.allbrands = data;

    });
  };
  $scope.listactivebrands();

  $scope.showPricemodal = function(subscriptionid, plan_name, price, noofimages) {
    if ($scope.loggedindetails) $http({
      method: 'GET',
      url: `${myAuth.baseurl}checkuserstatus/${$scope.loggedindetails._id}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      if (data == 'success') $location.path('/settings');
      else {
        $('#myModal-price').modal('toggle');
        $scope.subscription.subscriptionid = subscriptionid;
        $scope.subscription.noofimages = noofimages;
        $scope.subscription.selectedplanname = plan_name;
        $scope.subscription.selectedprice = price;
        $scope.subscription.phonenumber = '+91-';
      }
    });
    else
      // $('#myModal-login').modal('toggle');
      $('#mymodal-payment').modal('show', { backdrop: 'static', keyboard: false });

  };

  $scope.pay = function() {
    if ($scope.loggedindetails) {
      $scope.paybycardmessage = true;
      $scope.loaderimg = true;
      $scope.alert = myAuth.addAlert('success', 'Contacting with Bank, Please wait, will late some seconds');
      $scope.subscription.userid = $scope.loggedindetails._id;
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}subscribe`,
        data: $scope.subscription,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type == 'success') {
          $scope.subscription.cardnumber = '';
          $scope.subscription.expirydate = '';
          $scope.subscription.cvcnumber = '';
          $scope.subscription.phonenumber = '+91-';
          $scope.paybycardmessage = true;
          $scope.loaderimg = false;
          $scope.alert = myAuth.addAlert('success', data.msg);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.paybycardmessage = false;
              $('#myModal-price').modal('toggle');
              $location.path('/settings');
            });
          }, 3000);
        } else {
          $scope.subscription.cardnumber = '';
          $scope.subscription.expirydate = '';
          $scope.subscription.cvcnumber = '';
          $scope.subscription.phonenumber = '+91-';
          $scope.paybycardmessage = true;
          $scope.loaderimg = false;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.paybycardmessage = false;
            });
          }, 3000);
        }
      });
    } else {
      $scope.paybycardmessage = true;
      $scope.loaderimg = false;
      $scope.alert = myAuth.addAlert('danger', 'Some error occurred. Please try again later or check you are logged in.');
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.paybycardmessage = false;
        });
      }, 3000);
    }
  };
};

mycontrollers.contactController = function(configService, $scope, $http, myAuth, $location, $sce) {
  $scope.config = configService;
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };
  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}contact/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.contact = data;

    });
  };
  $scope.getcontentbyid();
  $scope.contactus = {};
  $scope.contact = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}contact/contactus`,
      data: $scope.contactus,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      if (data.type == 'success') {
        $scope.contactus = {};
        $scope.contactusSuccess = true;
        $scope.alert = myAuth.addAlert('success', 'Thank you for your Interest...');
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.contactusSuccess = false;
          });
          $scope.ishide = false;
        }, 2000);
      } else {
        $scope.contactusError = true;
        $scope.alert = myAuth.addAlert('danger', data.msg);
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.contactusError = false;
          });
          $scope.ishide = false;
        }, 3000);
      }
    });
  };
};

mycontrollers.aboutusController = function(configService, $scope, $http, $location, myAuth, $sce) {
  $scope.config = configService;
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.listallmembers = function() {
    $http({
      url: `${myAuth.baseurl}teams/listallmembers`,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      if (data) $scope.memberslist = data;

    });
  };
  $scope.listallmembers();

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}teams/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.teams = data;

    });
  };
  $scope.getcontentbyid();

};

mycontrollers.cmsController = function(configService, $scope, $http, $location, $routeParams, myAuth, $sce) {
  $scope.config = configService;
  const keyword = $routeParams.name;
  $scope.pageheading = keyword;

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.cmscontent = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}cms/getcontentbypagename/${keyword}`
    }).success(function(data) {
      $scope.tabcontent = data.pagecontent;
    });
  };
  $scope.cmscontent();
};

mycontrollers.faqController = function(configService, $scope, $http, $location, myAuth, $sce) {

  $scope.config = configService;
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.getallfaq = function() {
    $http({
      url: `${myAuth.baseurl}faq/listallfaq`,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      if (data) $scope.faqlist = data;

    });
  };
  $scope.getallfaq();
};

mycontrollers.saleController = function(configService, $scope, $http, $location, myAuth, $sce) {
  $scope.config = configService;
  $scope.loggedindetails = myAuth.getUserNavlinks();
  $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.isloggedin = false;
  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;
  else {

  }

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}sale/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.salecms = data;

    });
  };
  $scope.getcontentbyid();
  $scope.getsales = function(obj) {
    $http({
      url: `${myAuth.baseurl}sale/getsales/${$scope.loggedindetails._id}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) {
        let totalimagessold = 0;
        let totalalbumssold = 0;
        let totalsales = 0;
        let totalearnings = 0;
        if (data.type == 'success') if (data.is_sale_exist == 0) {
          $scope.showtips = true;
        } else {
          data.sales.forEach(function(sale, index) {
            if (sale.type == 'Album') totalalbumssold = totalalbumssold + 1;
            else if (sale.type == 'Image') totalimagessold = totalimagessold + 1;

            totalsales = parseFloat(totalsales) + parseFloat(sale.totalamount);
            if (sale.ack == 'Success') totalearnings = parseFloat(totalearnings) + parseFloat(sale.totalearnings);

          });

          $scope.showtips = false;
        }
        else $scope.showtips = true;

        $scope.totalimagessold = totalimagessold;
        $scope.totalalbumssold = totalalbumssold;
        $scope.totalsales = totalsales.toFixed(2);
        $scope.totalearnings = totalearnings.toFixed(2);
      }
    });
  };
  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.getsales();
};

mycontrollers.buyController = function(configService, $scope, $http, $location, myAuth, $sce) {
  $scope.config = configService;
  $scope.loggedindetails = myAuth.getUserNavlinks();
  $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };
  $scope.isloggedin = false;
  if ($scope.loggedindetails) $scope.isloggedin = true;

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}purchase/getcontentbyid/1`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) $scope.purchasecms = data;

    });
  };
  $scope.getcontentbyid();
  $scope.getbuy = function(obj) {
    $http({
      url: `${myAuth.baseurl}sale/getpurchases/${$scope.loggedindetails._id}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) {
        let totalimagesbuy = 0;
        let totalalbumsbuy = 0;
        let totalpaid = 0;
        if (data.type == 'success') if (data.is_sale_exist == 0) {
          $scope.showtips = true;
        } else {
          data.purchases.forEach(function(purchase, index) {
            if (purchase.type == 'Album') totalalbumsbuy = totalalbumsbuy + 1;
            else if (purchase.type == 'Image') totalimagesbuy = totalimagesbuy + 1;

            totalpaid = parseFloat(totalpaid) + parseFloat(purchase.totalamount);
          });
          $scope.showtips = false;
        }
        else $scope.showtips = true;

        $scope.totalimagesbuy = totalimagesbuy;
        $scope.totalalbumsbuy = totalalbumsbuy;
        $scope.totalpaid = totalpaid.toFixed(2);
      }
    });
  };
  $scope.getbuy();
};

mycontrollers.profileController = function(configService, $scope, $http, $location, $routeParams, myAuth, $sce) {
  $scope.config = configService;
  $scope.username = $routeParams.username;

  $scope.showDetails = function(galleryid, imageid) {
    window.open(`/details/${galleryid}/${imageid}`);
  };

  $scope.getprofile = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}userdetails/${$scope.username}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data.type == 'success') {
        $http({
          method: 'GET',
          url: `${myAuth.baseurl}usertags/${data.msg._id}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).success(function(tags) {
          if (tags.type == 'success') $scope.tags = tags.msg;

        });

        $http({
          method: 'GET',
          url: `${myAuth.baseurl}album/getalbums/${data.msg._id}`
        }).success(function(image) {
          if (image.is_album_exist == '0') $scope.showalbums = false;
          else $scope.showalbums = true;

          $scope.loading = false;
          $scope.allalbums = image.allalbums;
        });
        $scope.details = data.msg;
      } else $location.path('/home');

    });
  };
  $scope.getprofile();
};

mycontrollers.downloadsController = function(configService, $scope, $http, $routeParams, $location, myAuth, $sce, $window) {
  // console.log('downloadsController')
  $scope.config = configService;
  $scope.myaccount = myAuth.getUserNavlinks();
  $scope.loggedindetails = myAuth.getUserNavlinks();
  $scope.loading = true;
  $scope.isloggedin = false;
  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;

  $scope.paginationPhotos = {
    curPage: 0,
    pageSize: 30,
    numberOfPages: 0,
    pageSizeList: [2, 30, 50, 75, 100]
  };

  $scope.paginationAlbums = {
    curPage: 0,
    pageSize: 30,
    numberOfPages: 0,
    pageSizeList: [2, 30, 50, 75, 100]
  };
  $scope.downloadMessage = null;

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  function forceDownload(url, filename, folder) {
    console.log(url, filename);
    const a = $('<a>').attr('href', url).attr('download', filename);

    a[0].click();
    a.remove();
    if (folder) setTimeout(function() {
      $scope.removeFolder(folder);
    }, 100000);

  }

  $scope.removeFolder = function(path) {
    return $http({
      method: 'GET',
      url: `${myAuth.baseurl}download/deletefolder/${path}`
    }).success(function(data) {
      if (data.type === 'success') {
        //
      }
    });
  };

  $scope.downloadPhotos = async function(photo) {
    $scope.hiddenPhotos(photo._id);
    const slpit = photo.downloadlink.split('/');
    photo.fileName = slpit[slpit.length - 1];

    return $http({
      method: 'GET',
      url: `${myAuth.baseurl}download/downloadphoto/${photo._id}/${photo.gallery_id}/${$scope.loggedindetails._id}`
    }).success(function(data) {
      if (data.type === 'success') forceDownload(`img/${photo.gallery_id}/${photo.fileName}`, photo.fileName, photo.gallery_id);

      else setTimeout(function() {
        $scope.$apply(function() {
          $('#myAlert-download').modal('show');
          $scope.downloadMessage = data.msg;
        });
      }, 1000);

    })
      .then(function() {
        $scope.displayPhotos(photo._id);
      })
      .finally(function() {
        $scope.displayPhotos(photo._id);
        // Execute logic independent of success/error
      })
      .catch(function(error) {
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.displayPhotos(photo._id);
            $scope.downloadMessage = error.message || error.toString();
            $('#myAlert-download').modal('show');
          });
        }, 1000);
        // Catch and handle exceptions from success/error/finally functions
      });
  };

  $scope.downloadAlbums = async function(album) {
    $scope.hiddenAlbums(album._id);

    return $http({
      method: 'GET',
      url: `${myAuth.baseurl}download/downloadalbum/${album.gallery_id}/${$scope.loggedindetails._id}`
    }).success(function(data) {
      if (data.type === 'success') forceDownload(`img/${album.gallery_id}/${album.gallery_id}.zip`, `${album.gallery_id}.zip`, album.gallery_id);

      else {
        $scope.downloadMessage = data.msg;
        $('#myAlert-download').modal('show');
      }
    })
      .then(function() {
        $scope.displayAlbums(album._id);
      })
      .finally(function() {
        $scope.displayAlbums(album._id);
        // Execute logic independent of success/error
      })
      .catch(function(error) {
        $scope.displayAlbums(album._id);

        $scope.downloadMessage = error.message || error.toString();
        $('#myAlert-download').modal('show');
        // Catch and handle exceptions from success/error/finally functions
      });

  };

  $scope.hiddenPhotos = function(_id) {
    $scope.filteredDownloads = $scope.filteredDownloads.map(e => {
      if (e._id === _id) setTimeout(function() {
        $scope.$apply(function() {
          e.hidden = true;
        });
      }, 100);

      return e;
    });
  };

  $scope.displayPhotos = function(_id) {
    $scope.filteredDownloads = $scope.filteredDownloads.map(e => {
      if (e._id === _id) setTimeout(function() {
        $scope.$apply(function() {
          e.hidden = false;
        });
      }, 100);

      return e;
    });
  };

  $scope.hiddenAlbums = function(_id) {
    // console.log(_id)
    $scope.filteredAlbumDownloads = $scope.filteredAlbumDownloads.map(e => {
      // console.log(e)
      if (e._id === _id) setTimeout(function() {
        $scope.$apply(function() {
          e.hidden = true;
        });
      }, 100);

      return e;
    });
  };
  $scope.displayAlbums = function(_id) {
    $scope.filteredAlbumDownloads = $scope.filteredAlbumDownloads.map(e => {
      if (e._id === _id) setTimeout(function() {
        $scope.$apply(function() {
          e.hidden = false;
        });
      }, 100);

      return e;
    });
  };
  $scope.tabdownload = function(value) {
    $scope.showalbums = value;
  };

  $scope.getFileExtension = function(filename) {
    return filename.split('.').pop();
  };

  $scope.getalldownloads = function() {
    const pagination = $scope.paginationPhotos;

    const criteria = {
      page: pagination.curPage,
      limit: pagination.pageSize
    };

    $http({
      method: 'GET',
      url: `${myAuth.baseurl}album/getalldownloads/${$scope.loggedindetails._id}/${$('#load_number').val()}`,
      params: criteria
    }).success(function(data) {
      if (data.type === 'success') {

        if ($('#load_number').val() >= data.length) $scope.noloadmore = false;
        else $scope.noloadmore = true;

        if (data.is_download_exist == '0') $scope.nodownload = true;
        else $scope.nodownload = false;

        $scope.alldownloads = data.downloads.map(e => {
          e.fileExtension = $scope.getFileExtension(e.downloadlink);
          e.fileName = `${e.image_id}.${e.fileExtension}`;
          e.hidden = false;
          return e;
        });

        $scope.filteredDownloads = $scope.alldownloads;

        // if (!$scope.showalbums) pagination.numberOfPages = Math.ceil($scope.alldownloads.length / $scope.pagination.pageSize);

        pagination.numberOfPages = Math.ceil(data.count / pagination.pageSize);
        $window.scrollTo(0, 0);
      }
    });
  };

  $scope.$watch('paginationPhotos.pageSize', function() {
    $scope.getalldownloads();
  });

  $scope.$watch('paginationAlbums.pageSize', function() {
    $scope.getalldownloads_albums();
  });

  $scope.showPhotosPage = showPage($scope.getalldownloads, $scope.paginationPhotos);
  $scope.showAlbumsPage = showPage($scope.getalldownloads_albums, $scope.paginationAlbums);

  function showPage(fn, pagination) {
    return function(page) {
      pagination.curPage = page;
      fn();
    }
  }

  $scope.getalldownloads_albums = function() {
    const pagination = $scope.paginationAlbums;

    const criteria = {
      page: pagination.curPage,
      limit: pagination.pageSize
    };

    $http({
      method: 'GET',
      url: `${myAuth.baseurl}album/getalldownloads_albums/${$scope.loggedindetails._id}/${$('#load_number').val()}`,
      params: criteria
    }).success(function(data) {
      if (data.type === 'success') {
        if ($('#load_number').val() >= data.length) $scope.noloadmorealbum = false;
        else $scope.noloadmorealbum = true;

        if (data.is_download_exist_albums == '0') $scope.nodownloadalbum = true;
        else $scope.nodownloadalbum = false;

        $scope.allalbumdownloads = data.downloads_albums.map(e => {
          e.fileExtension = $scope.getFileExtension(e.downloadlink);
          e.hidden = false;
          e.list_images = e.list_images.map(i => {
            i.fileExtension = $scope.getFileExtension(i.downloadlink);
            i.fileName = `${i.image_id}.${i.fileExtension}`;
            return i;
          });

          return e;
        });

        // console.log($scope.allalbumdownloads)

        // $scope.filteredAlbumDownloads = $scope.allalbumdownloads.slice(0, $scope.pagination.pageSize);
        // if ($scope.showalbums) $scope.pagination.numberOfPages = Math.ceil($scope.allalbumdownloads.length / $scope.pagination.pageSize);

        pagination.numberOfPages = Math.ceil(data.count / pagination.pageSize);
        $window.scrollTo(0, 0);

        $scope.loading = false;
      }
    });
  };

  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.getalldownloads();
  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.getalldownloads_albums();

  $scope.getbuy = function(obj) {
    $http({
      url: `${myAuth.baseurl}sale/getpurchases/${$scope.loggedindetails._id}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).success(function(data) {
      if (data) {
        let totalimagesbuy = 0;
        let totalalbumsbuy = 0;
        let totalpaid = 0;
        if (data.type == 'success') if (data.is_sale_exist == 0) {
          $scope.showtips = true;
        } else {
          data.purchases.forEach(function(purchase, index) {
            if (purchase.type == 'Album') totalalbumsbuy = totalalbumsbuy + 1;
            else if (purchase.type == 'Image') totalimagesbuy = totalimagesbuy + 1;

            totalpaid = parseFloat(totalpaid) + parseFloat(purchase.totalamount);
          });
          $scope.showtips = false;
        }
        else $scope.showtips = true;

        $scope.totalimagesbuy = totalimagesbuy;
        $scope.totalalbumsbuy = totalalbumsbuy;
        $scope.totalpaid = totalpaid.toFixed(2);
      }
    });
  };
  if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.getbuy();

  $scope.status = function(id) {
    const dataobj = {
      'imgid': id
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}gallery/updatedownloadstatus`,
      data: dataobj
    }).success(function(data) {
      if (data.type == 'success') {

        $scope.getalldownloads();
        window.location.href = '/downloads';

      }

    });
  };

  $scope.loadmoredata = function() {
    const current = parseInt($('#load_number').val()) + 4;
    $('#load_number').val(current);
    $scope.getalldownloads();
    window.location.href = '/downloads';
  };
};

mycontrollers.paypalController = function(configService, $scope, $http, $routeParams, $location, myAuth, $sce) {

  $scope.config = configService;
  $scope.myaccount = myAuth.getUserNavlinks();
  $scope.loggedindetails = myAuth.getUserNavlinks();

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  // parse something like this https://devtools-paypal.com/guide/pay_paypal?success=true&paymentId=PAY-20V944351M531651DK4GZD7A&token=EC-1NN30103F6934233J&PayerID=BL43B7SAA8BES
  const paymentId = $routeParams.paymentId;
  const token = $routeParams.token;
  const payerID = $routeParams.PayerID;

  console.log('Parmas: ', $routeParams);
  console.log('Location: ', $location);

  $scope.savepaypalsuccess = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}album/executepayment`,
      data: {
        paymentId,
        payerId: payerID,
        albumId: $routeParams.albumid,
        userId: $scope.loggedindetails._id
      }
    }).then(function(response) {
      if (response.data.type == 'success') window.location.href = '/downloads';

      if (response.data.type == 'error') $scope.error = response.data.msg;

    }, function(error) {
      $scope.error = error.data.msg;
    });
  };
  $scope.savepaypalsuccess();
};

mycontrollers.paypalCartController = function(configService, $scope, $http, $routeParams, $location, myAuth, $sce) {

  $scope.config = configService;
  $scope.myaccount = myAuth.getUserNavlinks();
  $scope.loggedindetails = myAuth.getUserNavlinks();

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  // parse something like this https://devtools-paypal.com/guide/pay_paypal?success=true&paymentId=PAY-20V944351M531651DK4GZD7A&token=EC-1NN30103F6934233J&PayerID=BL43B7SAA8BES
  const paymentId = $routeParams.paymentId;
  const token = $routeParams.token;
  const payerID = $routeParams.PayerID;

  $scope.executePayment = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}gallery/executepayment/`,
      data: {
        paymentId,
        payerId: payerID,
        userId: $scope.loggedindetails._id
      }
    }).then(function(response) {
      if (response.data.type == 'success') window.location.href = '/downloads';

      if (response.data.type == 'error') $scope.error = response.data.msg;

    }, function(error) {
      $scope.error = error.data.msg;
    });
  };

  $scope.executePayment();

};

mycontrollers.lastphotosController = function(configService, constSetting, $scope, $http, $routeParams, $location, myAuth, $sce, $filter, $window, $cookieStore, $rootScope) {
  $scope.config = configService;
  $scope.pagination = {
    curPage: 0,
    pageSize: 50,
    numberOfPages: 1,
    pageSizeList: [30, 50, 75, 100]
  };

  $scope.tag = $routeParams.tag;
  $scope.year = $routeParams.year;
  $scope.month = $routeParams.month;
  $scope.tagPreview = '';
  $scope.countPhotos = 0;

  $rootScope.$on('website-logo-click', function($event, next, current) {
    $scope.pagination = {
      curPage: 0,
      pageSize: 50,
      numberOfPages: 1,
      pageSizeList: [30, 50, 75, 100]
    };
    $scope.getlastphotos();
  });
  
  $scope.noalbum = true;
  $scope.updating = false;
  $scope.alluserphotos = [];
  $scope.filteredUserphotos = [];
  function distance(lat1 = 0, lon1 = 0, coords = [], lat2 = 0, lon2 = 0) {
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    if (!coords) coords = $cookieStore.get('coords');
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('lat') && urlParams.has('lng')) {
      lat2 = Number(urlParams.get('lat'));
      lon2 = Number(urlParams.get('lng'));
    }
    else if (coords) {
      lat2 = Number(coords[0]);
      lon2 = Number(coords[1]);
    }
    // console.log(typeof lat1, typeof lon1)
    const R = 6371; // km (change this constant to get miles)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d);
  }

  $scope.sortlastphotos = async function(data = {}) {
    let { coords, country_filter, list = [] } = data;
    const sort_by = $cookieStore.get('sort_by');
    if (list.length) $scope.alluserphotos = list;
    if (!coords && !sort_by && !country_filter) country_filter = $cookieStore.get('country');

    const urlParams = new URLSearchParams(window.location.search);
    // const search = {
    //   lat: coords[0],
    //   lng: coords[1],
    // };
    const search = {};
    if (urlParams.has('lat')) search.lat = Number(urlParams.get('lat'));
    if (urlParams.has('lng')) search.lng = Number(urlParams.get('lng'));
    if (urlParams.has('country')) search.country = urlParams.get('country').toLowerCase();
    if (urlParams.has('city')) search.city = urlParams.get('city').toLowerCase();
    if (urlParams.has('size')) search.size = urlParams.get('size').toLowerCase();
    if (urlParams.has('time')) search.time = urlParams.get('time').toLowerCase();

    if (search.country) country_filter = search.country;

    if (search.time && search.time === 'custom-range' && urlParams.get('from') && urlParams.get('to')) {
      search.from = new Date(urlParams.get('from')).getTime();
      search.to = new Date(urlParams.get('to')).getTime();
    }
    if (urlParams.has('tag')) search.tag = urlParams.get('tag');

    let from; let to = new Date().getTime();
    if (search.time) {
      const filterController = angular.element('#filter-controller').scope();
      const listFilterTime = filterController.listTime;
      const time = listFilterTime.find(e => e.value === search.time);
      if (time && !time.seconds) {
        // anytime
      }
      else
        if (!time && search.time === 'custom-range' && search.from && search.to) {
          to = search.to;
          from = search.from;
        }
        else if (time) {
          to = to;
          from = to - Number(time.seconds) * 1000;
        }

    }

    if (search.time && from && to) $scope.alluserphotos = $scope.alluserphotos.filter(function(userphoto) {
      const createdate = new Date(userphoto.date).getTime();
      if (createdate > from && createdate <= to) return userphoto;

    });

    if (search.lat && search.lng) coords = [search.lat, search.lng];
    else if (sort_by === 'near') coords = $cookieStore.get('coords');

    if (sort_by === 'newest') $scope.alluserphotos = $filter('orderBy')($scope.alluserphotos, '-images.adddate');
    else if (sort_by === 'newest-country' && $cookieStore.get('default_country')) {
      const default_country = $cookieStore.get('default_country').toLowerCase();
      const match = $scope.alluserphotos.filter(e => default_country === e.albumcountry.toLowerCase());
      const not_match = $scope.alluserphotos.filter(e => default_country !== e.albumcountry.toLowerCase());

      $scope.alluserphotos = $filter('orderBy')(match, '-images.adddate');
      // console.log(match)
      $scope.alluserphotos = $scope.alluserphotos.concat(not_match);
    }
    else if (coords) {
      $scope.alluserphotos = $scope.alluserphotos.map(function(userphoto) {
        if (userphoto.lat && userphoto.lng) userphoto.distance = distance(userphoto.lat, userphoto.lng, coords);
        else userphoto.distance = null;
        return userphoto;
      });
      $scope.alluserphotos = $filter('orderBy')($scope.alluserphotos, 'distance');
    }

    if (country_filter && !search.lat && !search.lng && !sort_by) {
      const paramcountry = String(country_filter).toLowerCase();
      const country = constSetting.list_countries.find(function(e) {
        if (e.name.toLowerCase() === paramcountry ||
          e.alpha3code.toLowerCase() === paramcountry ||
          e.alpha2code.toLowerCase() === paramcountry) return e;

      });

      if (country) {
        $scope.myCountry = paramcountry.toUpperCase();
        let match = [];
        let notmatch = [];
        match = $scope.alluserphotos.filter((album) => {
          if (album.albumcountry && Object.values(country).find(e => e.toLowerCase() === album.albumcountry.toLowerCase())) return album;

        });
        notmatch = $scope.alluserphotos.filter((album) => {
          if (!album.albumcountry || !Object.values(country).find(e => e.toLowerCase() === album.albumcountry.toLowerCase())) return album;

        });

        // match = $filter('orderBy')(match, '-images.adddate');
        if (search.city) {
          let allalbums = [];
          let not_allalbums = [];

          allalbums = match.filter((album) => album.albumcity && album.albumcity.toLowerCase() === search.city.toLowerCase());
          not_allalbums = match.filter((album) => !album.albumcity || album.albumcity.toLowerCase() !== search.city.toLowerCase());

          allalbums = $filter('orderBy')(allalbums, '-images.adddate');

          match = allalbums.concat(not_allalbums);
        }

        $scope.alluserphotos = match.concat(notmatch);
      }
    }

    const tagController = angular.element('#tag-controller').scope();
    if (tagController && tagController.allphotos) {
      tagController.allphotos = $scope.alluserphotos || [];
      if (($location.$$path !== '/albums' || $location.$$path.indexOf('mainalbumdetails') === -1) && tagController.gettags) tagController.gettags({ list: tagController.allphotos, country_filter });

    }

    $scope.filteredUserphotos = $scope.alluserphotos.slice($scope.pagination.curPage, $scope.pagination.pageSize);

    $scope.noalbum = false;

  };

  function getTagWithLogo(callback) {
    if (!$scope.tag) {
      return callback();
    }

    $http({
      method: 'GET',
      url: `${myAuth.baseurl}tag/tag-with-logo`,
      params: { tag: $scope.tag }
    }).success(function(data) {
      if (data.type === 'error') {
        console.log(data.msg);
      }
      if (data.type === 'success' && data.logo) {
        $scope.tagPreview = `${$scope.config.ftpFullPath}h200_${data.logo}`;
      }
      callback();
    }).error(function(error) {
      console.log(error);
      callback();
    });
  }

  $scope.getlastphotos = function(country = null) {
    $scope.updating = true;
    $scope.noalbum = true;
    $scope.alluserphotos = [];
    $scope.filteredUserphotos = [];

    const pagination = $scope.pagination;

    const criteria = {
      page: pagination.curPage,
      limit: pagination.pageSize,
      country
    };

    criteria.ts = Date.now();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tag')) criteria.tag = urlParams.get('tag');
    if (urlParams.has('year')) criteria.year = urlParams.get('year');
    if (urlParams.has('month')) criteria.month = urlParams.get('month');
    if (urlParams.has('country')) criteria.country = urlParams.get('country');
    if (urlParams.has('time')) criteria.time = urlParams.get('time');
    if (urlParams.has('from')) criteria.from = urlParams.get('from');
    if (urlParams.has('to')) criteria.to = urlParams.get('to');

    $http({
      method: 'GET',
      url: `${myAuth.baseurl}album/getlastphotos`,
      params: criteria
    }).success(function(data) {
      $('title').html(`Last Photos${PAGE_TITLE_SUFFIX}`);
      let country_filter = $cookieStore.get('country');
      if (data && data.geolocation && data.geolocation.name && data.geolocation.name !== $cookieStore.get('default_country')) {
        $cookieStore.put('default_country', data.geolocation.name.toLowerCase());

        if (!country_filter) country_filter = data.geolocation.name;

      }
      let sort_by;
      // if (!$cookieStore.get('sort_by')) {
      //   sort_by = 'newest-country';
      //   $cookieStore.put('sort_by', 'newest-country');
      // }
      const sizes = [200, 215, 230, 250, 265, 280, 295, 305, 315, 325];
      $scope.alluserphotos = (data.alluserphotos || []).map(function(userphoto) {
        const randomSize = Math.floor(Math.random() * 10);
        userphoto.width = sizes[randomSize];
        userphoto.height = 200;
        userphoto.config = $scope.config;
        return userphoto;
      });

      $scope.pagination.numberOfPages = Math.ceil(data.count / $scope.pagination.pageSize);

      $scope.sortlastphotos({ coords: [$cookieStore.get('lat'), $cookieStore.get('lng')], sort_by, list: $scope.alluserphotos, country_filter });

      getTagWithLogo(() => {
        if (!$scope.tagPreview && $scope.filteredUserphotos.length > 0) {
          const photo = $scope.filteredUserphotos[0];
          $scope.tagPreview = `${$scope.config.ftpFullPath}h200_${photo.images.publicid}.${photo.images.fileExtension}`;
        }
        $scope.countPhotos = data.count;
      });

      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  };

  $rootScope.$on('updated-cords', function() {
    $scope.noalbum = true;
    $scope.getlastphotos();
  });
  if ($scope.noalbum && ($location.$$path !== '/albums' && $location.$$path.indexOf('mainalbumdetails') === -1)) $scope.getlastphotos();

  $rootScope.$on('lastphotos', function(event, data) {
    if (!$scope.noalbum && ($location.$$path !== '/albums' && $location.$$path.indexOf('mainalbumdetails') === -1)) $scope.getlastphotos($cookieStore.get('country') || $cookieStore.get('default_country'));

  });

  $scope.showPage = (page) => {
    $scope.pagination.curPage = page;
    $scope.getlastphotos();
  };

  $scope.$watch('pagination.pageSize', function(newVal, oldVal) {
    if (newVal === oldVal) return;

    $scope.getlastphotos();
  });
};


mycontrollers.headersController = function(configService, $timeout, constSetting, $scope, $http, $routeParams, $location, myAuth, $sce, $filter, $window, $cookieStore, $rootScope) {
  $scope.constSetting = constSetting;
  $scope.myaccount = myAuth.getUserNavlinks();
  const list_currencies = Object.values(constSetting.list_currencies);
  $scope.list_currencies = list_currencies;
  $scope.filter_currencies = Object.values(constSetting.filter_currencies);

  // $rootScope.$broadcast("lastphotos");
  // $rootScope.$broadcast("allmyalbums");

  $scope.emitUpdatePhotos = () => {
    $rootScope.$emit('website-logo-click');
  }

  $scope.sort_by = $cookieStore.get('sort_by');
  // if (!$scope.sort_by) {
  //   $scope.sort_by = 'newest-country';
  //   $cookieStore.put('sort_by', $scope.sort_by);
  // } else $scope.sort_by = $cookieStore.get('sort_by');

  // $scope.countries = ["united states", "united kingdom", "spain", "italy", "mexico", "uruguay", "argentina", "colombia", "canada", "brazil"];
  $scope.countries = [{ name: 'united states', code: 'AR' }, { name: 'united kingdom', code: 'GB' }, { name: 'spain', code: 'ES' }, { name: 'italy', code: 'IT' }, { name: 'mexico', code: 'MX' }, { name: 'uruguay', code: 'UY' },
  { name: 'argentina', code: 'AR' }, { name: 'colombia', code: 'CO' }, { name: 'canada', code: 'CA' }, { name: 'brazil', code: 'BR' }];
  $scope.myCurrency = {
    'symbol': '$',
    'name': 'US Dollar',
    'decimal_digits': 2,
    'rounding': 0,
    'code': 'USD',
    'name_plural': 'US dollars'
  };
  $scope.location = $location;
  $scope.path = '/';

  $scope.changeCurrency = function(code, save) {

    $cookieStore.put('currency', code);
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.selected_currency = code;
        $scope.myCurrency = $scope.constSetting.list_currencies[code];
      });
    }, 100);

    $('.dropdown-currency').text(code);

    if (save && $scope.myaccount && $scope.myaccount.currency !== code) {
      $scope.myaccount.currency = code;
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}changecurrency`,
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function(data) {
        if (data.type !== 'error') {
          $cookieStore.put('users', data.userdata);
          $cookieStore.put('currency', data.userdata.currency || 'USD');
        }
      });
    }
  };

  $scope.sortPhotoAgain = function(data = {}) {
    if ($location.$$path === '/albums' || $location.$$path.indexOf('mainalbumdetails') >= 0) $rootScope.$emit('allmyalbums', data);

    else $rootScope.$emit('lastphotos', data);
  };

  $scope.$watch('selected_currency', function(v) {
    if ($scope.myCurrency && v && v !== $scope.myCurrency.code) $scope.changeCurrency(v);

  });
  $scope.changeSort = function(v) {
    $cookieStore.put('sort_by', v);
    console.log('sort_by', v);
    $scope.sortPhotoAgain({ sort_by: v });
    $rootScope.$emit('lastphotos');
  };

  $scope.$watch('sort_by', function(v) {
    if (v !== $cookieStore.get('sort_by')) $scope.changeSort(v);

  });
  $scope.stringifyPath = function(query) {
    if ($scope.path !== $location.$$path && ($location.$$path === '/' || $location.$$path === '/albums')) $scope.path = $location.$$path;

    const urlParams = new URLSearchParams(window.location.search);
    const search = {};
    // if (urlParams.has('country')) search.country = urlParams.get('country');
    if (urlParams.has('tag')) search.tag = urlParams.get('tag');
    if (query) search.country = query;
    else delete search.country;

    let string = '';
    Object.keys(search).forEach((e, i) => {
      if (i !== 0) string += '&';

      string += `${e}=${search[e]}`;
    });
    if (string) string = `?${string}`;

    return `${$scope.path}${string}`;
  };

  $scope.myCountry = 'Country';

  const urlParams = new URLSearchParams(window.location.search);
  const search = {};

  if (urlParams.has('tag')) search.tag = urlParams.get('tag');
  if ($cookieStore.get('country')) {
    let country = $cookieStore.get('country');
    country = country.toLowerCase();
    if ($scope.countries.find(e => e.name === country)) $scope.myCountry = country.toUpperCase();

  }
  const currency = $cookieStore.get('currency');
  if (currency && constSetting.list_currencies[currency]) $scope.changeCurrency(currency);

  $scope.changeCountry = function(value) {
    if (!value) {
      value = 'country';
      $cookieStore.put('country', '');
      if ($cookieStore.get('default_country')) {
        console.log('default country');
        $scope.sortPhotoAgain({country: $cookieStore.get('default_country')});
      }
    }
    else {
      $cookieStore.put('country', value);
      console.log('changeCountry', value);
      $scope.sortPhotoAgain({ country_filter: value });
    }
    $cookieStore.remove('sort_by');
    $scope.myCountry = (value).toUpperCase();
    $('#select-country').text($scope.myCountry);
    $('#flag-selected-country').attr('src', `../img/flag-${$scope.myCountry.toLowerCase().trim().replace(' ', '-')}.svg`);
  };

  $('#select-country').text($scope.myCountry);
  $('#flag-selected-country').attr('src', `../img/flag-${$scope.myCountry.toLowerCase().trim().replace(' ', '-')}.svg`);

  $scope.saveCoord = async function(coords) {
    await $cookieStore.put('coords', coords);
  };
  $scope.getCoord = function(flag) {
    if ('geolocation' in navigator) navigator.geolocation.getCurrentPosition(
      async function success(position) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({
          'latLng': new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK && !flag) {
            if (results[0]) {
              const address_components = results[0].address_components;
              const country = address_components.find(e => e.types.find(i => i === 'country'));

              if (country) {
                const code = $scope.countries.find(e => e.code.toLowerCase() === country.short_name.toLowerCase());

                if (code && code.name && code.code && !$cookieStore.get('country')) $scope.changeCountry(code.name);

                const coordsExists = $cookieStore.get('lat') !== undefined && $cookieStore.get('lng') !== undefined;

                $cookieStore.put('default_country', country.long_name);
                $cookieStore.put('lng', results[0].geometry.location.lng());
                $cookieStore.put('lat', results[0].geometry.location.lat());
                if (!$cookieStore.get('country')) $cookieStore.put('country', country.long_name);
                if (!coordsExists) $rootScope.$emit('updated-cords');
              }
            } else {
              console.log('No results found');
            }
          }
          else {
            $cookieStore.remove('lng');
            $cookieStore.remove('lat');
            $cookieStore.remove('country');
            console.log(`Geocoder failed due to: ${status}`);
          }
        });
        $scope.saveCoord([position.coords.latitude, position.coords.longitude]);
      },
      function error(error_message) {
        console.error('An error has occured while retrievinglocation', error_message);
      });
    else {
      console.log('geolocation is not enabled on this browser');
    }
  };

  $scope.getIP = function() {
    $http({
      method: 'get',
      url: `${myAuth.baseurl}ip`
    }).success(function(res) {
      if (res.type === 'success') {
        const data = res.data;
        const json = data.country;
        let countryCode = json.code;
        if (!countryCode) countryCode = data.name;

        if (countryCode) {
          const old = $cookieStore.get('default_country');
          const list_countries = constSetting.list_countries;
          const find = list_countries.find(e => e.alpha2code.toLowerCase() === countryCode.toLowerCase());
          if (find && find.name !== old) {
            $cookieStore.put('default_country', find.name);
            const code = $scope.countries.find(e => e.code.toLowerCase() === countryCode.toLowerCase());
            if (code && code.name && code.code && !$cookieStore.get('country')) $scope.changeCountry(code.name);
          }
        }

        let currency = $cookieStore.get('currency');

        if ($scope.loggedindetails && $scope.loggedindetails.currency) currency = $scope.loggedindetails.currency;

        if (!currency && json.currency && json.currency.currencyCode) {
          currency = json.currency.currencyCode;
          $cookieStore.put('currency', currency);

          if (!constSetting.filter_currencies[currency] && currency) $scope.filter_currencies = [constSetting.list_currencies[currency]].concat($scope.filter_currencies);

        }
        if (!constSetting.filter_currencies[currency] && currency) $scope.filter_currencies = [constSetting.list_currencies[currency]].concat($scope.filter_currencies);

        if (!currency) currency = 'USD';
        if (currency) $scope.changeCurrency(currency);

        if (json.geo) {
          const coords = Object.values(json.geo);
          $scope.saveCoord(coords);
        }

        $scope.getCoord();
      }
      else $scope.getCoord();

    })
      .error(function() {
        $scope.getCoord();
      });
  };
};

photographerApp.controller(mycontrollers);
