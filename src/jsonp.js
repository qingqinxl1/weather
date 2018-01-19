// JSONP对象
// 处理异步请求jsonp方式
var JSONP = function(url, callback, callbackFn) {
  var s = document.createElement("script"),
    first = document.getElementsByTagName("script")[0];
  s.type = "text/javascript";
  s.src = !callback ? url : url + (url.indexOf("?") == -1 ? "?" : "&") + "jsonpcallback=" + callback;
  first.parentNode.insertBefore(s, first);

  if (typeof callbackFn === 'function') {
    if (s.readyState) {
      s.onreadystatechange = function() {
        var r = s.readyState;
        if (r === 'loaded' || r === 'complete') {
          s.onreadystatechange = null;
          callbackFn();
        }
      };
    } else {
      s.onload = function() {
        callbackFn();
      };
    }
  }
};

//jquery jsonp
var $JSONP = function(url, jsonpName, isCache, asy) {
  return $.ajax({
    type: 'get',
    url: url,
    dataType: 'jsonp',
    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
    timeout: 30000,
    jsonp: jsonpName || 'jsonpcallback',
    cache: isCache || false,
    async: asy || true
  });
};

module.exports = {
  jsonp: JSONP,
  $jsonp: $JSONP
};
