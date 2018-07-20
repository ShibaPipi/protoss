// pages/home/home.js

// var Base = require('../../utils/base.js').base;
// 使用 ES6 新特性，没有使用小程序内部自带的 require() 方法
import {Home} from 'home-model.js';

var home = new Home();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  onLoad:function() {
    this._loadData();
  },

  // JS没有private、protected等成员变量控制的关键字，因此利用在一个方法前面加上 _ 下划线表示此方法是 private 的，以便区分（信仰问题）
  _loadData:function() {
    var id = 1;
    // 函数名是最好的注释，不推荐这么写
    home.getBannerData(id, (data) => {
      this.setData({
        bannerArr: data,
      });
    });

    home.getThemeData((data) => {
      this.setData({
        themeArr: data,
      });
    });

    /*获取单品信息*/
    home.getProductorData((data) => {
      this.setData({
        productsArr: data
      });
    });
  },

  /*跳转到商品详情*/
  onProductsItemTap: function(event) {
    var id = home.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id,
    })
  },

  /*跳转到主题列表*/
  onThemesItemTap: function (event) {
    var id = home.getDataSet(event, 'id');
    var name = home.getDataSet(event, 'name');
    wx.navigateTo({
      url: '../theme/theme?id=' + id + '&name=' + name
    })
  },

})
