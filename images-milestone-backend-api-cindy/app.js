const express = require('express');
const nodemon = require('nodemon');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const CryptoJS = require('node-cryptojs-aes').CryptoJS;
const fs = require('fs');
const upload = require('jquery-file-upload-middleware');
const cors = require('cors');
const _n = require('country-js');
require('dotenv').config();

const admin = require('./controllers/admin');

const frontend = require('./controllers/index');
const tagapi = require('./api/tags');
const braintree = require('./api/braintree');
const usersapi = require('./api/user');
const userrolesapi = require('./api/userrole');
const cmsapi = require('./api/cms');
const subscriptionapi = require('./api/subscription');
const settingsapi = require('./api/settings');
const languageapi = require('./api/language');
const galleryapi = require('./api/usergallery');
const albumapi = require('./api/useralbum');
const catalogapi = require('./api/catalog');
const contactapi = require('./api/contactus');
const faqapi = require('./api/faq');
const teamsapi = require('./api/teams');
const joinusapi = require('./api/joinus');
const brandapi = require('./api/brands');
const exploreapi = require('./api/explore');
const saleapi = require('./api/sale');
const purchaseapi = require('./api/purchase');
const downloadapi = require('./api/downloads');
const apiembed = require('./api/embed');
const passport = require('./api/passport');
const gapi = require('./api/googleapi');
const app = express();
const session = require('client-sessions');
// app.use(cors());
require('@babel/core').transform('code', {
  plugins: ['@babel/plugin-transform-arrow-functions']
});

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(
  cors({
    credentials: true, // Access-Control-Allow-Credentials true
    origin: ["https://images.vavel.com", "https://managerimages.vavel.com", "http://localhost:3000", "http://172.104.27.231:3000"]
  })
);


app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 24 * 60 * 60 * 1000, // defaults to 1 day
  cookie: {
    path: '/',
    // cookie expiration parameters
    // this gets updated on every cookie call,
    // so it's not appropriate for saying that the session
    // expires after 1 day, for example, since the cookie
    // may get updated regularly and push the time back.
    maxAge: 24 * 60 * 60 * 1000, // in ms
    httpOnly: false, // defaults to true
    secure: false // defaults to false
  }
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.set('views', require('path').join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser({ encode: String }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(require('prerender-node').set('prerenderToken', 'I0EIxPdagUeD7gRqZvdq'));

app.use(require('./controllers/middlewares/prerender').set('prerenderServiceUrl', 'http://localhost:1337/'));

app.use('*', function(req, res, next) {
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const country = req.headers['CF-IPCountry'] || req.headers['cf-ipcountry'];
  const geolocation = _n.search(country) ? _n.search(country)[0] : {};
  req.ip = ip;
  req.country = country;
  req.geolocation = geolocation;
  next();
});
app.get("/api/getenv", function(req, res) {
  let key = 'encrypt!@#key';
  let encryptedClientId = CryptoJS.AES.encrypt(process.env.CLIENT_ID, key).toString();
  let encryptedViewId = CryptoJS.AES.encrypt(process.env.VIEW_ID, key).toString();
  var env = {
    clientId: encryptedClientId,
    viewId: encryptedViewId
  };
  res.json({data: env});
});
app.get('/api/ip', function(req, res, next) {
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const country = req.headers['CF-IPCountry'] || req.headers['cf-ipcountry'];
  if (country) res.send({
    type: 'success',
    data: {
      ip,
      name: country,
      country: _n.search(country) ? _n.search(country)[0] : {}
    }
  });

  else res.send({
    type: 'error'
  });

});

// app.use('/tag', frontend);
app.use('/admin', admin);
app.use('/', frontend);
app.use('/api', usersapi);
app.use('/api/embed', apiembed);
app.use('/api/userroles', userrolesapi);
app.use('/api/cms', cmsapi);
app.use('/api/subscription', subscriptionapi);
app.use('/api/settings', settingsapi);
app.use('/api/language', languageapi);
app.use('/api/gallery', galleryapi);
app.use('/api/album', albumapi);
app.use('/api/catalog', catalogapi);
app.use('/api/contact', contactapi);
app.use('/api/faq', faqapi);
app.use('/api/teams', teamsapi);
app.use('/api/joinus', joinusapi);
app.use('/api/brand', brandapi);
app.use('/api/explore', exploreapi);
app.use('/api/sale', saleapi);
app.use('/api/purchase', purchaseapi);
app.use('/api/braintree', braintree);
app.use('/api/gapi', gapi);
app.use('/api/tag', tagapi);
app.use('/api/download', downloadapi);
app.use('/api/auth', passport);
/*
app.use('/upload', upload.fileHandler({
 uploadDir: __dirname + '/api/uploads/',
 uploadUrl: '/uploads',
 imageVersions: {
    thumbnail: {
        height: 170
    }
 }
}));
upload.on('begin', function (fileInfo, req, res) {
});
upload.on('end', function (fileInfo, req, res){
});
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  // Fix bug show 404 html with another parameter
  return res.status(404).render('layout', { title: '404 Not Found' });
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') app.use(function(err, req, res) {
  console.log('intercepted error', err.message);
  if (req.path.indexOf('/api') === 0) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  }
  else {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  }
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  console.log('error: ', err);
  res.status(err.status || 500);
  res.send(err);
});

const port = 8085;

const key = fs.readFileSync('./selfsigned.key');
const cert = fs.readFileSync('./selfsigned.crt');
const options = {
  key,
  cert
};

// https.createServer(options, app).listen(port, () => {
//   console.log("server starting on port : " + port)
// });

app.listen(port, () => {
  console.log(`server starting on port : ${port}`);
});

module.exports = app;
