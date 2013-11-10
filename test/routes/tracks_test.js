var should = require('should');
var request = require('supertest');
var server = require('../../server');
var Song = require('../../models/song');

describe('tracks', function() {
  var song = new Song('db/test.git');

  describe('POST /tracks', function() {
    it('responds with success', function(done) {
      request(server)
        .post('/tracks')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('responds with new song hash');
  });
});