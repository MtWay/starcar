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
    edit: 0,
    noCar:false
  },

  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
    token = token || wx.getStorageSync("token");//更新token

    var that = this;
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/getbrowsehis.json',
      data: {
        // subDomain: "hxtest",
        token: token
      },
      success: function (res) {
        var list = [];
        var carList = res.data.historys;
        for (let i = 0; i < carList.length; i++) {
          list.push({
            index: i,
            id: carList[i].id,
            select: false,
            img: carList[i].photo,
            title: carList[i].title,
            spDate: carList[i].useDate,
            browseDate: carList[i].browseDate,
            kilometer: carList[i].journey,
            money: carList[i].price,
            collect: carList[i].collectNum,//暂无
          })
        }

        //暂无
        var noCar = false;
        if (carList.length == 0) {
          noCar = true;
        }
        that.setData({
          list: list,
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
    if (!this.data.edit){
     var id = e.currentTarget.id;
     wx.navigateTo({
       url: '../carDetail/carDetail?id='+id
     })
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
    var id = e.currentTarget.id;
    if (list[index].collect){
      //取消收藏
      this.collectcancel(id)
    }else{
      //添加收藏
    this.addCollect(id);
    }

    list[index].collect = !list[index].collect;
    this.setData({
      list: list
    })
  },


  //收藏接口
  addCollect: function (id) {
    var that = this;
    //如果未登录就去登录
    if (!token) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 4,
        id: id,
        token: token,
      }, success: function (res) {
        if (res.data.msg == "提交成功") {
          that.message("已成功收藏")

        }
      }
    })
  },

  //取消收藏
  collectcancel: function (id) {
    var that = this;
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/collectcancel.json',
      data: {
        token: token,
        id: id,
      }, success: function (res) {
        if (res.data.msg == "取消成功") {
          that.message("已取消收藏")
        }
      }
    })
  },

  // 删除
  del: function () {
    var that = this;
    var arr = [];
    var newList=[];
    var list = this.data.list;
    var len = list.length;
    for (var i = 0; i < len; i++) {
      if (list[i].select) {
        arr.push(list[i].index);
      }else{
        newList.push(list[i]);//生成新的list

      }
    }
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/delbrowsehis.json',

      data: {
        flag: arr.join(","),
        token: token
      }, success: function (res) {
        that.message(res.data.msg)
        if(res.data.msg=="删除成功"){
          that.setData({
            list:newList,
            edit:0
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