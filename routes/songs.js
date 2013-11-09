// GET /songs/123
exports.show = function(req, res) {
  res.json({name: 'song ' + req.params.sha});
};