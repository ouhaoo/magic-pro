
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
