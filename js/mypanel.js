// 区服列表
let zoneList = []

// 获取随机字符串
const getXMReqId = number => {
  let str = '';
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for (let i = 0; i < number; i ++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

// 页面刚一进入时
document.addEventListener('DOMContentLoaded', function() {
  $('.content-opt').hide()
  $('.content-info-refer').click(handleRefer)
  $('.content-info-start').click(handleGet)
  // 拉取区服id配置
  httpRequest(function(status, respText, isSuccess) {
    if (isSuccess) {
      const {
        code,
        data: { list }
      } = JSON.parse(respText)
      zoneList = list
    }		
  }, 'GET', `https://api-wanbaolou.xoyo.com/api/platform/setting/gateways`);
  handleRefer();
});

const handleRefer = () => {
  httpRequest(function(status, respText, isSuccess) {
    if (isSuccess) {
      console.log(JSON.parse(respText).length, chrome.runtime.id)
      if (JSON.parse(respText).includes(chrome.runtime.id)) {
        // 有权限
        $('.content-other').hide()
        $('.content-opt').show()
        getMyFollowList()
      } else {
        // 无权限
        $('.content-other').show()
        $('.content-opt').hide()
        $('.content-loading').hide()
      }
    }
  }, 'GET', `https://private-b07546-ouhaoo.apiary-mock.com/user`);
}

const getMyFollowList = () => {
  httpRequest(function(status, respText) {
    if (!respText) return
    const {
      code,
      data: { list }
    } = JSON.parse(respText)
    if (code === 1) {
      // 登陆了
      $('.content-loading').hide()
    }	else {
      // 没登陆
      $('.content-loading').show()
    }	
  }, 'GET', `https://api-wanbaolou.xoyo.com/api/passport/follow/list?req_id=${getXMReqId(32)}&page=1&size=10`);
}

// 倒计时/s -> 结束时间
const getEndTime = (remaining) => {
  const timestamp = new Date().getTime() + remaining * 1000
  const nowTime = new Date(timestamp)
  var year = nowTime.getFullYear()
  var month = nowTime.getMonth() + 1
  var date = nowTime.getDate()
  var hour = nowTime.getHours()
  var minute = nowTime.getMinutes()
  var second = nowTime.getSeconds()
  const changeDouble = number => number < 10 ? '0' + number : number
  return `${changeDouble(year)}-${changeDouble(month)}-${changeDouble(date)} ${changeDouble(hour)}:${changeDouble(minute)}:${changeDouble(second)}`
}

// 展示详情(state-3:公示中;5:在售中)
let havedChick = false // 是否已经点击
let errorMsg = '' // 错误信息
let times = 0; // 下单次数
let logMsg = ''; // 日志

// 清楚空格换行
function CTim (str) { 
  return str.replace(/\s/g,''); 
}

// 创建订单
const creatOrder = (order) => {
  var initTimerCreate = setInterval(() => {
    const XMYzm = CTim($('.yzm')[0].value) // 添加验证码ID
    const XMYzmArr = XMYzm.split('|').filter(_ => _) // 验证码数组
    if (XMYzmArr.length <= times + 1) clearInterval(initTimerCreate)
    const XMOrder = {
      ...order,
      geetest_challenge: XMYzmArr[times].split('-')[0],
      geetest_seccode: `${XMYzmArr[times].split('-')[1]}|jordan`,
      geetest_validate: XMYzmArr[times].split('-')[1],
    }
    httpRequest(function(status, respText, isSuccess) {
      if (isSuccess) {
        const {
          code,
          data,
          msg
        } = JSON.parse(respText)
        var XMOrderId = data.order_id;
        var XMMsg = msg;
        console.log(XMMsg, 'orderId: ', XMOrderId);
        if (XMOrderId) {
          httpRequest(function(status, respText, isSuccess) {
            if (isSuccess) {
              clearInterval(initTimerCreate);
              const {
                code,
                data,
              } = JSON.parse(respText)
              var ZFBIMG = data.pay_attach;
              var XMIfr = document.createElement('iframe');
              XMIfr.width = 110;
              XMIfr.height = 110;
              XMIfr.scrolling = 'no';
              XMIfr.src = ZFBIMG;
              $('.zfb').html(XMIfr)
            }		
          }, 'GET', `https://api-wanbaolou.xoyo.com/api/buyer/order/pay?req_id=${getXMReqId(32)}&order_id=${XMOrderId}&pay_way_code=alipay_qr&order_type=2`);
        }
        logMsg = logMsg + XMMsg
        $('.error').html(logMsg)
      }	
    }, 'POST', `https://api-wanbaolou.xoyo.com/api/buyer/order/create`, JSON.stringify(XMOrder));
    times++;
  }, 300);
}

// 请求详情接口
function detailInfo (XMServiceFee, cb) {
  const XMId = $('.content-id')[0].value
  httpRequest(function(status, respText, isSuccess) {
    if (isSuccess) {
      const {
        code,
        data,
      } = JSON.parse(respText)
      var XMRemainingTime = data.remaining_time; // 剩余秒数
      var XMPrice = data.single_unit_price; // 号价
      var XMZoneId = data.zone_id;
      var XMServerId = data.server_id;
      var XMStatus = data.state; // 状态
      var XMOrder = {
        req_id: getXMReqId(32),
        buy_type: 0,
        total_price: XMPrice + +XMServiceFee,
        total_quantity: 1,
        total_unit_count: 1,
        order_type: 2,
        service_fee_info: {
          separation_service_fee: +XMServiceFee,
          transfer_service_fee: 0,
        },
        consignee_info: {
          zone_id: XMZoneId,
          server_id: XMServerId,
        },
        list: [
          {
            count: 1,
            id: XMId,
          }
        ],
      };
      var remainingTimer
      if (XMRemainingTime > 6) {
        let remaining = XMRemainingTime
        var remainingTimer = setInterval(() => {
          $('.time').html(`<b>￥${+XMPrice/100 + +XMServiceFee/100}-${remaining}s</b>`)
          remaining--
          if (remaining < 12) {
            clearInterval(remainingTimer);
            $('.time').html(`<b>￥${+XMPrice/100 + +XMServiceFee/100}-魔法书准备抢号！</b>`)
          }
        }, 1000)
      } else {
        $('.time').html(`<b>￥${+XMPrice/100 + +XMServiceFee/100}-${XMRemainingTime}s</b>`)
      }
      cb(XMOrder, XMStatus, XMRemainingTime)
    }
  }, 'GET', `https://api-wanbaolou.xoyo.com/api/buyer/goods/detail?req_id=${getXMReqId(32)}&consignment_id=${XMId}&goods_type=2`);
}

// 抢号ing
function handleGet () {
  if (havedChick) return // 二次点击无效
  const XMServiceFee = [
    $('.free')[0],
    $('.free')[1]
  ].map(item => item.checked ? item.value : '').filter(_ => _)[0]
  const XMSpe = [
    $('.spe')[0],
    $('.spe')[1],
    $('.spe')[2],
    $('.spe')[3],
    $('.spe')[4]
  ].map(item => item.checked ? item.value : '').filter(_ => _)[0]

  havedChick = true // 二次点击
  // 第一步：获取倒计时 剩余8秒时反复请求detail接口
  // 第二步：判断剩余1s时 请求接口（设置一个网速延迟）
  detailInfo(XMServiceFee, (XMOrder, XMStatus, XMRemainingTime) => {
    if (XMStatus !== 3) { // 非公示期直接弹二维码
      creatOrder(XMOrder)
      return
    }
    if (XMRemainingTime > 6) {
      setTimeout(() => {
        var initTimer = setInterval(() => {
          detailInfo(XMServiceFee, (XMOrder, XMStatus, XMRemainingTime) => {
            if ((XMStatus === 3 && XMRemainingTime < 2) || (XMStatus !== 3)) {
              clearInterval(initTimer);
              setTimeout(() => {
                creatOrder(XMOrder)
              }, XMSpe)
            }
          })
        }, 100);
      }, (XMRemainingTime - 6) * 1000)
    } else {
      var initTimer = setInterval(() => {
        detailInfo(XMServiceFee, (XMOrder, XMStatus, XMRemainingTime) => {
          if ((XMStatus === 3 && XMRemainingTime < 2) || (XMStatus !== 3)) {
            clearInterval(initTimer);
            setTimeout(() => {
              creatOrder(XMOrder)
            }, XMSpe)
          }
        })
      }, 100);
    }
  })
}
