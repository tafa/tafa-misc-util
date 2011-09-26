
fs = require 'fs'
http = require 'http'
assert = require 'assert'
crypto = require 'crypto'
querystring = require 'querystring'
{spawn, exec} = require 'child_process'

async = require 'async'


exports.mac = require './mac'


exports.I = I = (->)


for own k, v of require('./middleware')
  exports[k] = v


exports.min = min = (x, y) -> if x < y then x else y
exports.max = max = (x, y) -> if x > y then x else y

exports.intervalSet = intervalSet = (ms, f) -> setInterval f, ms
exports.timeoutSet  = timeoutSet  = (ms, f) -> setTimeout f, ms


exports.readText = readText = (s, callback = I) ->
  arr = []
  s.on 'data', (data) -> arr.push data.toString 'utf-8'
  s.on 'end', () -> callback arr.join ''


exports.readData = readData = (s, callback = I) ->
  arr = []
  s.on 'data', (data) -> arr.push data
  s.on 'end', () -> callback joinBuffers arr


exports.reversed = reversed = (arr) ->
  arr2 = []
  if arr.length > 0
    for i in [(arr.length - 1)..0]
      arr2.push arr[i]
  arr2


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


exports.startswith = startswith = (s, s2) -> (s.length >= s2.length) and (s.substr(0, s2.length) == s2)
exports.endswith = endswith = (s, s2) -> (s.length >= s2.length) and (s.substr(s.length - s2.length) == s2)

exports.rstrip = (s, chars = "\t\n\v\f\r ") ->
  m = s.match new RegExp "[#{re_escape chars}]+$"
  if m then s.substr(0, s.length - m[0].length) else s


exports.lstrip = (s, chars = "\t\n\v\f\r ") ->
  m = s.match new RegExp "^[#{re_escape chars}]+"
  if m then s.substr(m[0].length) else s


exports.lremove = (s, s2) ->
  assert.ok startswith s, s2
  s.slice s2.length


exports.rjust = rjust = (s, width, fillchar = ' ') ->
  n = width - s.length
  if n <= 0
    s
  else
    arr = []
    for i in [0...n]
      arr.push fillchar
    arr.push s
    arr.join ''


exports.sha256 = sha256 = (data) ->
  new Buffer crypto.createHash('sha256').update(data).digest('base64'), 'base64'


exports.sha256_first4 = sha256_first4 = (data) ->
  sha256(data).slice 0, 4


exports.keysOf = keysOf = (d) ->
  for own k of d
    k


exports.valuesOf = valuesOf = (d) ->
  for own k, v of d
    v


exports.invertedDict = invertedDict = (d) ->
  d2 = {}
  for own k, v of d
    d2[v] = k
  d2


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


exports.ALPHABET58 = ALPHABET58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

exports.randomToken = randomToken = (n = 8, alphabet = ALPHABET58) ->
  lte = alphabet.length - 1
  (for i in [0...n]
    alphabet.charAt randomInteger(0, lte)
  ).join('')



exports.test_api_call = test_api_call = (fname, x, callback = I) ->
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


exports.objectKeys = objectKeys = (obj) ->
  for own k of obj
    k


exports.objectSize = objectSize = (obj) ->
  i = 0
  for own k of obj
    i++
  i


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


