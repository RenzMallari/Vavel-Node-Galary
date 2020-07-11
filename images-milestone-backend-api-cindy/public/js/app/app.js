const listmod = angular.module('listmod', ['myUtils', 'ngRoute', 'ngAnimate', 'ngSanitize', 'cloudinary', 'photoAlbumServices', 'colorpicker.module', 'wysiwyg.module']); const mycontrollers = {};
listmod.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/admin/tag', { controller: 'tagController', templateUrl: '/admin/partials/tags.html' })
    .when('/admin/login', { controller: 'loginController', templateUrl: '/admin/partials/login.html' })
    .when('/admin', { controller: 'userController', templateUrl: '/admin/partials/users.html' })
    .when('/admin/users', { controller: 'userController', templateUrl: '/admin/partials/users.html' })
    .when('/admin/usersubscription', { controller: 'usersubscriptionController', templateUrl: '/admin/partials/usersubscription.html' })
    .when('/admin/roles', { controller: 'roleController', templateUrl: '/admin/partials/roles.html' })
    .when('/admin/subscriptions', { controller: 'subscriptionController', templateUrl: '/admin/partials/subscriptions.html' })
    .when('/admin/subscriptionfaq', { controller: 'subscriptionfaqController', templateUrl: '/admin/partials/subscriptionfaq.html' })
    .when('/admin/cms', { controller: 'cmsController', templateUrl: '/admin/partials/cms.html' })
    .when('/admin/settings', { controller: 'settingsController', templateUrl: '/admin/partials/settings.html' })
    .when('/admin/adminsettings', { controller: 'adminSettingsController', templateUrl: '/admin/partials/adminsettings.html' })
    .when('/admin/contactuslist', { controller: 'contactusController', templateUrl: '/admin/partials/contactus.html' })
    .when('/admin/faqlist', { controller: 'faqController', templateUrl: '/admin/partials/faq.html' })
    .when('/admin/teamlist', { controller: 'teamController', templateUrl: '/admin/partials/teams.html' })
    .when('/admin/teamcms', { controller: 'teamcmsController', templateUrl: '/admin/partials/teamcms.html' })
    .when('/admin/contactcms', { controller: 'contactcmsController', templateUrl: '/admin/partials/contactcms.html' })
    .when('/admin/joinuscms', { controller: 'joinuscmsController', templateUrl: '/admin/partials/joinuscms.html' })
    .when('/admin/subscriptioncms', { controller: 'subscriptioncmsController', templateUrl: '/admin/partials/subscriptioncms.html' })
    .when('/admin/brandcms', { controller: 'brandcmsController', templateUrl: '/admin/partials/brandcms.html' })
    .when('/admin/brandlist', { controller: 'brandlistController', templateUrl: '/admin/partials/brandlist.html' })
    .when('/admin/explorecms', { controller: 'explorecmsController', templateUrl: '/admin/partials/explorecms.html' })
    .when('/admin/salecms', { controller: 'salecmsController', templateUrl: '/admin/partials/salecms.html' })
    .when('/admin/purchasecms', { controller: 'purchasecmsController', templateUrl: '/admin/partials/purchasecms.html' })
    .when('/admin/listcollections', { controller: 'collectionController', templateUrl: '/admin/partials/collections.html' })
    .when('/admin/listcatalogs', { controller: 'catalogController', templateUrl: '/admin/partials/catalogs.html' })
    .when('/admin/listalbums', { controller: 'albumController', templateUrl: '/admin/partials/albums.html' })
    .when('/admin/listimages', { controller: 'imageController', templateUrl: '/admin/partials/images.html' })
    .when('/admin/paymentlist', { controller: 'paymentController', templateUrl: '/admin/partials/payments.html' })
    .when('/admin/sales', { controller: 'saleController', templateUrl: '/admin/partials/sales.html' })

    .otherwise({ redirectTo: '/admin' });
});

listmod.run(function($rootScope, myAuth, $location) {

  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    const loggedindetails = myAuth.getAdminNavlinks();
    if ((next.$$route && next.$$route.originalPath !== '/admin/login') && !loggedindetails) {
      event.preventDefault();
      $location.path('/admin/login');
    }
    if (loggedindetails) $rootScope.loggedIn = true;

    else $rootScope.loggedIn = false;

  });

});

