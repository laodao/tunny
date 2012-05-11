/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var Cookie = require('./cookie'),path=require('path');
var WebForm = function (controller){
	this.params = {};
	this.files = {};
	this.cookies = [];
	this.req = null;
    this.res = null;
	this.session = null;
	this.data = {};
	this.appContext = {};
	this.socketContext = null;
	this.retType = null;
	this.method = null;
	this.instance = this;
}
WebForm.prototype.setReq = function(request){this.req = request;};
WebForm.prototype.getReq = function(){return this.req;};
WebForm.prototype.setRes = function(response){this.res = response;};
WebForm.prototype.getRes = function(){return this.res;};
WebForm.prototype.setContext = function(context){this.appContext = context;};
WebForm.prototype.getContext = function(){return this.appContext;};
WebForm.prototype.setSocketContext = function(context){this.socketContext = context;};
WebForm.prototype.getSocketContext = function(){return this.socketContext;};
WebForm.prototype.addParam = function(key, value){this.params[key]=value;};
WebForm.prototype.getParams = function(){return this.params;};
WebForm.prototype.getParam = function(key){return this.params[key];};
WebForm.prototype.get = function(key){return this.params[key];};
WebForm.prototype.getCookies = function(){return this.cookies;};
WebForm.prototype.setCookies = function(cookie){this.cookies = cookie;};
WebForm.prototype.addCookie = function(key, value, path){
	if(key&&value){
		var _cookie = new Cookie(this.req, {key:key, val:value}, path);
		this.cookies[this.cookies.length] = _cookie;
	}
};
WebForm.prototype.delCookie = function(key){
	for(var i=0;i<this.cookies.length;i++){
		if(this.cookies[i].key==key){
			this.cookies[i].expires=0;
			break;
		}
	}
}
WebForm.prototype.addAllParam = function(obj){
	for(var key in obj){
		this.params[key] = obj[key];
	}
};
WebForm.prototype.setFiles = function(files){
	this.files = files;
}
WebForm.prototype.getFiles = function(){
	return this.files;
}
WebForm.prototype.getMethod = function(){return this.method;}
WebForm.prototype.setMethod = function(method){this.method = method;}
WebForm.prototype.getSession = function(){return this.session;};
WebForm.prototype.setSession = function(session){this.session = session;};
WebForm.prototype.fill = function(obj){
	for(var _k in this.params){
		if(obj[_k]){
			obj[_k] = this.params[_k];
		}
	}
}
WebForm.prototype.setData = function(data){this.data = data;};
WebForm.prototype.getData = function(){
	if(this.session){
		this.data['session'] = this.session.getData();
	}
	this.data['params'] = this.params;
	return this.data;
};
WebForm.prototype.addData = function(key, value){this.data[key] = value;};
WebForm.prototype.setRetType = function(type){this.retType = type;};
WebForm.prototype.getRetType = function(){return this.retType;};
exports.WebForm = WebForm;
