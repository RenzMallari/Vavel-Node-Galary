(function() {
  angular.module('photographer').controller('uploadImgController', uploadImgController);

  function uploadImgController($routeParams, _, configService, $scope, myAuth, albums, collections, collectionService, albumService) {
    $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
    $scope.loggedindetails = myAuth.getUserNavlinks();

    $scope.config = configService;
    $scope.tagsBunch = [];

    $scope.isloggedin = false;
    if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;

    $scope.albums = [];

    if (albums && albums.allalbums) {
      $scope.albums = albums.allalbums;

      for (const i in $scope.albums) for (const j in $scope.albums[i].images) for (const k in $scope.albums[i].images[j].tags) $scope.tagsBunch = $scope.tagsBunch.concat($scope.albums[i].images[j].tags[k].tag);
    }

    // Set title
    $('title').html(`Upload${PAGE_TITLE_SUFFIX}`);

    $scope.tagsBunch = _.uniq($scope.tagsBunch);

    if (collections && collections.allcollections) $scope.collections = collections.allcollections;

    $scope.dropzoneView = true;

    $scope.dropeSelection = function() {
      // console.log("dropeSelection ");
      _.forEach($scope.imgList, function(item, index) {
        $scope.imgList[index].selected = false;
      });
      $scope.imageForm = {
        imageSelectedList: [],
        data: {
          caption: '',
          tags: []
        }
      };

      $scope.$apply();
    };

    $scope.ctrlActive = false;

    $(document).keyup(function(event) {
      $scope.ctrlActive = false;
    });
    $(document).keydown(function(event) {
      $scope.ctrlActive = true;
    });

    $('#selectable').selectable({
      filter: '.img-col',
      start(event, ui) {
        if (!$scope.ctrlActive) {
          $scope.imgList.forEach((item, index) => {
            $scope.imgList[index].selected = false;
          });

          $scope.imageForm = {
            imageSelectedList: [],
            data: {
              caption: '',
              tags: []
            }
          };

          $scope.$apply();
        }
      },
      selected(evento, ui) {
        selectImg($(ui.selected).attr('data-nom'));
      }
    });

    $scope.albumSelect = {
      _id: '-',
      name: 'Select album'
    };

    $scope.albumsList = [$scope.albumSelect];
    $scope.albumsList = _.concat($scope.albumsList, _.map($scope.albums, function(data) {
      return _.pick(data, ['_id', 'name']);
    }));

    $scope.collectionSelect = {
      _id: '-',
      name: 'Select collection'
    };

    $scope.collectionList = [$scope.collectionSelect];
    $scope.collectionList = _.concat($scope.collectionSelect, _.map($scope.collections, function(data) {
      return _.pick(data, ['_id', 'name']);
    }));

    $scope.total_selectedfile = 0;

    $scope.dropzoneConfig = {
      'options': {
        'url'() { return `/api/album/uploader/${$scope.albumSelect._id}`; },
        'maxFilesize': 10.9,
        'acceptedFiles': '.jpeg,.jpg,.png,.gif'
      },
      'eventHandlers': {
        'sending'(file, formData, xhr) {
          $('.dz-message').hide();
          $scope.total_selectedfile++;
        },
        'success'(file, response) {
          if (response.files && response.files[0]) {
            const index = _.findIndex($scope.albums, { _id: response.files[0].albumId });
            $scope.albums[index].images.unshift(response.files[0].data);

            if ($scope.albumSelect._id == response.files[0].albumId) {
              $scope.imgList = $scope.albums[index].images;
              $scope.$apply();
            }
            $scope.total_selectedfile--;

            if (!$scope.total_selectedfile) $('.dz-message').show();

            $(file.previewTemplate).detach();
          }
        },
        'error'(err, msg) {
          console.log('err', err);
          console.log('msg', msg);
        }
      }
    };

    $scope.albumSelectDropzone = function() {
      _.forEach($scope.imgList, function(item, index) {
        $scope.imgList[index].selected = false;
      });

      $scope.collectionSelect = {
        _id: '-',
        name: 'Select collection'
      };

      $scope.imageForm = {
        imageSelectedList: [],
        data: {
          caption: '',
          tags: []
        }
      };

      $scope.deleteImg = function(data) {
        if ($scope.albumSelect._id !== '-') {

          $scope.imageForm.imageSelectedList = _.filter($scope.imageForm.imageSelectedList, function(img) {
            return img != data;
          });

          albumService.deleteimage({
            imageid: data,
            albumid: $scope.albumSelect._id
          }).then(function(rez) {
            if (rez.type == 'success') {
              const index = _.findIndex($scope.albums, { _id: $scope.albumSelect._id });
              _.remove($scope.albums[index].images, { publicid: data });
              _.remove($scope.imgList, { publicid: data });
              for (const i in $scope.collections) _.remove($scope.collections[i].images, { publicid: data });
            }
          });
        }
      };

      if ($scope.albumSelect._id !== '-') {
        $scope.currentAlbum = _.findIndex($scope.albums, { _id: $scope.albumSelect._id });
        $scope.imgList = $scope.albums[$scope.currentAlbum].images;
      }
      else $scope.imgList = [];
    };

    $scope.collectionSelectDropzone = function() {
      _.forEach($scope.imgList, function(item, index) {
        $scope.imgList[index].selected = false;
      });

      $scope.albumSelect = {
        _id: '-',
        name: 'Select album'
      };

      $scope.imageForm = {
        imageSelectedList: [],
        data: {
          caption: '',
          tags: []
        }
      };

      $scope.deleteImg = function(data) {
        if ($scope.collectionSelect._id !== '-') {

          $scope.imageForm.imageSelectedList = _.filter($scope.imageForm.imageSelectedList, function(img) {
            return img != data;
          });

          collectionService.deleteimage({
            imageid: data,
            collectionid: $scope.collectionSelect._id
          }).then(function(rez) {
            if (rez.type == 'success') {
              const index = _.findIndex($scope.collections, { _id: $scope.collectionSelect._id });
              _.remove($scope.collections[index].images, { publicid: data });
              _.remove($scope.imgList, { publicid: data });
            }
          });
        }
      };

      $scope.imgList = [];

      if ($scope.collectionSelect._id !== '-') {
        $scope.currentCollection = _.findIndex($scope.collections, { _id: $scope.collectionSelect._id });

        const imgId = $scope.collections[$scope.currentCollection].images;

        for (const i in imgId) {
          const galleryIndex = _.findIndex($scope.albums, { _id: imgId[i].galleryid });

          if (!$scope.albums[galleryIndex]) $scope.imgList.unshift(imgId[i]);
          else {
            const index = _.findIndex($scope.albums[galleryIndex].images, { publicid: imgId[i].publicid });
            if (~index) $scope.imgList.unshift($scope.albums[galleryIndex].images[index]);
          }
        }
      }
    };

    function selectImg(imgId) {
      const index = _.findIndex($scope.imgList, { publicid: imgId });
      if (~index) {
        let selected;
        $scope.imgList[index].selected = selected = !$scope.imgList[index].selected;

        if (selected) $scope.imageForm.imageSelectedList.unshift(imgId);

        else _.pull($scope.imageForm.imageSelectedList, imgId);

        if ($scope.imageForm.imageSelectedList.length === 1) for (const i in $scope.albums) {
          const index = _.findIndex($scope.albums[i].images, { publicid: $scope.imageForm.imageSelectedList[0] });

          $scope.imageForm.data.editPhotoVisible = true;

          if (index === -1) {
            $scope.imageForm.data.editPhotoVisible = false;

            continue;
          }

          if (~index) {
            const imgDetail = $scope.albums[i].images[index];
            // console.log(imgDetail)
            const imagewidth = imgDetail.imagewidth;
            const imageheight = imgDetail.imageheight;

            $scope.imageForm.data.priceSmallVisible = false;
            $scope.imageForm.data.priceMediumVisible = false;
            $scope.imageForm.data.priceLargeVisible = false;

            if ((parseInt(imagewidth) >= 1600) || (parseInt(imageheight) >= 1200) || (parseInt(imageheight) >= 1600) || (parseInt(imagewidth) >= 1200)) {
              $scope.imageForm.data.priceSmallVisible = true;
              $scope.imageForm.data.priceMediumVisible = true;
              $scope.imageForm.data.priceLargeVisible = true;
            } else if ((imagewidth >= 1024 && imagewidth < 1600) || (imageheight >= 768 && imageheight < 1200) || (imageheight >= 1024 && imageheight < 1600) || (imagewidth >= 768 && imagewidth < 1200)) {
              $scope.imageForm.data.priceSmallVisible = true;
              $scope.imageForm.data.priceMediumVisible = true;
              $scope.imageForm.data.priceLargeVisible = false;
            } else {
              $scope.imageForm.data.priceSmallVisible = true;
              $scope.imageForm.data.priceMediumVisible = false;
              $scope.imageForm.data.priceLargeVisible = false;
            }

            $scope.imageForm.data.caption = imgDetail.caption;
            $scope.imageForm.data.tags = imgDetail.tags;
            $scope.imageForm.data.price = imgDetail.price || { large: "50.00", medium: "20.00", small: "10.00" };
            $scope.imageForm.data.isthumbnail = imgDetail.isthumbnail;
            $scope.imageForm.data.sellonetime = imgDetail.sellonetime;

            break;
          }
        } else {
          $scope.imageForm.data.caption = '';
          $scope.imageForm.data.tags = [];
          $scope.imageForm.data.isthumbnail = false;
          $scope.imageForm.data.sellonetime = false;
        }
        $scope.$apply();
      }
    }

    $scope.imgUpdate = function(data) {
      for (const i in $scope.albums) {
        let flag = false;
        $scope.albums[i].images = _.map($scope.albums[i].images, function(o) {
          if (~_.indexOf(data.imageid, o.publicid)) {

            if (!flag) o.isthumbnail = data.isthumbnail;

            if (data.isthumbnail === true && !flag) flag = true;

            o.caption = data.caption;
            o.sellonetime = data.sellonetime;
            if (data.imageid.length == 1) o.tags = data.tags;

            else o.tags = _.uniq(o.tags.concat(data.tags));

          }
          return o;
        });
      }

      $scope.imgList = _.map($scope.imgList, function(o) {
        if (~_.indexOf(data.imageid, o.publicid)) {
          o.caption = data.caption;

          if (data.imageid.length == 1) o.tags = data.tags;

          else o.tags = _.uniq(o.tags.concat(data.tags));

        }
        return o;
      });

      $scope.imageForm.imageSelectedList = [];
      _.forEach($scope.imgList, function(item, index) {
        $scope.imgList[index].selected = false;
      });

    };

    $scope.albumUpdate = function(data) {
      const index = _.findIndex($scope.albums, { _id: data._id });
      $scope.albums[index].name = data.name;
      $scope.albums[index].price = data.price;
      $scope.albums[index].tags = data.tags;

      $scope.albumSelect = {
        _id: data._id,
        name: data.name
      };
      $scope.albumsList = [{
        _id: '-',
        name: 'Select album'
      }];
      $scope.albumsList = _.concat($scope.albumsList, _.map($scope.albums, function(data) {
        return _.pick(data, ['_id', 'name']);
      }));
    };

    $scope.collactionUpdate = function(data) {
      const index = _.findIndex($scope.collections, { _id: data.col._id });
      if (data.col.name) $scope.collections[index].name = data.col.name;

      if (data.col.images) $scope.collections[index].images = data.col.images;

      if (data.reload) {
        $scope.collectionSelect = {
          _id: data.col._id,
          name: data.col.name
        };
        $scope.collectionList = [{
          _id: '-',
          name: 'Select album'
        }];

        $scope.collectionList = _.concat($scope.collectionList, _.map($scope.collections, function(data) {
          return _.pick(data, ['_id', 'name']);
        }));
      } else {
        $scope.imageForm.imageSelectedList = [];
        _.forEach($scope.imgList, function(item, index) {
          $scope.imgList[index].selected = false;
        });
      }
    };

    $scope.albumDelete = function(data) {
      _.remove($scope.albums, { _id: data._id });

      $scope.albumSelect = {
        _id: '-',
        name: 'Select album'
      };
      $scope.albumsList = [$scope.albumSelect];
      $scope.albumsList = _.concat($scope.albumsList, _.map($scope.albums, function(data) {
        return _.pick(data, ['_id', 'name']);
      }));

      for (const j in data.images) for (const i in $scope.collections) _.remove($scope.collections[i].images, { publicid: data.images[j] });

      $scope.imgList = [];
    };

    $scope.collactionDelete = function(data) {
      _.remove($scope.collections, { _id: data._id });

      $scope.collectionSelect = {
        _id: '-',
        name: 'Select album'
      };
      $scope.collectionList = [$scope.collectionSelect];
      $scope.collectionList = _.concat($scope.collectionList, _.map($scope.collections, function(data) {
        return _.pick(data, ['_id', 'name']);
      }));

      $scope.imgList = [];
    };

    $scope.addAlbum = function(data) {
      $scope.albums.unshift(data.album);

      $scope.albumSelect = {
        _id: data.album._id,
        name: data.album.name
      };
      $scope.albumsList = [{
        _id: '-',
        name: 'Select album'
      }];
      $scope.albumsList = _.concat($scope.albumsList, _.map($scope.albums, function(data) {
        return _.pick(data, ['_id', 'name']);
      }));

      $scope.albumSelectDropzone();
    };

    $scope.addCollaction = function(data) {
      $scope.collections.unshift(data.collaction);
      $scope.collectionSelect = {
        _id: data.collaction._id,
        name: data.collaction.name
      };

      $scope.collectionList = [{
        _id: '-',
        name: 'Select collection'
      }];
      $scope.collectionList = _.concat($scope.collectionList, _.map($scope.collections, function(data) {
        return _.pick(data, ['_id', 'name']);
      }));

      $scope.collectionSelectDropzone();
    };

    if ($routeParams.part == 'album') {
      const index = _.findIndex($scope.albums, { _id: $routeParams.id });

      if (~index) {
        $scope.albumSelect = {
          _id: $routeParams.id,
          name: $scope.albums[index].name
        };
        $scope.albumSelectDropzone();
      }
    }
    else if ($routeParams.part == 'collection') {
      const index = _.findIndex($scope.collections, { _id: $routeParams.id });

      if (~index) {
        $scope.collectionSelect = {
          _id: $routeParams.id,
          name: $scope.collections[index].name
        };
        $scope.collectionSelectDropzone();
      }
    }
  }
})();
