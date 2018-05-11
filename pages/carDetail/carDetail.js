var haost = "https://www.hx2car.com.cn";
var app;
var  token = wx.getStorageSync("token");
// var token = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token:token,
    imgUrls: [],
    indicatorDots: true,//是否显示面板指示点
    autoplay: true,//自动播放
    interval: 5000,
    duration: 500,
    phone: 0,
    imgCode: "",
    code: "",
    chujia:"",
    imgCodeSrc: "http://m.hx2car.com/servlet/yzCode.jpg",
    phoneError: false,//手机号码输错
    imgError: false,
    codeError: false,
    chujiaError:false,
    chujiaFocus:false,
    showbg: false,
    saleModel: false,
    chujiaModel:false,
    isCollect:false,
    detailModelShow:false,
    message: [
    ],
    telePhone: '400-884-0101'
  },
  /**
* 生命周期函数--监听页面加载
*/
  onLoad: function (options) {
    token = token || wx.getStorageSync("token");//更新token
    app=getApp();
    haost = app.globalData.haost;
    var id = this.geturlData("id") ;
    this.setData({
      id: id,
      token:token
    })
    var that = this;
    wx.request({

      url:haost+'/wxapp/' + app.globalData.second + '/cardetailjson.json',//
      data: {
        id: id,
        token: token
      },
      success: function (res) {
        var data = res.data.carInfo;
        // var price = data.price+"万" || "面议";
        var shoufu = (data.price * 0.3).toFixed(2);
        var yuefu = (data.price * 0.7/24).toFixed(2);
        var standards = ['国一', '国二', '国三', '国三 + ODB', '国四', '国五'];
        var autos=['自动', '手动' ,'手自一体'];
        var colors= ["黑色", "红色", "蓝色", "白色", "绿色", "黄色", "银灰", "灰色", "橙色", "其他", "香槟"];
        var transfers=["未知","能","不能"];
        var imgUrls =[];
        if (data.photos){
          imgUrls = JSON.parse(data.photos)
        }
        //修改页面标题
        wx.setNavigationBarTitle({
          title: data.title || "车辆详情",
        })  
        that.setData({
          isCollect: (res.data.collectState>0),
          price: data.price,
          carData: data,
          imgUrls: imgUrls,
          shoufu: shoufu,
          yuefu: yuefu,
          message: [
            {
              value: data.useDate,
              hint: "上牌时间"
            }, {
              value: (data.journey || 0)+"万公里 ",
              hint: "表显里程"
            }, {
              value: standards[data.standard],
              hint: "排放标准"
            }, {
              value: autos[data.auto],
              hint: "变速箱"
            }, {
              value: data.pailiang,
              hint: "涡轮增压"
            }, {
              value: data.areaName || "全国",
              hint: "车辆所在地"
            }
          ],
          details: [   
            {
              key:"上牌时间",
              value: data.useDate,
            },
            {
              key: "车牌所在地",
              value: data.areaName,
            },
            {
              key: "里程",
              value: data.journey+"万公里",
            },
            {
              key: " 颜色（外 / 内）",
              value: colors[data.bodyColor] + "/" + (data.innerColor || "未知"),
            },
            {
              key: "排放标准",
              value: standards[ data.standard],
            },
            {
              key: "涡轮增压",
              value: data.pailiang ? data.pailiang+"T":"未知",
            },
            {
              key: "变速箱",
              value: data.auto,
            },
            {
              key: "保险到期",
              value: data.insuranceDeadline,
            },
            {
              key: "年审到期",
              value: data.inspectionDeadline,
            },
            {
              key: "过户",
              value: transfers[data.transfer],
            },
          ]
        })
      }
    })
  },

  // 去金融服务
  tofinancial: function () {
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 8,
        id: this.data.id,
        token: token,
      }, success: function (res) {
      }
    })
    wx.navigateTo({
      url: "../financial/financial"
    })
  },
  //展示详情
  showDetail:function(){
    this.setData({
      detailModelShow:true,
    })
  },

  //隐藏详情
  hideDetail: function () {
    this.setData({
      detailModelShow: false,
    })
  },
  //点击展示大图
  showImg: function (e) {
    var src = e.currentTarget.dataset.src;//最初展示
    var imgUrls = this.data.imgUrls //datali存的
    var urls = [];
    //转为线上地址
    for(var i =0;i<imgUrls.length;i++ ){
      urls.push('http://img.hx2cars.com/upload' + imgUrls[i]);
    }
    wx.previewImage({
      current: 'http://img.hx2cars.com/upload' +src,
      urls: urls  // 需要预览的图片http链接列表//在线链接
    })
  }, 
  //降价弹框
  showSaleModel: function () {
    if(token){
      this.requireFn()
      return false;
    }

    this.reset();
    this.setData({
      showbg: true,
      saleModel: true,
    })
    var that = this;

    setTimeout(function () {
      that.setData({
        saleFocus: true,
      })
    }, 500)
  },
  hideModel: function () {
    this.setData({
      showbg: false,
      saleModel: false,
      chujiaModel: false,
      chujiaFocus: false,
      saleFocus: true,
    })
  },
  //出价弹框
  showChujiaModel: function () {
    if (this.data.isrequireCj) {
      this.message("出价提交成功");//防止连点
      return false;
    }
    this.reset();
    this.setData({
      showbg: true,
      chujiaModel: true,
    })
    var that = this;
    
    setTimeout(function(){
      that.setData({
        chujiaFocus: true,
      })
    },500)

  },
  changeCode: function () {
    this.setData({
      imgCodeSrc: "http://m.hx2car.com/servlet/yzCode.jpg?" + Math.random()
    })
  },
  testPhnoe: function (e) {
    var phone = e.detail.value;
    this.setData({
      phoneError:false,
      phone: phone
    })
  },
  testImageCode: function (e) {
    var imgCode = e.detail.value;
    this.setData({
      imgCode: imgCode,
      imgError: false
    })
  },

  //获取验证码
  getCode: function () {
    var phone = this.data.phone;
    var numb = /^1[3|4|5|7|8|9]\d{9}$/;
    var that = this;
    if (!numb.test(phone)) {
      //手机号码错误
      this.setData({
        phoneError: true
      })
      return false;
    }

    wx.request({
      url: haost + '/code/outcodephones.json',
      data: {
        Number: phone,
      },
      success: function (res) {
        if (res.data.message!='短信发送成功'){
          that.changeCode()
        }else{
          that.message("短信发送成功");
        }
      }
    })
  },

  testCode: function (e) {
    var code = e.detail.value;
    this.setData({
      code: code,
      codeError: false

    })
  },

  //获取出价
  testChujia:function(e){
    var chujia = e.detail.value;
    this.setData({
      chujia:chujia,
      chujiaError: false
      
    })
  },

  //提交降价通知
  saleSub: function () {
    var that = this;
    this.login(that.requireFn)
  },
  //提交出价
  chujiaSub: function () {
    var that = this;

    //判断是否已登录
    if(token){
      this.requireCj();
    }else{
      this.login(function () {
        that.requireCj();
      });
    }


  },

