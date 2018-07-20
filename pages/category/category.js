// pages/category/category.js
import {Category} from 'category-model.js';

var category = new Category();  //实例化 home 的推荐页面

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /*加载所有数据*/
  _loadData: function (callback) {
    category.getCategoryType((categoryData) => {
      this.setData({
        categoryTypeArr: categoryData,
        // loadingHidden: true
      });

      category.getProductsByCategory(categoryData[0].id, (data) => {
        // this.setData({
        //   categoryProducts: data,
        // })
        var dataObj = {
          procucts: data,
          topImgUrl: categoryData[0].img.url,
          title: categoryData[0].name
        };
        this.setData({
          loadingHidden: true,
          categoryInfo0: dataObj
        });
        callback && callback();
      });
    });
  },

  /*切换分类*/
  changeCategory: function (event) {
    var index = category.getDataSet(event, 'index'),
      id = category.getDataSet(event, 'id')//获取data-set
    this.setData({
      currentMenuIndex: index
    });

    //如果数据是第一次请求
    if (!this.isLoadedData(index)) {
      var that = this;
      this.getProductsByCategory(id, (data) => {
        that.setData(that.getDataObjForBind(index, data));
      });
    }
  },

  isLoadedData: function (index) {
    if (this.data['categoryInfo' + index]) {
      return true;
    }
    return false;
  },

  getDataObjForBind: function (index, data) {
    var obj = {},
      arr = [0, 1, 2, 3, 4, 5],
      baseData = this.data.categoryTypeArr[index];
    for (var item in arr) {
      if (item == arr[index]) {
        obj['categoryInfo' + item] = {
          procucts: data,
          topImgUrl: baseData.img.url,
          title: baseData.name
        };

        return obj;
      }
    }
  },

  getProductsByCategory: function (id, callback) {
    category.getProductsByCategory(id, (data) => {
      callback && callback(data);
    });
  },

  /*跳转到商品详情*/
  onProductsItemTap: function (event) {
    var id = category.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id
    })
  },
})