mycontrollers.tagController = function($scope, $http, $location, myAuth) {
  $scope.listtag = [];
  $scope.total = 1;

  const urlParams = new URLSearchParams(window.location.search);

  $scope.page = urlParams.get('page') || 1;
  $scope.limit = urlParams.get('limit') || 10;
  $scope.totalPage = 1;
  $scope.link = 'https://stock.vavel.com/s/photoImages/bunch/';
  $scope.search = '';

  $scope.redirectURL = function(key, value = null) {
    $location.search(key, value);
  };
  $scope.searching = function(value) {
    $scope.redirectURL('search', value);
  };

  $scope.getlist = function(page = 1, search = '', limit = 10, isofficial) {
    if (page < 1) page = 1;

    let query = `page=${page}&limit=${limit}`;
    if (search !== undefined) query += `&search=${search}`;
    if (isofficial) query += `&isofficial=${isofficial}`;

    $http({
      method: 'GET',
      url: `${myAuth.baseurl}tag/adminlist?${query}`
    }).success(function(result) {
      if (result.type === 'success') {
        const list = [];
        result.listtags = result.listtags || [];
        result.listtags.forEach(e => {
          const find = list.find(i => i.keyword === e.keyword);

          if (!find) {
            e.list_tags = [e];
            list.push(e);
          }
          else {
            // let index = list.findIndex(i => i.keyword === e.keyword);
            if (!find.logo && e.logo) find.logo = e.logo;
            find.list_tags = find.list_tags || [];
            find.list_tags.push(e);
            // list[index] = find;
          }
        });
        $scope.listtag = list;
        $scope.search = search;
        $scope.limit = limit;
        $scope.page = page;
        $scope.total = result.total;
        $scope.totalPage = result.totalPage;
        $scope.pagination = [];
        const array = new Array($scope.totalPage).fill().map((e, i) => i);
        const temp = [];
        array.forEach(e => {
          if (Math.abs(e - $scope.page) <= 5) temp.push({
            page: e + 1,
            active: e + 1 == $scope.page ? 'active' : ' '
          });
        });
        $scope.pagination = temp;
      }
    });
  };

  $scope.clear = function(type) {
    $scope.edittag[type] = '';
  };

  $scope.getlist(urlParams.get('page'), urlParams.get('search') || '', urlParams.get('limit'), urlParams.get('isofficial'));

  $scope.create = function(data = {}) {
    if (data.isofficial === 'true') data.isofficial = true;
    else data.isofficial = false;

    if (data.showinexplore === 'true') data.showinexplore = true;
    else data.showinexplore = false;

    $http({
      method: 'POST',
      url: `${myAuth.baseurl}tag/create`,
      data
    }).success(function(result) {
      if (result.type === 'success') {
        $scope.getlist();
        $('#mymodal-createtag').modal('hide');
      }
      else $('.errors').text(result.message || 'Something went wrong');

    }).catch(err => {
      $('.loading').removeClass('show');
      $('.errors').text(err.message || 'Something went wrong');
    });
  };

  $scope.uploadFile = function(input) {
    $('.loading').addClass('show');
    const payload = new FormData();

    payload.append('file', input.files[0]);

    $http({
      method: 'POST',
      url: `${myAuth.baseurl}tag/upload/${$scope.edittag._id}`,
      // headers: { 'Content-Type': 'multipart/form-data' },
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity,
      data: payload
    }).success(function(result) {
      if (result.type === 'success') {
        if (result.msg && $scope.edittag) $scope.edittag.logo = result.msg.logo;

        $scope.getlist(urlParams.get('page'), urlParams.get('search') || '', urlParams.get('limit'), urlParams.get('isofficial'));
        $('#mymodal-createtag').modal('hide');
      }
      else $('.errors').text(result.message || 'Something went wrong');

      $('.loading').removeClass('show');
    }).catch(err => {
      $('.loading').removeClass('show');
      $('.errors').text(err.message || 'Something went wrong');
    });
  };

  $scope.update = function(tag = {}) {
    $('.loading').addClass('show');
    if (tag.isofficial === 'true') tag.isofficial = true;
    else tag.isofficial = false;
    if (tag.logo) tag.logo = tag.logo.replace($scope.link, '');
    delete tag.list_tags;
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}tag/update/${tag._id}`,
      data: tag
    }).success(function(result) {
      if (result.type === 'success') {
        tag = result.msg;
        $('#mymodal-edittag').modal('hide');
      }
      else $('.errors').text(result.msg || 'Can not update');

      $('.loading').removeClass('show');
    }).catch(err => {
      $('.errors').text(err.message || 'Can not update');
      $('.loading').removeClass('show');
    });
  };
  $scope.official = function(tag) {
    $('.loading').addClass('show');
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}tag/official/${tag._id}`,
      data: {
        isofficial: !tag.isofficial
      }
    }).success(function(result) {
      if (result.type === 'success') {
        tag = result.msg;
        // $scope.listtag = $scope.listtag.map(e => {
        // 	if(tag._id === e._id) e.isofficial = tag.official
        // 	return e;
        // })
        $scope.getlist();
      }
      else {

        $('.loading').removeClass('show');
        $('.errors').text(result.message || 'Something went wrong');
      }
    }).catch(err => {
      $('.loading').removeClass('show');
      $('.errors').text(err.message || 'Something went wrong');
    });
  };
  $scope.showedit = function(tag) {
    $scope.edittag = {};
    $scope.edittag = tag;
    $('#mymodal-edittag').modal('show');
  };
  $scope.showcreate = function() {
    $('#mymodal-createtag').modal('show');
  };

};
mycontrollers.loginController = function($scope, $http, $location, myAuth) {
  $scope.login = function() {
    $http({
      method: 'POST',
      data: { email: $scope.email, password: $scope.password },
      url: '/admin/adminlogin'
    }).success(function(result) {
      if (result) {
        myAuth.updateAdminUserinfo({
          isloggedin: true,
          _id: result.user._id,
          email: result.user.email
        });
        $location.path('/admin');
      }
    });
  };
};

mycontrollers.headerController = function($scope, $http, $location, myAuth) {
  $scope.logout = function() {
    $http({
      method: 'POST',
      url: '/admin/logout'
    }).success(function() {
      myAuth.resetAdminUserinfo();
      $location.path('/admin/login');
    });
  };
};

