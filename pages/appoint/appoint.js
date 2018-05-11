// const KEY = "5ZHBZ-MK7KV-XT7P2-UU22S-O6B52-IOFEP";
const KEY  = "YPVBZ-PMPLV-WPEPD-U7E3N-6VY5K-QQBXF";
// const haost = "https://www.hx2car.com.cn";
var app,haost;
var token = wx.getStorageSync("token");


// appoint.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    way:true,
    shop:"",
    shopModel:false,
    mapModel:false,
    date:"",
    msg:"提示信息",
    showmsg:false,
    address:"",
    phone:"",
    shops:[
      {
        value:"北京第一站就机动车经纪公司（花乡店）"
      },
      {
        value: "北京第一站酷车小镇店"
      },
    
    ],
    latitude: 0,
    longitude: 0,
    first:true,
    centerMark:true,
    //位置标记
    markers: [{
      iconPath: '../../images/addr.png',
      id: 0,
      latitude:0 ,
      longitude:0 ,
      width: 30,
      height: 30,

    }],
    controls: [{
      id: 1,
      iconPath: '../../images/location.png',
      position: {
        left:0,
        top: 0,
        width: 30,
        height: 30
      },
      clickable: true
    }]
  },
  //获取url参数
  geturlData: function (name) {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]  //最后一页是当前页
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options
    return options[name];
  },
  // 获取id

  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
    token = token || wx.getStorageSync("token");//更新token
    var id = this.geturlData("id");
    this.setData({
      id: id
    })
  },
    //改变预约方式
  changeWay:function(e){
  var way = false;
  if (e.currentTarget.dataset.way==1){
     way = true;
  }
    this.setData({
      way: way
    })
  },
  //展示门店列表
  showShopList:function(){
    this.setData({
      shopModel:true,
    })
  },
  //选择门店
  selectShop:function(e){
  var shop = this.data.shops[e.currentTarget.dataset.index].value
    this.setData({
      shopModel: false,
      shop:shop
    })                  
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  //获取输入的地址
  addressInput:function(e){
    var address = e.detail.value;
    this.setData({
      address: address
    })
  },
  //获取输入的手机号码
  phoneInput: function (e) {
    var phone = e.detail.value;
    this.setData({
      phone: phone
    })
  },
  submit:function(){
    // this.message("123456");
    var way = this.data.way;//预约方式true为门店预约
    var shop = this.data.shop;
    var address = this.data.address;
    var date = this.data.date;
    var phone = this.data.phone;
    var numb = /^1[3|4|5|7|8|9]\d{9}$/;

    if(this.data.mark){
      return false;
    }

    // 信息是否完整
    if(way){
      if (shop==""){
        this.message("请选择预约门店");
        return false;
      }
    }else{
      if (address == "") {
        this.message("请填写详细地址");
        return false;
      }
    }

    if (date == "") {
      this.message("请选择您的预约时间");
      return false;
    } 

    if (!numb.test(phone)) {

      this.message("请输入正确的手机号码");
      return false;
    } 
  var that = this;
  this.setData({mark:true})//限制连点
    wx.request({
      url: haost +'/wxapp/' + app.globalData.second + '/carlookbooking.json',
      data:{
        token: token,
        id:this.data.id,
        bookingType: Number(!way),
        bookingTime: date,
        visitAddr: (way ? shop : address),
        contactWay: phone
      },
      success:function(res){
        that.setData({ mark: false })//限制连点
        if (res.data.msg =="预约成功"){
          that.message("预约成功")
          setTimeout(function(){
            wx.navigateBack()//返回上一页
          },1000)
        }
      }
    })
  },

  //提示信息
  message:function(msg){
    this.setData({
      msg:msg,
      showmsg:true,
    });
  },
  msgAnimationend:function(){
    this.setData({
      showmsg: false,
    });
  },


  //通过地图获取用户地址
  showMap: function () {
    if (this.data.first){
      // 首次点击获取当前位置
      this.moveToLocation();
    }
    this.setData({
      mapModel: true,
      first:false
    })
    // clearInterval(this.timer);
    var that = this;
    // this.timer = setInterval(function () {
      // that.getCenterLocation()
    // }, 1000)
    
  },

  onReady: function (e) {
    this.timer = "";
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
    // this.moveToLocation();
    var that = this;

    wx.getSystemInfo({
      success:function(res){
        var controls = that.data.controls;
        controls[0].position.left = res.windowWidth - 40;
        controls[0].position.top = res.windowHeight-90;
        that.setData({
          controls: controls
        })
      }
    })
  },

  //获取地址信息
  setAdd:function (x,y){
    var that = this ;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/?location='+x+','+y+'&get_poi=1&key=' + KEY,
      success: function (data) {
        that.setData({
          address: data.data.result.address 
        })
      }
    })
  },

  //获取中心点位置
  getCenterLocation: function () {
    if (!this.data.centerMark){
      return false;
    }
    this.setData({
      centerMark:false
    })
    var that = this;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        that.setData({
          centerMark: true
        })
        that.setAdd(res.latitude, res.longitude);//获取地址信息
        that.translateMarker(res.latitude, res.longitude);//移动标记点
      }
    })
  },
  //获取当前位置
  moveToLocation: function () {
    var that = this;
    this.mapCtx.moveToLocation();

      this.getCenterLocation();
 
  },



  //移动标记点
  translateMarker: function (x,y) {
    this.mapCtx.translateMarker({
      markerId: 0,
      // autoRotate: true,
      duration: 200,//动画时长
      destination: {
        latitude:x ,
        longitude: y,
      },
      animationEnd() {
      }
    })
  },

  //点击控件回到当前位置
  controltap:function(e){
    this.moveToLocation()
  },
  subAdd:function(){
    clearInterval(this.timer);
    this.setData({
      mapModel: false,
    })
  }
})