//降价通知接口
  requireFn:function(){
    if (this.data.isrequire){
      this.message("降价通知设置成功");
      return false;//防止连点
    }

    var that = this ;
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 5,
        id: this.data.id,
        expectPrice: this.data.price,
        token: token,
      },success:function(res){
      if(res.data.msg=="提交成功"){
        that.message("降价通知设置成功");
        that.setData({
          isrequire:true,
          showbg: false,
          saleModel: false,
        })
      }
    }
    })
  },

  //出价接口
  requireCj: function () {
    var that = this;
    var chujia = this.data.chujia;
    if (chujia == "") {
      this.setData({
        chujiaError: true
      })
      return false;
    }
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 9,
        id: this.data.id,
        bidPrice: chujia,
        token:token 
      }, success: function (res) {
        if (res.data.msg == "提交成功") {
          that.message("出价提交成功");
          that.setData({
            isrequireCj:true,
            showbg: false,
            chujiaModel: false,
          })
        }
      }
    })
  },



  //登陆接口
 login:function(fn){
   var phone = this.data.phone;
   var numb = /^1[3|4|5|7|8|9]\d{9}$/;
   var code = this.data.code;
   var that = this;
   if (!numb.test(phone)) {
     //手机号码错误
     this.setData({
       phoneError: true
     })
     return false;
   }
   if (code == "") {
     this.setData({
       codeError: true
     })
     return false;
   }
   var uuid = wx.getStorageSync("uuid") || "";

   wx.request({
     url: haost + '/wxapp/' + app.globalData.second + '/wxsmslogin.json',
     data: {
       flag: uuid ,
       phone: phone,
       code: code
     },
     success: function (res) {
       if (res.data.msg === '验证成功') {
         token = res.data.token;
          that.setData({
            token:token
          })

         //登陆成功后存放token
           wx.setStorage({
             key: "token",
             data: res.data.token,
             success: function (res) {
             }
           })
         fn();
       }
     }
   })
 },

  //清空弹框数据
  reset:function(){
    this.setData({
      code: "",
      imgCode:"",
      phone:"",
      phoneError:false,
      chujiaError:false,
      chujia:""
    })
  },
  //预约看车
  toappiont:function(){
    if(token){
      wx.navigateTo({
        url: '../appoint/appoint?id=' + this.data.id
      })
    }else{
      wx.navigateTo({
        url: '../index/index'
      })
    }

  },

//车况咨询
  consult:function(){
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 6,
        id: this.data.id,
        token: token
      }, success: function (res) {
        if (res.data.msg == "提交成功") {
          //成功

        }
      }
    })
    this.callphone();
  },


  //电话咨询
  consultTel: function () {
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 7,
        id: this.data.id,
        token: token
      }, success: function (res) {
        if (res.data.msg == "提交成功") {
          //成功

        }
      }
    })
    this.callphone();
  },


  onReady: function () {

  },
  //打电话
  callphone: function () {
    var temp = this
    wx.makePhoneCall({
      phoneNumber: temp.data.telePhone
    })
  },

  //改变收藏状态
  changeCollect:function(){
    //如果未登录就去登录
    if (!token) {
      wx.navigateTo({
        url: '../index/index'
      })
      return false
    }
    var  collect = this.data.isCollect;
    this.setData({
      isCollect: !collect
    })
    if (collect){
      this.collectcancel();
    }else{
      this.addCollect()
    }
  },

  //收藏接口
  addCollect:function(){
    var that = this;

    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/require.json',
      data: {
        requireType: 4,
        id: this.data.id,
        token: token,
      }, success: function (res) {
        if (res.data.msg == "提交成功") {
          that.message("已成功收藏")

        }
      }
    })
  },

//取消收藏
  collectcancel:function(){
    var that = this;
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/collectcancel.json',
      data: {
        token: token,
        id: this.data.id,
      }, success: function (res) {
        if (res.data.msg == "取消成功") {
          that.message("已取消收藏")
        }
      }
    })
  },
  
  //获取url参数
  geturlData:function(name){
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]  //最后一页是当前页
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options
    return options[name];
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