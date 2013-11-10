$(document).ready(function() {
  // click on a navi element
  $('a').click(function(e) {
     // skip link's default behaviour
     e.preventDefault();
     // change the hash part of the URL
     $.route($(this).attr('href'));
  })
   
  // Listen to URL change events
  $.route(function(hash) {
    url = hash.slice(2);
    urlSegments = url.split('/');
    if (urlSegments.length > 0 && urlSegments[0] === 'songs') {
      $.get(url, function(res) {
        console.log(res);
      })
    }
  })
});