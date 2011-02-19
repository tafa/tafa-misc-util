(function() {
  var ENOTDIR, assert, async, check_exec, check_spawn_exec, extend, firstTimeOnly, http, joinBuffers, joinBuffersWithFixes, pack, pathsIn, querystring, random, randomInteger, randomToken, re_escape, readData, readText, replaceExtension, spawn_exec, test_api_call, toBuffer, unpack, _pathsIn, _ref;
  var __hasProp = Object.prototype.hasOwnProperty;
  http = require('http');
  assert = require('assert');
  querystring = require('querystring');
  async = require('async');
  _ref = require('msgpack'), pack = _ref.pack, unpack = _ref.unpack;
  exports.middleware = require('./middleware');
  exports.readText = readText = function(s, callback) {
    var arr;
    arr = [];
    s.on('data', function(data) {
      return arr.push(data.toString('utf-8'));
    });
    return s.on('end', function() {
      return callback(arr.join(''));
    });
  };
  exports.readText = readData = function(s, callback) {
    var arr;
    arr = [];
    s.on('data', function(data) {
      return arr.push(data);
    });
    return s.on('end', function() {
      return callback(joinBuffers(arr));
    });
  };
  exports.msgpackToBuffer = function(x) {
    return new Buffer(pack(x).toString('base64'), 'base64');
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
  exports.randomToken = randomToken = function(n, alphabet) {
    var i;
    if (n == null) {
      n = 8;
    }
    if (alphabet == null) {
      alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    }
    return ((function() {
      var _results;
      _results = [];
      for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
        _results.push(alphabet.substr(randomInteger(0, 57), 1));
      }
      return _results;
    })()).join('');
  };
  exports.test_api_call = test_api_call = function(fname, x, callback) {
    var j, opt, qs, req;
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
  exports.check_exec = check_exec = function(cmd, callback) {
    return exec(cmd, function(e, stdout, stderr) {
      if (e) {
        throw e;
      }
      return callback(stdout, stderr);
    });
  };
  exports.spawn_exec = spawn_exec = function(name, args, callback) {
    var p, stderr_bufs, stdout_bufs;
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
    return p.on('exit', function(code) {
      return callback((code === 0 ? null : {
        code: code
      }), (callback.length > 0 ? joinBuffers(stdout_bufs) : null), (callback.length > 0 ? joinBuffers(stderr_bufs) : null));
    });
  };
  exports.check_spawn_exec = check_spawn_exec = function(name, args, callback) {
    return spawn_exec(name, args, function(e, stdout, stderr) {
      if (e) {
        throw e;
      }
      return callback(stdout, stderr);
    });
  };
  ENOTDIR = 20;
  _pathsIn = function(path, paths, callback) {
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
}).call(this);
