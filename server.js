// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('fagdshmxJpp-hZcg');

var express = require('express');
var user = require('./routes/user');
var songs = require('./routes/songs');
var tracks = require('./routes/tracks');
var http = require('http');
var path = require('path');

var app = express();
module.exports = app;

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());

// development and production
if ('development' == app.get('env') || 'production' == app.get('env')) {
  app.use(express.logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.bodyParser({
  keepExtensions: true,
  uploadDir: __dirname + '/frontend/tracks',
  limit: '2mb'
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'frontend')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);
app.get('/songs/:hash', songs.show);
app.post('/tracks', tracks.create);

http.createServer(app).listen(app.get('port'), function(err) {
  if (err) { console.error(err); process.exit(-1); }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err); }
      process.setuid(stats.uid);
    });
  }

  if ('development' == app.get('env') || 'production' == app.get('env')) {
    console.log('Express server listening on port ' + app.get('port'));
  }
});
