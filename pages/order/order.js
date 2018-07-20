// pages/order/order.js
import {Order} from '../order/order-model.js';
import {Cart} from '../cart/cart-model.js';
import {Address} from '../../utils/address.js';

var order = new Order();
var cart = new Cart();
var address = new Address();

Page({

  data: {
    id: null,
  },

  onLoad: function (options) {
    var from = options.from;
    if (from == 'cart') {
      this._fromCart(options.account);
    } else {
      this._fromOrder(options.id);
    }
  },

  _fromCart: function(account) {
    var productsArr = cart.getCartDataFromLocal(true);
    this.data.account = account;

    this.setData({
      productsArr: productsArr,
      account: account,
      orderStatus: 0
    });

    /*显示收获地址*/
    address.getAddress((res) => {
      this._bindAddressInfo(res);
    });
  },

  _fromOrder: function(id) {
    if (id) {
      var that = this;
      //下单后，支付成功或者失败后，点左上角返回时能够更新订单状态 所以放在onshow中
      order.getOrderInfoById(id, (data) => {
        that.setData({
          orderStatus: data.status,
          productsArr: data.snap_items,
          account: data.total_price,
          basicInfo: {
            orderTime: data.create_time,
            orderNo: data.order_no
          },
        });

        // 快照地址
        var addressInfo = data.snap_address;
        // 根据服务器返回的地址信息，将地址拼合为一整条信息
        addressInfo.totalDetail = address.setAddressInfo(addressInfo);
        // 将地址信息进行数据绑定
        that._bindAddressInfo(addressInfo);
      });
    }
  },

  onShow: function () {
    if (this.data.id) {
      this._fromOrder(this.data.id);
    }
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

  /*绑定地址信息*/
  _bindAddressInfo: function (addressInfo) {
    this.setData({
      addressInfo: addressInfo
    });
  },

  /*下单和付款*/
  pay: function () {
    if (!this.data.addressInfo) {
      this.showTips('下单提示', '请填写您的收货地址');
      return;
    }
    if (this.data.orderStatus == 0) {
      this._firstTimePay();
    } else {
      this._oneMoresTimePay();
    }
  },

  /*第一次支付*/
  _firstTimePay: function () {
    var orderInfo = [],
      procuctInfo = this.data.productsArr,
      order = new Order();
    for (let i = 0; i < procuctInfo.length; i++) {
      orderInfo.push({
        product_id: procuctInfo[i].id,
        count: procuctInfo[i].counts
      });
    }

    var that = this;
    //支付分两步，第一步是生成订单号，然后根据订单号支付
    order.doOrder(orderInfo, (data) => {
      //订单生成成功
      if (data.pass) {
        //更新订单状态
        var id = data.order_id;
        that.data.id = id;
        // that.data.fromCartFlag = false;

        //开始支付
        that._execPay(id);
      } else {
        // 下单失败
        that._orderFail(data);
      }
    });
  },

  /*
     *下单失败
     * params:
     * data - {obj} 订单结果信息
     * */
  _orderFail: function (data) {
    var nameArr = [],
      name = '',
      str = '',
      pArr = data.pStatusArray;
    for (let i = 0; i < pArr.length; i++) {
      if (!pArr[i].haveStock) {
        name = pArr[i].name;
        if (name.length > 15) {
          name = name.substr(0, 12) + '...';
        }
        nameArr.push(name);
        if (nameArr.length >= 2) {
          break;
        }
      }
    }
    str += nameArr.join('、');
    if (nameArr.length > 2) {
      str += ' 等';
    }
    str += ' 缺货';
    wx.showModal({
      title: '下单失败',
      content: str,
      showCancel: false,
      success: function (res) {

      }
    });
  },

  /* 再次支付 */
  _oneMoresTimePay: function () {
    this._execPay(this.data.id);
  },

  /*
  *开始支付
  * params:
  * id - {int}订单id
  */
  _execPay: function (id) {
    // 屏蔽支付，提示
    if (!order.onPay) {
      this.showTips('支付提示', '本产品仅用于演示，支付系统已屏蔽', true);
      // 将已经下单的商品从购物车删除
      this.deleteProducts();
      return;
    }
    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode != 0) {
        // 将已经下单的商品从购物车删除
        that.deleteProducts();
        var flag = statusCode == 2;
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order'
        });
      }
    });
  },

  /*
    * 提示窗口
    * params:
    * title - {string}标题
    * content - {string}内容
    * flag - {bool}是否跳转到 "我的页面"
    */
  showTips: function (title, content, flag) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function (res) {
        if (flag) {
          wx.switchTab({
            url: '/pages/my/my'
          });
        }
      }
    });
  },

  // 将已经下单的商品从购物车删除
  deleteProducts: function () {
    var ids = [], arr = this.data.productsArr;
    for (let i = 0; i < arr.length; i++) {
      ids.push(arr[i].id);
    }
    cart.delete(ids);
  },
})