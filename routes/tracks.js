var Song = require('../models/song');
var song = new Song('db/test.git');

var format = format = require('util').format;
var fs = require('fs');

var resque = require('coffee-resque').connect({
  host: 'localhost',
  port: 6379
});

// POST /tracks
exports.create = function(req, res, next) {
  if (req.files.track.type === 'audio/wav') {
    var segments = req.files.track.path.split('/');
    var newFilePath = req.files.track.path.replace(segments[segments.length-1], req.files.track.name);
    fs.rename(req.files.track.path, newFilePath);

    // enqueue enconding jobs
    resque.enqueue('enc', 'encode', [newFilePath, 'mp3']);
    resque.enqueue('enc', 'encode', [newFilePath, 'aac']);
    resque.enqueue('enc', 'encode', [newFilePath, 'ogg']);

    var trackData = {
      name: req.body.name,
      originalPath: newFilePath,
      url: '/tracks/' + req.files.track.name
    };

    console.log(trackData);

    var callback = function(err, hash) {
      if (err) return next(err);
      res.json(hash);
    };

    // save new song
    if (req.body.parent) {
      song.addTrack(req.body.parent, trackData, callback);
    } else {
      song.createWithTrack(trackData, callback);
    }
  } else {
    fs.unlink(req.files.track.path, function(err) {
      if (err) console.log(err);
      console.log('file deleted');
    });
    res.json(412, 'audio/wav please');
  }
};