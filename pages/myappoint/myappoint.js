var haost = "https://www.hx2car.com.cn";
var app;
var token = wx.getStorageSync("token");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    allselect: false,
    delNum: 0,
    edit: 1,
    noCar:false,
  },

  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
token = wx.getStorageSync("token");

    var that = this;
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/getreserve.json',
      data: {
        // subDomain: "hxtest",
        token: token
      },
      success: function (res) {
        var list = [];
        var carList = res.data.bookingList;
        for (let i = 0; i < carList.length; i++) {
          carList[i].select=false;
        }
        //暂无
        var noCar = false;
        if (carList.length==0){
          noCar = true;
        }
        that.setData({
          list: carList,
          noCar: noCar
        })
      }
    })
  },
  edit: function () {
    this.setData({
      edit: 1
    })
  },
  cancel: function () {
    this.setData({
      edit: 0
    })
  },

  //选择一条/或者到详情页
  changeSelect: function (e) {
    if (!this.data.edit) {
     
      return false;
    }
    var index = e.currentTarget.dataset.index;
    var list = this.data.list;
    list[index].select = !list[index].select;
    this.setData({
      list: list
    })
    this.selectSum()
  },
  //全选
  allselect: function () {
    var allselect = !this.data.allselect;
    var list = this.data.list;
    var len = list.length;
    for (var i = 0; i < len; i++) {
      list[i].select = allselect;
    }
    this.setData({
      list: list,
      allselect: allselect
    })
    this.selectSum()
  },

  //统计当前选中记录数量
  selectSum: function () {
    var list = this.data.list;
    var num = 0;
    var len = list.length;
    for (var i = 0; i < len; i++) {
      if (list[i].select) {
        num++;
      }
    }
    this.setData({
      delNum: num
    })
  },
  //收藏
  collectChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.list;
    list[index].collect = !list[index].collect;
    this.setData({
      list: list
    })
  },
  // 删除
  del: function () {
    var that = this;
    var arr = [];
    var newList = [];
    var list = this.data.list;
    var len = list.length;
    for (var i = 0; i < len; i++) {
      if (list[i].select) {
        arr.push(list[i].recordId);
      } else {
        newList.push(list[i]);//生成新的list

      }
    }
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/delreserve.json',

      data: {
        flag: arr.join(","),
        token: token
      }, success: function (res) {
        if (res.data.delList.length > 0) {
          that.message("删除成功")
          that.setData({
            list: newList,
          })
          that.selectSum();

        }
      }
    }) 
  },
  //提示信息
  message: function (msg) {
    this.setData({
      msg: msg,
      showmsg: true,
    });
  },
  msgAnimationend: function () {
    this.setData({
      showmsg: false,
    });
  },

})