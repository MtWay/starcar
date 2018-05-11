var haost = "https://www.hx2car.com.cn";
var app;
var token = wx.getStorageSync("token");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeUrl:haost+"/servlet/yzCode.jpg",//图片验证码
    msg: "提示信息",
    showmsg: false,
    phone:"",
    imgCode:"",
    msgCode:"",
    loding:false,//处在等待再次获取时间段，
    lodingNum:60,
    mark: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app = getApp();
    haost = app.globalData.haost;
    token = token || wx.getStorageSync("token");//更新token
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
//图片验证码切换
  changeCode:function(){
    var url = this.data.codeUrl.split("?")[0];
    this.setData({
      codeUrl:url+"?"+Math.random()
    })
  },
  //提示信息
  message: function (msg) {
    this.setData({
      msg: msg,
      showmsg: true,
    });
  },
  //动画结束后重置
  msgAnimationend: function () {
    this.setData({
      showmsg: false,
    });
  },
  //手机号输入
  phoneInput:function(e){
    var phone = e.detail.value;
    this.setData({
      phone: phone,
    })
  },

  //图片验证码输入
  imgInput: function (e) {
    var imgCode = e.detail.value;
    this.setData({
      imgCode: imgCode,
    })
  },

  //短信验证码输入
  codeInput: function (e) {
    var msgCode = e.detail.value;
    this.setData({
      msgCode: msgCode,
    })
  },
  //获取短信验证码
  getCode:function(){
    var that = this;
    if(this.data.mark){
      return false;
    }
    this.setData({
      mark:true,
    })

    setTimeout(function(){
      that.setData({
        mark: false,
      })
    },500)
    var numb = /^1[3|4|5|7|8|9]\d{9}$/;
    var phone = this.data.phone;
    // var imgCode = this.data.imgCode;
    if (!numb.test(phone)) {

      this.message("请输入正确的手机号码");
      return false;
    } 

    wx.request({
      url: haost +'/code/outcodephones.json',
      data:{
        Number:phone,
      },
      success:function(res){
        if (res.data.message=="短信发送成功"){
          that.message("短信发送成功");
          that.setData({
            loding: true,
            lodingNum: 60
          })
          var timer = setInterval(function(){
            var num = that.data.lodingNum;
            num--;
            that.setData({
              lodingNum:num
            })
            if(num<=0){
              clearInterval(timer);
              that.setData({
                loding:false
              })
            }
          },1000)
        }
        //获取验证码成功
      }
    })
  },

//登录
  submit:function(){
    var numb = /^1[3|4|5|7|8|9]\d{9}$/;
    var phone = this.data.phone;
    var msgCode = this.data.msgCode;
    var that = this;
    if (!numb.test(phone)) {
      this.message("请输入正确的手机号码");
      return false;
    } 
    if (msgCode.length ==0) {
      this.message("请输入正确的验证码");
      return false;
    }
    var uuid = wx.getStorageSync("uuid") || "";
    
    wx.request({
      url: haost+'/wxapp/' + app.globalData.second + '/wxsmslogin.json',
      data:{
        // flag:"bindwechat",
        phone: phone,
        code: msgCode,
        flag:uuid
      },
      success:function(res){
        if(res.data.msg=="验证成功"){
          wx.setStorage({
            key: "token",
            data: res.data.token,
            success:function(res){
              var mark = that.geturlData("mark");
              if(mark){
                //由初始页进来
                wx.switchTab({
                  url: '../carlist/carlist'
                })
              }else{
                wx.navigateBack()
              }
            }
          })
          //存放手机号
          wx.setStorage({
            key: "mobile",
            data: phone,
            success: function (res) {
            }
          })
        }else{
          that.message(res.data.msg);
        }
      }
    })

  },
  //获取url参数
  geturlData: function (name) {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]  //最后一页是当前页
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options
    return options[name];
  },
})