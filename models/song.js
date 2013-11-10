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
      var tracks = blobs.map(function(blob) {
        var content = blob.toString();
        var contentParts = content.split(',');
        var jsonData = contentParts.splice(0, contentParts.length-1).join(',');
        console.log(content);
        console.log(jsonData);
        return JSON.parse(jsonData);
      });

      callback(err, {
        author: commit.author,
        parents: commit.parents,
        tracks: tracks
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
  this.repo.saveAs('blob', JSON.stringify(track), function (err, hash) {
    if (err) return callback(err);
    tree.push({
      mode: 0100644,
      name: track.name + '.json',
      hash: hash
    });
    this.repo.saveAs('tree', tree, function (err, hash) {
      if (err) return callback(err);
      var commit = {
        tree: hash,
        parent: parent,
        author: { name: 'Fork \'n\' Roll', email: 'play@forkandroll.com' },
        committer: { name: 'JS-Git', email: 'js-git@forkandroll.com' },
        message: 'New track'
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