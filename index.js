require('@risingstack/trace');
// your application's code
import Promise from 'bluebird'; // eslint-disable-line import/imports-first
import mongoose from 'mongoose'; // eslint-disable-line import/imports-first
import util from 'util'; // eslint-disable-line import/imports-first
import redis from 'redis'; // eslint-disable-line import/imports-first
import winston from 'winston'; // eslint-disable-line import/imports-first
import config from './config/env'; // eslint-disable-line import/imports-first
import app from './config/express'; // eslint-disable-line import/imports-first
import fixtures from './server/helpers/fixtures'; // eslint-disable-line import/imports-first

fixtures();

const debug = require('debug')('agrobolt-base-api-mongo:index');

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

mongoose.connection.on('connected', () => {
  winston.log('info', 'Mongoose default connection open to %s for %s environment', config.db, config.env);
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// listen on port config.port
app.listen(config.port, () => {
  winston.log('info', 'Server started on port %s for %s environment', config.port, config.env);
});

process.on('uncaughtException', (err) => {
  winston.log('error', 'uncaught error', err);
});

// Promise redis
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

export default app;