// =========================================================================//
mycontrollers.userController = function($scope, $http, $location, myAuth) {
  $scope.pageClass = 'page-home';
  $scope.id = '0';

  const urlParams = new URLSearchParams(window.location.search);

  $scope.page = urlParams.get('page') || 1;
  $scope.limit = urlParams.get('limit') || 10;
  $scope.totalPages = 1;
  $scope.search = '';

  $scope.redirectURL = function(key, value = null) {
    $location.search(key, value);
  };

  $scope.searching = function(value) {
    $scope.redirectURL('search', value);
  };

  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      _id: obj._id,
      firstname: obj.firstname,
      lastname: obj.lastname,
      middlename: obj.middlename,
      email: obj.email,
      password: obj.password,
      phonenumber: obj.phonenumber,
      country: obj.country,
      city: obj.city,
      state: obj.state,
      addressline1: obj.addressline1,
      addressline2: obj.addressline2
    };

  };
  $scope.bindroles = function() {
    $http({
      url: `${myAuth.baseurl}userroles/getallroles`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .success(function(data) {
        if (data) $scope.roles = data;

      });
  };
  $scope.verified = function(user) {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}verifieduser/${user._id}`,
      data: {
        verified: !user.verified
      }
    }).success(function(res) {
      if (res.type === 'success') user.verified = !user.verified;
      // $scope.users = res.msg;
    });
  };

  $scope.listallusers = function(page = 1, search = '', limit = 10) {
    if (page < 1) page = 1;

    let query = `page=${page}&limit=${limit}`;
    if (search) query += `&search=${search}`;

    $scope.bindroles();
    $http({
      url: `${myAuth.baseurl}getallusers?${query}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(result) {
      $scope.users = result.users;
      $scope.search = search;
      $scope.limit = limit;
      $scope.page = Number(page);
      $scope.total = result.total;
      $scope.totalPages = result.totalPages;
      $scope.pagination = [];
      const array = new Array($scope.totalPages).fill().map((e, i) => i);
      const temp = [];
      array.forEach(e => {
        if (Math.abs(e - $scope.page) <= 5) temp.push({
          page: e + 1,
          active: e + 1 == $scope.page ? 'active' : ' '
        });
      });
      $scope.pagination = temp;

      if ($scope.page > $scope.totalPages) $scope.listallusers($scope.totalPages, urlParams.get('search') || '', urlParams.get('limit'));

    });
  };

  $scope.listallusers(urlParams.get('page'), urlParams.get('search') || '', urlParams.get('limit'));

  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add Users';
    $scope.addusers = {};
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}insertuser`,
      data: $.param($scope.addusers),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallusers();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}updateuser`,
      data: $.param($scope.addusers),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.addusers = {};
      $scope.editMode = !$scope.editMode;
      $scope.listallusers();
    });

  };

  $scope.getuserbyid = function(obj) {
    $scope.mode = 'Edit Users';
    $scope.id = obj._id;
    $scope.addusers = {
      _id: obj._id,
      roleid: obj.roleid,
      firstname: obj.firstname,
      lastname: obj.lastname,
      middlename: obj.middlename,
      email: obj.email,
      phonenumber: obj.phonenumber,
      country: obj.country,
      city: obj.city,
      state: obj.state,
      addressline1: obj.addressline1,
      addressline2: obj.addressline2,
      isactive: obj.isactive,
      isfeatured: obj.isfeatured,
      adminpercentage: obj.adminpercentage
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.deleteUser = function(id) {
    $http({
      url: `${myAuth.baseurl}deleteuser/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallusers();

    });
  };

  $scope.changeStatus = function(id, status) {
    $http({
      url: `${myAuth.baseurl}updateuserstatus/${id}/${status}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallusers();

    });
  };

};
// =========================================================================//

// =========================================================================//
mycontrollers.addusersController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.addUser = function() {
    if ($scope.adduser.$valid) $http({
      method: 'POST',
      url: `${myAuth.baseurl}insertuser`,
      data: $.param($scope.users),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      // console.log(data);
      $location.path('admin/listusers');
    });

  };
};
// =========================================================================//

// ROLE CONTROLLER
// =========================================================================//
mycontrollers.roleController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';
  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      _id: obj._id,
      rolename: obj.rolename,
      isactive: obj.description

    };

  };

  $scope.listallroles = function() {

    $http({
      url: `${myAuth.baseurl}userroles/getallroles`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.roles = data;

    });
  };

  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add Roles';
    $scope.addrole = {};
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}userroles/insertrole`,
      data: $.param($scope.addroles),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}userroles/updaterole`,
      data: $.param($scope.addroles),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.addroles = {};
      $scope.editMode = !$scope.editMode;
    });

    $scope.listallroles();
  };

  $scope.getrolebyid = function(obj) {
    $scope.mode = 'Edit Roles';
    $scope.id = obj._id;
    $scope.addroles = {
      _id: obj._id,
      rolename: obj.rolename,
      isactive: obj.isactive
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.deleteRole = function(id) {
    $http({
      url: `${myAuth.baseurl}userroles/deleterole/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallroles();

    });
  };

  /* $scope.changeStatus=function(id,status){
		$http({
			url: myAuth.baseurl+"updateuserstatus/"+id+"/"+status,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		}).success(function(data){
				$scope.listallusers();

		});
	}*/

  $scope.listallroles();

};
// =========================================================================//

// SUBSCRIPTION FAQ CONTROLLER
// =========================================================================//
mycontrollers.subscriptionfaqController = function($scope, $http, $location, myAuth, $sce) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.listallsubscriptionfaqs = function() {
    $http({
      url: `${myAuth.baseurl}subscription/getallsubscriptionfaqs`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.allsubscriptionfaqs = data;

    });
  };
  $scope.listallsubscriptionfaqs();

  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add Subscription FAQ';
    $scope.subscriptionfaqs = {
      _id: '',
      question: '',
      answer: ''
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}subscription/insertsubscriptionfaqs`,
      data: $.param($scope.subscriptionfaqs),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallsubscriptionfaqs();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}subscription/updatesubscriptionfaqs`,
      data: $.param($scope.subscriptionfaqs),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallsubscriptionfaqs();
    });

  };

  $scope.getsubscriptionfaqbyid = function(obj) {
    $scope.mode = 'Edit Subscription FAQ';
    $scope.id = obj._id;
    $scope.subscriptionfaqs = {
      _id: obj._id,
      question: obj.question,
      answer: obj.answer
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.deletesubscriptionfaq = function(id) {
    $http({
      url: `${myAuth.baseurl}subscription/deletsubscriptionfaq/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallsubscriptionfaqs();

    });
  };

};
// =========================================================================//

