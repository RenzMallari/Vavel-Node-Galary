var request = require('request')
    , url = require('url')
    , zlib = require('zlib');
var crypto = require('crypto');
var Promise = require('bluebird');
var redisConfig = require('../../config/redis');
var redis_url = "redis://" + redisConfig.host + ":" + redisConfig.port,
    ttl = process.env.PAGE_TTL || 86400;

// Parse out the connection vars from the env string.
var connection = url.parse(redis_url),
    redis = require('redis'),
    client = redis.createClient(connection.port, connection.hostname),
    redis_online = false,
    last_error = "",
    last_end_message = ""; // Make redis connection

// Select Redis database, parsed from the URL
connection.path = (connection.pathname || '/').slice(1);
connection.database = connection.path.length ? connection.path : '0';
client.select(connection.database);

// Parse out password from the connection string
if (connection.auth) {
    client.auth(connection.auth.split(":")[1]);
}

// Catch all error handler. If redis breaks for any reason it will be reported here.
client.on("error", function (err) {
    if(last_error === err.toString()) {
        // Swallow the error for now
    } else {
        last_error = err.toString();
        console.log("Redis Cache Error: " + err);
    }
});
//
client.on("ready", function () {
    redis_online = true;
    console.log("Redis Cache Connected");
});

var prerender = module.exports = function(req, res, next) {
    if(!prerender.shouldShowPrerenderedPage(req)) return next();

    prerender.beforeRenderFn(req, function(err, cachedRender) {

        if (!err && cachedRender) {
            if (typeof cachedRender == 'string') {
                res.writeHead(200, {
                    "Content-Type": "text/html"
                });
                return res.end(cachedRender);
            } else if (typeof cachedRender == 'object') {
                res.writeHead(cachedRender.status || 200, {
                    "Content-Type": "text/html"
                });
                return res.end(cachedRender.body || '');
            }
        }

        prerender.getPrerenderedPageResponse(req, function(err, prerenderedResponse){
            prerender
                .afterRenderFn(err, req, prerenderedResponse)
                .then(function () {
                    if (prerenderedResponse) {
                        res.writeHead(prerenderedResponse.statusCode, prerenderedResponse.headers);
                        return res.end(prerenderedResponse.body);
                    } else {
                        next(err);
                    }
                });
        });
    });
};

// googlebot, yahoo, and bingbot are not in this list because
// we support _escaped_fragment_ and want to ensure people aren't
// penalized for cloaking.
prerender.crawlerUserAgents = [
    // 'googlebot',
    // 'yahoo',
    // 'bingbot',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator',
    'redditbot',
    'Applebot',
    'WhatsApp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'SkypeUriPreview',
    'nuzzel',
    'Discordbot',
    'Google Page Speed'
];


prerender.extensionsToIgnore = [
    '.js',
    '.css',
    '.xml',
    '.less',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.pdf',
    '.doc',
    '.txt',
    '.ico',
    '.rss',
    '.zip',
    '.mp3',
    '.rar',
    '.exe',
    '.wmv',
    '.doc',
    '.avi',
    '.ppt',
    '.mpg',
    '.mpeg',
    '.tif',
    '.wav',
    '.mov',
    '.psd',
    '.ai',
    '.xls',
    '.mp4',
    '.m4a',
    '.swf',
    '.dat',
    '.dmg',
    '.iso',
    '.flv',
    '.m4v',
    '.torrent',
    '.woff',
    '.ttf',
    '.svg'
];


prerender.whitelisted = function(whitelist) {
    prerender.whitelist = typeof whitelist === 'string' ? [whitelist] : whitelist;
    return this;
};


prerender.blacklisted = function(blacklist) {
    prerender.blacklist = typeof blacklist === 'string' ? [blacklist] : blacklist;
    return this;
};


prerender.shouldShowPrerenderedPage = function(req) {
    var userAgent = req.headers['user-agent']
        , bufferAgent = req.headers['x-bufferbot']
        , isRequestingPrerenderedPage = false;

    if(!userAgent) return false;
    if(req.method != 'GET' && req.method != 'HEAD') return false;

    //if it contains _escaped_fragment_, show prerendered page
    var parsedQuery = url.parse(req.url, true).query;
    if(parsedQuery && parsedQuery['_escaped_fragment_'] !== undefined) isRequestingPrerenderedPage = true;

    //if it is a bot...show prerendered page
    if(prerender.crawlerUserAgents.some(function(crawlerUserAgent){ return userAgent.toLowerCase().indexOf(crawlerUserAgent.toLowerCase()) !== -1;})) isRequestingPrerenderedPage = true;

    //if it is BufferBot...show prerendered page
    if(bufferAgent) isRequestingPrerenderedPage = true;

    //if it is a bot and is requesting a resource...dont prerender
    if(prerender.extensionsToIgnore.some(function(extension){return req.url.toLowerCase().indexOf(extension) !== -1;})) return false;

    //if it is a bot and not requesting a resource and is not whitelisted...dont prerender
    if(Array.isArray(this.whitelist) && this.whitelist.every(function(whitelisted){return (new RegExp(whitelisted)).test(req.url) === false;})) return false;

    //if it is a bot and not requesting a resource and is not blacklisted(url or referer)...dont prerender
    if(Array.isArray(this.blacklist) && this.blacklist.some(function(blacklisted){
            var blacklistedUrl = false
                , blacklistedReferer = false
                , regex = new RegExp(blacklisted);

            blacklistedUrl = regex.test(req.url) === true;
            if(req.headers['referer']) blacklistedReferer = regex.test(req.headers['referer']) === true;

            return blacklistedUrl || blacklistedReferer;
        })) return false;

    return isRequestingPrerenderedPage;
};


