$(document).ready(function() {
  var audio = $('.player audio').get(0);
  var loadingIndicator = $('.player #loading');
  var positionIndicator = $('.player #handle');
  var timeleft = $('.player #timeleft');
  var loaded = false;
  var manualSeek = false;

  if ((audio.buffered != undefined) && (audio.buffered.length != 0)) {
    $(audio).bind('progress', function() {
      var loaded = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10);
      loadingIndicator.css({width: loaded + '%'});
    });
  }
  else {
    loadingIndicator.remove();
  }

  $(audio).bind('timeupdate', function() {
      
    var rem = parseInt(audio.duration - audio.currentTime, 10),
    pos = (audio.currentTime / audio.duration) * 100,
    mins = Math.floor(rem/60,10),
    secs = rem - mins*60;
        
    timeleft.text('-' + mins + ':' + (secs > 9 ? secs : '0' + secs));
    
    if (!loaded) {
      loaded = true;
          
      $('.player #gutter').slider({
        value: 0,
        step: 0.01,
        orientation: "horizontal",
        range: "min",
        max: audio.duration,
        animate: true,
        slide: function() {             
          manualSeek = true;
        },
        stop:function(e,ui) {
          manualSeek = false;         
          audio.currentTime = ui.value;
        }
      });
    }
    else if(!manualSeek) {
      $('.player #gutter').slider('value', audio.currentTime);
    }

  });

  $(audio).bind('play',function() {
    $("#play").addClass('playing');
    $(".player-ctrl").addClass('stop'); 
    $(".player-ctrl").removeClass('play');
  }).bind('pause ended', function() {
    $("#play").removeClass('playing');
    $(".player-ctrl").removeClass('stop');
    $(".player-ctrl").addClass('play');    
  });   
      
  $("#play").click(function() {     
    audio.play();
  });
  $("#stop").click(function() {     
    audio.pause(); 
  });

});