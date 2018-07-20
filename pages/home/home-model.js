import {Base} from '../../utils/base.js';

class Home extends Base {

  constructor() {
    super();
  }

  getBannerData(id, callback){
    // 微信小程序发送请求是异步的，不能用定义 var b = wx.request({}) 这样的方式获得请求的结果
    var params = {
      url: 'banner/' + id,
      successCallback: function(data) {
        data = data.items;
        callback && callback(data);
      }
    };
    this.request(params);
  }

  /*首页主题*/
  getThemeData(callback) {
    var params = {
      url: 'theme?ids=1,2,3',
      successCallback: function(data) {
        callback && callback(data);
      }
    };
    this.request(params);
  }

  /*首页部分商品*/
  getProductorData(callback) {
    var param = {
      url: 'product/recent',
      successCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export {Home};