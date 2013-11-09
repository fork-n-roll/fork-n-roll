var platform = require('git-node-platform');
var jsGit = require('js-git')(platform);
var fsDb = require('git-fs-db')(platform);
var fs = platform.fs;
var async = require('async');

// Song model
function Song(repo_path) {
  // Create a filesystem backed bare repo
  this.repo = jsGit(fsDb(fs(repo_path)));
}

// Load song from hash
//
// Example:
//
//   var Song = require('./models/song');
//   var s = new Song('test.git');
//   s.load('HEAD', function(err, song) {
//     if(err) throw err;
//     console.log('SONG', song);
//   });
Song.prototype.load = function(hash, callback) {
  this.repo.loadAs('commit', hash, function(err, commit, hash) {
    if (err) throw err;
    console.log('COMMIT', hash, commit);
    this.repo.loadAs('tree', commit.tree, function(err, tree, hash) {
      if (err) throw err;
      console.log('TREE', hash, tree);
      async.parallel(tree.map(function(entry) {
        return function(callback) {
          this.repo.loadAs('blob', entry.hash, callback);
        }.bind(this);
      }.bind(this)), function(err, blobs) {
        console.log('BLOBS', blobs);
        callback(err, {
          author: commit.author,
          parents: commit.parents,
          tracks: blobs.map(function(blob) {return blob.toString()})
        });
      });
    }.bind(this));
  }.bind(this));
};

// Add track to song
Song.prototype.addTrack = function(hash, callback) {

};

module.exports = Song;