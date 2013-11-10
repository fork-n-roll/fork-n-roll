var exec = require('child_process').exec;

var encodingJobs = {
  // format is 'mp3', 'aac', or 'ogg'
  encode: function(filePath, format, callback) {
    var filePathWithoutExt = filePath.slice(0, -4);
    exec('/home/deploy/bin/ffmpeg -i ' + filePath + ' ' + filePathWithoutExt + '.' + format, function (err, stdout, stderr) {
      if (err) return callback(new Error(err));
      callback('DONE', filePath, format);
    });
  },
}

// setup a worker
var worker = require('coffee-resque').connect({
  host: 'localhost',
  port: 6379
}).worker('*', encodingJobs);

// Triggered every time a Job errors.
worker.on('error', function(err, worker, queue, job) {
  console.log('ERROR', job);
});

// Triggered on every successful Job run.
worker.on('success', function(worker, queue, job, result) {
  console.log(result);
});

worker.start();