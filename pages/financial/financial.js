Page({

  /**
   * 页面的初始数据
   */
  data: {
    telePhone: '400-884-0101'
  },
call:function(){
  wx.makePhoneCall({
    phoneNumber: this.data.telePhone
  })
}
})