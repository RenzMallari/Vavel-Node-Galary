(function () {

  angular.module("photographer").controller('settingsController', settingsController);

  function settingsController(constSetting, configService, $scope, $http, myAuth, $location, $cookies, $cookieStore) {
    $scope.config = configService;
    $scope.myaccount = myAuth.getUserNavlinks();
    $scope.loggedindetails = myAuth.getUserNavlinks();
    
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
    $scope.list_currencies = Object.values(constSetting.list_currencies)
    // Set title
    $('title').html('Settings' + PAGE_TITLE_SUFFIX);

    $scope.isloggedin = false;
    if ($scope.loggedindetails && $scope.loggedindetails._id) {
      $scope.isloggedin = true;
    } else {

      
    }

    $scope.openedit = function () {
      $scope.editActive = true;
    }

    $scope.closeedit = function () {
      $scope.editActive = false;
    }

    $scope.openpassedit = function () {
      $scope.editpassActive = true;
    }

    $scope.closepassedit = function () {
      $scope.editpassActive = false;
    }

    $scope.openuseredit = function () {
      $scope.edituserActive = true;
    }

    $scope.closeuseredit = function () {
      $scope.edituserActive = false;
    }

    $scope.openbioedit = function () {
      $scope.editbioActive = true;
    }

    $scope.closebioedit = function () {
      $scope.editbioActive = false;
    }

    $scope.openpaypaledit = function () {
      $scope.editpaypalActive = true;
    }
    $scope.closepaypaledit = function () {
      $scope.editpaypalActive = false;
    }
    $scope.closecurrencyedit = function () {
      $scope.editcurrencyActive = false;
    }
    $scope.opencurrencyedit = function () {
      $scope.editcurrencyActive = true;
    }

    $scope.changeCurrency = function () {

      $scope.updatingcurrency = true;

      $http({
        method: "POST",
        url: myAuth.baseurl + "changecurrency",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.currencyupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.currencyupdateSuccess = false;
              $scope.updatingcurrency = false;
            });
          }, 3000);
        }
        else {
          $scope.currencyupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          $cookieStore.put('users', data.userdata);
          $cookieStore.put('currency', data.userdata.currency || 'USD');
          setTimeout(function () {
            $scope.$apply(function () {
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              $scope.currencyupdateSuccess = false;
              $scope.editcurrencyActive = false;
              $scope.myaccount = $scope.myaccount || {}
              $scope.myaccount.currency = data.userdata.currency;
              $scope.updatingcurrency = false;
            });
          }, 3000);
        }
      }).catch(err => {
        $scope.currencyupdateSuccess = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.currencyupdateSuccess = false;
            $scope.updatingcurrency = false;
          });
        }, 3000);
      });
    }
    $scope.changePassword = function () {
      $scope.updatingpassword = true;
      $http({
        method: "POST",
        url: myAuth.baseurl + "changepassword",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.passwordupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.passwordupdateSuccess = false;
              $scope.updatingpassword = false;
            });
          }, 3000);
        }
        else {
          $scope.passwordupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.passwordupdateSuccess = false;
              $scope.editpassActive = false;
              $scope.myaccount.oldpassword = "";
              $scope.myaccount.newpassword = "";
              $scope.myaccount.newpasswordconfirmation = "";
              $scope.updatingpassword = false;
            });
          }, 3000);
        }
      }).catch(err => {
        $scope.alert = myAuth.addAlert('danger', err.message);
        $scope.passwordupdateSuccess = true;
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.passwordupdateSuccess = false;
            $scope.updatingpassword = false;
          });
        }, 3000);
      });
    }

    $scope.changeEmail = function () {
      $scope.updatingemail = true;
      $http({
        method: "POST",
        url: myAuth.baseurl + "changeemail",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.emailupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.emailupdateSuccess = false;
              $scope.updatingemail = false;
            });
          }, 3000);
        }
        else {
          $scope.emailupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          $cookieStore.put('users', data.userdata);
          setTimeout(function () {
            $scope.$apply(function () {
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              $scope.emailupdateSuccess = false;
              $scope.editActive = false;
              $scope.updatingemail = false;
            });
          }, 3000);
        }
      }).catch(err => {
        $scope.emailupdateSuccess = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.emailupdateSuccess = false;
            $scope.updatingemail = false;
          });
        }, 3000);
      })
    }

    $scope.changeUsername = function () {
      $scope.updatingusername = true;
      $http({
        method: "POST",
        url: myAuth.baseurl + "changeusername",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.usernameupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.usernameupdateSuccess = false;
              $scope.updatingusername = false;
            });
          }, 3000);
        }
        else {
          $scope.usernameupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          $cookieStore.put('users', data.userdata);
          setTimeout(function () {
            $scope.$apply(function () {
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              // console.log($scope.loggedindetails)
              $scope.usernameupdateSuccess = false;
              $scope.edituserActive = false;
              $scope.updatingusername = false;

            });
          }, 3000);
        }
      }).catch(err => {
        $scope.usernameupdateSuccess = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.usernameupdateSuccess = false;
            $scope.updatingusername = false;
          });
        }, 3000);
      })
    }

    $scope.changeBio = function () {
      $scope.updatingbio = true;
      $http({
        method: "POST",
        url: myAuth.baseurl + "changebio",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.bioupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.bioupdateSuccess = false;
              $scope.updatingbio = false;
            });
          }, 3000);
        }
        else {
          $scope.bioupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          $cookieStore.put('users', data.userdata);
          setTimeout(function () {
            $scope.$apply(function () {
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              $scope.bioupdateSuccess = false;
              $scope.editbioActive = false;
              $scope.updatingbio = false;
            });
          }, 3000);
        }
      }).catch(err => {
        $scope.bioupdateSuccess = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.bioupdateSuccess = false;
            $scope.updatingbio = false;
          });
        }, 3000);
      })
    }

    $scope.changePaypal = function () {

      $scope.updatingpaypal = true;

      $http({
        method: "POST",
        url: myAuth.baseurl + "changepaypal",
        data: $.param($scope.myaccount),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).success(function (data) {
        if (data.type == "error") {
          $scope.paypalupdateSuccess = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function () {
            $scope.$apply(function () {
              $scope.paypalupdateSuccess = false;
              $scope.updatingpaypal = false;
            });
          }, 3000);
        }
        else {
          $scope.paypalupdateSuccess = true;
          $scope.alert = myAuth.addAlert('success', data.msg);
          $cookieStore.put('users', data.userdata);
          setTimeout(function () {
            $scope.$apply(function () {
              myAuth.updateUserinfo(myAuth.getUserAuthorisation());
              $scope.loggedindetails = myAuth.getUserNavlinks();
              $scope.paypalupdateSuccess = false;
              $scope.editpaypalActive = false;
              $scope.myaccount = $scope.myaccount || {}
              $scope.myaccount.paypalemail = data.userdata.paypalemail;
              $scope.updatingpaypal = false;
            });
          }, 3000);
        }
      }).catch(err => {
        $scope.paypalupdateSuccess = true;
        $scope.alert = myAuth.addAlert('danger', err.message);
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.paypalupdateSuccess = false;
            $scope.updatingpaypal = false;
          });
        }, 3000);
      })
    }

    //$.cloudinary.config().upload_preset
    $scope.widget = $(".cloudinary_fileupload")
      .unsigned_cloudinary_upload(myAuth.cloudinary_upload_preset, { tags: 'myphotoalbum', context: 'photo=' }, {
        dropZone: "#direct_upload",
        start: function (e) {
          $scope.status = "Starting upload...";
          $scope.$apply();
        },
        fail: function (e, data) {
          $scope.status = "Upload failed";
          $scope.$apply();
        }
      })
      .on("cloudinaryprogressall", function (e, data) {
        $scope.filruploadSuccess = true;
        $scope.progress = Math.round((data.loaded * 100.0) / data.total);
        $scope.status = "Uploading... " + $scope.progress + "%";
        $scope.$apply();
      })
      .on("cloudinarydone", function (e, data) {
        $scope.filruploadSuccess = false;
        $scope.status = "Image uploaded successfully";
        $scope.myaccount.image = data.result.public_id;

        $http({
          method: "POST",
          url: myAuth.baseurl + "changeprofileimage",
          data: $.param($scope.myaccount),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
          $('#myModal-fileupload').modal('toggle');
          if (data.type == "error") {
            $scope.userfileupdateSuccess = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function () {
              $scope.$apply(function () {
                $scope.userfileupdateSuccess = false;
              });
            }, 3000);
          }
          else {
            $scope.userfileupdateSuccess = true;
            $scope.alert = myAuth.addAlert('success', data.msg);
            $cookieStore.put('users', data.userdata);
            setTimeout(function () {
              $scope.$apply(function () {
                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                $scope.loggedindetails = myAuth.getUserNavlinks();
                $scope.userfileupdateSuccess = false;
              });
            }, 3000);
          }
        });
      });

    $scope.widget = $(".cloudinary_watermark1upload")
      .unsigned_cloudinary_upload(myAuth.cloudinary_upload_preset, { tags: 'Watermark', context: 'photo=' }, {
        dropZone: "#direct_upload",
        start: function (e) {
          $scope.watermark1status = "Starting upload...";
          $scope.$apply();
        },
        fail: function (e, data) {
          $scope.watermark1status = "Upload failed";
          $scope.$apply();
        }
      })
      .on("cloudinaryprogressall", function (e, data) {
        $scope.watermark1uploadSuccess = true;
        $scope.watermark1progress = Math.round((data.loaded * 100.0) / data.total);
        $scope.watermark1status = "Uploading... " + $scope.watermark1progress + "%";
        $scope.$apply();
      })
      .on("cloudinarydone", function (e, data) {
        $scope.watermark1uploadSuccess = false;
        $scope.watermark1status = "Image uploaded successfully";
        $scope.myaccount.watermark1 = data.result.public_id;

        $http({
          method: "POST",
          url: myAuth.baseurl + "changewatermark1",
          data: $.param($scope.myaccount),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
          $('#myModal-watermark1').modal('toggle');
          if (data.type == "error") {
            $scope.userwatermarkoneSuccess = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function () {
              $scope.$apply(function () {
                $scope.userwatermarkoneSuccess = false;
              });
            }, 3000);
          }
          else {
            $scope.userwatermarkoneSuccess = true;
            $scope.alert = myAuth.addAlert('success', data.msg);
            $cookieStore.put('users', data.userdata);
            setTimeout(function () {
              $scope.$apply(function () {
                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                $scope.loggedindetails = myAuth.getUserNavlinks();
                $scope.userwatermarkoneSuccess = false;
              });
            }, 3000);
          }
        });
      });

    $scope.widget = $(".cloudinary_watermark2upload")
      .unsigned_cloudinary_upload(myAuth.cloudinary_upload_preset, { tags: 'Watermark', context: 'photo=' }, {
        dropZone: "#direct_upload",
        start: function (e) {
          $scope.watermark2status = "Starting upload...";
          $scope.$apply();
        },
        fail: function (e, data) {
          $scope.watermark2status = "Upload failed";
          $scope.$apply();
        }
      })
      .on("cloudinaryprogressall", function (e, data) {
        $scope.watermark2uploadSuccess = true;
        $scope.watermark2progress = Math.round((data.loaded * 100.0) / data.total);
        $scope.watermark2status = "Uploading... " + $scope.watermark2progress + "%";
        $scope.$apply();
      })
      .on("cloudinarydone", function (e, data) {
        $scope.watermark2uploadSuccess = false;
        $scope.watermark2status = "Image uploaded successfully";
        $scope.myaccount.watermark2 = data.result.public_id;

        $http({
          method: "POST",
          url: myAuth.baseurl + "changewatermark2",
          data: $.param($scope.myaccount),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function (data) {
          $('#myModal-watermark2').modal('toggle');
          if (data.type == "error") {
            $scope.userwatermarktwoSuccess = true;
            $scope.alert = myAuth.addAlert('danger', data.msg);
            setTimeout(function () {
              $scope.$apply(function () {
                $scope.userwatermarktwoSuccess = false;
              });
            }, 3000);
          }
          else {
            $scope.userwatermarktwoSuccess = true;
            $scope.alert = myAuth.addAlert('success', data.msg);
            $cookieStore.put('users', data.userdata);
            setTimeout(function () {
              $scope.$apply(function () {
                myAuth.updateUserinfo(myAuth.getUserAuthorisation());
                $scope.loggedindetails = myAuth.getUserNavlinks();
                $scope.userwatermarktwoSuccess = false;
              });
            }, 3000);
          }
        });
      });


    if ($scope.loggedindetails) {
      $scope.currentsubscription = {};
      $scope.getSubscriptionDetails = function () {
        $http({
          method: "GET",
          url: myAuth.baseurl + "getSubscriptionDetails/" + $scope.loggedindetails._id,
          headers: { 'Content-Type': 'application/json' }
        }).success(function (data) {
          if (data.subscription_exist == 0) {
            $scope.subscribed = false;
          }
          else {
            $scope.subscribed = true;
            $scope.currentsubscription.images = data.res.images;
            $scope.currentsubscription.price = data.res.price;
            $scope.currentsubscription.subscriptiondate = data.res.subscriptiondate;
            $scope.currentsubscription.subscriptionenddate = data.res.subscriptionenddate;
            $scope.currentsubscription.subscriptionname = data.res.subscriptionname;
            $scope.currentsubscription.remaining_images = data.res.remaining_images;
          }
          if (data.is_subscription_expired == 0) {
            $scope.expired = false;
          }
          else {
            $scope.expired = true;
            $scope.currentsubscription.remaining_images = 0;
          }
        });
      }
      $scope.getSubscriptionDetails();
    }
  }

})();
