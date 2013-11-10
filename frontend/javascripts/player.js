function Player() {}

Player.prototype.onPlay = function() {
  $("#play").addClass('playing');
  $(".player-ctrl").addClass('stop');
  $(".player-ctrl").removeClass('play');
};

Player.prototype.onStopPause = function() {
  $("#play").removeClass('playing');
  $(".player-ctrl").removeClass('stop');
  $(".player-ctrl").addClass('play');
};

Player.prototype.play = function() {
  if (typeof song !== 'undefined' && !$(".player-ctrl").hasClass('inactive')) {
    song.play();
  }
};

Player.prototype.stop = function() {
  if (typeof song !== 'undefined' && !$(".player-ctrl").hasClass('inactive')) {
    song.pause();
    song.each(song.tracks, function (track) {
      track.attr('currentTime', 0);
    });
  }
}

var player = new Player();
var song;

function loadAudio() {
  var audioTracks = {};
  var loaded = false;
  var manualSeek = false;

  song = new tracks.Tracks([]);

  $('.track').each(function(i, trackContainer) {
    var progressElement = $(trackContainer).children('.loading');
    progressElement.progressbar();

    var trackId = $(trackContainer).attr('id');
    var audioElement = $(trackContainer).children('audio').get(0);
    var track = new tracks.Track(audioElement);

    track.on('progress', function() {
      if (this.attr('buffered').length > 0) {
        progressElement.progressbar('value', this.attr('buffered').end(0));
      } else {
        // NOTE: already buffered?
        progressElement.progressbar('value', this.attr('duration'));
      }
    }).on('loadedmetadata', function() {
      progressElement.progressbar('option', 'max', this.attr('duration'));
    });

    audioTracks[trackId] = track;
  });

  // add tracks to song
  for (var trackId in audioTracks) {
    song.addTrack(audioTracks[trackId]);
  }

  song.on('canplay', function() {
      $(".player-ctrl").removeClass('inactive');
      $("#play").click(player.play);
      $("#stop").click(player.stop);
    })
    .on('play', player.onPlay)
    .on('pause', function() {
      if (!recording) {
        player.onStopPause();
      }
    })
    .on('ended', function() {
      if (!recording) {
        player.onStopPause();
      }
    })
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
}