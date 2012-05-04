/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var config = require('../config'),Cookie = require('./cookie');
var WebForm = function (appPath, controller, action){
	this.action = action;
	this.controller = controller;
	this.appPath = appPath;
	var _appName = appPath.replace('/app', '');
	if(_appName.charAt(0)=='/'){
		_appName = _appName.subString(1);
	}
	if(_appName.charAt(_appName.length-1)=='/'){
		_appName = _appName.subString(0, _appName.length-1);
	}
	this.appName = _appName.replace('/', '.');
	this.actionPath = null;
	this.url = null;
	var tempViewPath = this.appName.substring(0, this.appName.lastIndexOf("app"))+config.templatePath+"/"+this.controller+"/"+this.action+"."+config.templateSuffix[config.templateType];
	this.viewPath = tempViewPath;
	this.params = {};
	this.files = {};
	this.cookies = [];
	this.req = null;
	this.session = null;
	this.data = {};
	this.appContext = {};
	this.socketContext = null;
	this.retType = null;
	this.method = null;
	this.instance = this;
}
WebForm.prototype.getAppName = function(){return this.appName;};
WebForm.prototype.getAppPath = function(){return this.appPath;};
WebForm.prototype.getActionPath = function(){return this.actionPath;};
WebForm.prototype.setActionPath = function(path){this.actionPath = path;};
WebForm.prototype.getControllerName = function(){return this.controller;};
WebForm.prototype.getActionName = function(){return this.action;};
WebForm.prototype.setUrl = function(url){this.url = url;};
WebForm.prototype.getUrl = function(){return this.url;};
WebForm.prototype.setReq = function(request){this.req = request;};
WebForm.prototype.getReq = function(){return this.req;};
WebForm.prototype.setContext = function(context){this.appContext = context;};
WebForm.prototype.getContext = function(){return this.appContext;};
WebForm.prototype.setSocketContext = function(context){this.socketContext = context;};
WebForm.prototype.getSocketContext = function(){return this.socketContext;};
WebForm.prototype.getViewPath = function(){return this.viewPath;};
WebForm.prototype.addParam = function(key, value){this.params[key]=value;};
WebForm.prototype.getParams = function(){return this.params;};
WebForm.prototype.getParam = function(key){return this.params[key];};
WebForm.prototype.get = function(key){return this.params[key];};
WebForm.prototype.getCookies = function(){return this.cookies;};
WebForm.prototype.setCookies = function(cookie){this.cookies = cookie;};
WebForm.prototype.addCookie = function(key, value){
	if(key&&value){
		var _cookie = new Cookie(this.req, {key:key, val:value});
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
