$(document).ready(function() {
  // click on a navi element
  $('a.route').click(function(e) {
     // skip link's default behaviour
     e.preventDefault();
     // change the hash part of the URL
     $.route($(this).attr('href'));
  });
   
  // Listen to URL change events
  $.route(function(hash) {
    url = hash.slice(2);
    urlSegments = url.split('/');
    if (urlSegments.length > 0 && urlSegments[0] === 'songs') {
      $.get(url, function(res) {
        $('#tracks-list').empty();

        res.tracks.forEach(function(track) {
          $($.render($('[type=\'html/track\']').html(), {
            id: '_' + ('' + Math.random()).slice(2),
            name: track.name,
            urlMp3: track.url.slice(0, -4) + '.mp3',
            urlAac: track.url.slice(0, -4) + '.mp3',
            urlOgg: track.url.slice(0, -4) + '.mp3'
          })).appendTo($('#tracks-list'));
        });

        console.log(res);

        $('#choose-a-name input[name=\'name\']').val('');
        $('#choose-a-name input[name=\'parent\']').val(urlSegments[1]);

        if (res.parents.length > 0) {
          $('#parent-container a').attr('href', '#/songs/' + res.parents[0]);
          $('#parent-container a').html(res.parents[0]);
          $('#parent-container').show();
        } else {
          $('#parent-container').hide();
        }

        loadAudio();
      })
    }
  })
});