
url = require 'url'



exports.apiXY = (req, res, next) ->
  req.x = req.body or {}
  res.api = (y) ->
    j = JSON.stringify y
    GET = url.parse(req.url, true).query or {}
    if GET.jsonp
      j = "#{GET.jsonp}(#{j})"
    res.writeHead 200, {'Content-Type': 'text/javascript'}
    res.end j
  next()

