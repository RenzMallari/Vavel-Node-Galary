(
    function() {

    angular.module('photographer').controller('mymetricsController', mymetricsController);
    function mymetricsController(configService, $scope, myAuth, ngAnalyticsService, gapiService, accessToken, envVariables, $cookieStore) {

      // Set title
      $('title').html(`My Metrics${PAGE_TITLE_SUFFIX}`);

      const key = 'encrypt!@#key';
      const decryptClientId = CryptoJS.AES.decrypt(envVariables.data.clientId, key);
      const decryptViewId = CryptoJS.AES.decrypt(envVariables.data.viewId, key);
      const clientId = CryptoJS.enc.Utf8.stringify(decryptClientId);
      const viewId = CryptoJS.enc.Utf8.stringify(decryptViewId);
      
      $scope.serviceAuthToken = accessToken.access_token;
      ngAnalyticsService.setClientId(clientId);
      $scope.viewId = viewId;
      $scope.clicktimes = 0;
      $scope.viewtimes = 0;
      $scope.ctr = 0;
      
      $scope.config = configService;
      $scope.loggedindetails = myAuth.getUserNavlinks();
      $scope.isUserLoggedIn = myAuth.isUserLoggedIn();
  
      $scope.isloggedin = false;
      if ($scope.loggedindetails && $scope.loggedindetails._id) $scope.isloggedin = true;
      
      // specify default date range in controller
      const dateRangeData = $cookieStore.get("dateRange");

      let startMoment = moment(new Date()).add(-7, 'days');
      let endMoment = moment(new Date()).add(-1, 'days');
      if (dateRangeData) {
        startMoment = moment(dateRangeData.start);
        endMoment = moment(dateRangeData.end);
      }
      $scope.startDate = startMoment.format("YYYY-MM-DD");
      $scope.endDate = endMoment.format("YYYY-MM-DD");
      $scope.dateRange = moment().range(startMoment, endMoment);

      //Select range options
      $scope.customRanges = [
          {
              label: "This week",
              range: moment().range(
                  moment().startOf("week").startOf("day"),
                  moment().endOf("week").startOf("day")
              )
          },
          {
              label: "Last month",
              range: moment().range(
                  moment().add(-1, "month").startOf("month").startOf("day"),
                  moment().add(-1, "month").endOf("month").startOf("day")
              )
          },
          {
              label: "This month",
              range: moment().range(
                  moment().startOf("month").startOf("day"),
                  moment().endOf("month").startOf("day")
              )
          }
      ];

      $scope.mycallback = "None";
      $scope.dateRangeChanged = function() {
          $scope.mycallback = " from " + $scope.dateRange.start.format("LL") + 
              " to " + $scope.dateRange.end.format("LL");
          $scope.startDate = $scope.dateRange.start.format("YYYY-MM-DD");
          $scope.endDate = $scope.dateRange.end.format("YYYY-MM-DD");

          const dateRage = {
            start: $scope.dateRange.start,
            end: $scope.dateRange.end
          };
          $cookieStore.put("dateRange", dateRage);
          $scope.getRangedViewTimes();
      }

      // total
      $scope.resetRangedViewTimes = function() {
        $scope.viewtimes = 0;
        $scope.clicktimes = 0;
        $scope.ctr = 0;
      }

      // ranged view times
      $scope.getRangedViewTimes = function() {
        $scope.resetRangedViewTimes();

        var metrics = 'ga:pageviews';
        gapiService.queryAnalyticsData({
          ids: $scope.viewId,
          startDate: $scope.startDate,
          endDate: $scope.endDate,
          metrics: metrics
        })
        .then(rep => {
          if (rep.rows) {
            $scope.viewtimes = parseInt(rep.rows[0][0]);
            var metrics = 'ga:uniqueEvents';
            gapiService.queryAnalyticsData({
              ids: $scope.viewId,
              startDate: $scope.startDate,
              endDate: $scope.endDate,
              filters: 'ga:eventAction==Click',
              metrics: metrics
            })
            .then(res => {
              if (res) {
                $scope.clicktimes = parseInt(res.rows[0][0]);
                $scope.ctr = Math.round($scope.clicktimes/$scope.viewtimes*100);

                $scope.showWidgetPage(1);
                $scope.showDomainPage(1);
                $scope.showCityPage(1);
                $scope.showCountryPage(1);
                $scope.updateCharts({
                  startDate: $scope.startDate,
                  endDate: $scope.endDate
                });
              }
            })
            .catch(err => {});
          } else {
          }
        })
        .catch(err => {
        });
      };
      $scope.getRangedViewTimes();

      $scope.updateCharts = function(params) {
        $scope.$broadcast('callUpdateChart', params);
      }

      // recent top image widgets
      $scope.widgetPagination = {
        curPage: 1,
        pageSize: 20,
        numberOfPages: 1,
        pageSizeList: [20, 50, 100]
      };

      $scope.showWidgetPage = (page) => {
        $scope.widgetPagination.curPage = page?page:$scope.widgetPagination.curPage;
        $scope.getAnalyticsData();
      };

      $scope.analyticsDatas = [];
      $scope.totalRowCounts = 0
      
      // search widget id
      $scope.searchWidgetId = null;
      
      $scope.getAnalyticsData = function () {
        var metrics = 'ga:pageviews,ga:totalEvents';
        var dimensions = 'ga:pagePath,ga:source';
        var param = {
          ids: $scope.viewId,
          startDate: $scope.startDate,
          endDate: $scope.endDate,
          sort:'-ga:pageviews',
          metrics: metrics,
          dimensions: dimensions,
          filters: 'ga:source!@(direct);ga:pagePath!@tag',
          pageSize: $scope.widgetPagination.pageSize,
          startIndex: ($scope.widgetPagination.curPage-1)*$scope.widgetPagination.pageSize+1
        };

        if ($scope.searchWidgetId) {
          param.filters = `ga:pagePath=@${$scope.searchWidgetId};ga:source!@(direct);ga:pagePath!@tag`;
        }
        gapiService.queryAnalyticsData(param)
        .then(res => {
          $scope.analyticsDatas = [];
          $scope.totalRowCounts = 0;
          if (res.rows) {
            for (var data of res.rows) {
              let imageId = data[0]?data[0].split("/").pop():'';
              let clickTimes = data[3]?data[3]:0;
              let ctr = (data[2]&&(data[2]!=0))?clickTimes/data[2]*100:0;
              let analyticsData = {
                imageId: imageId,
                imageUrl: `https://stock.vavel.com/s/photoImages/bunch/h200_${imageId}.jpg`,
                viewTimes: data[2],
                domain: data[1],
                clickTimes: clickTimes,
                ctr: Math.round(ctr)
              };
              $scope.analyticsDatas.push(analyticsData);
            }
            $scope.totalRowCounts = res.totalResults;
            $scope.widgetPagination.numberOfPages = Math.ceil(res.totalResults / $scope.widgetPagination.pageSize);
          }
        })
        .catch(err => {});
      };

      // domain filter
      $scope.domainFilter = null;

      $scope.onFilterByDomain = function (index) {
        let domainData = $scope.domainDatas[index];
        $scope.domainFilter = domainData.pageTitle;
        $scope.getDomainDatas();
      }

      // by domain analytics
      $scope.domainPagination = {
        curPage: 1,
        pageSize: 20,
        numberOfPages: 1,
        pageSizeList: [20, 50, 100]
      };

      $scope.totalDomainRowCounts = 0;
      $scope.showDomainPage = (page) => {
        $scope.domainFilter = null;
        $scope.domainPagination.curPage = page?page:$scope.domainPagination.curPage;
        $scope.getDomainDatas();
      };
      $scope.getDomainDatas = function () {                       
        let params = {
          ids: $scope.viewId,
          startDate: $scope.startDate,
          endDate: $scope.endDate,
          sort:'-ga:pageviews',
          metrics: 'ga:pageviews',
          dimensions: 'ga:source',
          filters: "ga:source!@(direct)",
          pageSize: $scope.domainPagination.pageSize,
          startIndex: ($scope.domainPagination.curPage-1)*$scope.domainPagination.pageSize+1
        };
        
        if ($scope.domainFilter && $scope.domainFilter !== '') {
          params.dimensions = 'ga:referralPath,ga:source';
          params.filters = `ga:source=@${$scope.domainFilter};ga:source!@(direct)`;
        }

        gapiService.queryAnalyticsData(params)
        .then(res => {
          $scope.domainDatas = [];
          if (res.rows) {
            for (var data of res.rows) {
              let domainData = {};

              if ($scope.domainFilter && $scope.domainFilter !== '') {
                domainData = {
                  domainUrl: data[0],
                  linkUrl: 'http://'+data[1].replace('(direct)', 'images.vavel.com')+data[0],
                  pageTitle: data[1].replace('(direct)', 'images.vavel.com'),
                  percentage: Math.round(data[2]/$scope.viewtimes*100)
                };
              } else {
                domainData = {
                  pageTitle: data[0].replace('(direct)', 'images.vavel.com'),
                  percentage: Math.round(data[1]/$scope.viewtimes*100)
                };
              }
              
              $scope.domainDatas.push(domainData);
            }
            $scope.totalDomainRowCounts = res.totalResults;
            $scope.domainPagination.numberOfPages = Math.ceil(res.totalResults / $scope.domainPagination.pageSize);
          }
        })
        .catch(err => {});
      };
      
      // city filter
      $scope.cityFilter = null;
      $scope.onFilterByCity = function (index) {
        let cityData = $scope.cityDatas[index];
        $scope.cityFilter = cityData.cityName;
        $scope.getCityDatas();
      }

      // by city
      $scope.cityPagination = {
        curPage: 1,
        pageSize: 20,
        numberOfPages: 1,
        pageSizeList: [20, 50, 100]
      };

      $scope.totalCityRowCounts = 0;
      $scope.showCityPage = (page) => {
        $scope.cityFilter = null;
        $scope.cityPagination.curPage = page?page:$scope.cityPagination.curPage;
        $scope.getCityDatas();
      };

      $scope.getCityDatas = function () {
        let params = {
          ids: $scope.viewId,
          startDate: $scope.startDate,
          endDate: $scope.endDate,
          metrics: 'ga:pageviews',
          sort:'-ga:pageviews',
          dimensions: 'ga:city',
          pageSize: $scope.cityPagination.pageSize,
          startIndex: ($scope.cityPagination.curPage-1)*$scope.cityPagination.pageSize+1
        };

        if ($scope.cityFilter && $scope.cityFilter !== '') {
          params.dimensions = 'ga:city';
          params.filters = `ga:city=@${$scope.cityFilter}`;
        }

        gapiService.queryAnalyticsData(params)
        .then(res => {
          $scope.cityDatas = [];
          $scope.totalCityRowCounts = 0;
          if (res.rows) {
            for (var data of res.rows) {
              let cityData = {
                cityName: data[0],
                percentage: Math.round(data[1]/$scope.viewtimes*100)
              };
              $scope.cityDatas.push(cityData);
            }
            $scope.totalCityRowCounts = res.totalResults;
            $scope.cityPagination.numberOfPages = Math.ceil(res.totalResults / $scope.cityPagination.pageSize);
          }
        })
        .catch(err => {});
      };

      // country filter
      $scope.countryFilter = null;
      $scope.onFilterByCountry = function (index) {
        let countryData = $scope.countryDatas[index];
        $scope.countryFilter = countryData.countryName;
        $scope.getCountryDatas();
      }

      //by Country
      $scope.countryPagination = {
        curPage: 1,
        pageSize: 20,
        numberOfPages: 1,
        pageSizeList: [20, 50, 100]
      };

      $scope.totalCountryRowCounts = 0;
      $scope.showCountryPage = (page) => {
        $scope.countryFilter = null;
        $scope.countryPagination.curPage = page?page:$scope.countryPagination.curPage;
        $scope.getCountryDatas();
      };

      $scope.getCountryDatas = function () {
        let params = {
          ids: $scope.viewId,
          startDate: $scope.startDate,
          endDate: $scope.endDate,
          metrics: 'ga:pageviews',
          dimensions: 'ga:country',
          sort: '-ga:pageviews',
          pageSize: $scope.countryPagination.pageSize,
          startIndex: ($scope.countryPagination.curPage-1)*$scope.countryPagination.pageSize+1
        };

        if ($scope.countryFilter && $scope.countryFilter !== '') {
          params.dimensions = 'ga:country';
          params.filters = `ga:country=@${$scope.countryFilter}`;
        }

        gapiService.queryAnalyticsData(params)
        .then(res => {
          $scope.countryDatas = [];
          $scope.totalCountryRowCounts = 0;
          if (res.rows) {
            for (var data of res.rows) {
              
              let countryData = {
                countryName: data[0],
                percentage: Math.round(data[1]/$scope.viewtimes*100)
              };

              $scope.countryDatas.push(countryData);
            }
            $scope.countryPagination.numberOfPages = Math.ceil(res.totalResults / $scope.countryPagination.pageSize);
            $scope.totalCountryRowCounts = res.totalResults;
          }
        })
        .catch(err => {});
      };

      $scope.isShowViews = true;
      $scope.isShowClicks = true;
      // toggle views and clicks
      $scope.toggleViews = function () {
        $scope.isShowViews = !$scope.isShowViews;
        $scope.updateCharts({
          showViews: $scope.isShowViews,
          showClicks: $scope.isShowClicks
        });
      }

      $scope.toggleClicks = function () {
        $scope.isShowClicks = !$scope.isShowClicks;
        $scope.updateCharts({
          showViews: $scope.isShowViews,
          showClicks: $scope.isShowClicks
        });
      }

      // real time chart
      $scope.selectedDimention = 'ga:date';
      $scope.selectedIndex = 1;
      $scope.updateChartType = function(dimensions) {
        if($scope.selectedDimention === dimensions) return;

        $scope.selectedDimention = dimensions;
        if (dimensions === "ga:hour") {
          $scope.selectedIndex = 0;
        } else if (dimensions === "ga:date") {
          $scope.selectedIndex = 1;
        } else if (dimensions === "ga:week") {
          $scope.selectedIndex = 2;
        } else if (dimensions === "ga:month") {
          $scope.selectedIndex = 3;
        }

        $scope.updateCharts({
          dimensions: $scope.selectedDimention,
          startDate: $scope.startDate,
          endDate: $scope.endDate
        });
      }

      $scope.mainChart = {
        reportType: 'ga',
        query: {
            metrics: 'ga:pageviews,ga:uniqueEvents',
            dimensions: 'ga:date',
            expression: "ga:uniqueEvents/ga:pageviews",
            'start-date': $scope.startDate,
            'end-date': $scope.endDate,
            filters: 'ga:eventAction==Click',
            ids: `ga:${$scope.viewId}` // put your viewID here
        },
        chart: {
            container: 'chart-container-1',
            type: 'LINE',
            data: {
                datasets: [{
                    yAxisID: 'Views'
                }, {
                    yAxisID: 'Clicks'
                }]
            },
            options: {
              width: '100%',
              colors: ['#af2f2f','#e99002'],
              scales: {
                yAxes: [{
                    id: 'Views',
                    type: 'linear'
                }, {
                    id: 'Clicks',
                    type: 'linear'
                }]
              }
            }
        }
      };
      
      $scope.sessionsChart = {
        reportType: 'ga',
        query: {
            metrics: 'ga:sessions',
            dimensions: 'ga:date',
            'start-date': $scope.startDate,
            'end-date': $scope.endDate,
            ids: `ga:${$scope.viewId}` // put your viewID here
        },
        chart: {
            container: 'chart-container-2',
            type: 'LINE',
            options: {
                width: '100%'
            }
        }
      };

      $scope.usersChart = {
          reportType: 'ga',
          query: {
              metrics: 'ga:users',
              'start-date': $scope.startDate,
              'end-date': $scope.endDate,
              dimensions: 'ga:date',
              ids: `ga:${$scope.viewId}` // put your viewID here
          },
          chart: {
              container: 'chart-container-3',
              type: 'COLUMN',
              options: {
                  width: '100%'
              }
          }
      };

      $scope.defaultIds = {
          ids: `ga:${$scope.viewId}`
      };

      $scope.queries = [{
        query: {
            ids: `ga:${$scope.viewId}`,  // put your viewID here
            metrics: 'ga:sessions',
            dimensions: 'ga:city'
        }
      }];
      
      $scope.setDirectiveFn = function(directiveFn) {
        $scope.directiveFn = directiveFn;
      };

      // if a report is ready
      $scope.$on('$gaReportSuccess', function (e, report, element) {
      });

      $scope.$on('$gaReportError', function (event, response, element) {
          console.log('error response', response);
      });
    };
  })();
  