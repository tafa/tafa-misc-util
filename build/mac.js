(function() {
  var exec, fs, showImage, _convert;
  fs = require('fs');
  exec = require('child_process').exec;
  _convert = function(data, ext) {
    var path;
    path = "/Users/a/Desktop/temp." + ext;
    return fs.writeFile(path, data, function() {
      return exec("convert /Users/a/Desktop/temp." + ext + " /Users/a/Desktop/temp.png", function() {
        return exec("open -a Preview '/Users/a/Desktop/temp.png'", function() {});
      });
    });
  };
  exports.showImage = showImage = function(data) {
    if (data[0] === 0x50) {
      if (data[1] === 0x34 || data[1] === 0x31) {
        _convert(data, 'pbm');
      }
      if (data[1] === 0x35 || data[1] === 0x32) {
        _convert(data, 'pgm');
      }
      if (data[1] === 0x36 || data[1] === 0x33) {
        _convert(data, 'ppm');
      }
    }
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
      return _convert(data, 'png');
    }
  };
}).call(this);
