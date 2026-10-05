function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri === '/blog' || uri === '/blog/' || uri === '/blog/cliftons' || uri === '/blog/cliftons/') {
    return {statusCode: 308, headers: {location: {value: '/articles/'}}};
  }
  if (uri.indexOf('/blog/') === 0) {
    var slug = uri.slice(6).replace(/\/$/, '');
    if (slug === 'after-the-wards-navigating-lifes-turbulent-currents-as-a-gay-widower') slug = 'after-the-wards-navigating-lifes-turbulent-currents-as-a-widower';
    if (/^[a-z0-9-]+$/.test(slug)) return {statusCode: 308, headers: {location: {value: '/articles/' + slug + '/'}}};
  }
  if (uri.charAt(uri.length - 1) === '/') request.uri += 'index.html';
  else if (uri.split('/').pop().indexOf('.') === -1) request.uri += '/index.html';
  return request;
}
