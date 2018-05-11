// pages/login/login.js
var app,haost;
var token = wx.getStorageSync("token");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:""
  },
  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
    token = token || wx.getStorageSync("token");//更新token

  },
  getText:function(e){
    var txt = e.detail.value;
    this.setData({
      text:txt
    })  
  },
  submit:function(){
    var txt = this.data.text;
    var that = this;
    wx.request({
      url: haost+'/wxapp/' + app.globalData.second + '/commitfeedback.json',
      data:{
        flag:txt,
        token: token
      },
      success:function(res){
        if(res.data.msg=="提交成功"){
        //反馈成功
          that.message("提交成功");
          setTimeout(function(){
            wx.navigateBack()
          },2000)
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