/**
 * 天气预报js版本.
 * 用途：用来比对客户端天气预报缓存版本号
 * 若缓存数据版本号与js程序版本号不一致
 * 则请求新的天气预报并更新本地缓存数据
 */
var jsVersion = window["WEATHER_STORAGE_VERSION"] ? window["WEATHER_STORAGE_VERSION"] : '1.0.2';

module.exports = jsVersion;
