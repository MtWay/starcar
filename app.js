//app.js
App({
  data: {
    a: 1
  },
  onLaunch: function () {
    var haost = this.globalData.haost;
    var that = this;
    var token = token = wx.getStorageSync("token") || "";;
    // 登录
    wx.login({
      success: res => {
     
        var code = res.code;
        wx.getSetting({
          success: res => {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                that.globalData.userInfo = res.userInfo;
                // 可以将 res 发送给后台解码出 unionId
                if (!token) 
                that.login(res.encryptedData, res.iv, code)

              }
            })
          }
        })
      }

    })
  },

  login: function (encryptedData, iv, code) {
    var haost = this.globalData.haost;
    wx.request({
      url: haost + "/wxapp/" + this.globalData.second + "/wxappauthorize.json",
      data: {
        code: code,
        encryptedData: encryptedData,
        iv: iv
      },
      success: function (res) {
        if (res.data.msg == "验证成功") {
          wx.setStorage({
            key: "token",
            data: res.data.token,
            success: function (res) {
              //由初始页进来
              wx.switchTab({
                url: '../carlist/carlist'
              })
            }
          })
        } else {
          wx.setStorage({
            key: "uuid",
            data: res.data.uuid,
            success: function (res) {
              // //由初始页进来
            // if (res.authSetting['scope.userInfo']) {
              // wx.navigateTo({
              //   url: '../login/login?mark=1'
              // })
            }
          })
        }
      }
      })
  },
  globalData: {
    userInfo: null,
    // haost: "http://m.2schome.net",//测试
    haost: "https://www.hx2car.com.cn",//生产
    token: wx.getStorageSync("token") || "",
    second: "diyizhan"
  }
})