// BRAND LIST CONTROLLER
// =========================================================================//
mycontrollers.brandlistController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.listallbrands = function() {
    $http({
      url: `${myAuth.baseurl}brand/listallbrands`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.allbrands = data;

    });
  };
  $scope.listallbrands();

  $scope.changeMode = function() {
    $scope.mode = 'Add Brand';
    $scope.status = '';
    $scope.brands = {
      _id: 0,
      image: '',
      imageid: '',
      isactive: false
    };
    $scope.iseditmode = false;
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if ($scope.brands._id == 0) $http({
      method: 'POST',
      url: `${myAuth.baseurl}brand/insertbrand`,
      data: $.param($scope.brands),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallbrands();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}brand/updatebrand`,
      data: $.param($scope.brands),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallbrands();
    });

  };

  $scope.getbrandbyid = function(obj) {
    $scope.mode = 'Edit Brand';
    $scope.iseditmode = true;
    $scope.status = '';
    $scope.brands = {
      _id: obj._id,
      image: obj.image,
      isactive: obj.isactive,
      imageid: ''
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.deletebrand = function(id) {
    $http({
      url: `${myAuth.baseurl}brand/deletebrand/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallbrands();

    });
  };

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'mybrandalbum', context: 'photo=' }, {
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.showupload = true;
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.showupload = false;
      $scope.iseditmode = true;
      $scope.status = 'Image uploaded successfully';
      $scope.brands.imageid = data.result.public_id;
      $scope.brands.image = data.result.public_id;
    });

};
// =========================================================================//

