var express = require('express');
var router = express.Router();
var User = require('../models/usersmodel');

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;




router.use(passport.initialize());

router.use(passport.session());


passport.serializeUser(function (user, done) {
  console.log('user', user)
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  console.log('obj', obj)
  done(null, obj);
});


passport.use(new FacebookStrategy({
  // clientID: 169320175188, //replace
  clientID: 626998041134590,
  // clientSecret: 'ebd3601fa2d514c1e78f374aa6756aa4', //replace
  clientSecret: '54a8c863b8e2f7b0fe4c823e27163af7',
  callbackURL: "https://localhost:8085/api/auth/facebook/callback", //replace
  profileFields: ['id', 'emails', 'displayName', 'name'] //This

},

  // facebook will send back the token and profile
  function (token, refreshToken, profile, done) {
    console.log('================ token :', token);
   console.log('profile', profile);
    // return done(null, profile);
    User.findOne({
        facebookid: profile.id
      }, function(err, result_find) {
        if(err) {
          // res.send({
          //   'type': 'error',
          //   'error': err,
          //   'msg': err.message
          // })
          return done(err)
        }
        else if(result_find && result_find._id) {
          // res.send({
          //   'type': 'success',
          //   'msg': result_find
          // })
          return done(null, result_find)
        }
        else {
          
          User.create({
            facebookid: profile.id,
            username: profile.id,
            email: profile.username || profile.emails[0].value,
            firstname: profile.name.familyName,
            middlename: profile.name.givenName,
            lastname: profile.name.middleName,
            fullname: profile.displayName,
            roleid: 'photographee',
            isdeleted: false
          }, function(err, result_create){
            if(err) {
              // res.send({
              //   'type': 'error',
              //   'error': err,
              //   'msg': err.message
              // })
              return done(err)
            }
            else {
              // res.send({
              //   'type': 'success',
              //   'msg': result_find
              // })
              return done(null, result_create)
            }
          })
        }
      })

  }))

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// xử lý sau khi user cho phép xác thực với facebook
router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/api/auth/facebook/success',
    failureRedirect: '/signup/photographer'
  })
);

router.get('/facebook/success', function(req, res, next) {
  console.log("Passport",req._passport.sesson.user);
  let user=req._passport.sesson.user;
  if(!user.isdeleted && user.isactive){

  }
  res.redirect('/');
});

module.exports = router;
