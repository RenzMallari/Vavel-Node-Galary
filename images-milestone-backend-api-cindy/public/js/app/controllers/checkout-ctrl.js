(function() {

  angular.module('photographer').controller('checkoutController', checkoutController);

  function checkoutController(configService, constSetting, localService, paymentService, $cookieStore, $scope, $http, $routeParams, $location, myAuth, $sce, recaptchaService) {
    $scope.config = configService;
    $scope.list_countries = constSetting.list_countries;
    $scope.user = {};
    $scope.myaccount = myAuth.getUserNavlinks();
    $scope.loggedindetails = myAuth.getUserNavlinks();
    if (!$scope.loggedindetails) $scope.loggedindetails = localService.createLocalUser();
    $scope.recaptchaPublicKey = recaptchaService.getPublicKey();

    $scope.convert = constSetting.convert;

    $scope.list_currencies = constSetting.list_currencies;

    //  currency and symbol
    if ($scope.loggedindetails && $scope.loggedindetails.symbol) $scope.loggedindetails.symbol = $scope.loggedindetails.symbol;
    if ($scope.loggedindetails.currency && $scope.list_currencies && $scope.list_currencies[$scope.loggedindetails.currency] && $scope.list_currencies[$scope.loggedindetails.currency].symbol) $scope.loggedindetails.symbol = $scope.list_currencies[$scope.loggedindetails.currency].symbol;

    //  currency and symbol
    $scope.getCurrency = constSetting.getCurrency;

    $('title').html(`Checkout${PAGE_TITLE_SUFFIX}`);

    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    // INIT BRAINTREE
    paymentService.init();
    $scope.payNow = function() {
      $scope.registrationError = false;
      $scope.paying = true;
      // Create account before purchase
      if (!$scope.loggedindetails.loginstatus) {
        $scope.signup($scope.payNow);
        return;
      }

      // Start payment
      paymentService.createTransaction($scope.totalAmount, $scope.loggedindetails._id,
        $scope.localUserId)
        .then(function(res) {
          console.log('payNow argssss: ', res);
          // $('#mymodal-payment').modal('toggle');
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.paying = false;
            });
            window.location.href = '/downloads';
          }, 1000);
        }, function(err) {
          // $('#mymodal-payment').modal('toggle');
          // alert(err.message);
          $scope.$apply(function() {
            $scope.paying = false;
            $scope.registrationError = true;
            $scope.alert = myAuth.addAlert('danger', err.message || 'Something went wrong');
          });
          console.log(err);
        });
    };
    // END INIT BRAINTREE
    $scope.getallcarts = function() {
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}album/getcarts/${$scope.loggedindetails._id}`
      }).success(function(data) {
        $scope.allcarts = data.carts;
        $scope.$root.cartcount = data.carts.length;
        $scope.totalAmount = _.sumBy($scope.allcarts, function(o) { return Number(o.price); });
      });
    };

    $scope.getallcarts();
    $scope.showModalLogin = function() {
      $('#myModal-login').modal('show');
      $('#mymodal-payment').modal('hide');
    };
    $scope.removecart = function(allalbum) {
      if (allalbum.removing) return;

      allalbum.removing = true;
      $scope.myaccount = myAuth.getUserNavlinks();
      // $scope.loggedindetails = myAuth.getUserNavlinks();
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}album/deletecart/${$scope.loggedindetails._id}/${allalbum._id}/${allalbum.price}`
      }).success(function(data) {
        allalbum.removing = false;
        $scope.getallcarts();
      });
    };

    $scope.payforcart_paypal = function() {
      if ($scope.paying) return;

      $scope.paying = true;
      if ($scope.loggedindetails) {
        $scope.paybycardmessage = true;
        $scope.loaderimg = true;
        $scope.alert = myAuth.addAlert('success', 'Redirecting to Paypal, Please wait, will late some seconds');
        // console.log('requesting to: ' + myAuth.baseurl + "gallery/cart_payment_paypal/" + $scope.loggedindetails._id);
        $http({
          method: 'GET',
          url: `${myAuth.baseurl}gallery/cart_payment_paypal/${$scope.loggedindetails._id}`
        }).success(function(data) {
          $scope.paying = false;
          if (data.type == 'success') window.location = data.url;
          else alert('Error: Payment not done! try again.');

        });
      }
    };

    $scope.openPaymentModal = function() {
      // if ($scope.loggedindetails.loginstatus) {
      //   $scope.getPaymentUrl($scope.loggedindetails);
      //   return;
      // }
      $('#mymodal-payment').modal('toggle');
    };

    $scope.signup = function(callback) {
      const recaptchaResponse = recaptchaService.getResponse();

      if (!recaptchaResponse) {
        $scope.paying = false;
        $scope.registrationError = true;
        $scope.alert = myAuth.addAlert('danger', 'Please fill captcha to sign up');
        return;
      }

      const dataObj = {
        'firstname': $scope.user.firstname,
        'lastname': $scope.user.lastname,
        'country': $scope.user.country,
        'email': $scope.user.email,
        'password': $scope.user.password,
        'g-recaptcha-response': recaptchaResponse,
        'usertype': 'buyer'
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}registration`,
        data: dataObj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type == 'error') {
          $scope.paying = false;
          $scope.registrationError = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          recaptchaService.reload();
        } else if (data.type == 'validate') {
          $scope.paying = false;
          $scope.registrationError = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          recaptchaService.reload();
        } else {
          $cookieStore.put('users', data.msg);
          $scope.localUserId = $scope.loggedindetails._id;
          $scope.loggedindetails = data.msg;
          $scope.loggedindetails.loginstatus = true;
          callback();
        }
      });
    };

    $scope.getPaymentUrl = function(user) {
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/cart_payment_paypal/${user._id}`,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(res) {
          if (res.data.type == 'success') window.location = res.data.url;
          else alert('Error: Payment not done! try again.');

        });
    };

    $scope.pay_cart = function() {

      if ($scope.loggedindetails) {
        $scope.paybycardmessage = true;
        $scope.loaderimg = true;
        $scope.alert = myAuth.addAlert('success', 'Contacting with Bank, Please wait, will late some seconds');
        $scope.payment.galleryid = $routeParams.galleryid;
        $scope.payment.imageid = $routeParams.id;
        $scope.payment.payerid = $scope.loggedindetails._id;
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/cart_payment`,
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == 'success') {
            $scope.payment.cardnumber = '';
            $scope.payment.expirydate = '';
            $scope.payment.cvcnumber = '';
            $scope.payment.phonenumber = '+91-';
            $scope.paybycardmessage = true;
            $scope.loaderimg = false;
            $scope.alert = myAuth.addAlert('success', data.msg);

            $location.path('/downloads');
          } else {
            $scope.payment.cardnumber = '';
            $scope.payment.expirydate = '';
            $scope.payment.cvcnumber = '';
            $scope.payment.phonenumber = '+91-';
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

  }
})();
