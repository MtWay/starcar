
function wxAutoImageCal(e){
    //获取图片的原始长宽
    var originalWidth = e.detail.width;
    var originalHeight = e.detail.height;

    var windowWidth = 0,windowHeight = 0;
    var autoWidth = 0,autoHeight = 0;

    var results= {};
    wx.getSystemInfo({
      success: function(res) {
        //获取屏幕的宽和高
        windowWidth = res.windowWidth;
        windowHeight = res.windowHeight;
        //判断按照那种方式进行缩放
   
        if(originalWidth > windowWidth){//在图片width大于手机屏幕width时候
          autoWidth = windowWidth;
          autoHeight = (autoWidth*originalHeight)/originalWidth;
          results.imageWidth = autoWidth;
          results.imageheight = autoHeight;

               console.log("autoWidth:"+autoWidth+"autoHeight:"+autoHeight);
        }else{//否则展示原来的数据
          results.imageWidth = originalWidth;
          results.imageheight = originalHeight;
        }
      }
    })

    return results;

  }

module.exports = {
  wxAutoImageCal: wxAutoImageCal
}