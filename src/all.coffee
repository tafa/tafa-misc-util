
http = require 'http'
assert = require 'assert'
querystring = require 'querystring'

async = require 'async'
{pack, unpack} = require 'msgpack'


exports.middleware = require './middleware'



exports.readText = readText = (s, callback) ->
  arr = []
  s.on 'data', (data) -> arr.push data.toString 'utf-8'
  s.on 'end', () -> callback arr.join ''


exports.readText = readData = (s, callback) ->
  arr = []
  s.on 'data', (data) -> arr.push data
  s.on 'end', () -> callback joinBuffers arr


# <code>msgpack.pack</code> isn't an ordinary <code>Buffer</code>.
exports.msgpackToBuffer = (x) ->
  new Buffer(pack(x).toString('base64'), 'base64')


exports.joinBuffers = joinBuffers = (arr) ->
  size = 0
  for x in arr
    size += x.length
  result = new Buffer size
  pos = 0
  for x in arr
    x.copy result, pos
    pos += x.length
  result


exports.joinBuffersWithFixes = joinBuffersWithFixes = (bufs, prefix, infix, suffix) ->
  
  # Sizes
  prefixSize = if prefix then prefix.length else 0
  infixSize  = if infix  then infix.length  else 0
  suffixSize = if suffix then suffix.length else 0
  totalSize = prefixSize + suffixSize + infixSize * (bufs.length - 1)
  for buf in bufs
    totalSize += buf.length
  
  # Prep result
  result = new Buffer totalSize
  prefix.copy(result, 0, 0) if prefix
  suffix.copy(result, totalSize - suffixSize, 0) if suffix
  
  # Fill result
  pos = prefixSize
  first = yes
  for buf in bufs
      if infix
        if first
          first = no
        else
          infix.copy(result, pos, 0)
          pos += infixSize
      buf.copy(result, pos, 0)
      pos += buf.length
  
  result


exports.toBuffer = toBuffer = (x) ->
  if x instanceof Buffer
    x
  else
    new Buffer x


exports.firstTimeOnly = firstTimeOnly = (callback) ->
  state = {first: yes}
  return () ->
    if state.first
      state.first = no
      callback()

# Ensure we don't return 1. (Easier than trusting/verifying each JS impl)
exports.random = random = () ->
  x = Math.random()
  if x == 1 then 0 else x


# <code>[a, b]</code>
exports.randomInteger = randomInteger = (a, b) ->
  Math.floor(random() * (b - a + 1)) + a


exports.randomToken = randomToken = (n = 8, alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz') ->
  (for i in [0...n]
    alphabet.substr randomInteger(0, 57), 1
  ).join('')



exports.test_api_call = test_api_call = (fname, x, callback) ->
  j = JSON.stringify x
  qs = querystring.stringify {j:j}
  opt = {
    host: 'localhost'
    port: 8000
    method: 'GET'
    path: "/api/v0.1/#{fname}.js?#{qs}"
  }
  console.log "-----------------------------------\\"
  console.log "API: #{fname} #{j}"
  req = http.get opt, (res) ->
    readText res, (text) ->
      process.stdout.write text
      console.log "\n-----------------------------------/"
      y = JSON.parse text
      callback y


exports.extend = extend = (x, x2) ->
  for own k, v of x2
    x[k] = v
  x


exports.replaceExtension = replaceExtension = (path, fromExt, toExt) ->
  bits = path.split '.'
  assert.equal bits.pop(), fromExt
  bits.push toExt
  bits.join '.'


exports.re_escape = re_escape = (s) ->
  s.replace /[-\[\]{}()*+?.,\\^$|#\s]/g, "\\$&"


exports.startswith = (s, s2) ->
  (s.length >= s2.length) and (s.substr(0, s2.length) == s2)


exports.endswith = (s, s2) ->
  (s.length >= s2.length) and (s.substr(s.length - s2.length) == s2)


exports.rstrip = (s, chars = "\t\n\v\f\r ") ->
  m = s.match new RegExp "[#{re_escape chars}]+$"
  if m then s.substr(0, s.length - m[0].length) else s


exports.lstrip = (s, chars = "\t\n\v\f\r ") ->
  m = s.match new RegExp "^[#{re_escape chars}]+"
  if m then s.substr(m[0].length) else s


exports.check_exec = check_exec = (cmd, callback) ->
  exec cmd, (e, stdout, stderr) ->
    throw e if e
    callback stdout, stderr


exports.spawn_exec = spawn_exec = (name, args, callback) ->
  
  stdout_bufs = []
  stderr_bufs = []
  p = spawn name, args
  if callback.length > 0
    p.stdout.on 'data', (data) -> stdout_bufs.push data
    p.stderr.on 'data', (data) -> stderr_bufs.push data
  p.on 'exit', (code) ->
    callback(
        (if code == 0 then null else {code: code}),
        (if callback.length > 0 then joinBuffers(stdout_bufs) else null),
        (if callback.length > 0 then joinBuffers(stderr_bufs) else null))


exports.check_spawn_exec = check_spawn_exec = (name, args, callback) ->
  spawn_exec name, args, (e, stdout, stderr) ->
    throw e if e
    callback stdout, stderr




ENOTDIR = 20


_pathsIn = (path, paths, callback) ->
  fs.readdir path, (err, files) ->
    
    # Case: file
    if err and err.errno == ENOTDIR
      paths.push path
      return callback()
    
    # Case: error
    throw err if err
    
    # Case: dir
    async.forEach(
      files,
      ((file, cb) ->
        _pathsIn("#{path}/#{file}", paths, cb)),
      ((err) ->
        throw err if err
        callback())
    )


exports.pathsIn = pathsIn = (dir, callback) ->
  paths = []
  _pathsIn dir, paths, () ->
    callback paths

