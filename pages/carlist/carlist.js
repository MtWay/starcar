var haost = "https://www.hx2car.com.cn";
var app;
var token = wx.getStorageSync("token");
var URL;

const BrandUrl = haost + "/mobile/getAllOneLevelSerial2.json";//品牌接口

//品牌二级的接口
const SecondBrandUrl = haost + "/mobile/getCarSerialByParentId2.json?parentId=";

//地区选择的接口s
const CityUrl = haost + "/tools/getprovinces.json";

//地区选择的二级接口
const CitySceondUrl = haost + "/tools/getAreaByCityCode.json?province=";

// const carListUrl = haost + "/wxapp/" + app.globalData.second + "/carlistjson.json";


Page({
  data: {
    guanggao: false,
    loading: false,
    carList: [],
    windowWidth: 0,
    windowHeight: 0,
    currentpage: 1,
    showlist: true,
    hasMore: false,
    totalpage: 1,
    refresh: false,
    // 头部的四个选择状态
    order: "默认排序",
    brand: "品牌",
    price: "价格",
    other: "筛选",
    age: "全部车龄",
    city: "全国",
    //城市选择
    showcity: false,
    areaCode: 100000,
    carType: "",
    cityArr: [],

    //城市二级选择
    showcitysecond: false,
    citySecondArr: [],
    areaSceondCode: "",
    provincecode: "",
    provincetitle: "",

    //排序
    orderArr: ["按时间排序", "价格从低到高", "价格从高到低", "车龄最短", "里程最少", ],
    showorder: false,
    orderNum: 0,

    //价格
    priceArr: ["不限", "100万以内", "100-300万", "300万以上"],
    showprice: false,
    priceInterval: "",
    othermap: [
      {
        name: "车源类型",
        data: ["不限", "第一站自营"],
        code: "",
        value: "不限"
      },
      {
        name: "车龄",
        data: ["1年以内", "2年以内", "3年以内", "3-5年"],
        code: "",
        codes: ["0-1", "0-2", "0-3", "3-5"],//获取数据在codes取值
        value: "不限"
      },
      {
        name: "里程",
        data: ["1万公里以内", "1-3万公里", "3-6万公里", "6-10万公里"],
        code: "",
        codes: ["0-1", "1-3", "3-6", "6-10"],
        value: "不限"
      },
      {
        name: "颜色",
        data: ["黑色", "红色", "蓝色", "白色", "绿色", "黄色", "银灰", "灰色", "橙色", "香槟"],
        code: "",
        codes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
        value: "不限"
      },
    ],
    thisother: 0,
    other3: [],
    showother3: false,
    showage: false,
    carAge: "",
    lastyear: "",
    firstyear: "",
    firstmileage: "",
    lastmileage: "",

    //关键字搜索
    keyword: "",
    isSearch: false,

    //品牌数据
    resultmap: [],
    keymap: ["A", "B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"],
    showbrand: false,
    serial: "",
    serialId: "",
    resultmapSecond: [],
    showbrandsecond: false,
    gg:false,//是否没有更多数据了
  },
  onLoad: function (options) {
    app = getApp();
    haost = app.globalData.haost;
    token = token || wx.getStorageSync("token");//更新token
    var temp = this
    wx.getSystemInfo({
      success: (res) => {
        temp.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    
    setTimeout(function () {
      temp.fetchData(temp.data.currentpage);
    })


  },

  //获取列表数据
  fetchData: function (page) {
    if(this.data.gg){
      //没有更多数据
      return false;
    }

    URL = haost + "/wxapp/" + app.globalData.second + "/carlistjson.json";
    var temp = this;
    var othermap = this.data.othermap;
    var color = othermap[3].codes[othermap[3].code] || '';

    var data = {
      sort: this.data.orderNum,//排序方式
      price: Number(this.data.priceInterval) - 1,//价格
      startYear: this.data.firstyear,// 年份区间数字
      endYear: this.data.lastyear,//年份区间数字 
      startMile: this.data.firstmileage,//最小里程 
      endMile: this.data.lastmileage,//最大里程 
      color: color,//颜色 
      serial: this.data.serialId,//车系 
      carType: this.data.carType,//车型 
      keyword: this.data.keyword,//查询关键字 
      currPage: this.data.currentpage,//页码  

    }
    wx.request({
      url: URL,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (temp.data.refresh) {
          temp.setData(
            {
              carList: [],
              currentpage: 1,
              guanggao: false,
            }
          )
        }
        //推广车辆
        let appcarad = res.data.appcarad
        // if (appcarad != '' && appcarad != null) {
        //   appcarad.type = "1"
        // }

        let items = temp.data.carList;

        if (!temp.data.guanggao && appcarad != '' && appcarad != null) {
          items.push(appcarad);
        }

        if (!res.data.carList || res.data.carList.length == 0) {
          temp.message("没有更多车源了")
          temp.setData({
            // 没有更多
            gg: true
          })
          return false;
        }
        var list = res.data.carList;

        for (let i = 0; i < list.length;i++){
          list[i].photo = list[i].photo.replace("http://img.hx2cars.com/upload",'')
      }

        items = items.concat(list)


        temp.setData({
          loading: true,
          carList: items,
          // totalpage: res.data.page.lastpage,
          totalpage: 1,
          currentpage: temp.data.currentpage + 1,
          guanggao: true,
        })
        //加载更多动画
        if (temp.data.showlist) {
          if (temp.data.totalpage >= temp.data.currentpage) {
            temp.setData({
              hasMore: true,
            })

          } else {
            temp.setData({
              hasMore: false,
            })

          }
        }

        //刷新动画
        temp.setData(
          {
            refresh: false
          }
        )

      }
    })

  },


  binderrorimgmain: function (e) {
    var carlistData = this.data.carList;
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标

    carlistData[errorImgIndex].photoAddress = "http://static.hx2cars.com/resource/web/mobpages/images/mcarlist/carmr.jpg"
    this.setData({
      carList: carlistData,
    })
  },

  //图片加载出错
  binderrorimg: function (e) {
    var carlistData = this.data.resultmap;
    var errorImgIndex = e.target.dataset.errorimg //获取循环的下标

    carlistData[errorImgIndex].mobileLogo = "http://www.hx2car.com/resource/web/mobile/img/appdown.jpg"
    this.setData({
      resultmap: carlistData,
    })
  },

  // 加载更多
  loadmore: function (e) {
    this.fetchData(this.data.currentpage)
  },


  //刷新最新的数据
  refresh: function (e) {
    var temp = this;
    this.setData(
      {
        refresh: true,
        currentpage:1,
        gg: false,
        
      }
    )
    //获取数据
    setTimeout(function () {

      temp.fetchData(1)
    }, 500);

  },



  onReady: function () {

  },
  /*获取当前页url*/
  getCurrentPageUrl: function () {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    return url
  },
  onShow: function () {
    var temp = this;
    if (this.data.keyword != '' && this.data.isSearch) {
      this.datarefresh()
      this.setData(
        {
          serial: "",
          brand: temp.data.keyword,
          keyword: temp.data.keyword,
          isSearch: false
        }
      )
      //获取数据
      setTimeout(function () {
        temp.fetchData(1)
      }, 200);
    }
    token = token || wx.getStorageSync("token");//更新token
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  // onShareAppMessage: function () {
  //   // 用户点击右上角分享
  //   return {
  //     title: '华夏二手车', // 分享标题
  //     desc: '华夏二手车', // 分享描述
  //     path: '/pages/findcar/findcar' // 分享路径
  //   }
  // },

  //点击地区
  cityonlick: function () {

    if (this.data.showcity || this.data.showcitysecond) {
      return;
    }

    this.shaixuan()

    if (this.data.cityArr.length > 0) {
      this.setData({
        showcity: true
      })
      return;
    }
    var temp = this;
    wx.request({
      url: CityUrl,
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
            cityArr: res.data.provinces,
            showcity: true
          }
        )
      }
    })
  },


  //点击排序
  ordeclick: function () {
    this.shaixuan()
    this.setData(
      {
        showorder: true,
      }
    )
  },
  ordeItemclick: function (e) {
    var temp = this;
    // var num = [0, 1, 2, 5, 6, 7, 8, 3];
    var index = e.currentTarget.id;
    // var tempordernumber = num[index];
    var temporder = temp.data.orderArr[index];

    this.setData(
      {
        order: temporder,
        orderNum: index
      }
    )
    this.datarefresh()
    //获取数据
    setTimeout(function () {
      temp.fetchData(1)
    }, 200);
  },


  //点击价格
  priceclick: function () {
    this.shaixuan()
    this.setData(
      {
        showprice: true,
      }
    )
  },
  priceItemclick: function (e) {
    var temp = this;
    var index = e.currentTarget.id;
    var tempprice = temp.data.priceArr[index];
    this.datarefresh()
    this.setData(
      {
        price: tempprice,
        priceInterval: index,
      }
    )
    //获取数据
    setTimeout(function () {
      temp.fetchData(1)
    }, 200);
  },

  //点击筛选
  otherclick: function () {
    this.shaixuan()
    this.setData(
      {
        showother: true,
      }
    )
  },
  //筛选二级
  otherItemclick: function (e) {
    this.shaixuan()
    var index = e.currentTarget.id;

    this.setData(
      {
        showother3: true,
        showlist: false,
        other3: this.data.othermap[index].data,
        thisother: index
      }
    )
  },

  //set自定义年份
  firstyear: function (e) {
    this.setData({
      firstyear:e.detail.value
    })
  },

  lastyear: function (e) {
    this.setData({
      lastyear: e.detail.value
    })
  },
  setyear: function () {
    var y1 = this.data.firstyear || 0;
    var y2 = this.data.lastyear || 0;
    this.shaixuan();
    var othermap = this.data.othermap;
    othermap[1].value = y1 + '-' + y2 + '年';
    this.setData(
      {
        showother: true,
        showlist: false,
        othermap: othermap
      }
    )
  },

  //自定义公里数
  firstmileage: function (e) {
    this.setData({
      firstmileage: e.detail.value
    })
  },

  lastmileage: function (e) {
    this.setData({
      lastmileage: e.detail.value
    })
  },
  setmileage: function () {
    var m1 = this.data.firstmileage || 0;
    var m2 = this.data.lastmileage || 0;
    this.shaixuan();
    var othermap = this.data.othermap;
    othermap[2].value = m1 + '-' + m2 + '万公里';
    this.setData(
      {
        showother: true,
        showlist: false,
        othermap: othermap
      }
    )
  },

  //筛选提交及重置
  rasetother: function () {
    var othermap = this.data.othermap;
    othermap.forEach(function (e) {
      e.value = "不限";
      e.code="";
    });
    this.setData(
      {
        othermap: othermap,
        lastyear: "",
        firstyear: "",
        firstmileage: "",
        lastmileage: "",
      })
  },
  subother: function () {
    this.setData(
      {
        showother: false,
        showlist: true,
        
      })
    this.refresh()//获取最新数据
    
    // 提交
  },


  //获取三级数据
  otherItemSonclick: function (e) {
    var index = e.currentTarget.id;
    this.shaixuan();
    var othermap = this.data.othermap;
    var thisother = this.data.thisother;//当前操作的筛选项
    othermap[thisother].value = othermap[thisother].data[index];//展示当前所选
    othermap[thisother].code = index;//保存所选项index

    this.setData(
      {
        showother: true,
        showlist: false,
        othermap: othermap
      }
    )
    //车龄
    if (thisother == 1) {
      this.setData(
        {
          firstyear: othermap[thisother].codes[index].split("-")[0],
          lastyear: othermap[thisother].codes[index].split("-")[1],
        })
    }

    //里程
    if (thisother == 2) {
      this.setData(
        {
          firstmileage: othermap[thisother].codes[index].split("-")[0],
          lastmileage: othermap[thisother].codes[index].split("-")[1],
        })
    }

  },
  //点击车龄
  ageclick: function () {
    this.shaixuan()
    this.setData(
      {
        showage: true,
      }
    )
  },

  //品牌点击
  brandonclick: function () {
    this.shaixuan()
    if (this.data.resultmap.length > 0) {
      this.setData({
        showbrand: true
      })
      return;
    }
    var temp = this;
    wx.request({
      url: BrandUrl,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        temp.setData(
          {
            resultmap: res.data.resultmap,
            showbrand: true
          }
        )
      }
    })
  },

  //选择品牌item
  allbrand: function () {
    //点击全部
    var temp = this;
    this.datarefresh()
    this.setData(
      {
        serialId: "",
        brand: "品牌",
        keyword: '',
        carType:""
      }
    )
    //获取数据
    setTimeout(function () {
      temp.fetchData(1)
    }, 200);
  },

  //选择了一级品牌的全部
  allbrandsecond: function () {
    //点击全部
    var temp = this;
    this.datarefresh()
    this.setData(
      {
        brand: temp.data.serial,
        resultmapSecond: [],
        keyword: '',
      }
    )
    //获取数据
    setTimeout(function () {
      temp.fetchData(1)
    }, 200);
  },

  onbranditemclick: function (e) {

    var temp = this
    var choosebrandtitle = e.currentTarget.id
    var tempid = e.target.dataset.alphabeta

    //获取二级的品牌

    temp.setData(
      {
        serialId: tempid,
        serial: choosebrandtitle,
      }
    )
    //获取数据
    setTimeout(function () {
      temp.getSecondBrand()
    }, 200);


  },

  //获取二级品牌
  getSecondBrand: function () {
    var temp = this;

    wx.request({
      url: SecondBrandUrl + temp.data.serialId,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        temp.shaixuan()
        temp.setData({
          resultmapSecond: res.data.sonCarSerials,
          showbrandsecond: true,

        })
      }
    })
  },

  //点击二级品牌
  onbranditemsecondclick: function (e) {
    var temp = this;
    var choosebrandtitle = e.currentTarget.id
    var tempid = e.target.dataset.alphabeta
    this.setData(
      {
        resultmapSecond: [],
        serial: choosebrandtitle,
        brand: choosebrandtitle,
        keyword: '',
        carType: tempid,
      }
    )
    this.datarefresh()
    //获取数据
    setTimeout(function () {
      temp.fetchData(1)
    }, 200);
  },


  //获取搜索框的内容
  input: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },

  //搜索
  search: function () {
    var temp = this;
    if (this.data.keyword == "") {
      wx.showToast({
        title: '请先输入内容',
        duration: 1000
      })
    } else {

      this.setData(
        {
          refresh: true,
          showorder: false,
          showprice: false,
          showage: false,
          showcity: false,
          showbrand: false,
          showlist: true,
        }
      )

      //获取数据
      setTimeout(function () {
        temp.fetchData(1)
      }, 200);
    }
  },



  //点击去搜索页进行搜索
  toSearch: function () {
    //跳转到搜索页面
    wx.navigateTo({
      url: '../search/search'
    })
  },

  //刷新数据显示与隐藏相关列表
  datarefresh: function () {
    this.setData({
      showorder: false,
      showprice: false,
      showage: false,
      showbrand: false,
      showcity: false,
      showcitysecond: false,
      showbrandsecond: false,
      refresh: true,
      showlist: true,
      currentpage:1,
      gg:false
    })
  },

  //点击相应筛选条件
  shaixuan: function () {
    this.setData(
      {
        showorder: false,
        showlist: false,
        hasMore: false,
        showage: false,
        showprice: false,
        showbrand: false,
        showbrandsecond: false,
        showcity: false,
        showother: false,
        showother3: false,
        showcitysecond: false
      }
    )
  },
  //给选中元素加样式
  select: function () {
    var all = "";

    function hasClass(obj, cls) {
      return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
    function addClass(obj, cls) {
      if (!this.hasClass(obj, cls)) obj.className += " " + cls;
    }
    function removeClass(obj, cls) {
      if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
      }
    }
  },

  //进入车辆详情页
  todetail: function (e) {
    var carid = e.currentTarget.id;
    wx.navigateTo({
      url: '../carDetail/carDetail?id=' + carid
    })
  },

  publishcar: function () {
    if(token){
      wx.navigateTo({
        url: '../publish/publish'
      })
    }else{
      wx.navigateTo({
        url: '../index/index'
      })
    }
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