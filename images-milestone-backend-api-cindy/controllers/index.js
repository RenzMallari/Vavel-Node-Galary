var express = require('express');
var router = express.Router();

var routes = {
  param1: [
    'home',
    'explore',
    'catalog',
    'collections',
    'albums',
    'pricing',
    'settings',
    'contact',
    'team',
    'faq',
    'mycollection',
    'myalbums',
    'mymetrics',
    'search',
    'advancesearch',
    'sale',
    'buy',
    'checkout',
    'success_cart',
    'downloads',
    'uploadimg'
  ],
  param2: [
    'maincollectiondetails',
    'mainalbumdetails',
    'myaccount',
    'cms',
    'signup',
    'collectiondetails',
    'catalogdetails',
    'albumdetails',
    'search',
    'success',
    'widget'
  ],
  param3: [
    'details',
    'uploadimg'
  ]
};

/* GET home page. */
router.get('/', function(req, res, next) {
  var env = process.env.NODE_ENV || 'prod';
  if (env == 'prod'){
    console.log('Production');
    res.render('layout', { title: 'Express' });
  }
  else{
    console.log('Development');
    res.render('layout_max', { title: 'Express' });
  }
});
router.get('/:arg0', function(req, res, next) {
  console.log('Params1: ', req.params.arg0);
  var urls = ['admin', 'api', 'partials', '#', 'js'];
  if (urls.indexOf(req.params.arg0) !== -1) {
    console.log('continue to next router');
    return next();
  }

  if (routes.param1.indexOf(req.params.arg0) === -1) {
    return res.status(404).render('layout', { title: '404 Not Found' });
  }

  res.render('layout', { title: 'Express' });
});
router.get('/:arg0/:arg1', function(req, res, next) {
  console.log('Params2: ' + req.params.arg0 + '/' + req.params.arg1);
  var urls = ['admin', 'api', 'partials', '#', 'js'];
  //,'usersubscription','teamlist','teamcms'
  if (urls.indexOf(req.params.arg0) !== -1) {
    return next();
  }

  if (routes.param2.indexOf(req.params.arg0) === -1) {
    return res.status(404).render('layout', { title: '404 Not Found' });
  }

  res.render('layout', { title: 'Express' });
});
router.get('/:arg0/:arg1/:arg2', function(req, res, next) {
  console.log('Params3: ' + req.params.arg0 + '/' + req.params.arg1 + '/' + req.params.arg2);
  var urls = ['admin', 'api', 'partials', '#'];
  var arg1 = ['dist','lib'];
  if (urls.indexOf(req.params.arg0) !== -1) {
    return next();
  }
  if (req.params.arg0 === 'js' && arg1.indexOf(req.params.arg1) !== -1) {
    console.log('resturn file: ' + __dirname + '/../public/js/' + req.params.arg1 + '/' + req.params.arg2);
    return res.sendFile(__dirname + '/js/' + req.params.arg1 + '/' + req.params.arg2);
    //return next();
  }

  if (routes.param3.indexOf(req.params.arg0) === -1) {
    return res.status(404).render('layout', { title: '404 Not Found' });
  }

  console.log('render layout');
  res.render('layout', { title: 'Express' });
});
router.get('/partials/:name', function(req, res, next) {
   var name = req.params.name;
   console.log('Partial:', name);
  res.render('partials/' + name);
});


module.exports = router;