// SUBSCRIPTION CONTROLLER
// =========================================================================//
mycontrollers.subscriptionController = function($scope, $http, $location, myAuth) {
  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.listallsubscriptions = function() {
    $http({
      url: `${myAuth.baseurl}subscription/getallsubscriptions`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.allsubscriptions = data;

    });
  };
  $scope.listallsubscriptions();

  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add Subscriptions';
    $scope.subscriptions = {
      _id: '',
      subscriptionname: '',
      description: '',
      amount: 0,
      noofimages: 0,
      ispopular: false,
      isactive: false
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}subscription/insertsubscriptions`,
      data: $.param($scope.subscriptions),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallsubscriptions();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}subscription/updatesubscriptions`,
      data: $.param($scope.subscriptions),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallsubscriptions();
    });

  };

  $scope.getsubscriptionsbyid = function(obj) {
    $scope.mode = 'Edit Subscriptions';
    $scope.id = obj._id;
    $scope.subscriptions = {
      _id: obj._id,
      subscriptionname: obj.subscriptionname,
      description: obj.description,
      amount: obj.amount,
      noofimages: obj.noofimages,
      ispopular: obj.ispopular,
      isactive: obj.isactive
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.deletesubscriptions = function(id) {
    $http({
      url: `${myAuth.baseurl}subscription/deletsubscription/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallsubscriptions();

    });
  };

};
// =========================================================================//

// CMS CONTROLLER
// =========================================================================//
mycontrollers.cmsController = function($scope, $http, $location, myAuth, $sce) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';
  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      _id: obj._id,
      pagename: obj.pagename,
      pagetitle: obj.pagetitle,
      pagecontent: obj.pagecontent

    };

  };

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.listallcms = function() {
    $http({
      url: `${myAuth.baseurl}cms/getallpages`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.cms = data;

    });
  };
  $scope.listallcms();

  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add CMS';
    $scope.addcms = {
      _id: '',
      pagename: '',
      pagetitle: '',
      pagecontent: ''
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}cms/insertpages`,
      data: $.param($scope.addcms),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallcms();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}cms/updatepages`,
      data: $.param($scope.addcms),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.cms = {};
      $scope.editMode = !$scope.editMode;
      $scope.listallcms();
    });

  };

  $scope.getcmsbyid = function(obj) {
    $scope.mode = 'Edit CMS';
    $scope.id = obj._id;
    $scope.addcms = {
      _id: obj._id,
      pagename: obj.pagename,
      pagetitle: obj.pagetitle,
      pagecontent: obj.pagecontent
    };
    $scope.editMode = !$scope.editMode;
  };
};
// =========================================================================//

// SETTINGS CONTROLLER
// =========================================================================//
mycontrollers.settingsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getsettingsbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}settings/getsettingsbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.settings = data;

    });
  };
  $scope.getsettingsbyid();

  $scope.save = function() {
    if ($scope.settings.imageid != '') {
    }
    else $scope.settings.imageid = '';

    $http({
      method: 'POST',
      url: `${myAuth.baseurl}settings/updatesettings`,
      data: $.param($scope.settings),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.settings.imageid = '';
        $scope.getsettingsbyid();
        alert('Setting data has been saved.');
      }
      else alert('Setting data could not be saved saved. please try again later.');

    });
  };

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'myphotoalbum', context: 'photo=' }, {
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.showupload = true;
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.showupload = false;
      $scope.status = 'Image uploaded successfully';
      $scope.settings.imageid = data.result.public_id;
    });
};
// =========================================================================//

/* =============================================TEAMSController===================================================*/
mycontrollers.teamController = function($scope, $http, $location, myAuth) {

  $scope.changeMode = function() {
    $scope.mode = 'Add Team Member';
    $scope.status = '';
    $scope.teammember = {
      _id: 0,
      image: '',
      imageid: '',
      name: '',
      designation: ''
    };
    $scope.iseditmode = false;
    $scope.editMode = !$scope.editMode;
  };

  $scope.listallmembers = function() {
    $http({
      url: `${myAuth.baseurl}teams/listallmembers`,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data) $scope.memberslist = data;

    });
  };
  $scope.listallmembers();

  $scope.getteammemberbyid = function(obj) {
    $scope.editMode = !$scope.editMode;
    $scope.mode = 'Edit Team Member';
    $scope.status = '';
    $scope.iseditmode = true;
    $scope.teammember = {
      _id: obj._id,
      name: obj.name,
      designation: obj.designation,
      image: obj.image,
      imageid: ''
    };
  };

  $scope.save = function() {
    if ($scope.teammember._id == 0) $http({
      method: 'POST',
      url: `${myAuth.baseurl}teams/savemember`,
      data: $scope.teammember,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallmembers();
      $scope.status = '';
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}teams/updatemember`,
      data: $scope.teammember,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.teammember = {};
      $scope.editMode = !$scope.editMode;
      $scope.listallmembers();
      $scope.status = '';
    });

  };

  $scope.deletemember = function(id) {
    $http({
      url: `${myAuth.baseurl}teams/teamdelete/${id}`,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.listallmembers();
    });
  };

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'myteamalbum', context: 'photo=' }, {
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.showupload = true;
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.showupload = false;
      $scope.iseditmode = true;
      $scope.status = 'Image uploaded successfully';
      $scope.teammember.imageid = data.result.public_id;
      $scope.teammember.image = data.result.public_id;
    });

};
// =========================================================================//

// EXPLORE CMS CONTROLLER
// =========================================================================//
mycontrollers.explorecmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}explore/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'error') $scope.explore = {
        _id: '',
        title: '',
        subtitle: '',
        usertitle: '',
        usercontent: '',
        userbuttonvalue: '',
        photographertitle: '',
        photographercontent: '',
        photographerbuttonvalue: '',
        belowtitle: '',
        belowuserbuttonvalue: '',
        belowphotographerbuttonvalue: '',
        signaturecollectiontitle: '',
        signaturecollectionsubtitle: ''
      };

      else $scope.explore = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}explore/updatecontent`,
      data: $scope.explore,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// SALE CMS CONTROLLER
// =========================================================================//
mycontrollers.salecmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}sale/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'error') $scope.salecms = {
        _id: '',
        title: '',
        content: ''
      };

      else $scope.salecms = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}sale/updatecontent`,
      data: $scope.salecms,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// SALE CMS CONTROLLER
// =========================================================================//
mycontrollers.purchasecmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}purchase/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'error') $scope.salecms = {
        _id: '',
        title: '',
        content: ''
      };

      else $scope.salecms = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}purchase/updatecontent`,
      data: $scope.salecms,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// BRAND CMS CONTROLLER
// =========================================================================//
mycontrollers.brandcmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}brand/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'error') $scope.brandcms = {
        _id: '',
        title: '',
        content: ''
      };

      else $scope.brandcms = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}brand/updatecontent`,
      data: $scope.brandcms,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// CONTACT CMS CONTROLLER
// =========================================================================//
mycontrollers.contactcmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}contact/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.contact = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}contact/updatecontent`,
      data: $scope.contact,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// SUBSCRIPTION CMS CONTROLLER
// =========================================================================//
mycontrollers.subscriptioncmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}subscription/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.subscriptioncms = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}subscription/updatecontent`,
      data: $scope.subscriptioncms,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'myphotoalbum', context: 'photo=' }, {
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.showupload = true;
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.showupload = false;
      $scope.status = 'Image uploaded successfully';
      $scope.subscriptioncms.imageid = data.result.public_id;
    });
};
// =========================================================================//

