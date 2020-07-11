angular.module("photographer").factory('configService', function() {
  return {
    ftpThumbnailPath:"https://stock.vavel.com/s/photoImages/thumbnail/",
    ftpAvatarPath:"https://stock.vavel.com/s/photoImages/avatar/",
    ftpCoverPath:"https://stock.vavel.com/s/photoImages/cover/",
    ftpFullPath:"https://stock.vavel.com/s/photoImages/bunch/",
    crop200:"h200_",
    crop300:"h200_",
    cropt200:"t200_",
    cropt200:"t200_",
    w800:"w800_",
  };
});
