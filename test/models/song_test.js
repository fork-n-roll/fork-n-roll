var should = require('should');
var Song = require('../../models/song');

describe('song', function() {
  var song = new Song('db/test.git');

  describe('createWithTrack', function() {
    it('creates a new song', function(done) {
      song.createWithTrack('track 01', function(err, hash) {
        should.not.exist(err);
        should.exist(hash);
        song.load(hash, function(err, song) {
          song.tracks[0].should.match(/track 01/);
          should.not.exist(song.parent);
          done();
        });
      });
    });
  });

  describe('addTrack', function() {
    var originalSong;

    before(function(done) {
      song.createWithTrack('track 01', function(err, hash) {
        originalSong = hash;
        done();
      });
    });

    it('adds a new track to an existing song', function(done) {
      song.addTrack(originalSong, 'track 02', function(err, hash) {
        should.not.exist(err);
        should.exist(hash);
        song.load(hash, function(err, song) {
          song.tracks[0].should.match(/track 02/);
          song.tracks[1].should.match(/track 01/);
          song.parents.should.include(originalSong);
          done();
        });
      });
    });
  });
});