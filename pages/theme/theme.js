// pages/theme/theme.js
import { Theme } from 'theme-model.js';

var theme = new Theme();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  onLoad: function (options) {
    this.data.titleName = options.name;
    this.data.id = options.id;
    this._loadData();
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.titleName
    });
  },

  /*加载所有数据*/
  _loadData: function (callback) {
    var that = this;
    /*获取单品列表信息*/
    theme.getProductorData(this.data.id, (data) => {
      that.setData({
        themeInfo: data,
        // loadingHidden: true
      });
      callback && callback();
    });
  },

  /*跳转到商品详情*/
  onProductsItemTap: function (event) {
    var id = theme.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id
    })
  },
})