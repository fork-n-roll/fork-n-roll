var should = require('should');
var request = require('supertest');
var server = require('../../server');
var Song = require('../../models/song');

describe('songs', function() {
  var song = new Song('db/test.git');

  describe('GET /songs/123', function() {
    describe('existing song', function() {
      var songHash;

      before(function(done) {
        song.createWithTrack('track 01', function(err, hash) {
          songHash = hash;
          done();
        });
      });

      it('responds with success', function(done) {
        request(server)
          .get('/songs/' + songHash)
          .expect('Content-Type', /json/)
          .expect(200, done);
      });

      it('responds with song ' + songHash, function(done) {
        request(server)
          .get('/songs/' + songHash)
          .end(function(err, res) {
            res.body.tracks[0].should.match(/track 01/);
            done();
          });
      });
    });

    describe('not existing song', function() {
      it('responds with not found', function(done) {
        request(server)
          .get('/songs/XXX')
          .expect('Content-Type', /json/)
          .expect(404, done);
      });
    })
  });
});