// JOIN US CMS CONTROLLER
// =========================================================================//
mycontrollers.joinuscmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}joinus/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.joinus = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}joinus/updatecontent`,
      data: $scope.joinus,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'myphotoalbum', context: 'photo=' }, {
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.showupload = true;
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.showupload = false;
      $scope.status = 'Image uploaded successfully';
      $scope.joinus.imageid = data.result.public_id;
    });
};
// =========================================================================//

// TEAM CMS CONTROLLER
// =========================================================================//
mycontrollers.teamcmsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.disabled = false;
  $scope.menu = [
    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
    ['format-block'],
    ['font'],
    ['font-size'],
    ['font-color', 'hilite-color'],
    ['remove-format'],
    ['ordered-list', 'unordered-list', 'outdent', 'indent'],
    ['left-justify', 'center-justify', 'right-justify'],
    ['code', 'quote', 'paragraph'],
    ['link', 'image']
  ];

  $scope.setDisabled = function() {
    $scope.disabled = !$scope.disabled;
  };

  $scope.getcontentbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}teams/getcontentbyid/1`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.teams = data;

    });
  };
  $scope.getcontentbyid();

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}teams/updatecontent`,
      data: $.param($scope.teams),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data == 'success') {
        $scope.getcontentbyid();
        alert('Content has been saved.');
      }
      else alert('Content data could not be saved saved. please try again later.');

    });
  };
};
// =========================================================================//

// =========================================================================//
mycontrollers.adminSettingsController = function($scope, $http, $location, myAuth) {

  $scope.pageClass = 'page-home';
  $scope.id = '0';

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}settings/updatesettings`,
      data: $.param($scope.settings),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      alert('data Saved');
    });
  };
  $scope.getsettingsbyid = function(obj) {
    $http({
      url: `${myAuth.baseurl}getuserbyid/550163e6fed19464099cb0cc`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.settings = data;

    });
  };
  $scope.getsettingsbyid();

  /* $scope.updateTitle = function () {
        var uploadParams = $scope.widget.fileupload('option', 'formData');
        uploadParams["context"] = "photo=" + $scope.title;
        $scope.widget.fileupload('option', 'formData', uploadParams);
        };*/

  $scope.widget = $('.cloudinary_fileupload')
    .unsigned_cloudinary_upload($.cloudinary.config().upload_preset, { tags: 'myphotoalbum', context: 'photo=' }, {
      // Uncomment the following lines to enable client side image resizing and valiation.
      // Make sure cloudinary/processing is included the js file
      // disableImageResize: false,
      // imageMaxWidth: 800,
      // imageMaxHeight: 600,
      // acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|ico)$/i,
      // maxFileSize: 20000000, // 20MB
      dropZone: '#direct_upload',
      start(e) {
        $scope.status = 'Starting upload...';
        $scope.$apply();
      },
      fail(e, data) {
        $scope.status = 'Upload failed';
        $scope.$apply();
      }
    })
    .on('cloudinaryprogressall', function(e, data) {
      $scope.progress = Math.round((data.loaded * 100.0) / data.total);
      $scope.status = `Uploading... ${$scope.progress}%`;
      $scope.$apply();
    })
    .on('cloudinarydone', function(e, data) {
      $scope.photos = $scope.photos || [];
      data.result.context = { custom: { photo: $scope.title } };
      $scope.result = data.result;
      $scope.photos.push(data.result);
      $scope.$apply();
      $scope.photo = data.result;
      $scope.settings.profileimage = $scope.photo.public_id;
      $scope.save = function() {
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}updateuser`,
          data: $.param($scope.settings),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data) {
          alert('data Saved');
        });
      };

    });

};

// =========================================================================//

// ContactUsListController
// =========================================================================//
mycontrollers.contactusController = function($scope, $http, $location, myAuth) {
  $scope.listallcontacts = function() {
    $http({
      url: `${myAuth.baseurl}contact/listallcontact`,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data) $scope.contactus = data;

    });
  };
  $scope.listallcontacts();

  $scope.getcontactlistbyid = function(obj) {
    $scope.editMode = !$scope.editMode;
    $scope.mode = 'Reply';
    $scope.id = obj._id;
    $scope.sendmail = {
      _id: obj._id,
      email: obj.email,
      subject: obj.subject
    };
  };

  $scope.save = function() {
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}contact/replymail`,
      data: $scope.sendmail,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data.type == 'success') {
        $scope.sendmail = {};
        /* $scope.sendmailSuccess=true;
				$scope.alert=myAuth.addAlert('success','Mail send successfully...');
				setTimeout(function()
				{
					$scope.$apply(function(){
						$scope.sendmailSuccess=false;
					});
					$scope.ishide=false;
				},2000);*/
        $scope.editMode = !$scope.editMode;
      }
      else {
        $scope.sendmail = {};
        $scope.sendmailError = true;
        $scope.alert = myAuth.addAlert('danger', data.msg);
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.sendmailError = false;
          });
          $scope.ishide = false;
        }, 2000);
      }
    });
  };

  $scope.changeMode = function() {
    $scope.editMode = !$scope.editMode;
  };

  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      email: obj.email,
      subject: obj.subject,
      descriptions: obj.descriptions
    };
  };

  $scope.deletecontact = function(id) {
    $http({
      url: `${myAuth.baseurl}contact/deletcontact/${id}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.listallcontacts();

    });
  };
};

/* ================================================================================================*/

/* =============================================FAQController===================================================*/
mycontrollers.faqController = function($scope, $http, $location, myAuth, $sce) {
  $scope.changeMode = function() {
    $scope.id = '0';
    $scope.mode = 'Add FAQ';
    $scope.faq = {
      _id: '',
      question: '',
      answer: ''
    };
    $scope.editMode = !$scope.editMode;
  };

  $scope.trustAsHtml = function(string) {
    return $sce.trustAsHtml(string);
  };

  $scope.listallfaq = function() {
    $http({
      url: `${myAuth.baseurl}faq/listallfaq`,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data) $scope.faqlist = data;

    });
  };
  $scope.listallfaq();

  $scope.getfaqbyid = function(obj) {
    $scope.editMode = !$scope.editMode;
    $scope.mode = 'Edit FAQ';
    $scope.id = obj._id;
    $scope.faq = {
      _id: obj._id,
      question: obj.questions,
      answer: obj.answer
    };
  };

  $scope.save = function() {
    if (document.getElementById('hdnid').value == '0') $http({
      method: 'POST',
      url: `${myAuth.baseurl}faq/savefaq`,
      data: $scope.faq,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.editMode = !$scope.editMode;
      $scope.listallfaq();
    });

    else $http({
      method: 'POST',
      url: `${myAuth.baseurl}faq/updatefaq`,
      data: $scope.faq,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.faq = {};
      $scope.editMode = !$scope.editMode;
      $scope.listallfaq();
    });

  };

  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      question: obj.questions,
      answer: obj.answer
    };
  };

  $scope.deletefaq = function(id) {
    $http({
      url: `${myAuth.baseurl}faq/faqdelete/${id}`,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      $scope.listallfaq();
    });
  };
};
/* ================================================================================================*/

/* =============================================CATALOGController===================================================*/
mycontrollers.catalogController = function($scope, $http, $location, myAuth) {
  $scope.getallkeywords = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}catalog/getallkeywords`
    }).success(function(data) {
      if (data.is_keyword_exist == '0') $scope.nokeyword = true;

      else $scope.nokeyword = false;

      $scope.allkeywords = data.allkeywords;
    });
  };
  $scope.getallkeywords();

  $scope.showinexplore = function(key) {
    if (confirm('Are you sure you want to show in explore?')) {
      const dataObj = {
        key
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}catalog/showinexplore`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! some error occurred. please try again later.');

        else $scope.getallkeywords();

      });
    }
    else {
    }
  };

  $scope.removefromexplore = function(key) {
    if (confirm('Are you sure you want to remove from explore?')) {
      const dataObj = {
        key
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}catalog/removefromexplore`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! some error occurred. please try again later.');

        else $scope.getallkeywords();

      });
    }
    else {
    }
  };
};
/* ================================================================================================*/

