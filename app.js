//app.js
import { Token } from 'utils/token.js';

App({
  // 小程序初始化完成的时候，执行其内部方法
  onLaunch: function () {
    var token = new Token();
    token.verify();
  },

  onShow: function () {

  },
})