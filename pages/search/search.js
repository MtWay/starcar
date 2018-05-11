const hotUrl = 'https://www.hx2car.com.cn/search/gethotcar.json?'//热门品牌

const searchUrl = 'https://www.hx2car.com.cn/mobile/searchsuggest.json?&keyword='

Page({
  data: {
    historySearchArr: ['', '', '', '', '', '', '', ''],
    hotArr: [{ 'title': '奥迪' }, { 'title': '奔驰' }, { 'title': '宝马' }, { 'title': '大众' }, { 'title': '别克' }, { 'title': '本田' }, { 'title': '马自达' }, { 'title': '丰田' }],
    searchList: []
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载i
    this.loadFromCatch()
    var temp = this
    wx.request({
      url: hotUrl, //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        temp.setData({
          hotArr: res.data.hotlist
        })
      }
    })

  },

  //将缓存的搜索历史记录取出来
  loadFromCatch: function () {
    var Arr = ['', '', '', '', '', '', '', '']
    for (var i = 0; i < 8; i++) {
      try {
        var value = wx.getStorageSync(i + '')
        if (value) {
          Arr[i] = value;
        }
      } catch (e) {
      }
    }
    this.setData({
      historySearchArr: Arr
    })
  },

  //监听输入
  listenerInput: function (e) {
    var temp = this
    var keyword = e.detail.value
    if (keyword == '') {
      temp.setData(
        {
          searchList: []
        }
      )
    } else {
      wx.request({
        url: searchUrl + keyword, //仅为示例，并非真实的接口地址
        data: {
          x: '',
          y: ''
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          temp.setData(
            {
              searchList: res.data.resList
            }
          )
        }
      })
    }

  },

  //取消
  cancel: function () {
    wx.navigateBack();
  },

  //点击搜索
  ordeItemclick: function (e) {
    var search = e.currentTarget.id
    this.pushToCash(search)

  },

  confirmInput: function (e) {
    var search = e.detail.value
    this.pushToCash(search)

  },

  //点击热门搜索
  hotsearch: function (e) {
    var search = this.data.hotArr[e.currentTarget.id].title
    this.pushToCash(search)


  },

  //点击搜索历史
  historysearch: function (e) {
    var search = this.data.historySearchArr[e.currentTarget.id]
    this.pushToCash(search)

  },

  //进行数据存储
  pushToCash: function (search) {
    //判断此热门搜索是否在搜索历史里面
    var isIn = false;
    for (var i = 0; i < 8; i++) {
      //在搜索历史记录里面
      if (this.data.historySearchArr[i] == search) {
        //将这条记录设置成空
        this.data.historySearchArr[i] = ''
        isIn = true;
        break;
      }
    }
    //如果该条记录之前已经存在放到第一条去
    if (isIn = true) {
      var j = 1;
      var Arr = ['', '', '', '', '', '', '', ''];
      for (var i = 0; i < 8; i++) {
        if (this.data.historySearchArr[i] != '') {
          Arr[j] = this.data.historySearchArr[i];
          j++
        }
      }
      Arr[0] = search
      this.setData({
        historySearchArr: Arr
      })
    } else {
      //分两种情况
      //第一种数据还没有存满,放置到第一条去
      //数据已经满了,删除最后一个数据
      //直接将最后一条数据至空
      var j = 1;
      var Arr = ['', '', '', '', '', '', '', ''];
      for (var i = 0; i < 7; i++) {
        if (this.data.historySearchArr[i] != '') {
          Arr[j] = this.data.historySearchArr[i];
          j++
        }
      }
      Arr[0] = search
      this.setData({
        historySearchArr: Arr
      })



    }


    //将数据重新放到缓存里面
    for (var i = 0; i < 8; i++) {
      try {
        wx.setStorageSync(i + '', this.data.historySearchArr[i])
      } catch (e) {

      }
    }

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      keyword: search,
      isSearch: true
    })

    wx.navigateBack();
  },


  //点击删除搜索历史
  delete: function () {
    var temp = this
    wx.showModal({
      title: '提示',
      content: '确定删除搜索历史记录?',
      success: function (res) {
        if (res.confirm) {
          for (var i = 0; i < 8; i++) {
            try {
              wx.setStorageSync(i + '', '')
            } catch (e) {
            }
          }

          temp.setData({
            historySearchArr: ['', '', '', '', '', '', '', '']
          })

        }
      }
    })
  }

})