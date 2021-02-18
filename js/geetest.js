/*
 * http异步请求封装
 * @param callback 回调函数
 * @param type 请求类型  GET、POST
 * @param url 请求地址
 */
function httpRequest(callback, type, url, form = null) {
	var xhr = new XMLHttpRequest();
	xhr.open(type, url, true);
	xhr.setRequestHeader("Content-Type","application/json");
	xhr.onreadystatechange = function() {
		callback(xhr.status, xhr.responseText, (xhr.readyState == 4 && xhr.status == 200));
	}
	xhr.send(form);
}

var handlerEmbed = function (captchaObj) {
	var app=document.getElementById("app");
	captchaObj.appendTo("#embed-captcha");
	captchaObj.onReady(function () {
			var embed = document.createElement("div")
			embed.setAttribute("id", "embed-captcha");
			app.parentElement.insertBefore(embed, app);
			var script = document.createElement('script');
			script.src = '../static/slide.7.7.1.js';
			document.getElementsByTagName('head')[0].appendChild(script);
	});
	captchaObj.onSuccess(function () {
			var result = captchaObj.getValidate();
			// console.log(result);
			var p1 = document.createElement("p");
			p1.setAttribute("style", "color: #fff;text-align: center;padding: 8px;");
			p1.innerHTML = `|${result.geetest_challenge}-${result.geetest_validate}|`
			app.parentElement.insertBefore(p1, app);
			// loadG();
	});
	captchaObj.onError(function (error) {
		// console.log(error);
		// loadG();
	});
};
function loadG(){
	httpRequest(function (status, data) {
		const result = data && JSON.parse(data).data.config
		initGeetest({
				gt: result.gt,
				challenge: result.challenge,
				product: "float",
				offline: !result.success,
				new_captcha: result.new_captcha,
				width: "300px",
		}, handlerEmbed)
	}, "GET", "https://api-wanbaolou.xoyo.com/api/platform/captcha/pre_auth?t=" + (new Date()).getTime());
}
loadG();













