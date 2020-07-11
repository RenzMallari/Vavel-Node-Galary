(function() {

  angular.module("photographer").controller('mainalbumdetailsController', mainalbumdetailsController);

  function mainalbumdetailsController(localService, constSetting, configService, $scope, paymentService, $cookieStore, $http, $location, $routeParams, myAuth) {
    $scope.config = configService;
    $scope.list_countries = constSetting.list_countries;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    if (!$scope.loggedindetails) {
      $scope.loggedindetails = localService.createLocalUser();
    }
    // $scope.loggedindetails.currency = $scope.loggedindetails.currency || 'USD';
    $scope.list_currencies = constSetting.list_currencies;

    //  currency and symbol
    if ($scope.loggedindetails && $scope.loggedindetails.symbol) $scope.loggedindetails.symbol = $scope.loggedindetails.symbol;
    if ($scope.loggedindetails.currency && $scope.list_currencies && $scope.list_currencies[$scope.loggedindetails.currency] && $scope.list_currencies[$scope.loggedindetails.currency].symbol) {
      $scope.loggedindetails.symbol = $scope.list_currencies[$scope.loggedindetails.currency].symbol
    }

    $scope.getCurrency = constSetting.getCurrency

    $scope.albumdetls = {};
    $scope.user = {};
    $scope.albumpayment = {};
    $scope.albumpayment.albumid = $routeParams.id;
    $scope.convert = constSetting.convert;
    $scope.pagination = {};
    $scope.pagination.curPage = 0;
    $scope.pagination.pageSize = 30;
    $scope.pagination.numberOfPages = 0;
    $scope.pagination.pageSizeList = [30, 50, 60, 80, 100];

    $scope.payment = {};
    $scope.payment.phonenumber = '+91-';
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
      paymentService.createTransaction($scope.price, $scope.loggedindetails._id, $scope.localUserId,
        { type: 'album', albumid: $scope.albumpayment.albumid })
        .then(function(res) {
          console.log('createTransaction success: ', res);
          setTimeout(function() {
            window.location.href = '/downloads';

            $scope.$apply(function() {
              $scope.paying = false;
            });
          }, 1000);
        })
        .catch(function(err) {
          console.log('createTransaction error: ', err);
          $scope.$apply(function() {
            $scope.registrationError = true;
            $scope.alert = myAuth.addAlert('danger', err.message || 'Something went wrong');
            $scope.paying = false;
          });
        });
    };
    // END INIT BRAINTREE

    $scope.showDetails = function(galleryid, imageid) {
      $location.path("/details/" + galleryid + '/' + imageid);
    }

    $scope.getallmyalbumdetails = function() {
      $scope.noalbumimage = true;
      $http({
        method: "GET",
        url: myAuth.baseurl + "album/getalbumdetails/" + $routeParams.id
      }).success(function(data) {
        if (data.type == 'success') {
          $scope.logintogetlicense = true;
          if ($scope.loggedindetails) {
            if ($scope.loggedindetails._id == data.usrdetls._id) {
              $scope.logintogetlicense = false;
            }
          }
          $scope.price = data.albumprice;

          $scope.albumname = data.albumname;
          $scope.noofphotos = data.msg.length;
          $scope.albumphotos = data.msg.map(function(photo) {
            photo.width = photo.imagewidth;
            photo.height = photo.imageheight;
            photo.src = 'https://stock.vavel.com/s/photoImages/bunch/h200_' + photo.publicid + '.' + photo.fileExtension;
            return photo;
          });
          $scope.albmid = $routeParams.id;

          $scope.usrdetls = data.usrdetls

          // if ($scope.loggedindetails && $scope.logintogetlicense) {
          //   if (!$scope.usrdetls.paypalemail) {
          //     $scope.logintogetlicense = false;
          //   }
          // }

          if (data.msg.length > 0) {
            $scope.noalbumimage = true;
          } else {
            $scope.noalbumimage = false;
          }

          // Set title
          $('title').html(PAGE_TITLE);

          if ($scope.albumname) {
            $('title').html($scope.albumname + PAGE_TITLE_SUFFIX);
          }
        } else {
          $location.path("/albums");
        }
        $scope.albumphotos = $scope.albumphotos || []
        $scope.filteredAlbumPhotos = $scope.albumphotos.slice(0, $scope.pagination.pageSize);
        $scope.pagination.numberOfPages = Math.ceil($scope.albumphotos.length / $scope.pagination.pageSize);
      });
    }
    $scope.getallmyalbumdetails();

    $scope.$watch('pagination.curPage + pagination.pageSize', function() {
      var begin = ($scope.pagination.curPage * $scope.pagination.pageSize)
        , end = begin + $scope.pagination.pageSize;
      if ($scope.albumphotos) {
        $scope.filteredAlbumPhotos = $scope.albumphotos.slice(begin, end);
        $scope.pagination.numberOfPages = Math.ceil($scope.albumphotos.length / $scope.pagination.pageSize);
      }
      if ($scope.pagination.curPage > $scope.pagination.numberOfPages - 1) {
        $scope.pagination.curPage = 0;
      }
    });

    $scope.open_selectpricemodal = function(galleryid, photo) {
      if ($scope.loggedindetails) {
        $('#myModal-selectprice').modal('toggle');
        $scope.albumdetls.collectiongalleryid = galleryid;
        $scope.albumdetls.photopublicid = photo.publicid;
        $scope.selectedImage = photo;


        // Price
        $scope.defaultPrice = constSetting.defaultPrice()

        var imagewidth = photo.imagewidth;
        var imageheight = photo.imageheight;
        var imagedetails = [];
        var replaceimagedetails;
        var price = (photo.price == null) ? {} : photo.price;
        var imagePrice = {
          small: price.small ? parseInt(price.small) : 0,
          medium: price.medium ? parseInt(price.medium) : 0,
          large: price.large ? parseInt(price.large) : 0
        };

        if ((parseInt(imagewidth) >= 1600) || (parseInt(imageheight) >= 1200) || (parseInt(imageheight) >= 1600) || (parseInt(imagewidth) >= 1200)) {
          var largewidth = parseInt(imagewidth);
          var largeheight = parseInt(imageheight);
          var largedpi = 300;
          var largeinch = parseFloat(largewidth / largedpi).toFixed(1) + '\" X ' + parseFloat(largeheight / largedpi).toFixed(1) + '\"';
          var largedetails = {
            'width': largewidth,
            'height': largeheight,
            'dpi': largedpi,
            'inch': largeinch,
            'type': 'large',
            'price': imagePrice.large || $scope.defaultPrice.large,
            'ischecked': true
          };
          replaceimagedetails = largedetails;

          var mediumwidth = parseInt(largewidth / 2);
          var mediumheight = parseInt(largeheight / 2);
          var mediumdpi = 300;
          var mediuminch = parseFloat(mediumwidth / mediumdpi).toFixed(1) + '\" X ' + parseFloat(mediumheight / mediumdpi).toFixed(1) + '\"';
          var mediumdetails = {
            'width': mediumwidth,
            'height': mediumheight,
            'dpi': mediumdpi,
            'inch': mediuminch,
            'type': 'medium',
            'price': imagePrice.medium || $scope.defaultPrice.medium,
            'ischecked': false
          };



          var smallwidth = parseInt(mediumwidth / 2);
          var smallheight = parseInt(mediumheight / 2);
          var smalldpi = 72;
          var smallinch = parseFloat(smallwidth / smalldpi).toFixed(1) + '\" X ' + parseFloat(smallheight / smalldpi).toFixed(1) + '\"';
          var smalldetails = {
            'width': smallwidth,
            'height': smallheight,
            'dpi': smalldpi,
            'inch': smallinch,
            'type': 'small',
            'price': imagePrice.small || $scope.defaultPrice.small,
            'ischecked': false
          };
          imagedetails.push(smalldetails);
          imagedetails.push(mediumdetails);
          imagedetails.push(largedetails);
        } else if ((imagewidth >= 1024 && imagewidth < 1600) || (imageheight >= 768 && imageheight < 1200) || (imageheight >= 1024 && imageheight < 1600) || (imagewidth >= 768 && imagewidth < 1200)) {
          var mediumwidth = parseInt(imagewidth);
          var mediumheight = parseInt(imageheight);
          var mediumdpi = 300;
          var mediuminch = parseFloat(mediumwidth / mediumdpi).toFixed(1) + '\" X ' + parseFloat(mediumheight / mediumdpi).toFixed(1) + '\"';
          var mediumdetails = {
            'width': mediumwidth,
            'height': mediumheight,
            'dpi': mediumdpi,
            'inch': mediuminch,
            'type': 'medium',
            'price': imagePrice.medium || $scope.defaultPrice.medium,
            'ischecked': true
          };
          replaceimagedetails = mediumdetails;


          var smallwidth = parseInt(mediumwidth / 2);
          var smallheight = parseInt(mediumheight / 2);
          var smalldpi = 72;
          var smallinch = parseFloat(smallwidth / smalldpi).toFixed(1) + '\" X ' + parseFloat(smallheight / smalldpi).toFixed(1) + '\"';
          var smalldetails = {
            'width': smallwidth,
            'height': smallheight,
            'dpi': smalldpi,
            'inch': smallinch,
            'type': 'small',
            'price': imagePrice.small || $scope.defaultPrice.small,
            'ischecked': false
          };
          imagedetails.push(smalldetails);
          imagedetails.push(mediumdetails);
        } else {

          var smallwidth = parseInt(imagewidth);
          var smallheight = parseInt(imageheight);
          var smalldpi = 72;
          var smallinch = parseFloat(smallwidth / smalldpi).toFixed(1) + '\" X ' + parseFloat(smallheight / smalldpi).toFixed(1) + '\"';
          var smalldetails = {
            'width': smallwidth,
            'height': smallheight,
            'dpi': smalldpi,
            'inch': smallinch,
            'type': 'small',
            'price': imagePrice.small || $scope.defaultPrice.small,
            'ischecked': true
          };
          replaceimagedetails = smalldetails;
          imagedetails.push(smalldetails);

        }
        $scope.imagedetails = imagedetails;
        $scope.replaceimagedetails = replaceimagedetails;



      } else {
        $('#myModal-login').modal('toggle');
      }
    }
    $scope.open_addtocartmodal = async function() {
      if (!$scope.imageDetailSelected) {
        return;
      }
      if (!$scope.loggedindetails) {
        $('#myModal-selectprice').modal('hide');
        $('#myModal-addtocart').modal('toggle');
        return;
      }



      var imagewidth = $scope.imageDetailSelected.width;
      var imageheight = $scope.imageDetailSelected.height;
      var imagedpi = $scope.imageDetailSelected.dpi;
      var imageprice = $scope.imageDetailSelected.price;
      var imagetype = $scope.imageDetailSelected.type;

      var downloadlink = myAuth.cloudinary_image_base_path + 'w_' + imagewidth + ',h_' + imageheight + '/' + $scope.selectedImage.publicid;
      /*------------------------------*/
      $scope.payment.imagetype = imagetype;
      $scope.payment.imageprice = imageprice;
      $scope.payment.downloadlink = downloadlink;
      const res = await $http({
        method: "GET",
        url: myAuth.baseurl + "checkusersubscriptionstatus/" + $scope.loggedindetails._id,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.subscription_exist == 1) {
        $scope.payment.galleryid = $routeParams.id;
        $scope.payment.imageid = $scope.selectedImage.publicid;

        $scope.payment.payerid = $scope.loggedindetails._id;
        $scope.paytogetlicense = false;
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.waitmessage = true;
            $scope.alert = myAuth.addAlert('success', 'Please wait. Processing...');
          });
        }, 500);
        const res = await $http({
          method: "POST",
          url: myAuth.baseurl + "gallery/subscriptiondownload",
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.data.type == 'success') {
          $scope.alert = myAuth.addAlert('success', res.data.msg);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.waitmessage = false;
              $scope.paytogetlicense = true;
              document.getElementById("forcedownloadlink").href = $scope.payment.downloadlink;
              document.getElementById("forcedownloadlink").click();
              $scope.payment.downloadlink = '';
              document.getElementById("forcedownloadlink").href = 'javascript:void(0);';
            });
          }, 3000);
        } else {
          $scope.alert = myAuth.addAlert('danger', res.data.msg);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.waitmessage = false;
              $scope.paytogetlicense = true;
            });
          }, 3000);
        }
      } else {
        $('#myModal-selectprice').modal('hide');
        $('#myModal-addtocart').modal('toggle');
      }
    }
    $scope.signup = function(callback) {
      var dataObj = {
        "firstname": $scope.user.firstname,
        "lastname": $scope.user.lastname,
        "country": $scope.user.country,
        "email": $scope.user.email,
        "password": $scope.user.password,
        "usertype": 'buyer'
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "registration",
        data: dataObj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.type == "error") {
          $scope.paying = false;
          $scope.registrationError = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
        } else if (data.type == "validate") {
          $scope.paying = false;
          $scope.registrationError = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
        } else {
          $cookieStore.put('users', data.msg);
          $scope.localUserId = $scope.loggedindetails._id;
          $scope.loggedindetails = data.msg;
          $scope.loggedindetails.loginstatus = true;
          callback();

        }
      });
    }

    $scope.addtocart = function(imageprice, final) {
      if (!$scope.imageDetailSelected) {
        return;
      }

      if ($scope.addingToCart) {
        return;
      }

      $scope.addingToCart = true;
      $scope.$root.cartUpdating = true;
      var imagewidth = $scope.imageDetailSelected.width;
      var imageheight = $scope.imageDetailSelected.height;
      var downloadlink = myAuth.cloudinary_image_base_path + 'w_' + imagewidth + ',h_' + imageheight + '/' + $scope.selectedImage.publicid;

      $scope.payment.imagetype = $scope.imageDetailSelected.type;
      $scope.payment.imagewidth = imagewidth;
      $scope.payment.imageheight = imageheight;
      $scope.payment.imagedpi = $scope.imageDetailSelected.dpi;
      $scope.payment.downloadlink = downloadlink;
      $scope.payment.price = $scope.imageDetailSelected.price;
      $scope.payment.galleryid = $routeParams.id;

      $scope.payment.imageid = $scope.selectedImage.publicid;
      $scope.payment.buyer_id = $scope.loggedindetails._id;
      // $('#myModal-price').modal('toggle');
      // $scope.addingToCart = false;
      $scope.paybycardmessage = true;
      $scope.$root.cartcount = $scope.$root.cartcount + 1;

      $http({
        method: "POST",
        url: myAuth.baseurl + "gallery/getseller_id",
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        console.log('addtocart gallery/getseller_id', data)

        $scope.payment.seller_id = data.msg;
        $scope.payment.type = data.type;
        $http({
          method: "POST",
          url: myAuth.baseurl + "gallery/addtocart",
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          console.log('addtocart gallery/addtocart', data)
          if (data.type == 'success') {
            if (final) {
              setTimeout(function() {
                window.location.href = '/checkout';
                // if (!$scope.loggedindetails || !$scope.loggedindetails.loginstatus) {
                //     $('#mymodal-payment').modal('toggle', {backdrop: 'static', keyboard: false});
                // }
                // else {
                //     window.location.href = '/checkout';
                // }
              }, 1000);
            }
            $('#myModal-addtocart').modal('hide');
            // $('#myModal-price').modal('toggle');
            $scope.$root.cartUpdating = false;
            $scope.addingToCart = false;
            $scope.paybycardmessage = true;
          }
          else {
            $scope.addingToCart = false;
            $scope.paybycardmessage = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.paybycardmessage = false;
              });
            }, 3000);

          }
        });
      });


    }
    $scope.checkImageDetail = function(imageDetail) {
      $scope.imageDetailSelected = imageDetail;
    };
    $scope.open_collectionmodal = function(galleryid, photopublicid) {
      // console.log(galleryid)
      if ($scope.loggedindetails) {
        $('#myModal-selectprice').modal('hide');
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
        'collectionname': $scope.albumdetls.collectionname
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
    $scope.showModalLogin = function() {
      $('#myModal-login').modal('show');
      $('#mymodal-payment').modal('hide');
    }
    $scope.showPricemodal = function(album_name, price, symbol) {
      if ($scope.loggedindetails) {
        $('#myModal-price').modal('toggle');
        $scope.albumpayment.selectedplanname = album_name;
        $scope.albumpayment.selectedprice = price;
        $scope.albumpayment.selectedsymboly = symbol;
        $scope.albumpayment.phonenumber = '+91-';
      } else {
        $('#mymodal-payment').modal('show');
      }
    }

    $scope.payforalbum = function() {
      if ($scope.loggedindetails) {
        $scope.albumpayment.payerid = $scope.loggedindetails._id;
        $scope.loaderimg = true;
        $scope.alert = myAuth.addAlert('success', 'Contacting with Bank, Please wait, will late some seconds');
        $http({
          method: "POST",
          url: myAuth.baseurl + "album/payment",
          data: $scope.albumpayment,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {

          if (data.type == 'success') {
            $scope.loaderimg = false;
            $scope.alert = myAuth.addAlert('success', data.msg);
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.paybycardmessage = false;
                $('#myModal-price').modal('toggle');
                window.location.href = '/downloads';
                window.location.reload();
              });
            }, 3000);
          } else {
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
    }

    $scope.payforalbum_paypal = function() {
      if ($scope.loggedindetails) {
        $scope.albumpayment.payerid = $scope.loggedindetails._id;
        $scope.loaderimg = true;
        $scope.alert = myAuth.addAlert('success', 'Redirecting to Paypal, Please wait, will late some seconds');
        $http({
          method: "POST",
          url: myAuth.baseurl + "album/payment_paypal",
          data: $scope.albumpayment,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {

          if (data.type == 'success') {
            window.location = data.url;
          } else {
            alert('Error: Payment not done! try again.');
          }
        });
      }
    }
  }
})();
