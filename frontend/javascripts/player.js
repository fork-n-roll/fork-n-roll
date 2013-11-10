$(document).ready(function() {

  var audioTracks = {};
  var loaded = false;
  var manualSeek = false;

  $('.track').each(function(i, trackContainer) {
    var progressElement = $(trackContainer).children('.loading');
    var trackId = $(trackContainer).attr('id');
    var audioElement = $(trackContainer).children('audio').get(0);
    var track = new tracks.Track(audioElement);
    track.on('progress', function() {
      if (this.attr('buffered').length > 0) {
        console.log('BUFFERING', trackId, this.attr('buffered').end(0));
        progressElement.progressbar('value', this.attr('buffered').end(0));
      } else {
        console.log('WWWWWWWWW', this.attr('buffered'));
      }
    }).on('loadedmetadata', function() {
      console.log('LOADEDMETADATA', this.attr('duration'));
      progressElement.progressbar({ max: this.attr('duration') });
    });

    audioTracks[trackId] = track;
  });

  var play = function() {
    $("#play").addClass('playing');
    $(".player-ctrl").addClass('stop');
    $(".player-ctrl").removeClass('play');
  };

  var stopPause = function() {
    $("#play").removeClass('playing');
    $(".player-ctrl").removeClass('stop');
    $(".player-ctrl").addClass('play');
  };

  var song = new tracks.Tracks([]);

  // add tracks to song
  for (var trackId in audioTracks) {
    song.addTrack(audioTracks[trackId]);
  }

  song.on('canplay', function() {
      $(".player-ctrl").removeClass('inactive');
    })
    .on('play',play)
    .on('pause', stopPause)
    .on('ended', stopPause)
    .on('timeupdate', function() {
      $('.timeleft').text(tracks.humanizeTime(this.longest.attr('currentTime')));

      if (!loaded) {
        loaded = true;

        $('.tracks #gutter').slider({
          value: 0,
          step: 0.01,
          orientation: 'horizontal',
          range: 'min',
          max: this.longest.attr('duration'),
          animate: true,
          slide: function() {
            manualSeek = true;
          },
          stop: function(e,ui) {
            manualSeek = false;
            this.each(this.tracks, function (track) {
              track.attr('currentTime', ui.value);
            });
          }.bind(this)
        });
      } else if (!manualSeek) {
        $('.tracks #gutter').slider('value', this.longest.attr('currentTime'));
      }
    })
    .preload();

  $("#play").click(function() {
    song.play();
  });

  $("#stop").click(function() {
    song.pause();
  });

});