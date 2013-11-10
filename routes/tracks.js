var Song = require('../models/song');
var song = new Song('db/test.git');

var format = format = require('util').format;
var fs = require('fs');

// POST /tracks
exports.create = function(req, res, next) {
  if (req.files.track.type === 'audio/wav') {
    var segments = req.files.track.path.split('/');
    var newFilePath = req.files.track.path.replace(segments[segments.length-1], req.files.track.name);
    fs.rename(req.files.track.path, newFilePath);
    res.json(newFilePath);
  } else {
    fs.unlink(req.files.track.path, function(err) {
      if (err) console.log(err);
      console.log('file deleted');
    });
    res.json(412, 'audio/wav please');
  }
};