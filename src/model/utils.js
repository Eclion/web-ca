// from https://stackoverflow.com/a/25098884
export function rangeArray (min, max) {
  var len = max - min + 1
  var arr = new Array(len)
  for (var i = 0; i < len; i++) {
    arr[i] = min + i
  }
  return arr
}

// based on https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
export function loadJSON (jsonFilePath) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', jsonFilePath + '?' + (new Date()).getTime(), false)
  xobj.send(null)
  return JSON.parse(xobj.responseText)
}
