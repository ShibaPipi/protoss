import {Config} from '../utils/config.js';
import {Token} from 'token.js';

class Base {
  constructor() {
    this.baseRequestUrl = Config.restUrl;
  }

  // 当noRefetch为true时，不做未授权重试机制
  request(params, noRefetch) {
    var url = this.baseRequestUrl + params.url;
    var that = this;
    if (!params.type) {
      params.type = 'GET';
    }
    wx.request({
      url: url,
      data: params.data,
      method: params.type,
      header: {
        'content-type':'application/json',
        'token':wx.getStorageSync('token'),
      },
      success:function(res) {
        // 获取code码
        var code = res.statusCode.toString();
        var startChar = code.charAt(0);
        if (startChar == '2') {
          params.successCallback && params.successCallback(res.data);
        } else {
          // AOP
          if (code == '401') {
            // 去服务器重新获取令牌，然后再次向服务器发送本请求
            if (!noRefetch) { // 防止无限调用
              that._refetch(params);
            }
          }
          if (noRefetch) {
            params.eCallback && params.eCallback(res.data);
          }
        }
      },
      fail:function(err) {
        console.log(err)
      },
    })
  }

  _refetch(params) {
    var token = new Token();
    token.getTokenFromServer((token) => {
      this.request(params, true);
    });
  }

  /*获得元素上的绑定的值*/
  getDataSet(event, key) {
    return event.currentTarget.dataset[key];
  };
}

export {Base};