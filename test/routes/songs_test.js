var helper = require('../test_helper');

describe('songs', function() {
  describe('GET /songs/123', function() {
    it('responds with success', function(done) {
      helper.request(helper.server)
        .get('/songs/123')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('responds with song 123', function(done) {
      helper.request(helper.server)
        .get('/songs/123')
        .end(function(err, res) {
          res.body.name.should.equal('song 123')
          done();
        });
    });
  });
});