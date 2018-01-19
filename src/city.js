// 城市处理函数
var $JSONP = require('./jsonp').$jsonp;
var CookieUtil = require('@cnpm/cookie-util');

var City = function() {
  return {
      cities: ["s_province", "s_city", "s_county"], //三个select的id
      seachURL: 'http://www.chinaso.com/search/pagesearch.htm?q=',
      cityURL: 'http://www.chinaso.com/weather/city', //http://10.10.176.20:8780/weather/city/cityJsonCallback1?areaid=110000
      defCityCode: ['110000', '110100', '110000'],
      cityCodeCookieName: 'CITY_CODE', //城市code存储的cookie名.
      getWeatherURL: 'http://www.chinaso.com/weather/query/updateWheatherState', //http://10.10.176.20:8780/weather/query/updateWheatherState?city=110000

      /**
       * 2016-08-16 pangzhihao
       * 增加特殊频道天气指定逻辑
       * 获得当前城市天气
       * @return {[type]} [description]
       */
      getCurrentCity: function() {
          var day = new Date();
          var T = this;
          var citystr = '';
          var allCityCode = CookieUtil.get(T.cityCodeCookieName, true);
          var arrCode = allCityCode ? allCityCode.split(',') : [];
          var curCityCode = arrCode.length && arrCode[2] ? arrCode[2] : '';
          var url = T.getWeatherURL;
          citystr = window["HOST-CITY"] ? (window["HOST-CITY"][location.host.split('.')[0]] || '') : '';

          //若城市code存在，则使用城市code，若不存在判断城市名是否存在.
          if (curCityCode) {
              citystr = curCityCode;
          }
          url = url + '?city=' + citystr;
          $JSONP(url, null, true);
      },

      /**
       * 初始化城市数据
       * @return {}
       */
      initCityChange: function() {
          var T = this;
          var defCode = T.defCityCode;

          //取cookie中存的城市code覆盖默认城市code.
          var cookieCityCode = CookieUtil.get(T.cityCodeCookieName, true);
          if (cookieCityCode && cookieCityCode.length) {
              var arr = cookieCityCode.split(',');
              T.updateDefCityCode(arr[0], arr[1], arr[2]);
          }

          T.sendCityJsonP('0', 0); //初始化省的下拉列表数据.
          T.sendCityJsonP(defCode[0], 1); //初始化所选择的省下市的下拉列表.
          T.sendCityJsonP(defCode[1], 2); //初始化所选市下区县的下拉列表.
      },

      /**
       * 获取cookie中的三级城市信息，若存在且不为空，则将默认城市信息修改
       */
      updateDefCityCode: function(province, city, county) {
          var T = this;
          T.defCityCode[0] = province || T.defCityCode[0];
          T.defCityCode[1] = city || T.defCityCode[1];
          T.defCityCode[2] = county || T.defCityCode[2];
      },

      /**
       * 点击城市切换确认按钮后，将所选城市的编码信息存入cookie.
       */
      updateCookieCityInfo: function() {
          var T = this;
          var d = new Date();
          d.setFullYear(2099);
          //CookieUtil.set('city', ct, d, '.chinaso.com');
          CookieUtil.set(T.cityCodeCookieName, T.defCityCode.join(','), d, document.domain);
      },

      /**
       * @param  {number} 城市对应的id
       * @param  {number} 城市类型 0 省直辖市 1 市 2区县
       * 发送城市请求
       */
      sendCityJsonP: function(areaID, areaType) {
          var T = this;
          var url = T.cityURL + '/cityJsonCallback' + areaType + '?areaid=' + areaID;
          $JSONP(url, null, true);
      },

      /**
       * @param  {array}
       * @param  {number} 城市类型 0 省直辖市 1 市 2区县
       * 城市信息回调.
       */
      cityJsonCallback: function(data, areaType) {
          var T = this;
          var $wrap = $('#' + T.cities[areaType]);
          var listLen = data && data.length || 0;
          var options = '';
          if (listLen) {
              for (var i = 0; i < listLen; i++) {
                  var cur = data[i];
                  options += '<option value="' + cur.areaid + '">' + cur.namecn + '</option>';
              }
              $wrap.html(options);
              if (areaType === '0') {
                  setTimeout(function() {
                      T.setChoosedCity(); //下拉列表中选中当前所在的城市,第一次页面初始化时候执行.
                  }, 200);
                  T.initProvChange(); //只会执行一次.避免事件重复绑定.
              } else {
                  T.bindCityChange();
              }
          }
      },

      /**
       * 将下拉列表中展示的城市设置为用户已经选择的城市.
       */
      setChoosedCity: function() {
          var T = this;
          var sels = T.cities;
          var cookiesCode = T.defCityCode;
          for (var i = 0, len = sels.length; i < len; i++) {
              var $curSel = $('#' + sels[i]);
              $curSel.val(cookiesCode[i]);
          }
      },

      /**
       * 初始化省的点击事件.
       * @return {[type]} [description]
       */
      initProvChange: function() {
          var T = this;
          var sels = T.cities;
          var $provice = $('#' + sels[0]);
          $provice.on('change', function() {
              var $this = $(this);
              var val = $this.val(); //所选省的id.
              var cityCode = val.replace(/0000/, '0100'); //所选省对应的省会id.

              T.sendCityJsonP(val, 1); //获取省对应的城市信息.
              T.sendCityJsonP(cityCode, 2); //获取省会对应的区信息.
          });
      },

      /**
       * 市区信息点击事件.
       * @return {[type]} [description]
       */
      bindCityChange: function() {
          var T = this;
          var sels = T.cities;
          var $cities = $('#' + sels[1]);
          var $counties = $('#' + sels[2]);

          $cities.off('change').on('change', function() {
              var $this = $(this);
              var val = $this.val();
              T.sendCityJsonP(val, 2);
          });
          $counties.off('change').on('change', function() {
              var $this = $(this);
              var val = $this.val();
          });
      }
  };
}();

/**
* 省直辖市信息回调
*/
window.cityJsonCallback0 = function(data) {
  City.cityJsonCallback(data, '0');
}
/**
* 市信息回调
*/
window.cityJsonCallback1 = function(data) {
  City.cityJsonCallback(data, '1');
}
/**
* 区县信息回调
*/
window.cityJsonCallback2 = function(data) {
  City.cityJsonCallback(data, '2');
}

module.exports = City;
