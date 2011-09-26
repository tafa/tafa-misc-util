(function() {
  var ALPHABET58, AsyncJoin, ENOTDIR, I, NIBBLES, asciiPrefixOfBuffer, assert, async, b64decode, b64encode, check_exec, check_spawn_exec, crypto, endswith, exec, extend, firstTimeOnly, fs, hex_decode, hex_encode, http, intervalSet, invertedDict, joinBuffers, joinBuffersWithFixes, k, keysOf, max, min, noisyExec, noisySpawn, objectKeys, objectSize, parseBash, parsePNM, pathsIn, querystring, random, randomInteger, randomToken, re_escape, readData, readText, replaceExtension, repoContainingPath, reversed, rjust, sha256, sha256_first4, spawn, spawn_exec, startswith, test_api_call, timeoutSet, toBuffer, uint16be, uint16le, uint32be, uint32le, v, valuesOf, varintEncodeToOctets, varintsEncode, xmlEscape, _pathsIn, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require('fs');
  http = require('http');
  assert = require('assert');
  crypto = require('crypto');
  querystring = require('querystring');
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  async = require('async');
  exports.mac = require('./mac');
  exports.I = I = (function() {});
  _ref2 = require('./middleware');
  for (k in _ref2) {
    if (!__hasProp.call(_ref2, k)) continue;
    v = _ref2[k];
    exports[k] = v;
  }
  exports.min = min = function(x, y) {
    if (x < y) {
      return x;
    } else {
      return y;
    }
  };
  exports.max = max = function(x, y) {
    if (x > y) {
      return x;
    } else {
      return y;
    }
  };
  exports.intervalSet = intervalSet = function(ms, f) {
    return setInterval(f, ms);
  };
  exports.timeoutSet = timeoutSet = function(ms, f) {
    return setTimeout(f, ms);
  };
  exports.readText = readText = function(s, callback) {
    var arr;
    if (callback == null) {
      callback = I;
    }
    arr = [];
    s.on('data', function(data) {
      return arr.push(data.toString('utf-8'));
    });
    return s.on('end', function() {
      return callback(arr.join(''));
    });
  };
  exports.readData = readData = function(s, callback) {
    var arr;
    if (callback == null) {
      callback = I;
    }
    arr = [];
    s.on('data', function(data) {
      return arr.push(data);
    });
    return s.on('end', function() {
      return callback(joinBuffers(arr));
    });
  };
  exports.reversed = reversed = function(arr) {
    var arr2, i, _ref3;
    arr2 = [];
    if (arr.length > 0) {
      for (i = _ref3 = arr.length - 1; _ref3 <= 0 ? i <= 0 : i >= 0; _ref3 <= 0 ? i++ : i--) {
        arr2.push(arr[i]);
      }
    }
    return arr2;
  };
  exports.joinBuffers = joinBuffers = function(arr) {
    var pos, result, size, x, _i, _j, _len, _len2;
    size = 0;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      x = arr[_i];
      size += x.length;
    }
    result = new Buffer(size);
    pos = 0;
    for (_j = 0, _len2 = arr.length; _j < _len2; _j++) {
      x = arr[_j];
      x.copy(result, pos);
      pos += x.length;
    }
    return result;
  };
  exports.joinBuffersWithFixes = joinBuffersWithFixes = function(bufs, prefix, infix, suffix) {
    var buf, first, infixSize, pos, prefixSize, result, suffixSize, totalSize, _i, _j, _len, _len2;
    prefixSize = prefix ? prefix.length : 0;
    infixSize = infix ? infix.length : 0;
    suffixSize = suffix ? suffix.length : 0;
    totalSize = prefixSize + suffixSize + infixSize * (bufs.length - 1);
    for (_i = 0, _len = bufs.length; _i < _len; _i++) {
      buf = bufs[_i];
      totalSize += buf.length;
    }
    result = new Buffer(totalSize);
    if (prefix) {
      prefix.copy(result, 0, 0);
    }
    if (suffix) {
      suffix.copy(result, totalSize - suffixSize, 0);
    }
    pos = prefixSize;
    first = true;
    for (_j = 0, _len2 = bufs.length; _j < _len2; _j++) {
      buf = bufs[_j];
      if (infix) {
        if (first) {
          first = false;
        } else {
          infix.copy(result, pos, 0);
          pos += infixSize;
        }
      }
      buf.copy(result, pos, 0);
      pos += buf.length;
    }
    return result;
  };
  exports.toBuffer = toBuffer = function(x) {
    if (x instanceof Buffer) {
      return x;
    } else {
      return new Buffer(x);
    }
  };
  exports.startswith = startswith = function(s, s2) {
    return (s.length >= s2.length) && (s.substr(0, s2.length) === s2);
  };
  exports.endswith = endswith = function(s, s2) {
    return (s.length >= s2.length) && (s.substr(s.length - s2.length) === s2);
  };
  exports.rstrip = function(s, chars) {
    var m;
    if (chars == null) {
      chars = "\t\n\v\f\r ";
    }
    m = s.match(new RegExp("[" + (re_escape(chars)) + "]+$"));
    if (m) {
      return s.substr(0, s.length - m[0].length);
    } else {
      return s;
    }
  };
  exports.lstrip = function(s, chars) {
    var m;
    if (chars == null) {
      chars = "\t\n\v\f\r ";
    }
    m = s.match(new RegExp("^[" + (re_escape(chars)) + "]+"));
    if (m) {
      return s.substr(m[0].length);
    } else {
      return s;
    }
  };
  exports.lremove = function(s, s2) {
    assert.ok(startswith(s, s2));
    return s.slice(s2.length);
  };
  exports.rjust = rjust = function(s, width, fillchar) {
    var arr, i, n;
    if (fillchar == null) {
      fillchar = ' ';
    }
    n = width - s.length;
    if (n <= 0) {
      return s;
    } else {
      arr = [];
      for (i = 0; 0 <= n ? i < n : i > n; 0 <= n ? i++ : i--) {
        arr.push(fillchar);
      }
      arr.push(s);
      return arr.join('');
    }
  };
  exports.sha256 = sha256 = function(data) {
    return new Buffer(crypto.createHash('sha256').update(data).digest('base64'), 'base64');
  };
  exports.sha256_first4 = sha256_first4 = function(data) {
    return sha256(data).slice(0, 4);
  };
  exports.keysOf = keysOf = function(d) {
    var k, _results;
    _results = [];
    for (k in d) {
      if (!__hasProp.call(d, k)) continue;
      _results.push(k);
    }
    return _results;
  };
  exports.valuesOf = valuesOf = function(d) {
    var k, v, _results;
    _results = [];
    for (k in d) {
      if (!__hasProp.call(d, k)) continue;
      v = d[k];
      _results.push(v);
    }
    return _results;
  };
  exports.invertedDict = invertedDict = function(d) {
    var d2, k, v;
    d2 = {};
    for (k in d) {
      if (!__hasProp.call(d, k)) continue;
      v = d[k];
      d2[v] = k;
    }
    return d2;
  };
  exports.firstTimeOnly = firstTimeOnly = function(callback) {
    var state;
    state = {
      first: true
    };
    return function() {
      if (state.first) {
        state.first = false;
        return callback();
      }
    };
  };
  exports.random = random = function() {
    var x;
    x = Math.random();
    if (x === 1) {
      return 0;
    } else {
      return x;
    }
  };
  exports.randomInteger = randomInteger = function(a, b) {
    return Math.floor(random() * (b - a + 1)) + a;
  };
  exports.ALPHABET58 = ALPHABET58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  exports.randomToken = randomToken = function(n, alphabet) {
    var i, lte;
    if (n == null) {
      n = 8;
    }
    if (alphabet == null) {
      alphabet = ALPHABET58;
    }
    lte = alphabet.length - 1;
    return ((function() {
      var _results;
      _results = [];
      for (i = 0; 0 <= n ? i < n : i > n; 0 <= n ? i++ : i--) {
        _results.push(alphabet.charAt(randomInteger(0, lte)));
      }
      return _results;
    })()).join('');
  };
  exports.test_api_call = test_api_call = function(fname, x, callback) {
    var j, opt, qs, req;
    if (callback == null) {
      callback = I;
    }
    j = JSON.stringify(x);
    qs = querystring.stringify({
      j: j
    });
    opt = {
      host: 'localhost',
      port: 8000,
      method: 'GET',
      path: "/api/v0.1/" + fname + ".js?" + qs
    };
    console.log("-----------------------------------\\");
    console.log("API: " + fname + " " + j);
    return req = http.get(opt, function(res) {
      return readText(res, function(text) {
        var y;
        process.stdout.write(text);
        console.log("\n-----------------------------------/");
        y = JSON.parse(text);
        return callback(y);
      });
    });
  };
  exports.extend = extend = function(x, x2) {
    var k, v;
    for (k in x2) {
      if (!__hasProp.call(x2, k)) continue;
      v = x2[k];
      x[k] = v;
    }
    return x;
  };
  exports.replaceExtension = replaceExtension = function(path, fromExt, toExt) {
    var bits;
    bits = path.split('.');
    assert.equal(bits.pop(), fromExt);
    bits.push(toExt);
    return bits.join('.');
  };
  exports.objectKeys = objectKeys = function(obj) {
    var k, _results;
    _results = [];
    for (k in obj) {
      if (!__hasProp.call(obj, k)) continue;
      _results.push(k);
    }
    return _results;
  };
  exports.objectSize = objectSize = function(obj) {
    var i, k;
    i = 0;
    for (k in obj) {
      if (!__hasProp.call(obj, k)) continue;
      i++;
    }
    return i;
  };
  exports.re_escape = re_escape = function(s) {
    return s.replace(/[-\[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  };
  exports.startswith = function(s, s2) {
    return (s.length >= s2.length) && (s.substr(0, s2.length) === s2);
  };
  exports.endswith = function(s, s2) {
    return (s.length >= s2.length) && (s.substr(s.length - s2.length) === s2);
  };
  exports.rstrip = function(s, chars) {
    var m;
    if (chars == null) {
      chars = "\t\n\v\f\r ";
    }
    m = s.match(new RegExp("[" + (re_escape(chars)) + "]+$"));
    if (m) {
      return s.substr(0, s.length - m[0].length);
    } else {
      return s;
    }
  };
  exports.lstrip = function(s, chars) {
    var m;
    if (chars == null) {
      chars = "\t\n\v\f\r ";
    }
    m = s.match(new RegExp("^[" + (re_escape(chars)) + "]+"));
    if (m) {
      return s.substr(m[0].length);
    } else {
      return s;
    }
  };
  exports.xmlEscape = xmlEscape = function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  };
  exports.parseBash = parseBash = function(str) {
    var bits;
    if (str.match(/^[^|'"]+$/)) {
      bits = str.split(/[ \t]+/);
      return [
        {
          program: bits[0],
          args: bits.slice(1)
        }
      ];
    } else {
      throw new Error("Bash strings containing any of |'\" are not yet supported");
    }
  };
  exports.noisySpawn = noisySpawn = function(program, args) {
    var p;
    p = spawn(program, args);
    p.stdout.on('data', function(data) {
      return process.stdout.write(data);
    });
    p.stderr.on('data', function(data) {
      return process.stderr.write(data);
    });
    return p;
  };
  exports.noisyExec = noisyExec = function(str, callback) {
    var args, errBufs, outBufs, p, program, _ref3;
    if (callback == null) {
      callback = I;
    }
    _ref3 = parseBash(str)[0], program = _ref3.program, args = _ref3.args;
    outBufs = [];
    errBufs = [];
    p = spawn(program, args);
    p.stdout.on('data', function(data) {
      process.stdout.write(data);
      return outBufs.push(data);
    });
    p.stderr.on('data', function(data) {
      process.stderr.write(data);
      return errBufs.push(data);
    });
    p.on('exit', function(code, signal) {
      return callback(code !== 0, joinBuffers(outBufs), joinBuffers(errBufs));
    });
    return p;
  };
  exports.check_exec = check_exec = function(cmd, callback) {
    if (callback == null) {
      callback = I;
    }
    return exec(cmd, function(e, stdout, stderr) {
      if (e) {
        throw e;
      }
      return callback(stdout, stderr);
    });
  };
  exports.spawn_exec = spawn_exec = function(name, args, callback) {
    var p, stderr_bufs, stdout_bufs;
    if (callback == null) {
      callback = I;
    }
    stdout_bufs = [];
    stderr_bufs = [];
    p = spawn(name, args);
    if (callback.length > 0) {
      p.stdout.on('data', function(data) {
        return stdout_bufs.push(data);
      });
      p.stderr.on('data', function(data) {
        return stderr_bufs.push(data);
      });
    }
    p.on('exit', function(code) {
      return callback((code === 0 ? null : {
        code: code
      }), (callback.length > 0 ? joinBuffers(stdout_bufs) : null), (callback.length > 0 ? joinBuffers(stderr_bufs) : null));
    });
    return p;
  };
  exports.check_spawn_exec = check_spawn_exec = function(name, args, callback) {
    if (callback == null) {
      callback = I;
    }
    return spawn_exec(name, args, function(e, stdout, stderr) {
      if (e) {
        throw e;
      }
      return callback(stdout, stderr);
    });
  };
  ENOTDIR = 20;
  _pathsIn = function(path, paths, callback) {
    if (callback == null) {
      callback = I;
    }
    return fs.readdir(path, function(err, files) {
      if (err && err.errno === ENOTDIR) {
        paths.push(path);
        return callback();
      }
      if (err) {
        throw err;
      }
      return async.forEach(files, (function(file, cb) {
        return _pathsIn("" + path + "/" + file, paths, cb);
      }), (function(err) {
        if (err) {
          throw err;
        }
        return callback();
      }));
    });
  };
  exports.pathsIn = pathsIn = function(dir, callback) {
    var paths;
    paths = [];
    return _pathsIn(dir, paths, function() {
      return callback(paths);
    });
  };
  exports.uint32le = uint32le = function(n) {
    return new Buffer([n % 256, (n >> 8) % 256, (n >> 16) % 256, (n >> 24) % 256]);
  };
  exports.uint16le = uint16le = function(n) {
    return new Buffer([n % 256, (n >> 8) % 256]);
  };
  exports.uint32le = uint32be = function(n) {
    return new Buffer([(n >> 24) % 256, (n >> 16) % 256, (n >> 8) % 256, n % 256]);
  };
  exports.uint16le = uint16be = function(n) {
    return new Buffer([(n >> 8) % 256, n % 256]);
  };
  exports.AsyncJoin = AsyncJoin = (function() {
    function AsyncJoin() {
      this.numCallbacks = 0;
      this.callbacksPending = {};
    }
    AsyncJoin.prototype.newCallback = function() {
      var id;
      this.numCallbacks++;
      id = '' + this.numCallbacks;
      this.callbacksPending[id] = true;
      return __bind(function() {
        if (this.callbacksPending[id]) {
          delete this.callbacksPending[id];
          if (this.whenDone_callback && objectSize(this.callbacksPending) === 0) {
            this.whenDone_callback();
            return this.whenDone_callback = null;
          }
        }
      }, this);
    };
    AsyncJoin.prototype.whenDone = function(callback) {
      if (objectSize(this.callbacksPending) === 0) {
        return callback();
      } else {
        return this.whenDone_callback = callback;
      }
    };
    return AsyncJoin;
  })();
  repoContainingPath = function(path, callback, i) {
    var bits, repo;
    if (i == null) {
      i = 0;
    }
    bits = path.split('/');
    repo = bits.slice(0, bits.length - i).join('/');
    return fs.stat("" + repo + "/.git", function(e, stats) {
      if (!e && stats.isDirectory()) {
        return callback(repo);
      } else {
        if ((i + 1) < bits.length) {
          return currentRepo(path, callback, i + 1);
        } else {
          return callback(null);
        }
      }
    });
  };
  exports.asciiPrefixOfBuffer = asciiPrefixOfBuffer = function(data) {
    var i, _ref3;
    for (i = 0, _ref3 = data.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
      if (data[i] > 127) {
        break;
      }
    }
    return data.slice(0, i).toString('utf-8');
  };
  exports.parsePNM = parsePNM = function(data) {
    var P, headerLength, m, m0, maxValue, text;
    text = asciiPrefixOfBuffer(data);
    m0 = text.match(/^P([123456])/);
    if (!m0) {
      throw new Error("Invalid PNM header");
    }
    P = parseInt(m0[1], 10);
    if (P === 1 || P === 4) {
      m = text.match(/^P([14])[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+/);
      maxValue = 1;
    } else {
      m = text.match(/^P([2356])[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+([0-9]+)[ \r\n\t]+/);
      maxValue = parseInt(m[4], 10);
    }
    if (!m) {
      throw new Error("Invalid PNM header");
    }
    headerLength = m[0].length;
    return {
      P: P,
      maxValue: maxValue,
      headerLength: headerLength,
      data: data.slice(headerLength),
      w: parseInt(m[2], 10),
      h: parseInt(m[3], 10)
    };
  };
  exports.varintEncodeToOctets = varintEncodeToOctets = function(octets, x) {
    var octet, _results;
    if (x < 128) {
      return octets.push(x);
    } else {
      _results = [];
      while (true) {
        octet = x % 128;
        if (x >= 128) {
          octet |= 128;
        }
        octets.push(octet);
        if (x < 128) {
          return;
        }
        _results.push(x = Math.floor(x / 128));
      }
      return _results;
    }
  };
  exports.varintsEncode = varintsEncode = function(ints) {
    var octets, x, _i, _len;
    octets = [];
    for (_i = 0, _len = ints.length; _i < _len; _i++) {
      x = ints[_i];
      varintEncodeToOctets(octets, x);
    }
    return new Buffer(octets);
  };
  NIBBLES = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': 'a',
    '11': 'b',
    '12': 'c',
    '13': 'd',
    '14': 'e',
    '15': 'f'
  };
  exports.hex_encode = hex_encode = function(buf) {
    var arr, i, n, _ref3;
    arr = [];
    for (i = 0, _ref3 = buf.length; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
      n = buf[i];
      arr.push(NIBBLES['' + (n >> 4)], NIBBLES['' + (n % 16)]);
    }
    return arr.join('');
  };
  exports.hex_decode = hex_decode = function(str) {
    var i, octets, sub, _ref3;
    octets = [];
    for (i = 0, _ref3 = str.length / 2; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
      sub = str.substr(2 * i, 2);
      octets.push(parseInt(sub, 16));
    }
    return new Buffer(octets);
  };
  exports.b64encode = b64encode = function(x) {
    if (!(x instanceof Buffer)) {
      x = new Buffer(x, 'utf-8');
    }
    return x.toString('base64');
  };
  exports.b64decode = b64decode = function(x) {
    return new Buffer(x, 'base64');
  };
}).call(this);