exports.xmlEscape = xmlEscape = (s) ->
  (s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;'))


exports.parseBash = parseBash = (str) ->
  if str.match /^[^|'"]+$/
    bits = str.split /[ \t]+/
    return [
      {
        program: bits[0]
        args: bits[1...]
      }
    ]
  else
    throw new Error """Bash strings containing any of |'" are not yet supported"""


exports.noisySpawn = noisySpawn = (program, args) ->
  p = spawn program, args
  p.stdout.on 'data', (data) -> process.stdout.write data
  p.stderr.on 'data', (data) -> process.stderr.write data
  p


exports.noisyExec = noisyExec = (str, callback = I) ->
  {program, args} = parseBash(str)[0]
  outBufs = []
  errBufs = []
  p = spawn program, args
  p.stdout.on 'data', (data) ->
    process.stdout.write data
    outBufs.push data
  p.stderr.on 'data', (data) ->
    process.stderr.write data
    errBufs.push data
  p.on 'exit', (code, signal) ->
    callback (code != 0), joinBuffers(outBufs), joinBuffers(errBufs)
  p


exports.check_exec = check_exec = (cmd, callback = I) ->
  exec cmd, (e, stdout, stderr) ->
    throw e if e
    callback stdout, stderr


exports.spawn_exec = spawn_exec = (name, args, callback = I) ->
  
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
  p


exports.check_spawn_exec = check_spawn_exec = (name, args, callback = I) ->
  spawn_exec name, args, (e, stdout, stderr) ->
    throw e if e
    callback stdout, stderr




ENOTDIR = 20


_pathsIn = (path, paths, callback = I) ->
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


exports.uint32le = uint32le = (n) ->
  new Buffer [
    (n) % 256,
    (n >> 8) % 256,
    (n >> 16) % 256,
    (n >> 24) % 256
  ]


exports.uint16le = uint16le = (n) ->
  new Buffer [
    (n) % 256,
    (n >> 8) % 256
  ]


exports.uint32le = uint32be = (n) ->
  new Buffer [
    (n >> 24) % 256,
    (n >> 16) % 256,
    (n >> 8) % 256,
    (n) % 256
  ]


exports.uint16le = uint16be = (n) ->
  new Buffer [
    (n >> 8) % 256,
    (n) % 256
  ]


# Call <code>.whenDone</code> only after every <code>.newCallback</code>
exports.AsyncJoin = class AsyncJoin
  
  constructor: () ->
    @numCallbacks = 0
    @callbacksPending = {}
  
  newCallback: () ->
    
    @numCallbacks++
    id = '' + @numCallbacks
    @callbacksPending[id] = true
    
    (() =>
      if @callbacksPending[id]
        delete @callbacksPending[id]
        if @whenDone_callback and objectSize(@callbacksPending) == 0
          @whenDone_callback()
          @whenDone_callback = null)
  
  whenDone: (callback) ->
    if objectSize(@callbacksPending) == 0
      callback()
    else
      @whenDone_callback = callback


repoContainingPath = (path, callback, i = 0) ->
  bits = path.split '/'
  repo = bits[0...(bits.length - i)].join('/')
  fs.stat "#{repo}/.git", (e, stats) ->
    if not e and stats.isDirectory()
      callback repo
    else
      if (i + 1) < bits.length
        currentRepo path, callback, (i + 1)
      else
        callback null


exports.asciiPrefixOfBuffer = asciiPrefixOfBuffer = (data) ->
  for i in [0...data.length]
    if data[i] > 127
      break
  data.slice(0, i).toString('utf-8')


exports.parsePNM = parsePNM = (data) ->
  
  text = asciiPrefixOfBuffer data
  m0 = text.match /^P([123456])/
  throw new Error "Invalid PNM header" if not m0
  P = parseInt m0[1], 10
  
  if P == 1 or P == 4
    m = text.match /^P([14])[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+/
    maxValue = 1
  else
    m = text.match /^P([2356])[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+/
    maxValue = parseInt m[4], 10
  
  throw new Error "Invalid PNM header" if not m
  headerLength = m[0].length
  
  {
    P: P
    maxValue: maxValue
    headerLength: headerLength
    data: data.slice(headerLength)
    w: parseInt(m[2], 10)
    h: parseInt(m[3], 10)
  }


exports.varintEncodeToOctets = varintEncodeToOctets = (octets, x) ->
  if x < 128
    octets.push x
  else
    while true
      octet = (x % 128)
      octet |= 128 if x >= 128
      octets.push octet
      if x < 128
        return
      x = Math.floor(x / 128)


exports.varintsEncode = varintsEncode = (ints) ->
  octets = []
  for x in ints
    varintEncodeToOctets octets, x
  new Buffer octets


NIBBLES = {
  '0': '0'
  '1': '1'
  '2': '2'
  '3': '3'
  '4': '4'
  '5': '5'
  '6': '6'
  '7': '7'
  '8': '8'
  '9': '9'
  '10': 'a'
  '11': 'b'
  '12': 'c'
  '13': 'd'
  '14': 'e'
  '15': 'f'
}


exports.hex_encode = hex_encode = (buf) ->
  arr = []
  for i in [0...buf.length]
    n = buf[i]
    arr.push(
          NIBBLES['' + (n >> 4)],
          NIBBLES['' + (n % 16)])
  arr.join ''


exports.hex_decode = hex_decode = (str) ->
  octets = []
  for i in [0...str.length / 2]
    sub = str.substr(2*i, 2)
    octets.push parseInt(sub, 16)
  new Buffer octets



exports.b64encode = b64encode = (x) ->
  if x not instanceof Buffer
    x = new Buffer x, 'utf-8'
  x.toString 'base64'


exports.b64decode = b64decode = (x) ->
  new Buffer x, 'base64'

