var helper = require('../test_helper');

describe('users', function() {
  it('responds with success', function(done) {
    helper.request(helper.server)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body[0].name.should.equal('giovanni');
        done();
      });
  });
});