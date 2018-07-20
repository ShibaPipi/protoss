// pages/cart/cart.js
import { Cart } from 'cart-model.js';

var cart = new Cart(); //实例化 购物车

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
  
  },

  onHide: function () {
    // 离开页面时，更新缓存
    cart.execSetStorageSync(this.data.cartData);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var cartData = cart.getCartDataFromLocal();
    var cal = this._calcTotalAccountAndCounts(cartData);

    this.setData({
      selectedCounts: cal.selectedCounts,
      selectedTypeCounts: cal.selectedTypeCounts,
      account: cal.account,
      // loadingHidden: true,
      cartData: cartData
    });
  },

  /*
    * 计算总金额和选择的商品总数
    * */
  _calcTotalAccountAndCounts: function (data) {
    var len = data.length,

      // 所需计算的总价格，要注意排除未选中的商品
      account = 0,
      // 购买商品的总个数
      selectedCounts = 0,
      // 购买商品种类的总数
      selectedTypeCounts = 0;
    
    let multiple = 100;

    for (let i = 0; i < len; i++) {
      //避免 0.05 + 0.01 = 0.060 000 000 000 000 005 的问题，乘以 100 *100
      if (data[i].selectStatus) {
        account += data[i].counts * multiple * Number(data[i].price) * multiple;
        selectedCounts += data[i].counts;
        selectedTypeCounts++;
      }
    }
    return {
      selectedCounts: selectedCounts,
      selectedTypeCounts: selectedTypeCounts,
      account: account / (multiple * multiple)
    }
  },

  /*选择商品*/
  toggleSelect: function (event) {
    var id = cart.getDataSet(event, 'id'),
      status = cart.getDataSet(event, 'status'),
      index = this._getProductIndexById(id);
    // 反选勾选状态
    this.data.cartData[index].selectStatus = !status;
    // 更新购物车商品数据
    this._resetCartData();
  },

  /* 全选，判断用户选择的商品种类的数量与购物车中所有商品的种类数相等，即为全选 */
  toggleSelectAll: function (event) {
    var status = cart.getDataSet(event, 'status') == 'true';
    var data = this.data.cartData;

    for (let i = 0; i < data.length; i++) {
      data[i].selectStatus = !status;
    }
    // 更新购物车商品数据
    this._resetCartData();
  },

  /*根据商品id得到 商品所在下标*/
  _getProductIndexById: function (id) {
    var data = this.data.cartData,
      len = data.length;
    for (let i = 0; i < len; i++) {
      if (data[i].id == id) {
        return i;
      }
    }
  },

  /*更新购物车商品数据*/
  _resetCartData: function () {
    // 重新计算总金额和商品总数
    var newData = this._calcTotalAccountAndCounts(this.data.cartData);
    this.setData({
      account: newData.account,
      selectedCounts: newData.selectedCounts,
      selectedTypeCounts: newData.selectedTypeCounts,
      cartData: this.data.cartData
    });
  },

  /*调整商品数目*/
  changeCounts: function (event) {
    var id = cart.getDataSet(event, 'id'),
      type = cart.getDataSet(event, 'type'),
      index = this._getProductIndexById(id),
      counts = 1;
    if (type == 'add') {
      cart.addCounts(id);
    } else {
      counts = -1;
      cart.cutCounts(id);
    }
    //更新商品页面
    this.data.cartData[index].counts += counts;
    this._resetCartData();
  },

  /*删除商品*/
  delete: function(event) {
    var id = cart.getDataSet(event, 'id'),
      index = this._getProductIndexById(id);
    // 删除UI中的某一项商品
    this.data.cartData.splice(index, 1);
    // 重新计算UI中的价格数据
    this._resetCartData();
    // 删除内存中的该商品
    cart.delete(id);
  },

  /*提交订单*/
  submitOrder: function (event) {
    wx.navigateTo({
      url: '../order/order?account=' + this.data.account + '&from=cart'
    });
  },


})