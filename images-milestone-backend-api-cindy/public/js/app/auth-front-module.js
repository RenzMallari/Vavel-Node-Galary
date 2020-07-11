angular
  .module("authFront", ["ngCookies"])
  .factory("myAuth", function ($http, $cookies, $cookieStore) {

    var factobj = {};
    factobj.alerts = [
      { type: 'danger', msg: 'Invalid Email/Password!', altclass: 'alert-danger' },
      { type: 'success', msg: 'You have successfully logged in.', altclass: 'alert-success' }
    ];

    factobj.addAlert = function (type, message) {
      var msg = {};
      angular.forEach(factobj.alerts, function (alert, key) {
        if (alert.type == type) {
          alert.msg = message;
          msg = alert;
        }
      });
      return msg;
    };

    factobj.baseurl = "/api/";
    factobj.cloudinary_cloud_name = "mphotoproyect";
    factobj.cloudinary_upload_preset = "jc8a0geu";
    factobj.cloudinary_image_base_path = "https://stock.vavel.com/s/photoImages/bunch/";

    var years = [];
    for (var i = 2014; i <= 2050; i++) {
      years.push(i);
    }
    factobj.years = years;

    var days = [];
    for (var i = 1; i <= 31; i++) {
      days.push(i);
    }
    factobj.days = days;
    /*********************************Admin Authorisation ***********************************/
    factobj.adminuserinfo = { loginstatus: false, _id: "", email: "" };
    factobj.updateAdminUserinfo = function (obj) {
      if (obj) {
        factobj.adminuserinfo = { loginstatus: obj.isloggedin, _id: obj._id, email: obj.email };
      } else {
        factobj.adminuserinfo = {};
      }

      return true;
    };
    factobj.resetAdminUserinfo = function () {
      factobj.adminuserinfo = { loginstatus: false, _id: "", email: "" };
      $cookieStore.put('users', '');
    };

    factobj.getAdminNavlinks = function () {

      var login = factobj.adminuserinfo.loginstatus,
        useremail = (typeof factobj.adminuserinfo._id == "undefined" || factobj.adminuserinfo._id == "") ? "Unknown" : factobj.adminuserinfo._id;
      return login;
      //        if (!login) {
      //
      //           // window.location.href = "../admin/login"
      //        } else {
      //	  return factobj.adminuserinfo;
      //        }
    };
    factobj.getAdminAuthorisation = function () {
      var authResp = {};
      $.ajax({
        type: "POST",
        url: "/admin/adminauthlogin",
        dataType: 'json',
        async: false,
        success: function (responseData) {
          authResp = responseData;
        }
      });
      return authResp;
    };

    factobj.updateAdminUserinfo(factobj.getAdminAuthorisation());
    /*********************************Admin Authorisation ***********************************/

    /*********************************User Authorisation ***********************************/
    factobj.userinfo = { loginstatus: false, _id: "", email: "", name: "", image: "", username: "", bio: "", fullname: "", link: "", coverimage: "", usertype: "", watermark1: '', watermark2: '', currency: '' };
    factobj.updateUserinfo = function (obj) {
      if (obj) {
        factobj.userinfo = { loginstatus: obj.isloggedin, _id: obj._id, email: obj.email, paypalemail: obj.paypalemail, 
          name: obj.firstname, username: obj.username, image: obj.profileimage, bio: obj.bio, 
          fullname: obj.fullname, link: obj.link, coverimage: obj.coverimage, usertype: obj.roleid, 
          watermark1: obj.watermark1, watermark2: obj.watermark2, currency: obj.currency };
        return true;
      }
    };
    factobj.resetUserinfo = function () {
      factobj.userinfo = { loginstatus: false, _id: "", email: "", name: "", image: "", 
      username: "", bio: "", fullname: "", link: "", coverimage: "", usertype: "", watermark1: '', 
      watermark2: '', currency: 'USD' };
    };

    factobj.getUserAuthorisation = function () {
      var obj = $cookieStore.get('users');
      if (obj) {
        return obj;
      }
      else
        return null;
    };

    factobj.getUserNavlinks = function () {
      var userlogin = factobj.userinfo.loginstatus,
        useremail = (typeof factobj.userinfo._id == "undefined" || factobj.userinfo._id == "") ? "Unknown" : factobj.userinfo._id;
      if (!userlogin) {
      } else {
        return factobj.userinfo;
      }
    };

    factobj.isUserLoggedIn = function () {
      var userlogin = factobj.userinfo.loginstatus;
      function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
      }

      // if (!getCookie('session') || !userlogin) {
      //     $cookieStore.put('users', null);
      //     $cookieStore.put('session', null);

      //   window.location.href = "/explore";
      // } else {

      // }
    };

    /*********************************User Authorisation ***********************************/
    return factobj;
  })
