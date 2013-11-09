// GET /
exports.index = function(req, res){
  res.render('index', { title: 'Forn \'n\' Roll' });
};