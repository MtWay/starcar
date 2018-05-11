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
    edit:1,
    resaleWays:["直卖","寄售","租赁"],
    conditions: ["优秀", "良好", "正常","一般"],
    noCar:false
  },

  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
    token = wx.getStorageSync("token");
    var that = this;
    console.log(app)
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/getonsell.json',
      data: {
        // subDomain: "hxtest",
        token:token
      },
      success: function (res) {
        var list = [];
        var carList = res.data.carList;
        if (carList)
        for (let i = 0; i < carList.length; i++) {
          list.push({
            index: carList[i].id,
            id: carList[i].id,
            select: false,
            img: carList[i].photo.replace("http://img.hx2cars.com/upload",""),
            title: carList[i].title,
            spDate: carList[i].useDate,
            browseDate: carList[i].browseDate,
            kilometer: carList[i].journey,
            createTime: carList[i].createTime,
            resaleWay: carList[i].resaleWay,
            areaName: carList[i].areaName,
            condition: carList[i].condition,
          })
        }
        var  noCar = false;
        if (carList.length==0){
           noCar = true;
        }
        console.log(carList)
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
    if (!this.data.edit) {
      var id = e.currentTarget.id;
      console.log(id)
      wx.navigateTo({
        url: '../carDetail/carDetail?id=' + id
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
        arr.push(list[i].index);
      } else {
        newList.push(list[i]);//生成新的list

      }
    }
    console.log(arr)
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/delonsell.json',

      data: {
        flag: arr.join(","),
        token: token
      }, success: function (res) {
        console.log(res)
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