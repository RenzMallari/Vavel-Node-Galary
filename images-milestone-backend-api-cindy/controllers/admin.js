const express = require('express');
const md5 = require('md5');
const router = express.Router();
const models = require('../models');

const User = models.user;

router.get('/', function(req, res) {
  res.render('admin/index', { title: 'Express' });
});
router.get('/:arg0', function(req, res, next) {
  console.log('Admin params: ', req.params.arg0);
  if (req.params.arg0 === 'partials' || req.params.arg0 === 'js' || req.params.arg0 === 'logout' || req.params.arg0 === 'adminlogin') return next();

  res.render('admin/index', { title: 'Express' });
});

router.get('/partials/:name', function(req, res) {
  const name = req.params.name;
  res.render(`admin/partials/${name}`);
});

router.post('/logout', function(req, res) {
  req.session.adminuser = null;
  res.json({ message: 'logged out' });
});

router.post('/adminauthlogin', function(req, res) {
  res.json(req.session.adminuser);
});

router.post('/adminlogin', function(req, res) {
  const _email = req.body.email;
  const _password = md5(req.body.password);
  if (_email === 'billing@vavel.com') User.findOne({
    'email': _email
  }, function(err, user) {
    if (err) return res.status(401).json(err);

    if (!user) return res.status(400).json('Bad request');

    if (!(user.password === _password && user.isactive && !user.isdeleted)) return res.status(400).json({ message: 'Wrong credentials' });

    User.esUpdateOne({ '_id': user._id }, { $set: { 'lastloggedindate': Date.now(), 'isloggedin': true, 'isadmin': true } }, function(error, doc) {
      req.session.adminuser = user;
      res.json({ success: 'logged in', user });
    });

  });

  else res.json('Bad request');

});
router.get('/getuser/:username', function(req, res, next) {
  // console.log("login");
  const _username = req.params.username;
  console.log(_username);

});

module.exports = router;
