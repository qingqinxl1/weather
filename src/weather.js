// 天气情况显示
// 调用本地存储功能
//@dependence jQuery
var StoragePolyfill = require('@cnpm/storage');
var City = require('./city');
var CookieUtil = require('@cnpm/cookie-util');

var Weather = function () {
  var weatherStorageKey = "chinasoWeather",

    // 缓存时间（单位：小时）
    timestampDay = 0.5,

    // 初始化缓存对象
    // 用于存储天气信息到本地缓存
    // @params{weatherStorageKey: 缓存 key 值定义, timestampDay: 缓存有效时间}
    storageObj = new StoragePolyfill(weatherStorageKey, timestampDay);
  var CONST = {
    //天气图标名称.
    WEATHER_ICON: {
      '晴': ['qing', 'qing-yellow'],
      '阴': ['yin', 'yin'],
      '多云': ['duoyun', 'duoyun-yellow'],
      '小到中雨': ['xiaodaozhongyu', 'xiaodaozhongyu'],
      '小雨': ['xiaoyu', 'xiaoyu'],
      '大雨': ['dayu', 'dayu'],
      '阵雨': ['zhenyu', 'zhenyu-yellow'],
      '中雨': ['zhongyu', 'zhongyu'],
      '中雪': ['zhongxue', 'zhongxue'],
      '暴雪': ['baoxue', 'baoxue'],
      '暴雨': ['baoyu', 'baoyu'],
      '小雪': ['xiaoxue', 'xiaoxue'],
      '阵雪': ['zhenxue', 'zhenxue-yellow'],
      '雨夹雪': ['yujiaxue', 'yujiaxue'],
      '大暴雨': ['dabaoyu', 'dabaoyu'],
      '大雪': ['daxue', 'daxue'],
      '冻雨': ['dongyu', 'dongyu'],
      '浮尘': ['fuchen', 'fuchen-yellow'],
      '雷阵雨': ['leizhenyu', 'leizhenyu'],
      '雷阵雨伴有冰雹': ['leizhenyubanyoubingbao', 'leizhenyubanyoubingbao'],
      '霾': ['mai', 'mai-yellow'],
      '强沙尘暴': ['qiangshachenbao', 'qiangshachenbao-yellow'],
      '沙尘暴': ['shachenbao', 'shachenbao-yellow'],
      '特大暴雨': ['tedabaoyu', 'tedabaoyu'],
      '雾': ['wu', 'wu'],
      '扬尘': ['yangchen', 'yangchen-yellow'],
      'default': ['qing', 'qing-yellow']
    },
    WEATHER_ICON_URL: 'http://n3.static.pg0.cn/fp/weather/dist/image/@icon@.png',
    WEATHER_DETAIL_ID: 'weather_detail',
    WID_WRAP: 'toolbarTopWeather', // 天气外层ID
    WID: 'jToolbarWeather', // 左侧天气id
    WOUTER_ID: 'chinaso_weather', //天气外层容器，写在页面中的html
    OLD_WPREV_ID: 'jToolbarUser' //天气预报应该加入的元素位置，前一个兄弟节点，线上目前使用的该元素来插入天气
  };

  return {
    isExists: function (text, flag) {
      var index = text.indexOf(flag);
      return {
        index: index,
        isTrue: index !== -1 ? 1 : 0
      };
    },
    weatherCut: function (data) {
      var t = this;
      var strExists = t.isExists(data, "转");
      if (strExists.isTrue) {
        return data.substring(0, strExists.index);
      }
      return data;
    },
    /**
     * 1.本地缓存版本号和js版本号比对逻辑
     * 若缓存数据版本号storageVal.version 与js程序版本号storageObj.version不一致
     * 则更新本地缓存数据
     * 2.本地缓存数据过期storageVal.expires则更新本地数据
     * @return {[type]} [description]
     */
    getWeatherData: function () {
      var self = this,
        storageVal = storageObj.get(weatherStorageKey) || null;
      if (!storageVal || (typeof storageVal.version == 'undefined') || (storageVal.version != storageObj.version)) {
        self.requestWeatherData();
        return;
      }
      //本地存储逻辑判断
      if (storageVal) {
        //判断是否过期
        if (new Date().getTime() - storageVal.expires > 999) {
          self.requestWeatherData();
        } else {
          //若没有过期，判断cookie中存储的城市Code和localstorage中缓存的天气信息中城市Code是否一致
          var cookieCode = CookieUtil.get(City.cityCodeCookieName, true);
          var cookieCity = cookieCode && cookieCode.split(',').length === 3 ? cookieCode.split(',')[2] : '';
          var storageCity = storageVal.cityExt.cityid;
          cookieCity === storageCity ? self.formatWeatherData(storageVal) : self.requestWeatherData();
        }
      } else {
        self.requestWeatherData();
      }
    },
    requestWeatherData: function () {
      City.getCurrentCity();
    },

    //将天气数据缓存到localstorage中.
    fillStorageWeatherData: function (weatherData) {
      var self = this;
      if (weatherData && weatherData.length) {
        weatherData = weatherData[0];
      }
      // 计算毫秒数：1000 * 60 * 60 * timestampDay
      var expires = new Date().getTime() + 36e5 * timestampDay;
      weatherData.expires = +expires;
      storageObj.set(weatherStorageKey, weatherData);
    },

    /**
     * toolbar左侧天气展示
     * @param weatherData 天气数据
     */
    formatWeatherData: function (weatherData) {
      var city,
        forcast,
        airQuality,
        aqiClass,
        aqiText,
        w,
        jToolbarUser,
        disApi = "",
        T = this;
      if (weatherData) {
        if (weatherData.length) weatherData = weatherData[0];
        city = weatherData.cityExt;
        forcast = weatherData.forcast;
        airQuality = weatherData.airQuality || {};
        /***@view{<span>北京：晴 33 ～23℃</span><span class="air_quality">空气质量：86</span><em>轻度污染</em>}**/
        if (airQuality.aqi >= 0 && airQuality.aqi <= 50) {
          aqiClass = "you";
          aqiText = "优";
        } else if (airQuality.aqi > 50 && airQuality.aqi <= 100) {
          aqiClass = "liang";
          aqiText = "良";
        } else if (airQuality.aqi > 100 && airQuality.aqi <= 150) {
          aqiClass = "qingdu";
          aqiText = "轻度污染";
        } else if (airQuality.aqi > 150 && airQuality.aqi <= 200) {
          aqiClass = "zhongdu";
          aqiText = "中度污染";
        } else if (airQuality.aqi > 200 && airQuality.aqi <= 300) {
          aqiClass = "zhongdu2";
          aqiText = "重度污染";
        } else if (airQuality.aqi > 300) {
          aqiClass = "yanzhong";
          aqiText = "严重污染";
        }
        var tqyb = encodeURIComponent(city.city + "天气预报");
        var kqzl = encodeURIComponent(city.city + "空气质量");


        jToolbarUser = $("#" + CONST.OLD_WPREV_ID);
        var weatherStr = forcast.weathers[0].weather;
        //处理天气描述过长的问题
        weatherStr = weatherStr.length <= 4 ? weatherStr : (weatherStr.split('转')[0] || weatherStr.substring(0, 5));
        if (aqiText) {
          disApi = '<em class="' + aqiClass + '">' + aqiText + '</em>';
          w = '<a rel="external nofollow"  target="_blank" href="http://www.chinaso.com/search/pagesearch.htm?q=' + tqyb + '">' +
            city.city + ' ' + weatherStr + " " + forcast.weathers[0].temp.replace('℃', '') +
            '</a><a rel="external nofollow"  target="_blank"' +
            ' href="http://www.chinaso.com/search/pagesearch.htm?q=' + kqzl + '" class="air_quality">' + disApi +
            '</a>';
        } else {
          w = '<a rel="external nofollow"  target="_blank" href="http://www.chinaso.com/search/pagesearch.htm?q=' + tqyb + '" style="margin-right:0;">' +
            city.city + ' ' + weatherStr + " " + forcast.weathers[0].temp.replace('℃', '') +
            '</a>';
        }

        //判断天气预报将要展示的外层容器或者兄弟位置存在不，若不存在，退出.
        if (jToolbarUser.length) {
          if (!$('#' + CONST.WID_WRAP).length) {
            jToolbarUser.after('<div class="fl top_weather" id="' + CONST.WID_WRAP + '" log_action="598a758fec6e0f76098ffa69"><div class="top_data"><span id="' +
              CONST.WID + '"></span><i>|</i></div></div>');
          }
        } else if ($("#" + CONST.WOUTER_ID).length) {
          if (!$('#' + CONST.WID_WRAP).length) {
            $("#" + CONST.WOUTER_ID).html('<div class="fl top_weather" id="' + CONST.WID_WRAP + '" log_action="598a758fec6e0f76098ffa69"><div class="top_data"><span id="' +
              CONST.WID + '"></span><i>|</i></div></div>');
          }
        } else {
          return false;
        }

        var $wDetailWrap = $('#' + CONST.WID_WRAP);
        var $wCon = $('#' + CONST.WID);

        $wCon.html(w);

        //add by huangxiaoli 添加鼠标滑过展示四天天气预报逻辑
        var $wDetail = $wDetailWrap.find('#' + CONST.WEATHER_DETAIL_ID);
        if ($wDetail.length) {
          T.updateWeatherDetail(weatherData);
        } else {
          $wDetailWrap.append(T.buildWeatherDetail());
          T.updateWeatherDetail(weatherData);
          T.toggleWeatherDetailWrap();
        }

        //重置city中默认的citycode.
        var cityID = city.cityid;
        //拿到接口返回的城市数据后更新默认城市code.
        //初次请求若不传城市信息，则后台进行Ip定位，定位到省级.
        if (!CookieUtil.get(City.cityCodeCookieName)) {
          City.updateDefCityCode(/(\d{2})(\d{4})/.exec(cityID)[1] + '0000', /(\d{3})(\d{3})/.exec(cityID)[1] + '100', cityID);
          City.updateCookieCityInfo();
        }
      }
    },

    /**
     * 构建四天天气预报不依赖数据的部分结构.
     */
    buildWeatherDetail: function () {
      var str = '<div class="weather_con" id="' + CONST.WEATHER_DETAIL_ID +
        '" style="display:none"><i class="weather_horn"></i><a class="weather_seven" href="#"' +
        ' target="_blank">未来七天天气</a>' +
        '<div class="weather_title"><i></i><span class="weather_city"></span>' +
        '<a href="javascript:;" class="weather_change">[切换城市]</a></div>' +
        '<div class="weather_select" style="display:none"><select class="province" id="s_province"></select>' +
        '<select class="city" id="s_city"></select><select class="county" id="s_county"></select>' +
        '<input type="button" id="weatherSubmit" class="ok" value="更换"></div>' +
        '<div class="weather_day"></div><div class="weather_list clearb"></div></div>';

      return str;
    },

    /**
     * 填充四天天气预报数据.
     * @param $wDetailWrap
     * @param weatherData
     */
    updateWeatherDetail: function (weatherData) {
      var T = this;
      var $wDetailWrap = $('#' + CONST.WEATHER_DETAIL_ID);
      var airQuality = weatherData.airQuality;
      var cityExt = weatherData.cityExt;
      var city = cityExt.city;
      var citySearchURL = 'http://www.chinaso.com/search/pagesearch.htm?q=' + encodeURIComponent(city + '天气预报');
      var arrDaysW = weatherData.forcast.weathers;
      var todayW = arrDaysW[0];
      var todayWIcon = T.getWheatherIcon(todayW.weather, 1);
      var sevenDaysURL = cityExt.url || '';

      //空气质量数据处理.
      var qualitySpan = '';
      if (airQuality.aqi || (airQuality.quality && airQuality.quality !== '无')) {
        qualitySpan = '<span class="quality">';
        if (airQuality.aqi) {
          qualitySpan += '<i class="quality_digit">' + airQuality.aqi + '</i>';
        }
        if (airQuality.quality && airQuality.quality !== '无') {
          qualitySpan += '<i class="quality_degree">' + airQuality.quality + '</i>';
        }
        qualitySpan += '</span>';
      }

      var $sevenWeather = $wDetailWrap.find('.weather_seven');
      if (sevenDaysURL) {
        $sevenWeather.attr('href', sevenDaysURL);
      } else {
        $sevenWeather.hide();
      }
      $wDetailWrap.find('.weather_title').find('i').html(T.dealWheatherDate(todayW.date) + '-');
      $wDetailWrap.find('.weather_title').find('.weather_city').html(city);
      $wDetailWrap.find('.weather_day').html('<a href="' + citySearchURL + '" target="_blank"><div class="weather_day_l">' +
        '<img src="' + todayWIcon +
        '"><span class="feature">' + todayW.weather.substring(0, 8) +
        '</span></div><div class="weather_day_wrap"><span class="weather">' + todayW.temp.replace('℃', '') +
        '</span>' + qualitySpan + '<span class="wind">' +
        todayW.fl + '</span></div></a></div>');

      var afterThreeW = arrDaysW.slice(1);
      var threeWStr = '';
      var afterStr = '明天';
      for (var i = 0, len = afterThreeW.length; i < len; i++) {
        var curW = afterThreeW[i];
        var curWIcon = T.getWheatherIcon(curW.weather);

        if (i === 1) afterStr = '后天';
        if (i >= 2) afterStr = T.dealWheatherDate(curW.date);

        threeWStr += '<a href="' + citySearchURL + '" target="_blank"><div>' +
          afterStr + '</div><img src="' + curWIcon +
          '"><div>' + curW.weather + '</div><div>' +
          curW.temp.replace('℃', '') + '</div></a>';
      }

      $wDetailWrap.find('.weather_list').html(threeWStr);
    },

    /**
     * 天气详细内容展示隐藏切换.
     */
    toggleWeatherDetailWrap: function () {
      var T = this;
      var $wToolbar = $('#' + CONST.WID_WRAP);
      var timmer = null;
      var $wDetailCon = $('#' + CONST.WEATHER_DETAIL_ID);

      $wToolbar.on('mouseenter', function () {
        clearTimeout(timmer);
        timmer = setTimeout(function () {
          T.showWeatherDetail();
        }, 200);
      }).on('mouseleave', function (e) {
        //处理火狐和IE下的bug（鼠标滑到select的下拉列表时，触发mouseleave事件）.
        if (window.navigator.userAgent.toUpperCase().indexOf('FIREFOX') > -1 || !!window.ActiveXObject || "ActiveXObject" in window) {
          e = e || window.event;
          $target = $(e.target);
          if ($target.attr('id') === 's_province' || $target.attr('id') === 's_city' || $target.attr('id') === 's_county' ||
            $target.parent().attr('id') === 's_province' || $target.parent().attr('id') === 's_city' || $target.parent().attr('id') === 's_county') {
            return false;
          }
        }
        clearTimeout(timmer);
        timmer = setTimeout(function () {
          T.hideWeatherDetail();
        }, 200);
      });

      $wDetailCon.find('.weather_change').on('click', function () {
        $wDetailCon.find('.weather_select').show();
        // City.renderBack();
      }).one('click', function () {
        City.initCityChange();
      });

      //点击确认按钮
      $wDetailCon.find('#weatherSubmit').on('click', function () {
        var selectCity = $('#s_county').find("option:selected").text();

        //console.log(selectCity);
        if (selectCity) {
          //点击确定按钮后更新默认天气
          City.updateDefCityCode($('#s_province').val(), $('#s_city').val(), $('#s_county').val());
          City.updateCookieCityInfo();

          T.hideWeatherDetail();
          City.getCurrentCity(); //更新当前页面天气
        } else {
          alert('请选择一个城市');
          return false;
        }
      });
    },

    /**
     * 天气预报细节展示.
     */
    showWeatherDetail: function () {
      $('#' + CONST.WEATHER_DETAIL_ID).show();
    },

    /**
     * 收起天气预报细节展示.
     */
    hideWeatherDetail: function () {
      $('#' + CONST.WEATHER_DETAIL_ID).hide().find('.weather_select').hide();
    },

    /**
     * 获取类似12月1日的格式的日期.
     * @param dateStr 传入的日期格式 @example "2016-12-01 09:55:58"
     * @returns {*}
     */
    dealWheatherDate: function (dateStr) {
      var ymd = $.trim(dateStr).replace(/-0/g, '-').split(' ')[0].split('-');
      return ymd[1] + '月' + ymd[2] + '日';
    },

    /**
     * 获取天气图标路径
     * @param weather 天气 @example '多云'
     * @return string 天气图标路径
     */
    getWheatherIcon: function (weather, arrayIdx) {
      arrayIdx = arrayIdx || 0;
      weather = weather.split('转')[0];
      return CONST.WEATHER_ICON_URL.replace('@icon@', CONST.WEATHER_ICON[weather] ?
        CONST.WEATHER_ICON[weather][arrayIdx] : CONST.WEATHER_ICON['default'][arrayIdx]);
    }

  };
}();

//天气方法调用.
Weather.getWeatherData();

/***请求天气回调函数**/
window.updateWheatherState = function (data) {
  Weather.fillStorageWeatherData(data);
  Weather.formatWeatherData(data);
}
