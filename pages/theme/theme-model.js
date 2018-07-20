import { Base } from '../../utils/base.js';

class Theme extends Base {
  constructor() {
    super();
  }

  /*商品*/
  // 对应主题的 id 号
  getProductorData(id, callback) {
    var param = {
      url: 'theme/' + id,
      successCallback: function (data) {
        callback && callback(data);
      }
    };
    this.request(param);
  }
}

export {Theme};