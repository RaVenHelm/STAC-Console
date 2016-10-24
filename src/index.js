/*eslint no-console: 0 */
require('babel-polyfill');

// Koa dependencies
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import morgan from 'koa-morgan';
import logger from 'koa-logger';
import views from 'koa-views';
import session from 'koa-session';
import convert from 'koa-convert';
import serve from 'koa-static';
import mount from 'koa-mount';
import mkdirp from 'mkdirp';
import async from 'async';

// Regular NodeJS
import path from 'path';
import fs from 'fs';

// Application routes
import about from './routes/about';
import err404 from './routes/404';
import err500 from './routes/error';
import index from './routes/';

const app = module.exports = new Koa();

const sessionOpts = {
  maxage: 24 * 60 * 60 * 1000, // in milliseconds, from koa-session
  key: 'gd-session'
};

const viewsDir = path.resolve('views');
let logDir = path.resolve('logs');

mkdirp('logs', err => {
  if (err) logDir = __dirname;
});

// General access logs
const stream = fs.createWriteStream(logDir + '/access.log', {
  flags: 'a'
});

if (process.env.NODE_ENV !== 'test') {
  app.use(logger());
}

app.keys = ['secret123'];
app.use(convert(session(sessionOpts, app)));

app.use(morgan('combined', {
  stream
}));

app.use(mount('/public', serve('public')));

app.use(convert(bodyParser()));
app.use(views(viewsDir, {
  extension: 'pug'
}));

app.use(mount('/', index.routes()))
  .use(index.allowedMethods())
  .use(about.allowedMethods());

// have a specific test route for
// testing 500 errors
if (process.env.NODE_ENV === 'test') {
  app.use(mount('/error', () => {
    throw new Error('Bang bang!');
  }));
}

// Error handling middleware
app.use(err404);
app.use(err500);

app.on('error', err => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error occurred:', err);
    async.parallel([
      cb => {
        const stream = fs.createWriteStream(logDir + '/error.log', { access: 'a '});
        stream.write(err, cb);
      }  
    ])
  }
});

if (!module.parent) app.listen(3000);