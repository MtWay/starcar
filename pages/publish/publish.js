var haost = "https://www.hx2car.com.cn";
var app;
var token = wx.getStorageSync("token");


const BrandUrl = "https://www.hx2car.com.cn/mobile/getAllOneLevelSerial2.json";//品牌接口

//品牌二级的接口
const SecondBrandUrl = "https://www.hx2car.com.cn/mobile/getCarSerialByParentId2.json?parentId=";

//地区选择的接口
const CityUrl =
  "https://www.hx2car.com.cn/tools/getprovinces.json";

//地区选择的二级接口
const CitySceondUrl =
  "https://www.hx2car.com.cn/tools/getAreaByCityCode.json?province=";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    showcity: false,//显示省
    showcitysecond: false,//显示市
    condition: [//车况
      { value: '优秀', checked: true },
      { value: '良好' },
      { value: '正常' }, 
      { value: '一般' },
    ],
    sells: [//卖车方式
      { value: '直卖', checked: true },
      { value: '寄售' }, 
      { value: '租赁' },
    ],
    conditionSelect: 0,//初始选中车况
    sell: 0,//初始选中卖车方式
    msg: "提示信息",
    cityArr: [],//城市
    citySecondArr: [],
    city: "",
    areaCode: 0,
    mileage: 0,
    resultmap: [],//品牌
    phone: "",
    keymap: ["A", "B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"],
    brand: "",
    serial: "",
    carType:"",
    tag: false,
    date: "",
    imgurls: [],
    cw: 1200,//maxwidth
    ch: 900,//maxheight
    tempFilePaths: [],//等待上传的列表
    inupdate: false,//是否有图片正在上传
    imgNum:16,//最大上传数量
  },
  onLoad: function () {
    app = getApp();
    haost = app.globalData.haost;
    token = wx.getStorageSync("token");

  },

  //选择图片
  uodate: function () {
    if (this.data.imgNum<=0){
      this.message("最多上传16张图片")
      return false;
    }
    var that = this;
    var imgurls = this.data.imgurls;
    wx.chooseImage(
      {
        sizeType: ["compressed"],
        success: function (data) {
          var tempFilePaths = that.data.tempFilePaths
          tempFilePaths = tempFilePaths.concat(data.tempFilePaths);//加到等待队列
          that.setData({
            tempFilePaths: data.tempFilePaths,//选中图片的列表
          })
          //检查是否已有图片在上传
          if (!that.data.inupdate) {
            that.selectImage();
            that.setData({
              inupdate: true//开启上传状态
            })
          }
        }
      }
    )
  },

  //上传图片
  uploadFile: function (img) {
    var that = this;
    wx.uploadFile({
      url: "https://www.hx2car.com.cn/car/upload2.htm",
      filePath: img,
      name: "file",
      success: function (res) {
        var data = JSON.parse(res.data);
        var imgurls = that.data.imgurls;
        imgurls.push(data.relativePath);

        that.setData({
          imgurls: imgurls
        })
      },
    })

  },

  // 绘制图片到canvas上
  selectImage: function (index, fn) {
    var tempFilePaths = this.data.tempFilePaths;
    if (tempFilePaths.length == 0) {
      this.setData({
        inupdate: false,//关闭上传状态
      })
      return false;//中止递归
    }

    var that = this;
    const ctx = wx.createCanvasContext('myCanvas');
    var src = tempFilePaths[0];
    var num = this.data.imgNum;//剩余可上传图片数
    if(num<=0){
      this.setData({
        inupdate: false,//关闭上传状态
      })
      this.message("最多上传16张图片")
      return false;
    }
    //删除等待上传首个
    num--;
    tempFilePaths.shift();

    this.setData({
      tempFilePaths: tempFilePaths,//更新选中图片的列表
      imgNum:num
    })

    wx.getImageInfo({
      src: src,
      success: function (res) {
        var w = res.width;
        var h = res.height;
        var s = w / 1200 > h / 900 ? w / 1200 : h / 900;
        if (s < 1) {
          s = 1;
        }
        //保留原图比例,并限制最大尺寸
        // that.setData({
        //   cw: res.width / s,
        //   ch: res.height / s,
        // })
        ctx.drawImage(src, 0, 0, res.width / s, res.height / s)
        ctx.draw(false, function () {
          that.saveImage(res.width / s, res.height / s)
        })
      }
    })
  },

  //保存图片//为了压缩
  saveImage: function (w, h) {
    var that = this;
    const ctx = wx.createCanvasContext('myCanvas')
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: w,
      height: h,
      destWidth: w,
      destHeight: h,
      canvasId: 'myCanvas',
      quality: 0.9,//图片质量
      success: function (res) {
        that.selectImage();//开始压缩下一张
        that.uploadFile(res.tempFilePath)
      },
      complete: function (res) {
      }

    })
  },


  //点击地区
  cityonlick: function () {

    if (this.data.showcity || this.data.showcitysecond) {
      return;
    }

    if (this.data.cityArr.length > 0) {
      this.setData({
        showcity: true
      })
      return;
    }
    var temp = this;
    wx.request({
      url: CityUrl,
      // header: {
      //     'content-type': 'application/json'
      // },
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

  //点击全国
  cityallItemclick: function (e) {
    var temp = this;
    this.setData(
      {
        city: '全国',
        areaCode: 100000
      }
    )
  },


  //一级城市
  cityItemclick: function (e) {

    var temp = this;
    var citytitle = e.currentTarget.id
    var code = e.target.dataset.alphabeta
    if (citytitle == "北京市" || citytitle == "天津市" || citytitle == "上海市" || citytitle == "重庆市") {
      this.setData(
        {
          city: citytitle,
          areaCode: code,
          showcity: false
        }
      )

    } else {
      //获取二级的城市列表
      temp.setData(
        {
          city: citytitle,
          provincecode: code,
          provincetitle: citytitle
        }
      )
      //获取数据
      setTimeout(function () {
        temp.getSecondcity()
      }, 200);

    }

  },


  //二级城市
  citySecondItemclick: function (e) {

    var temp = this;
    var citytitle = e.currentTarget.id
    var code = e.target.dataset.alphabeta
    if (citytitle == "全省") {
      this.setData(
        {
          city: temp.data.provincetitle,
          areaCode: temp.data.provincecode,
          showcitysecond: false
        }
      )

    } else {
      this.setData(
        {
          city: temp.data.city + " " + citytitle,
          areaCode: code,
          showcitysecond: false
        }
      )

    }

  },

  //获取二级地区
  getSecondcity: function () {
    var temp = this;

    wx.request({
      url: CitySceondUrl + temp.data.provincecode,
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        temp.setData({
          citySecondArr: res.data.cityList,
          showcitysecond: true,
          showcity: false,
        })
      }
    })
  },

  //品牌点击
  brandonclick: function () {
    if (this.data.resultmap.length > 0) {
      this.setData({
        showbrand: true
      })
      return;
    }
    var temp = this;
    wx.request({
      url: BrandUrl,
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
        serial: "",
        brand: "品牌",
        keyword: '',
      }
    )

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
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        temp.setData({
          resultmapSecond: res.data.sonCarSerials,
          showbrandsecond: true,
          showbrand: false,

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
        carType: tempid,
        resultmapSecond: [],
        serial: choosebrandtitle,
        brand: temp.data.serial + " " + choosebrandtitle,
        keyword: '',
        showbrandsecond: false
      }
    )

  },

  //上牌切换
  changeTag: function () {
    this.setData({
      tag: !this.data.tag
    })
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  //点击展示大图
  showImg: function (e) {
    var src = e.currentTarget.dataset.src;
    var imgurls = this.data.imgurls;
    var urls = [];
    for (var i = 0; i < imgurls.length; i++) {
      urls.push("http://img.hx2cars.com/upload/" + imgurls[i])
    }
    wx.previewImage({
      current: src,
      urls: urls// 需要预览的图片http链接列表//在线链接
    })
  },
  //删除一张图片
  removeImg: function (e) {
    var index = e.currentTarget.id;
    var urls = this.data.imgurls;
    urls.splice(index, 1);
    var num = this.data.imgNum;
    num++;//剩余可上传+1
    this.setData({
      imgNum: num,
      imgurls: urls
    })

  },
  //车况选择
  radioChange: function (e) {
    this.setData({
      conditionSelect: e.detail.value
    })

  },

  //卖车方式选择
  radioChangeSell: function (e) {
    this.setData({
      sell: e.detail.value
    })


  },
  //保存input输入的
  saveIuput: function (e) {
    var key = e.currentTarget.dataset.key;//data-key
    this.data[key] = e.detail.value;//保存输入
  },


  // 提交按钮
  submit: function () {
    var data  = this.data; 
    var photos = JSON.stringify(data.imgurls);
    var city = data.city;
    var areaCode = data.areaCode;
    var carType = data.carType;
    var serialId = data.serialId;
    var date = data.date;//上牌日期
    var tag = data.tag;//是否未上牌
    var mileage = data.mileage;
    var condition = data.condition[data.conditionSelect].value;//车况
    var sell = data.sells[data.sell].value;//卖车方式
    var phone = data.phone;

    //防止连点
    if (data.mark) {
      return false;
    }

    //判断必填
    if (photos == "") {
      this.message("请上传车辆图片");
      return false;
    }

    if (city == "") {
      this.message("请选择车辆归属地");
      return false;
    }

    if (carType == "") {
      this.message("请选择车型");
      return false;
    }

    if (date == "" && !tag) {
      this.message("请选择上牌日期");
      return false;
    }
    if (tag) {
      date = "";
    }

    if (mileage == "") {
      this.message("请选择行驶里程");
      return false;
    }

    if (phone == "") {
      this.message("请输入联系方式");
      return false;
    }
    var that = this;
    this.setData({ mark: true })//限制连点
    wx.request({
      url: haost + '/wxapp/' + app.globalData.second + '/sellcar.json',
      data: {
        photos: photos,
        condition: condition,
        useYear: date.split("-")[0] || "",
        useMonth: date.split("-")[1] || "",
        areaCode: areaCode,
        areaName: city,
        resaleWay: sell,
        carType: carType,
        serial: serialId,
        contactWay: phone,
        token: token,
        mileage: mileage
      },
      success: function (res) {
        that.setData({ mark: false })//限制连点

        if (res.data.msg == "提交成功") {
          that.message("车辆发布成功");
          setTimeout(function () {
            wx.navigateBack()
          }, 1000)
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