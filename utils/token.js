// 引用使用es6的module引入和定义
// 全局变量以g_开头
// 私有函数以_开头
// 此class为业务工具类，不适合继承base类

import {Config} from 'config.js';

class Token {
  constructor() {
    this.verifyUrl = Config.restUrl + 'token/verify';
    this.tokenUrl = Config.restUrl + 'token/user';
  }

  // 去服务器验证当前令牌是否有效
  verify() {
    var token = wx.getStorageSync('token');
    if (!token) {
      // 不存在，去获取
      this.getTokenFromServer();
    } else {
      // 若存在，要验证
      this._veirfyFromServer(token);
    }
  }

  // 去服务器验证令牌有效性，如果令牌不合法直接去请求令牌
  _veirfyFromServer(token) {
    var that = this;
    wx.request({
      url: that.verifyUrl,
      method: 'POST',
      data: {
        token: token
      },
      success: function (res) {
        var valid = res.data.isValid;
        if (!valid) {
          that.getTokenFromServer();
        }
      }
    })
  }

  // 从服务器获取token
  getTokenFromServer(callBack) {
    var that = this;
    // 因为服务器需要code码才能获取token，调用login获取code码，会保存在回调函数中
    wx.login({
      success: function (res) {
        wx.request({
          url: that.tokenUrl,
          method: 'POST',
          data: {
            code: res.code
          },
          success: function (res) {
            wx.setStorageSync('token', res.data.token);
            callBack && callBack(res.data.token);
          }
        })
      }
    })
  }
}

export {Token};