(function() {
  var ALPHABET58, AsyncJoin, ENOTDIR, asciiPrefixOfBuffer, assert, async, check_exec, check_spawn_exec, exec, extend, firstTimeOnly, fs, http, joinBuffers, joinBuffersWithFixes, k, max, min, noisySpawn, objectKeys, objectSize, parsePNM, pathsIn, querystring, random, randomInteger, randomToken, re_escape, readData, readText, replaceExtension, repoContainingPath, spawn, spawn_exec, test_api_call, toBuffer, v, _pathsIn, _ref, _ref2;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require('fs');
  http = require('http');
  assert = require('assert');
  querystring = require('querystring');
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  async = require('async');
  exports.mac = require('./mac');
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
  exports.readData = readData = function(s, callback) {
    var arr;
    arr = [];
    s.on('data', function(data) {
      return arr.push(data);
    });
    return s.on('end', function() {
      return callback(joinBuffers(arr));
    });
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
}).call(this);
