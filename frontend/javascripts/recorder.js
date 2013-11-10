var audioContext;
var recorder;
var recording = false;

function startUserMedia(stream) {
  var input = audioContext.createMediaStreamSource(stream);
  console.log('Media stream created.');
  
  input.connect(audioContext.destination);
  console.log('Input connected to audio context destination.');
  
  recorder = new Recorder(input);
  console.log('Recorder initialised.');

  $(".player-rec").removeClass('inactive');

  $("#rec").click(startRecording);
}

function startRecording() {
  if (typeof recorder !== 'undefined' && !$(".player-rec").hasClass('inactive')) {
    recording = true;
    $(".player-rec").addClass('inactive');
    $(".player-ctrl").removeClass('inactive');
    $("#stop").click(stopRecording);
    recorder.record();
    player.play();
    player.onPlay();
    console.log('Recording...');
  }
}

function stopRecording() {
  if (typeof recorder !== 'undefined') {
    recording = false;
    $(".player-rec").removeClass('inactive');
    $("#stop").unbind('click');
    recorder.stop();
    player.stop();
    player.onStopPause();
    console.log('Stopped recording.');
    // create WAV download link using audio data blob
    createDownloadLink();
    recorder.clear();
    // show save-form
    $('#save-form').show();
  }
}

function createDownloadLink() {
  recorder.exportWAV(function(blob) {
    $('#tracks-list #new-track').remove();

    $($.render($('[type=\'html/new-track\']').html(), {
      id: 'new-track',
      name: 'Untitled',
      url: URL.createObjectURL(blob)
    })).appendTo($('#tracks-list'));

    loadAudio();

    $('#save').click(function() {
      var fd = new FormData();
      fd.append('track', blob, new Date().toISOString() + '.wav');
      fd.append('name', $('#choose-a-name input[name=\'name\']').val());
      fd.append('parent_song', $('#choose-a-name input[name=\'parent\']').val());

      $('.preloader').show();
      $('#save').addClass('inactive');

      $.ajax({
        type: 'POST',
        url: '/tracks',
        data: fd,
        processData: false,
        contentType: false
      }).done(function(hash) {
        $.route('#/songs/' + hash);
        $('.preloader').hide();
        $('#save-form').hide();
        $('#save').removeClass('inactive');
      });

      $('#save').unbind('click');
    });
  });
}

window.onload = function init() {
  try {                       
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    audioContext = new AudioContext;
    console.log('Audio context set up.');
    console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    // TODO: beautiful alert
    alert('No web audio support in this browser!');
  }

  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    console.log('No live audio input: ' + e);
  });
};