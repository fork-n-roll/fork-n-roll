$(document).ready(function() {
  // click on a navi element
  $('a.route').click(function(e) {
     // skip link's default behaviour
     e.preventDefault();
     // change the hash part of the URL
     $.route($(this).attr('href'));
  });

  var template = $('[type=\'html/track\']').html();
  var root = $('#tracks-list');
   
  // Listen to URL change events
  $.route(function(hash) {
    url = hash.slice(2);
    urlSegments = url.split('/');
    if (urlSegments.length > 0 && urlSegments[0] === 'songs') {
      root.empty();

      $.get(url, function(res) {
        res.tracks.forEach(function(track) {
          $($.render(template, {
            id: '_' + ('' + Math.random()).slice(2),
            name: track.name,
            url: track.url
          })).appendTo(root);
        });

        $('#choose-a-name input[name=\'name\']').val('');
        $('#choose-a-name input[name=\'parent\']').val(res.parents[0]);

        loadAudio();
      })
    }
  })
});