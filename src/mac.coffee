
fs = require 'fs'
{exec} = require 'child_process'


_convert = (data, ext) ->
  path = "/Users/a/Desktop/temp.#{ext}"
  fs.writeFile path, data, () ->
    exec "convert /Users/a/Desktop/temp.#{ext} /Users/a/Desktop/temp.png", () ->
      exec "open -a Preview '/Users/a/Desktop/temp.png'", () ->
        


exports.showImage = showImage = (data) ->
  
  if data[0] == 0x50
    _convert data, 'pbm'    if data[1] == 0x34 or data[1] == 0x31
    _convert data, 'pgm'    if data[1] == 0x35 or data[1] == 0x32
    _convert data, 'ppm'    if data[1] == 0x36 or data[1] == 0x33
  
  if data[0] == 0x89 and data[1] == 0x50 and data[2] == 0x4E and data[3] == 0x47
    _convert data, 'png'


