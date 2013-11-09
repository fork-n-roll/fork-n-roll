var platform = require('git-node-platform');
var jsGit = require('js-git')(platform);
var fsDb = require('git-fs-db')(platform);
var fs = platform.fs;
var async = require('async');

// Song model
function Song(repoPath) {
  // Create a filesystem backed bare repo
  this.repo = jsGit(fsDb(fs(repoPath)));
}

// Load song from hash
Song.prototype.load = function(hash, callback) {
  this._readCommitTree(hash, function(err, commit, tree, hash) {
    if (err) return callback(err);
    async.parallel(tree.map(function(entry) {
      return function(callback) {
        this.repo.loadAs('blob', entry.hash, callback);
      }.bind(this);
    }.bind(this)), function(err, blobs) {
      callback(err, {
        author: commit.author,
        parents: commit.parents,
        tracks: blobs.map(function(blob) {return blob.toString()})
      });
    });
  }.bind(this));
};

// Add track to song
Song.prototype.addTrack = function(hash, track, callback) {
  var parent = hash;
  this._readCommitTree(hash, function(err, commit, tree, hash) {
    if (err) return callback(err);
    this._addTrackToTree(parent, tree, track, callback);
  }.bind(this));
};

// Create new song with first track
Song.prototype.createWithTrack = function(track, callback) {
  this._addTrackToTree(null, [], track, callback);
};

// Add track to tree and create new commit
Song.prototype._addTrackToTree = function(parent, tree, track, callback) {
  this.repo.saveAs('blob', track, function (err, hash) {
    if (err) return callback(err);
    tree.push({
      mode: 0100644,
      name: hash + '.json',
      hash: hash
    });
    this.repo.saveAs('tree', tree, function (err, hash) {
      if (err) return callback(err);
      var commit = {
        tree: hash,
        parent: parent,
        author: { name: 'Giovanni', email: 'giovanni@forkandroll.com' },
        committer: { name: 'JS-Git', email: 'js-git@forkandroll.com' },
        message: 'Test message'
      };
      if (!parent) delete commit.parent;
      this.repo.saveAs('commit', commit, callback);
    }.bind(this));
  }.bind(this));
}

// Read load commit's tree
Song.prototype._readCommitTree = function(hash, callback) {
  this.repo.loadAs('commit', hash, function(err, commit, hash) {
    if (err) return callback(err);
    this.repo.loadAs('tree', commit.tree, function(err, tree, hash) {
      callback(err, commit, tree, hash);
    });
  }.bind(this));
}

module.exports = Song;