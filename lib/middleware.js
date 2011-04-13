(function() {
  var url;
  url = require('url');
  exports.apiXY = function(req, res, next) {
    req.x = req.body || {};
    res.api = function(y) {
      var GET, j;
      j = JSON.stringify(y);
      GET = url.parse(req.url, true).query || {};
      if (GET.jsonp) {
        j = "" + GET.jsonp + "(" + j + ")";
      }
      res.writeHead(200, {
        'Content-Type': 'text/javascript'
      });
      return res.end(j);
    };
    return next();
  };
}).call(this);
