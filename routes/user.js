// GET /users
exports.list = function(req, res){
  res.send([{name: 'giovanni'}]);
};