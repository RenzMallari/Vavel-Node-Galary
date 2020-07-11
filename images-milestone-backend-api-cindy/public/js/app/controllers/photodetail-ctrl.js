(function() {
  angular.module('photographer').controller('photodetailsController', photodetailsController);

  function photodetailsController(configService, localService, constSetting, $cookieStore, $scope, $http, $q, $location, $routeParams, myAuth, galleryService) {
    $scope.config = configService;
    $scope.loggedindetails = myAuth.getUserNavlinks();
    $scope.gallerydetails = myAuth.getUserNavlinks();
    $scope.user = {};
    $scope.list_currencies = constSetting.list_currencies;
    if (!$scope.loggedindetails) $scope.loggedindetails = localService.createLocalUser();

    $scope.convert = constSetting.convert;

    //  currency and symbol
    if ($scope.loggedindetails && $scope.loggedindetails.symbol) $scope.loggedindetails.symbol = $scope.loggedindetails.symbol;
    if ($scope.loggedindetails.currency &&
      $scope.list_currencies &&
      $scope.list_currencies[$scope.loggedindetails.currency] &&
      $scope.list_currencies[$scope.loggedindetails.currency].symbol)
      $scope.loggedindetails.symbol = $scope.list_currencies[$scope.loggedindetails.currency].symbol


    $scope.getCurrency = constSetting.getCurrency;

    const tagController = angular.element('#tag-controller').scope();

    function ifKeywordExists(array, keyword) {
      return array.some(item => item.tag.toLowerCase() === keyword.toLowerCase());
    }

    $scope.loadTags =  function(tag) {
      var deferred = $q.defer();
      if (!tag) return
      var dataObj = {
        'keyword': tag
      };
      $http({
        method: "POST",
        url: myAuth.baseurl + "catalog/searchkeywords_load",
        data: dataObj,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(datacatelog) {
        if (datacatelog.msg) {
          var uniqueElements = [];
          $.each(datacatelog.albumkeywords, function(i, el) {
            if (!ifKeywordExists(uniqueElements, el.keyword)) {
              const data = { 
                tag: el.keyword,
                isofficial: el.isofficial,
                logo: el.logo ? `${configService.ftpFullPath}/${el.logo}`: null								};
              uniqueElements.push(data);
            }
          });
          return deferred.resolve(uniqueElements);
        } else {
          return deferred.resolve([]);
        }
      });
      return deferred.promise;
    }

    $scope.page404 = false;
    $scope.loading = true;
    $scope.hideeditdiv = false;
    $scope.unliked = true;
    $scope.liked = false;
    $scope.payment = {};
    $scope.payment.phonenumber = '+91-';
    $scope.open_loginmodal = function() {
      $('#myModal-login').modal('toggle');
    };

    // Set title
    $('title').html(PAGE_TITLE);
    const promise = $http({
      method: 'GET',
      url: `${myAuth.baseurl}gallery/getimagedetails/${$routeParams.galleryid}/${$routeParams.id}`
    }).success(function(data) {
      if (data.type === 'error') {
        if (data.error)
          if (data.error.status === 404) {
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.page404 = true
              })
            }, 1000)
          } else {
            //need implement
          }
        else
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.page404 = true
            })
          }, 1000)

        return;
      }
      if (data.msg.commerciallicense == 'Yes')
        $scope.commerciallicense_icon = 'usage-icons ok';
      else
        $scope.commerciallicense_icon = 'usage-icons restricted';


      if (data.msg.editoriallicense == 'Yes')
        $scope.editoriallicense_icon = 'usage-icons ok';
      else
        $scope.editoriallicense_icon = 'usage-icons restricted';

      if (data.msg.albumaddress != '')
        $scope.albumaddress_icon = 'location-icon';
      else
        $scope.albumaddress_icon = '';

      if (data.msg && data.msg.album) {
        $scope.center = [data.msg.album.lat, data.msg.album.lng];
        $scope.position = `${data.msg.album.lat},${data.msg.album.lng}`;
        $scope.title_album = data.msg.album.name;
        const domain = 'https://images.vavel.com';
        $scope.albumLink = `${domain}/mainalbumdetails/${data.msg.album._id}`;
      }
      if (!data || !data.msg)
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.page404 = true
          })
        }, 1000)

      $scope.img = data.msg;
      const h4PrefixMaxDate = new Date('11/16/2019');
      let prefix = 'h5_';
      if (new Date($scope.img.album.date) < h4PrefixMaxDate) {
        prefix = 'h4_';
      }
      $scope.img.path = `${prefix}${$scope.img.imagepublicid}.${$scope.img.fileExtension}`;
      setTimeout(function() {
        $scope.$apply(function() {
          if (!$scope.img || !$scope.img.imagepublicid)
            $scope.page404 = true

          else
            $scope.page404 = false;

        });
      }, 1000);
      data.user = data.user || {};
      $scope.userId = data.user._id;
      $scope.relatedLink = '/details/:albumid/:imageid';

      let listImages = data.msg.images;
      let imageIndex = _.findIndex(listImages, { publicid: $routeParams.id });

      if (imageIndex !== -1) {
        // Set title
        if ($scope.img && $scope.img.caption)
          $('title').html($scope.img.caption + PAGE_TITLE_SUFFIX);
        else if ($scope.img)
          $('title').html($scope.img.album.name + ' Photo ' + (imageIndex + 1) + PAGE_TITLE_SUFFIX);


        if (imageIndex) {
          $scope.img.previous = {
            id: listImages[imageIndex - 1].publicid,
            album: $routeParams.galleryid
          };
          $scope.img.previousLink = `/details/${$scope.img.previous.album}/${$scope.img.previous.id}`;
        }

        if (imageIndex < (listImages.length - 1)) {
          $scope.img.next = {
            id: listImages[imageIndex + 1].publicid,
            album: $routeParams.galleryid
          };
          $scope.img.nextLink = `/details/${$scope.img.next.album}/${$scope.img.next.id}`;
        }
      }

      // previous/next
      /* galleryService.findById(data.msg.imagepublicid, data.user._id).then(function(img) {
          if (img.previous && img.previous.album && img.previous.id) {
              $scope.img.previous = img.previous;
              $scope.img.previousLink = '/details/' + img.previous.album + '/' + img.previous.id;
          }
          if (img.next && img.next.album && img.next.id) {
              $scope.img.next = img.next;
              $scope.img.nextLink = '/details/'+img.next.album+'/'+img.next.id;
          }
      });*/

      $('body').keydown(function(e) {
        if (e.which == 37)  // left
          $("a.prev-arrow").trigger("click");
        else if (e.which == 39)  // right
          $("a.next-arrow").trigger("click");

      });

      // previous/next
      // galleryService.getUserImages(data.user._id).then(function(images){
      //  // previous/next
      //  var img = images[data.msg.imagepublicid];
      //  if(img.previous){
      //    $scope.img.previous = img.previous;
      //    $scope.img.previousLink = '/details/'+img.previous.album+'/'+img.previous.id;
      //  }
      //  if(img.next){
      //    $scope.img.next = img.next;
      //    $scope.img.nextLink = '/details/'+img.next.album+'/'+img.next.id;
      //  }
      //  $("body").keydown(function(e) {
      //    if(e.which == 37) { // left
      //      $("a.prev-arrow").trigger("click");
      //    }
      //    else if(e.which == 39) { // right
      //      $("a.next-arrow").trigger("click");
      //    }
      //  });
      // });

      $scope.gallerypublicid = data.msg._id;
      $scope.galleryphotopublicid = data.msg.imagepublicid;
      $scope.userphotopublicid = data.user.profileimage;
      $scope.verified = data.user.verified;

      $scope.username = data.user.username;
      $scope.authorpaypalemail = data.user.paypalemail;
      $scope.comments = data.msg.comments;
      $scope.usrid = data.msg.userid;
      $scope.fileExtension = data.msg.fileExtension;
      if (tagController && tagController.alllisttags && tagController.getall)
        data.msg.tags = data.msg.tags.map(e => {
          let find = tagController.alllisttags.find(i => i._id === e.tag && i.logo);
          if (find) {
            e.logo = find.logo
          }
          return e;
        })

      $scope.tags = data.msg.tags;
      $scope.gallerydetails.tags = data.msg.tags;
      $scope.gallerydetails.userinfo = data.user;
      $scope.tags_length = data.msg.tags.length;
      $scope.no_of_comments = data.msg.comments.length;
      $scope.gallerydetails.caption = data.msg.caption;
      $scope.commerciallicense = data.msg.commerciallicense;
      $scope.editoriallicense = data.msg.editoriallicense;
      $scope.albumaddress = data.msg.albumaddress;
      $scope.soldout = data.msg.soldout;
      $scope.sellonetime = data.msg.sellonetime;
      $scope.paytogetlicense = true;

      if ($scope.loggedindetails) {
        if ($scope.loggedindetails._id == data.msg.userid) {
          $scope.isauthor = true;
          $scope.showeditdiv = true;
          $scope.getlicance = false;
          $scope.paytogetlicense = false;
        } else {
          $scope.isauthor = false;
          $scope.showeditdiv = false;
          $scope.getlicance = true;
        }

        $scope.logintogetlicense = false;

        if ($scope.authorpaypalemail == '' || $scope.authorpaypalemail === undefined) {
          $scope.paypalemailtogetlicense = true;
          $scope.paytogetlicense = false;
        } else
          $scope.paypalemailtogetlicense = false;

      } else {
        $scope.isauthor = false;
        $scope.showeditdiv = false;
        $scope.logintogetlicense = true;
        $scope.paypalemailtogetlicense = false;
        $scope.paytogetlicense = false;
      }

      if (data.msg.comments.length > 0) {
        $scope.showcommentsnumber = true;
        $scope.hidecommentsnumber = true;
        $scope.showcommentbox = false;
      } else {
        $scope.showcommentsnumber = false;
        $scope.hidecommentsnumber = true;
        $scope.showcommentbox = true;
      }
      if (data.msg.caption != '' && data.msg.caption != undefined) {
        $scope.showaddcaption = false;
        $scope.showcaption = true;
      } else {
        $scope.showaddcaption = true;
        $scope.showcaption = false;
      }
      if (data.msg.tags.length > 0) {
        $scope.keywordsshow = true;
        $scope.keywordmsgshow = true;
        $scope.showaddkeyword = false;
      } else {
        $scope.keywordsshow = false;
        $scope.keywordmsgshow = false;
        $scope.showaddkeyword = true;
      }

      // Price

      $scope.defaultPrice = constSetting.defaultPrice();
      // console.log($scope.defaultPrice)
      let imagewidth = data.msg.imagewidth;
      let imageheight = data.msg.imageheight;
      let imagedetails = [];
      let replaceimagedetails;
      let price = (data.msg.price == null) ? {} : data.msg.price;
      let imagePrice = {
        small: price.small ? parseInt(price.small) : 0,
        medium: price.medium ? parseInt(price.medium) : 0,
        large: price.large ? parseInt(price.large) : 0
      };
      // var imagePriceConvert = imagePrice;
      if ((parseInt(imagewidth) >= 1600) || (parseInt(imageheight) >= 1200) || (parseInt(imageheight) >= 1600) || (parseInt(imagewidth) >= 1200)) {
        let largewidth = parseInt(imagewidth);
        let largeheight = parseInt(imageheight);
        let largedpi = 300;
        let largeinch = `${parseFloat(largewidth / largedpi).toFixed(1)}\" X ${parseFloat(largeheight / largedpi).toFixed(1)}\"`;
        let largedetails = {
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
        var mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(1)}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
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
        var smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(1)}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
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
        var mediuminch = `${parseFloat(mediumwidth / mediumdpi).toFixed(1)}\" X ${parseFloat(mediumheight / mediumdpi).toFixed(1)}\"`;
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
        var smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(1)}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
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
        var smallinch = `${parseFloat(smallwidth / smalldpi).toFixed(1)}\" X ${parseFloat(smallheight / smalldpi).toFixed(1)}\"`;
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
    }).catch(err => {
      if (err.status === 404)
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.page404 = true
          })
        }, 1000)

    });
    if ($routeParams.id && $routeParams.galleryid)
      promise.then(function(response) {
        if (response.type === 'success' && $scope.loggedindetails && $scope.gallerydetails && $scope.gallerydetails.userinfo
          && $scope.gallerydetails.userinfo._id && $routeParams.id && $routeParams.galleryid) {
          $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getlikes/" + $routeParams.galleryid + '/' + $routeParams.id + '/' + $scope.gallerydetails.userinfo._id
          }).success(function(data) {
            if (data.is_like_exist == 0) {
              $scope.unliked = true;
              $scope.liked = false;
            } else {
              $scope.unliked = false;
              $scope.liked = true;
            }
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.loading = false;
              })
            }, 2000)
            $scope.totallikes = data.totallikes;
          });
        } else {
          $http({
            method: "GET",
            url: myAuth.baseurl + "gallery/getlikesall/" + $routeParams.galleryid + '/' + $routeParams.id
          }).success(function(data) {
            $scope.unliked = true;
            $scope.liked = false;
            $scope.totallikes = data.totallikes;
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.loading = false;
              })
            }, 2000)
          });
        }
      })

    else

      setTimeout(function() {
        $scope.$apply(function() {
          $scope.loading = false;
        })
      }, 2000)


    $scope.open_collectionmodal = function(galleryid) {
      if ($scope.loggedindetails) {
        $('#mymodal-addcollection').modal('toggle');
        $scope.gallerydetails.collectiongalleryid = galleryid;
        $scope.gallerydetails.photopublicid = $routeParams.id;
      } else
        $('#myModal-login').modal('toggle');

    };

    $scope.getallmycollections = function() {
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/getcollections/${$scope.loggedindetails._id}`
      }).success(function(data) {
        if (data.is_collection_exist == 0)
          $scope.showcollections = false;
        else
          $scope.showcollections = true;

        $scope.allcollections = data.allcollections;
      });
    };

    if ($scope.loggedindetails)
      $scope.getallmycollections();


    $scope.collectionsubmit = function() {
      if ($scope.loggedindetails) {
        let dataobj = {
          'collectionname': $scope.gallerydetails.collectionname
        };
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/addalbumcollection`,
          data: dataobj,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == 'success') {
            $scope.gallerydetails.collectionname = '';
            $scope.allcollections = {};
            setTimeout(function() {
              $scope.getallmycollections();
            }, 500);
          }
        });
      } else
        $('#myModal-login').modal('toggle');

    };

    $scope.addtocollection = function(collectionid) {
      if ($scope.loggedindetails) {
        let dataobj = {
          'galleryid': $scope.gallerydetails.collectiongalleryid,
          'userid': $scope.loggedindetails._id,
          collectionid,
          'photopublicid': $scope.gallerydetails.photopublicid
        };
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/addalbumtocollection`,
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
    };

    $scope.getComments = function() {
      $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/getimagedetails/${$routeParams.galleryid}/${$routeParams.id}`
      }).success(function(data) {
        $scope.comments = data.msg.comments;
        $scope.no_of_comments = data.msg.comments.length;
      });
    };

    $scope.showComments = function() {
      $scope.showcommentsnumber = false;
      $scope.hidecommentsnumber = false;
    };

    $scope.hideComments = function() {
      $scope.showcommentsnumber = true;
      $scope.hidecommentsnumber = true;
    };

    $scope.showEdit = function() {
      $scope.showeditdiv = false;
      $scope.showaddcaption = false;
      $scope.showaddkeyword = false;
      $scope.showcaption = false;
      $scope.keywordsshow = false;
      setTimeout(function() {
        $scope.$apply(function() {
          $scope.updating = false;
          $scope.hideeditdiv = true;
        });
      }, 500);

    };

    $scope.likepics = function() {
      if ($scope.loggedindetails) {
        let dataobj = {
          'galleryid': $routeParams.galleryid,
          'imageid': $routeParams.id,
          'userid': $scope.loggedindetails._id
        };
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/postlike`,
          data: dataobj,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.is_like_exist == 0) {
            $scope.liked = false;
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.unliked = true;
              });
            }, 500);
          } else {
            $scope.unliked = false;
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.liked = true;
              });
            }, 500);
          }
          $scope.totallikes = data.totallikes;
        });
      } else
        $('#myModal-login').modal('toggle');

    };

    $scope.commentsubmit = function() {
      if ($scope.loggedindetails) {
        $scope.gallerydetails.galleryid = $routeParams.galleryid;
        $scope.gallerydetails.imageid = $routeParams.id;
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/postcomment`,
          data: $.param($scope.gallerydetails),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).success(function(data) {
          if (data.type == 'error') {

          } else {
            $scope.getComments();
            $scope.hidecommentsnumber = false;
            $scope.showcommentbox = false;
            $scope.gallerydetails.comment = '';
          }
        });
      } else
        $('#myModal-login').modal('toggle');

    };
    $scope.getEmbed = function() {
      const size = $scope.imagedetails.find(e => e.type === 'small') || {};
      // console.log(size)
      $('#mymodal-embed').modal('show');
      const domain = 'https://images.vavel.com';
      // let domain = 'http://localhost:8081';
      const defautl =
`
<div style="background-color:#fff;display:inline-block;font-family:Roboto,sans-serif;color:#a7a7a7;font-size:12px;width:100%;max-width:594px;">
    <div style="padding:0;margin:0;text-align:left;">
        <a href="${domain}/details/${$scope.img._id}/${$scope.img.imagepublicid}" target="_blank" style="color:#a7a7a7;text-decoration:none;font-weight:normal !important;border:none;display:inline-block;">
            Embed from Vavel
        </a>
    </div>
    <div style="overflow:hidden;position:relative;height:0;padding:66.66666666666666% 0 0 0;width:100%;">
        <iframe src="${domain}/api/embed/${$scope.img._id}/${$scope.img.imagepublicid}" scrolling="no" frameborder="0" width="594px" height="396px" style="display:inline-block;position:absolute;top:0;left:0;width:100%;height:100%;margin:0;"></iframe>
    </div>
</div>
`;
      $('.img-embed').html(defautl);
      $scope.embed_code = defautl;
    };

    $scope.close_pricingmodal = function() {
      $('#myModal-price').modal('close');
      return;
    };
    $scope.open_pricingmodal = async function() {
      if (!$scope.imageDetailSelected)
        return;

      if (!$scope.loggedindetails) {
        $('#myModal-price').modal('toggle');
        return;
      }

      let imagewidth = $scope.imageDetailSelected.width;
      let imageheight = $scope.imageDetailSelected.height;
      let imagedpi = $scope.imageDetailSelected.dpi;
      let imageprice = $scope.imageDetailSelected.price;
      let imagetype = $scope.imageDetailSelected.type;
      let downloadlink = `${myAuth.cloudinary_image_base_path}w_${imagewidth},h_${imageheight}/${$scope.galleryphotopublicid}`;
      /* ------------------------------*/
      $scope.payment.imagetype = imagetype;
      $scope.payment.imageprice = imageprice;
      $scope.payment.downloadlink = downloadlink;
      const res = await $http({
        method: 'GET',
        url: `${myAuth.baseurl}checkusersubscriptionstatus/${$scope.loggedindetails._id}`,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.subscription_exist == 1) {
        $scope.payment.galleryid = $routeParams.galleryid;
        $scope.payment.imageid = $routeParams.id;
        $scope.payment.payerid = $scope.loggedindetails._id;
        $scope.paytogetlicense = false;
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.waitmessage = true;
            $scope.alert = myAuth.addAlert('success', 'Please wait. Processing...');
          });
        }, 500);
        const res = await $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/subscriptiondownload`,
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
              document.getElementById('forcedownloadlink').href = $scope.payment.downloadlink;
              document.getElementById('forcedownloadlink').click();
              $scope.payment.downloadlink = '';
              document.getElementById('forcedownloadlink').href = 'javascript:void(0);';
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
      } else
        $('#myModal-price').modal('toggle');

    };

    $scope.checkImageDetail = function(imageDetail) {

      $scope.imageDetailSelected = imageDetail;
    };

    $scope.addtocart = function(imageprice, final) {
      if (!$scope.imageDetailSelected || $scope.imageDetailSelected.soldout)
        return;


      if ($scope.addingToCart)
        return;

      $scope.addingToCart = true;
      $scope.$root.cartUpdating = true;
      let imagewidth = $scope.imageDetailSelected.width;
      let imageheight = $scope.imageDetailSelected.height;
      let downloadlink = `${myAuth.cloudinary_image_base_path}w_${imagewidth},h_${imageheight}/${$scope.galleryphotopublicid}.${$scope.fileExtension}`;
      // console.log(downloadlink)
      $scope.payment.imagetype = $scope.imageDetailSelected.type;
      $scope.payment.imagewidth = imagewidth;
      $scope.payment.imageheight = imageheight;
      $scope.payment.imagedpi = $scope.imageDetailSelected.dpi;
      $scope.payment.downloadlink = downloadlink;
      $scope.payment.price = $scope.imageDetailSelected.price;

      $scope.payment.galleryid = $routeParams.galleryid;
      $scope.payment.imageid = $routeParams.id;
      $scope.payment.buyer_id = $scope.loggedindetails._id;
      $scope.payment.image_publicid = $scope.galleryphotopublicid;
      $scope.payment.soldout = $scope.soldout;
      $scope.payment.sellonetime = $scope.sellonetime;
      // $('#myModal-price').modal('toggle');
      // $scope.addingToCart = false;
      $scope.paybycardmessage = true;
      $scope.$root.cartcount = $scope.$root.cartcount + 1;

      $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/getseller_id`,
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        $scope.payment.seller_id = data.msg;
        $scope.payment.type = data.type;
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/addtocart`,
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == 'success') {
            if (final)
              setTimeout(function() {
                window.location.href = '/checkout';
                // if (!$scope.loggedindetails || !$scope.loggedindetails.loginstatus) {
                //     $('#mymodal-payment').modal('toggle', {backdrop: 'static', keyboard: false});
                // }
                // else {
                //     window.location.href = '/checkout';
                // }
              }, 1000);


            // $scope.addingToCart = false;
            // $scope.$root.cartcount = $scope.$root.cartcount + 1;
            $('#myModal-price').modal('toggle');
            $scope.addingToCart = false;
            $scope.$root.cartUpdating = false;
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

    };

    $scope.addtocart_final = async function() {
      if (!$scope.imageDetailSelected)
        return;


      if ($scope.addingToCart)
        return;


      if (!$scope.loggedindetails || !$scope.loggedindetails.loginstatus) {
        $('#myModal-price').modal('toggle', { backdrop: 'static', keyboard: false });
        $('#mymodal-payment').modal('toggle', { backdrop: 'static', keyboard: false });
      }

      if ($scope.loggedindetails && $scope.loggedindetails.loginstatus) {
        $scope.addingToCart = true;
        let imagewidth = $scope.imageDetailSelected.width;
        let imageheight = $scope.imageDetailSelected.height;
        let downloadlink = `${myAuth.cloudinary_image_base_path}w_${imagewidth},h_${imageheight}/${$scope.galleryphotopublicid}`;

        $scope.payment.imagetype = $scope.imageDetailSelected.type;
        $scope.payment.imagewidth = imagewidth;
        $scope.payment.imageheight = imageheight;
        $scope.payment.imagedpi = $scope.imageDetailSelected.dpi;
        $scope.payment.downloadlink = downloadlink;
        $scope.payment.price = $scope.imageDetailSelected.price;
        $scope.payment.galleryid = $routeParams.galleryid;
        $scope.payment.imageid = $routeParams.id;
        $scope.payment.buyer_id = $scope.loggedindetails._id;
        $scope.payment.soldout = $scope.soldout;
        $scope.payment.sellonetime = $scope.sellonetime;
        const getSellerRes = await $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/getseller_id`,
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        $scope.payment.seller_id = getSellerRes.data.msg;
        $scope.payment.type = getSellerRes.data.type;
        const addToCartRes = await $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/addtocart`,
          data: $scope.payment,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (addToCartRes.data.type == 'success') {
          $('#myModal-price').modal('toggle');
          $scope.addingToCart = false;
          $location.path('/checkout');
        }
      }
    };

    const loginOrSignup = async function() {
      let data = await login();
      if (data) data = await singup();
      return data.msg;
    };

    const login = async function() {
      const res = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}userlogin`,
        data: $.param($scope.user),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (res.error)
        $scope.submissionError = true;
      else {
        $cookieStore.put('users', res.data);
        $scope.loginSuccess = true;
      }
      return res.data;
    };

    const singup = async function() {
      const res = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}registration`,
        data: {
          'email': $scope.user.email,
          'password': $scope.user.password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.data.type == 'error')
        $scope.registrationError = true;
      else if (res.data.type == 'validate')
        $scope.registrationError = true;
      else {
        $scope.userregistration = {};
        $cookieStore.put('users', res.data.msg);
        $scope.registrationSuccess = true;
      }
      return res.data;
    };

    $scope.payforcart_paypal = async function() {
      if ($scope.paying)
        return;

      if (!$scope.loggedindetails)
        $scope.loggedindetails = await loginOrSignup();


      $scope.addingToCart = true;
      let imagewidth = $scope.imageDetailSelected.width;
      let imageheight = $scope.imageDetailSelected.height;
      let downloadlink = `${myAuth.cloudinary_image_base_path}w_${imagewidth},h_${imageheight}/${$scope.galleryphotopublicid}`;
      $scope.payment.payerid = $scope.loggedindetails._id;
      $scope.payment.imagetype = $scope.imageDetailSelected.type;
      $scope.payment.imagewidth = imagewidth;
      $scope.payment.imageheight = imageheight;
      $scope.payment.imagedpi = $scope.imageDetailSelected.dpi;
      $scope.payment.downloadlink = downloadlink;
      $scope.payment.price = $scope.imageDetailSelected.price;
      $scope.payment.galleryid = $routeParams.galleryid;
      $scope.payment.imageid = $routeParams.id;
      $scope.payment.buyer_id = $scope.loggedindetails._id;
      $scope.payment.soldout = $scope.soldout;
      $scope.payment.sellonetime = $scope.sellonetime;

      $scope.paying = true;
      $scope.paybycardmessage = true;
      $scope.loaderimg = true;
      $scope.alert = myAuth.addAlert('success', 'Redirecting to Paypal, Please wait, will late some seconds');
      const getSellerRes = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/getseller_id`,
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      $scope.payment.seller_id = getSellerRes.data.msg;
      $scope.payment.type = getSellerRes.data.type;
      const addToCartRes = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/addtocart`,
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const checkoutRes = await $http({
        method: 'GET',
        url: `${myAuth.baseurl}gallery/cart_payment_paypal/${$scope.loggedindetails._id}`
      });
      $scope.paying = false;
      if (checkoutRes.data.type == 'success') {
        window.location.reload();
        window.location = checkoutRes.data.url;
      } else
        alert('Error: Payment not done! try again.');

    };

    $scope.pay_cart = async function() {
      if (!$scope.loggedindetails)
        $scope.loggedindetails = await loginOrSignup();


      $scope.paybycardmessage = true;
      $scope.loaderimg = true;
      $scope.alert = myAuth.addAlert('success', 'Contacting with Bank, Please wait, will late some seconds');
      $scope.addingToCart = true;
      let imagewidth = $scope.imageDetailSelected.width;
      let imageheight = $scope.imageDetailSelected.height;
      let downloadlink = `${myAuth.cloudinary_image_base_path}w_${imagewidth},h_${imageheight}/${$scope.galleryphotopublicid}`;
      $scope.payment.payerid = $scope.loggedindetails._id;
      $scope.payment.imagetype = $scope.imageDetailSelected.type;
      $scope.payment.imagewidth = imagewidth;
      $scope.payment.imageheight = imageheight;
      $scope.payment.imagedpi = $scope.imageDetailSelected.dpi;
      $scope.payment.downloadlink = downloadlink;
      $scope.payment.price = $scope.imageDetailSelected.price;
      $scope.payment.galleryid = $routeParams.galleryid;
      $scope.payment.imageid = $routeParams.id;
      $scope.payment.buyer_id = $scope.loggedindetails._id;
      $scope.payment.soldout = $scope.soldout;
      $scope.payment.sellonetime = $scope.sellonetime;
      const getSellerRes = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/getseller_id`,
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      $scope.payment.seller_id = getSellerRes.data.msg;
      $scope.payment.type = getSellerRes.data.type;
      const addToCartRes = await $http({
        method: 'POST',
        url: `${myAuth.baseurl}gallery/addtocart`,
        data: $scope.payment,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      await $http({
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
          window.location.reload();
        } else {
          $scope.payment.cardnumber = '';
          $scope.payment.expirydate = '';
          $scope.payment.cvcnumber = '';
          $scope.payment.phonenumber = '+91-';
          $scope.loaderimg = false;
          $scope.paybycardmessage = true;
          $scope.alert = myAuth.addAlert('danger', data.msg);
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.paybycardmessage = false;
            });
          }, 3000);
        }
      });
    };

    $scope.pay = function() {
      if ($scope.loggedindetails) {
        $scope.paybycardmessage = true;
        $scope.loaderimg = true;
        $scope.alert = myAuth.addAlert('success', 'Contacting with Bank, Please wait, will late some seconds');
        $scope.payment.galleryid = $routeParams.galleryid;
        $scope.payment.imageid = $routeParams.id;
        $scope.payment.payerid = $scope.loggedindetails._id;
        $http({
          method: 'POST',
          url: `${myAuth.baseurl}gallery/payment`,
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
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.paybycardmessage = false;

                $('#myModal-price').modal('toggle');
                document.getElementById('forcedownloadlink').href = $scope.payment.downloadlink;
                document.getElementById('forcedownloadlink').click();
                $scope.payment.downloadlink = '';
                document.getElementById('forcedownloadlink').href = 'javascript:void(0);';
              });
            }, 3000);
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
        $scope.alert = myAuth.addAlert('danger', 'Some error occurred. Please try again later or check you are logged in.');
        setTimeout(function() {
          $scope.$apply(function() {
            $scope.paybycardmessage = false;
          });
        }, 3000);
      }
    };

    $scope.captionsubmit = function() {
      $scope.updating = true;
      $scope.gallerydetails.galleryid = $routeParams.galleryid;
      $scope.gallerydetails.imageid = $routeParams.id;
      if ($scope.gallerydetails.caption == '' && ($scope.gallerydetails.tags.length == 0 || $scope.gallerydetails.tags === undefined))
        $http({
          method: "POST",
          url: myAuth.baseurl + "gallery/addcaption",
          data: $scope.gallerydetails,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == "error") {

          } else {
            $http({
              method: "GET",
              url: myAuth.baseurl + "gallery/getimagedetails/" + $routeParams.galleryid + "/" + $routeParams.id
            }).success(function(data) {
              $scope.gallerydetails.caption = data.msg.caption;
              if (tagController && tagController.alllisttags && tagController.getall) {
                data.msg.tags = data.msg.tags.map(e => {
                  let find = tagController.alllisttags.find(i => i._id === e.tag && i.logo);
                  if (find) {
                    e.logo = find.logo
                  }
                  return e;
                })
              }
              $scope.tags = data.msg.tags;
              $scope.gallerydetails.tags = data.msg.tags;
              if (data.msg.caption != '') {
                $scope.showaddcaption = false;
                $scope.showcaption = true;
              } else {
                $scope.showaddcaption = true;
                $scope.showcaption = false;
              }
              if (data.msg.tags.length > 0) {
                $scope.keywordmsgshow = true;
                $scope.keywordsshow = true;
                $scope.showaddkeyword = false;
              } else {
                $scope.keywordmsgshow = false;
                $scope.keywordsshow = false;
                $scope.showaddkeyword = true;
              }
              $scope.hideeditdiv = false;
              setTimeout(function() {
                $scope.$apply(function() {
                  $scope.showeditdiv = true;
                });
              }, 1000);
            });
          }
        });
      else
        $http({
          method: "POST",
          url: myAuth.baseurl + "gallery/addcaption",
          data: $scope.gallerydetails,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          if (data.type == "error") {

          } else {
            $scope.gallerydetails.caption = data.gallerydetails.caption;
            if (tagController && tagController.alllisttags && tagController.getall) {
              data.gallerydetails.tags = data.gallerydetails.tags.map(e => {
                let find = tagController.alllisttags.find(i => i._id === e.tag && i.logo);
                if (find) {
                  e.logo = find.logo
                }
                return e;
              })
            }
            $scope.tags = data.gallerydetails.tags;
            $scope.gallerydetails.tags = data.gallerydetails.tags;
            if (data.gallerydetails.caption != '') {
              $scope.showaddcaption = false;
              $scope.showcaption = true;
            } else {
              $scope.showaddcaption = true;
              $scope.showcaption = false;
            }
            if (data.gallerydetails.tags.length > 0) {
              $scope.keywordmsgshow = true;
              $scope.keywordsshow = true;
              $scope.showaddkeyword = false;
            } else {
              $scope.keywordmsgshow = false;
              $scope.keywordsshow = false;
              $scope.showaddkeyword = true;
            }
            $scope.hideeditdiv = false;
            setTimeout(function() {
              $scope.$apply(function() {
                $scope.showeditdiv = true;
              });
            }, 1000);

          }
        });

    };

  }
})();