/* =============================================COLLECTIONController===================================================*/
mycontrollers.collectionController = function($scope, $http, $location, myAuth) {
  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.getallcollections = function() {
    $scope.listallusers();
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}gallery/getallcollection`
    }).success(function(data) {
      if (data.is_collection_exist == '0') $scope.nocollection = true;

      else $scope.nocollection = false;

      $scope.allcollections = data.allcollections;
    });
  };
  $scope.getallcollections();

  $scope.deletecollection = function(collectionid) {
    if (confirm('Are you sure you want to delete?')) {
      const dataObj = {
        collectionid
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/deleteCollection`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! collection can not be deleted.');

        else $scope.getallcollections();

      });
    }
    else {
    }
  };

  $scope.makesignatured = function(collectionid) {
    if (confirm('Are you sure you want to make signatured?')) {
      const dataObj = {
        collectionid
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/makesignatured`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! collection can not make signatured.');

        else $scope.getallcollections();

      });
    }
    else {
    }
  };

  $scope.removesignatured = function(collectionid) {
    if (confirm('Are you sure you want to remove from signatured?')) {
      const dataObj = {
        collectionid
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/removesignatured`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! collection can not remove from signatured.');

        else $scope.getallcollections();

      });
    }
    else {
    }
  };
};

/* =============================================ALBUMController===================================================*/
mycontrollers.albumController = function($scope, $http, $location, myAuth) {
  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.getallalbums = function() {
    $scope.noalbum = true;
    $scope.updating = true;
    $scope.listallusers();
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}album/getallalbums`
    }).success(function(data) {
      if (data.is_album_exist == '0') $scope.allalbums = [];
      // $scope.noalbum = true;

      else {
        $scope.allalbums = data.allalbums;
        $scope.noalbum = false;
      }
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.updating = false;
        });
      }, 1000);
    });
  };
  $scope.getallalbums();

  $scope.deletealbum = function(albumid) {
    if (confirm('Are you sure you want to delete?')) {
      const dataObj = {
        albumid
      };
      $http({
        method: 'POST',
        url: `${myAuth.baseurl}album/deleteAlbum`,
        data: dataObj,
        headers: { 'Content-Type': 'application/json' }
      }).success(function(data) {
        if (data.type == 'error') alert('Sorry! album can not be deleted.');

        else $scope.getallalbums();

      });
    }
    else {
    }
  };

  $scope.setadminpercentage = function(albumid) {
    $(`#updateadminpercentage${albumid}`).show('slow');
  };
  $scope.changeMode = function(albumid) {
    $(`#updateadminpercentage${albumid}`).hide('slow');
  };
  $scope.updateadminperc = function(albumid) {
    const perc = $(`#appendedPrependedInput${albumid}`).val();
    const dataObj = {
      albumid,
      'adminperc': perc
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}album/updateadminpercentage`,
      data: dataObj,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data.type == 'error') alert('Sorry! admin percentage can not be updated.');

      else {
        $(`#updateadminpercentage${albumid}`).hide('slow');
        $scope.getallalbums();
      }
    });
  };
};