prerender.prerenderServerRequestOptions = {};

prerender.getPrerenderedPageResponse = function(req, callback) {
    var options = {
        uri: url.parse(prerender.buildApiUrl(req)),
        followRedirect: false,
        headers: {}
    };
    for (var attrname in this.prerenderServerRequestOptions) { options[attrname] = this.prerenderServerRequestOptions[attrname]; }
    if (this.forwardHeaders === true) {
        Object.keys(req.headers).forEach(function(h) {
            // Forwarding the host header can cause issues with server platforms that require it to match the URL
            if (h == 'host') {
                return;
            }
            options.headers[h] = req.headers[h];
        });
    }
    options.headers['User-Agent'] = req.headers['user-agent'];
    options.headers['Accept-Encoding'] = 'gzip';
    if(this.prerenderToken || process.env.PRERENDER_TOKEN) {
        options.headers['X-Prerender-Token'] = this.prerenderToken || process.env.PRERENDER_TOKEN;
    }

    request.get(options).on('response', function(response) {
        if(response.headers['content-encoding'] && response.headers['content-encoding'] === 'gzip') {
            prerender.gunzipResponse(response, callback);
        } else {
            prerender.plainResponse(response, callback);
        }
    }).on('error', function(err) {
        callback(err);
    });
};

prerender.gunzipResponse = function(response, callback) {
    var gunzip = zlib.createGunzip()
        , content = '';

    gunzip.on('data', function(chunk) {
        content += chunk;
    });
    gunzip.on('end', function() {
        response.body = content;
        delete response.headers['content-encoding'];
        delete response.headers['content-length'];
        callback(null, response);
    });
    gunzip.on('error', function(err){
        callback(err);
    });

    response.pipe(gunzip);
};

prerender.plainResponse = function(response, callback) {
    var content = '';

    response.on('data', function(chunk) {
        content += chunk;
    });
    response.on('end', function() {
        response.body = content;
        callback(null, response);
    });
};


prerender.buildApiUrl = function(req) {
    var prerenderUrl = prerender.getPrerenderServiceUrl();
    var forwardSlash = prerenderUrl.indexOf('/', prerenderUrl.length - 1) !== -1 ? '' : '/';

    var protocol = req.connection.encrypted ? "https" : "http";
    if (req.headers['cf-visitor']) {
        var match = req.headers['cf-visitor'].match(/"scheme":"(http|https)"/);
        if (match) protocol = match[1];
    }
    if (req.headers['x-forwarded-proto']) {
        protocol = req.headers['x-forwarded-proto'].split(',')[0];
    }
    if (this.protocol) {
        protocol = this.protocol;
    }
    var fullUrl = protocol + "://" + (this.host || req.headers['x-forwarded-host'] || req.headers['host']) + req.url;
    return prerenderUrl + forwardSlash + fullUrl;
};

prerender.getPrerenderServiceUrl = function() {
    return this.prerenderServiceUrl || process.env.PRERENDER_SERVICE_URL || 'http://service.prerender.io/';
};

prerender.beforeRenderFn = function(req, done) {
    if (!this.beforeRender) return done();

    return this.beforeRender(req, done);
};


prerender.afterRenderFn = function(err, req, prerender_res) {
    if (!this.afterRender) return Promise.resolve();

    return this.afterRender(err, req, prerender_res);
};

prerender.hashUrl = function (url) {
    if (!url || (url == '/')) {
        url = 'index';
    }

    return 'url:' + crypto.createHash('md5').update(url).digest("hex");
};

prerender.beforeRender = function (req, done) {
    console.log(req.url);

    var key = prerender.hashUrl(req.url.trim());

    client.get(key, function (err, result) {
        if (!err && result) {
            done(null, result);
        } else {
            done(null, null);
        }
    });
};

prerender.afterRender = function (err, req, prerender_res) {
    return new Promise(function (resolve, reject) {
        if (prerender_res && prerender_res.statusCode === 200) {
            var key = prerender.hashUrl(req.url.trim());

            client.set(key, prerender_res.body, function (err, reply) {
                if (!err && reply && ttl && ttl != 0) {
                    client.expire(key, ttl, function (err, didSetExpiry) {
                        resolve();
                    });
                }
            });
        } else {
            resolve();
        }
    });
};

prerender.set = function(name, value) {
    this[name] = value;
    return this;
};
