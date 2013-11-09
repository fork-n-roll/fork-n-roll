var should = require('should');
var request = require('supertest');
var server = require('../../server');

describe('users', function() {
  it('responds with success', function(done) {
    request(server)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body[0].name.should.equal('giovanni');
        done();
      });
  });
});