/* =============================================ImageController===================================================*/
mycontrollers.imageController = function($scope, $http, $location, myAuth) {
  const sitealbumimages = [];
  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.listallusers();

  $scope.getallalbums = function() {
    $scope.noalbum = true;
    $scope.updating = true;
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}album/getallalbums`
    }).success(function(data) {
      data.allalbums.forEach(function(albm, index) {
        albm.images.forEach(function(albmimage, ind) {
          const allalbumimages = {};
          allalbumimages.albumid = albm._id;
          allalbumimages.userid = albmimage.userid;
          allalbumimages.imagepublicid = albmimage.publicid;
          allalbumimages.adddate = albmimage.adddate;
          allalbumimages.adminpercentage = albmimage.adminpercentage;
          sitealbumimages.push(allalbumimages);
        });
      });
      $scope.allalbums = sitealbumimages;
      if (data.is_album_exist == '0') {
        // $scope.noalbum = true;
      }
      else $scope.noalbum = false;

      setTimeout(function() {
        $scope.$apply(function() {
          $scope.updating = false;
        });
      }, 1000);
    });
  };
  $scope.getallalbums();

  $scope.getgallery = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}gallery/getallimages`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      $scope.galleryimages = data.msg;
    });
  };
  $scope.getgallery();

  $scope.deleteSinglePhoto = function(galleryid, imagepublicid) {
    const dataObj = {
      'imageid': imagepublicid
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}gallery/deleteImage`,
      data: dataObj,
      headers: { 'Content-Type': 'application/json' }

    }).success(function(data) {
      if (data.type == 'error') {
      }
      else $scope.getgallery();

    });
  };

  $scope.deleteAlbumPhoto = function(albumid, imagepublicid) {
    const dataObj = {
      'imageid': imagepublicid,
      albumid
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}album/deletealbumImage`,
      data: dataObj,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data.type == 'error') {
      }
      else $scope.getallalbums();

    });
  };

  $scope.setadminpercentage = function(imageid) {
    $(`#updateadminpercentage${imageid}`).show('slow');
  };
  $scope.changeMode = function(imageid) {
    $(`#updateadminpercentage${imageid}`).hide('slow');
  };
  $scope.updatealbumadminperc = function(albumid, imageid) {
    const perc = $(`#appendedPrependedInput${imageid}`).val();
    const dataObj = {
      albumid,
      imageid,
      'adminperc': perc
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}album/updatesingleimagepercentage`,
      data: dataObj,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data.type == 'error') alert('Sorry! admin percentage can not be updated.');

      else {
        $(`#updateadminpercentage${imageid}`).hide('slow');
        $scope.getallalbums();
      }
    });
  };
  $scope.updategalleryadminperc = function(galleryid, imageid) {
    const perc = $(`#appendedPrependedInput${imageid}`).val();
    const dataObj = {
      galleryid,
      imageid,
      'adminperc': perc
    };
    $http({
      method: 'POST',
      url: `${myAuth.baseurl}gallery/updateadminpercentage`,
      data: dataObj,
      headers: { 'Content-Type': 'application/json' }
    }).success(function(data) {
      if (data.type == 'error') alert('Sorry! admin percentage can not be updated.');

      else {
        $(`#updateadminpercentage${imageid}`).hide('slow');
        $scope.getgallery();
      }
    });
  };

};
/* ==================================================================================*/

/* =================================User Subscription================================*/
mycontrollers.usersubscriptionController = function($scope, $http, $location, myAuth) {

  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.listallusers();

  $scope.getallusersubscriptions = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}getallusersubscription`
    }).success(function(data) {
      $scope.usersubscriptions = data.res;
    });
  };
  $scope.getallusersubscriptions();
};
/* ==================================================================================*/

/* =================================Payment================================*/
mycontrollers.paymentController = function($scope, $http, $location, myAuth) {

  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.listallusers();

  $scope.getallpayments = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}sale/getpayments`
    }).success(function(data) {
      $scope.userpayments = data.res;
    });
  };
  $scope.getallpayments();
};
/* ==================================================================================*/

/* =================================Sale================================*/
mycontrollers.saleController = function($scope, $http, $location, myAuth) {

  $scope.listallusers = function() {
    $http({
      url: `${myAuth.baseurl}getallusers`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data) {
      if (data) $scope.users = data;

    });
  };
  $scope.listallusers();

  $scope.getallsales = function() {
    $http({
      method: 'GET',
      url: `${myAuth.baseurl}sale/getallsales`
    }).success(function(data) {
      $scope.usersales = data.res;
    });
  };
  $scope.getallsales();

  $scope.view = function(obj) {
    $('#viewModal').modal('show');
    $scope.viewdata = {
      type: obj.payfor,
      amount: obj.amount,
      adminpercentage: obj.adminpercentage,
      userearnings: obj.totalearnings,
      paymentid: obj.paymentid,
      paykey: obj.paykey,
      transactionid: obj.transactionid,
      ack: obj.ack,
      message: obj.message
    };
  };
};
/* ==================================================================================*/

listmod.controller(mycontrollers);
