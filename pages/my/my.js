// pages/my/my.js
import { Address } from '../../utils/address.js';
import { Order } from '../order/order-model.js';
import { My } from '../my/my-model.js';

var address = new Address();
var order = new Order();
var my = new My();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    isLoadedAll: false,
    loadingHidden: false,
    orderArr: [],
    addressInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
    this._getAddressInfo();
  },

  _loadData: function () {
    var that = this;
    my.getUserInfo((data) => {
      that.setData({
        userInfo: data
      });
    });

    this._getOrders();
    order.execSetStorageSync(false);  //更新标志位
  },

  onShow: function () {
    //更新订单,相当自动下拉刷新,只有非第一次打开 “我的”页面，且有新的订单时 才调用。
    var newOrderFlag = order.hasNewOrder();
    if (newOrderFlag == true) {
      this.refresh();
    }
  },

  refresh: function() {
    var that = this;
    // 初始化订单
    this.data.orderArr = [];
    this._getOrders( () => {
      // 将加载状态改为 false
      that.data.isLoadedAll = false;
      that.data.pageIndex = 1;
      // 更新本地缓存
      order.execSetStorageSync(false);
    })
  },

  /**地址信息**/
  _getAddressInfo: function () {
    var that = this;
    address.getAddress((addressInfo) => {
      that._bindAddressInfo(addressInfo);
    });
  },

  /*绑定地址信息*/
  _bindAddressInfo: function (addressInfo) {
    this.setData({
      addressInfo: addressInfo
    });
  },

  /*订单信息*/
  _getOrders: function (callback) {
    order.getOrders(this.data.pageIndex, (res) => {
      var data = res.data;
      if (data.length > 0) {
        this.data.orderArr.push.apply(this.data.orderArr, res.data);  //数组合并

        this.setData({
          orderArr: this.data.orderArr
        });
      } else {
        // 已经全部加载完毕
        this.data.isLoadedAll = true;
      }
      callback && callback();
    });
  },

  onReachBottom: function () {
    if (!this.data.isLoadedAll) {
      this.data.pageIndex++;
      this._getOrders();
    }
  },

  /*显示订单的具体信息*/
  showOrderDetailInfo: function (event) {
    var id = order.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../order/order?from=order&id=' + id
    });
  },

  /*未支付订单再次支付*/
  rePay: function (event) {
    var id = order.getDataSet(event, 'id'),
      index = order.getDataSet(event, 'index');

    //online 上线实例，屏蔽支付功能
    if (order.onPay) {
      this._execPay(id, index);
    } else {
      this.showTips('支付提示', '本产品仅用于演示，支付系统已屏蔽');
    }
  },

  /*支付*/
  _execPay: function (id, index) {
    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode > 0) {
        var flag = statusCode == 2;

        //更新订单显示状态
        if (flag) {
          that.data.orderArr[index].status = 2;
          that.setData({
            orderArr: that.data.orderArr
          });
        }

        //跳转到 成功页面
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=my'
        });
      } else {
        that.showTips('支付失败', '商品已下架或库存不足');
      }
    });
  },

  /*修改或者添加地址信息*/
  editAddress: function () {
    var that = this;
    wx.chooseAddress({
      success: function (res) {
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          totalDetail: address.setAddressInfo(res)
        };
        // 回调函数执行的时候，this已经改变，所以不能用this
        that._bindAddressInfo(addressInfo);

        // 保存地址到数据库
        address.submitAddress(res, (flag) => {
          if (!flag) {
            that.showTips('操作提示', '地址信息更新失败！');
          }
        });
      }
    })
  },

  /*
   * 提示窗口
   * params:
   * title - {string}标题
   * content - {string}内容
   * flag - {bool}是否跳转到 "我的页面"
   */
  showTips: function (title, content) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function (res) {

      }
    });
  },
})