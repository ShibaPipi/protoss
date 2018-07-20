import {Base} from '../../utils/base.js';

/*
* 购物车数据存放在本地，
* 当用户选中某些商品下单购买时，会从缓存中删除该数据，更新缓存
* 当用用户全部购买时，直接删除整个缓存
*
*/
class Cart extends Base {
  constructor() {
    super();
    this._storageKeyName = 'cart';
  };

  /*本地缓存 保存或更新*/
  execSetStorageSync(data) {
    wx.setStorageSync(this._storageKeyName, data);
  };

  /*
  * 获取购物车
  * param
  * flag - {bool} 是否过滤掉不下单的商品
  */
  getCartDataFromLocal(flag) {
    var res = wx.getStorageSync(this._storageKeyName);
    if (!res) {
      res = [];
    }

    // 在下单的时候过滤不下单的商品
    if (flag) {
      var flagRes = [];
      for (let i = 0; i < res.length; i ++) {
        if (res[i].selectStatus) {
          flagRes.push(res[i]);
        }
      }
      res = flagRes;
    }

    return res;
  };

  /*
  * 获得购物车商品总数目,包括分类和不分类
  * param:
  * flag - {bool} 是否区分选中和不选中
  * return
  * counts1 - {int} 不分类
  * counts2 - {int} 分类
  */
  getCartTotalCounts(flag) {
    var data = this.getCartDataFromLocal();
    var counts = 0;

    for (let i = 0; i < data.length; i++) {
      if (flag) {
        if (data[i].selectStatus) {
          counts += data[i].counts;          
        }
      } else {
        counts += data[i].counts;                  
      }
    }
    return counts;
  };

  /*
  * 加入到购物车
  * 如果之前没有样的商品，则直接添加一条新的记录， 数量为 counts
  * 如果有，则只将相应数量 + counts
  * @params:
  * item - {obj} 商品对象,
  * counts - {int} 商品数目,
  * */
  add(item, counts) {
    var cartData = this.getCartDataFromLocal();
    if (!cartData) {
      cartData = [];
    }
    var isHadInfo = this._isHasThatOne(item.id, cartData);
    //新商品
    if (isHadInfo.index == -1) {
      item.counts = counts;
      //默认在购物车中为选中状态
      item.selectStatus = true;
      cartData.push(item);
    }
    //已有商品
    else {
      cartData[isHadInfo.index].counts += counts;
    }
    //更新本地缓存
    wx.setStorageSync(this._storageKeyName, cartData);
    return cartData;
  };

  /*
  * 修改商品数目
  * 为什么定义一个私有方法，而不直接向外暴露此接口？
  * 如果外部可以访问，那么一旦传入的 count 值不为 +-1 的话，会产生商品数量<= 0的情况，因此是不安全的，而后定义了 addCount() 和 cutCount() 方法，调用此方法的时候传入 +1 或 -1 来实现商品数量的 +1 或 -1，这也是私有方法存在意义的最佳证明（虽然JS并没有真正的私有方法。。。）。
  * params:
  * id - {int} 商品id
  * counts -{int} 数目
  * */
  _changeCounts(id, counts) {
    var cartData = this.getCartDataFromLocal(),
      hasInfo = this._isHasThatOne(id, cartData);
    if (hasInfo.index != -1) {
      // 如果获得的当前商品数量大于1，则进行+1或者-1，等于1的时候已经设置不能点击减号，因为那样会删除这件商品
      if (hasInfo.data.counts > 1) {
        cartData[hasInfo.index].counts += counts;
      }
    }
    //更新本地缓存
    wx.setStorageSync(this._storageKeyName, cartData);
  };

  /* 判断购物车中是否已经存在该商品，并且返回这个商品的数据以及所在数组的序号 */
  _isHasThatOne(id, arr) {
    var item,
      result = { 
        index: -1 
      };
    for (let i = 0; i < arr.length; i++) {
      item = arr[i];
      if (item.id == id) {
        result = {
          index: i,
          data: item
        };
        break;
      }
    }
    return result;
  }

  /*
  * 删除某些商品
  */
  delete(ids) {
    if (!(ids instanceof Array)) {
      ids = [ids];
    }
    var cartData = this.getCartDataFromLocal();
    for (let i = 0; i < ids.length; i++) {
      // 先判断缓存中是否有该商品
      var hasInfo = this._isHasThatOne(ids[i], cartData);
      if (hasInfo.index != -1) {
        //删除数组某一项
        cartData.splice(hasInfo.index, 1);
      }
    }
    //更新本地缓存
    wx.setStorageSync(this._storageKeyName, cartData);
  }

  /*
    * 增加商品数目
    * */
  addCounts(id) {
    this._changeCounts(id, 1);
  };

  /*
  * 购物车减
  * */
  cutCounts(id) {
    this._changeCounts(id, -1);
  };
}

export {Cart};