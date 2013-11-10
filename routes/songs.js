var Song = require('../models/song');
var song = new Song(process.env.GIT_PATH || 'db/test.git');

// GET /songs/123
exports.show = function(req, res, next) {
  if (req.params.hash == 'test') {
    res.json({
      author: {
        name: 'Giovanni'
      },
      parents: ['123'],
      tracks: [
        {
          url: 'https://dl.dropboxusercontent.com/u/3094976/forknroll/synth.mp3',
          name: 'Synth'
        },
        {
          url: 'https://dl.dropboxusercontent.com/u/3094976/forknroll/drum.mp3',
          name: 'Drum'
        }
      ]
    });
  } else {
    song.load(req.params.hash, function(err, song) {
      if (err && err.code === 'ENOENT') return res.json(404, 'not found');
      if (err) return next(err);
      res.json(song);
    });
  }
};