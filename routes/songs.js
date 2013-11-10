var Song = require('../models/song');
var song = new Song(process.env.GIT_PATH || 'db/test.git');

// GET /songs/123
exports.show = function(req, res, next) {
  song.load(req.params.hash, function(err, song) {
    if (err && err.code === 'ENOENT') return res.json(404, 'not found');
    if (err) return next(err);
    res.json(song);
  });
};