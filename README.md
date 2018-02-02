## 天气预报
### 几个接口
接口地址 | 接口说明 | 参数
--- | --- | ---
http://www.chinaso.com/weather/city/? | 城市数据获取 | 请求路径中的?为jsonp返回函数名，areaid：城市编码，如北京：110000
http://www.chinaso.com/weather/query/updateWheatherState | 天气预报数据获取 | city：城市编码，jsonpcallback：jsonp返回函数名

### 引入方式
* 说明：引入前先引入jquery
```html
<!--引入css-->
<link rel="stylesheet" href="http://n3.static.pg0.cn/fp/weather/dist/weather.css">

<!--引入js-->
<script src="http://n3.static.pg0.cn/fp/weather/dist/weather.js" type="text/javascript"></script>
```
### 页面提前放好以下结构
```html
<div id="chinaso_weather"></div>
```
### 说明
* 若天气缓存数据有问题，bug修复后为了清除客户端已经缓存的数据，可以在页面中添加以下代码
```html
<script>
  //修改天气缓存版本号以更新天气本地缓存
  window["WEATHER_STORAGE_VERSION"]='1.1.0';
</script>
```

