//index.js
//获取应用实例
var token = wx.getStorageSync("token");//小程序初始化时就会触发

Page({
  data: {
    token: token,
    hide:true
  },
 tologin :function(){
    wx.navigateTo({//不在tabbar的用这个跳转
      url: '../login/login?mark=1'
    })
 },
 tolist: function () {
   wx.switchTab({
     url: '../carlist/carlist'//在tabbar的用这个跳转
   })
 
 },
 onLoad: function(){
   var token = wx.getStorageSync("token");//小程序初始化时就会触发
   this.setData({
     token: token
   })
   var that = this;
   if(this.data.token){
       that.tolist()
   }else{
     this.setData({
       hide: false
     })
   }
 },
 stopPropation:function(){
   return false;
 }
})
