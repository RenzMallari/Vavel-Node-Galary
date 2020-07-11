const config = require('../config/redis');

const host = config.host || 'localhost';
const port = config.port || 6379;

const cache = require('express-redis-cache')({
  prefix: 'imgs',
  host,
  port,
  expire: 1800
});

exports.route = route;
exports.del = cache.del.bind(cache);
exports.cache = cache;

function route(options) {
  return (req, res, next) => {
    const query = req.query;
    const params = req.params;

    const name = [];
    options.name && name.push(options.name);

    // eslint-disable-next-line max-len
    if (params) for (const [key, val] of Object.entries(params)) name.push(`${key}:${val}`);


    // eslint-disable-next-line max-len
    if (query) for (const [key, val] of Object.entries(query)) name.push(`${key}:${val}`);

    return cache.route({ name: name.join(':') })(req, res, next);
  };
}
