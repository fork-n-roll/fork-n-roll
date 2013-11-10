var audioContext;
var recorder;

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
    $(".player-rec").removeClass('inactive');
    $("#stop").unbind('click');
    recorder.stop();
    player.stop();
    player.onStopPause();
    console.log('Stopped recording.');
    // create WAV download link using audio data blob
    createDownloadLink();
    recorder.clear();
  }
}

function createDownloadLink() {
  recorder.exportWAV(function(blob) {
    $('#tracks-list #new-track').remove();

    $($.render($('[type=\'html/track\']').html(), {
      id: 'new-track',
      name: 'Untitled',
      url: URL.createObjectURL(blob)
    })).appendTo($('#tracks-list'));

    loadAudio();

    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');
    
    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    recordingslist.appendChild(li);

    var fd = new FormData();
    fd.append('track', blob, new Date().toISOString() + '.wav');
    fd.append('name', 'guitar');

    $.ajax({
      type: 'POST',
      url: '/tracks',
      data: fd,
      processData: false,
      contentType: false
    }).done(function(data) {
      console.log(data);
    });
  });
}

window.onload = function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    
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