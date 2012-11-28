/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var Cookie = require('./cookie'),path=require('path'),HashMap=require('./HashMap').HashMap;
var WebForm = function (){
    this.reqType = "http";
	this.params = {};
	this.files = {};
	this.cookies = new HashMap();
	this.req = null;
    this.res = null;
	this.session = null;
	this.data = {};
	this.appContext = {};
	this.socketContext = null;
	this.retType = null;
	this.method = null;
	this.instance = this;
    this.error = null;
    this.msg = null;
    this.socket = null;
}
WebForm.prototype.setReq = function(request){this.req = request;};
WebForm.prototype.getReq = function(){return this.req;};
WebForm.prototype.setRes = function(response){this.res = response;};
WebForm.prototype.getRes = function(){return this.res;};
WebForm.prototype.setContext = function(context){this.appContext = context;};
WebForm.prototype.getContext = function(){return this.appContext;};
WebForm.prototype.setSocketContext = function(context){this.socketContext = context;};
WebForm.prototype.getSocketContext = function(){return this.socketContext;};
WebForm.prototype.setSocket = function(socket){this.socket = socket;};
WebForm.prototype.getSocket = function(){return this.socket;};
WebForm.prototype.addParam = function(key, value){this.params[key]=value;};
WebForm.prototype.getParams = function(){return this.params;};
WebForm.prototype.getParam = function(key){return this.params[key];};
WebForm.prototype.get = function(key){return this.params[key];};
WebForm.prototype.getCookies = function(){return this.cookies;};
WebForm.prototype.setCookies = function(cookie){this.cookies = cookie;};
WebForm.prototype.addCookie = function(key, value, path){
	if(key&&value){
		var _cookie = new Cookie({key:key, val:value}, path);
		this.cookies.put(key, _cookie);
	}
};
WebForm.prototype.delCookie = function(key){
    this.cookies.get(key).expires=0;
};
WebForm.prototype.addAllParam = function(obj){
	for(var key in obj){
		this.params[key] = obj[key];
	}
};
WebForm.prototype.setFiles = function(files){
	this.files = files;
};
WebForm.prototype.getFiles = function(){
	return this.files;
};
WebForm.prototype.getMethod = function(){return this.method;};
WebForm.prototype.setMethod = function(method){this.method = method;};
WebForm.prototype.getSession = function(){return this.session;};
WebForm.prototype.setSession = function(session){this.session = session;};
//当存在paramArr参数时，会根据该参数对obj进行赋值。如果没有paramArr参数，则对form.params和obj中同名的属性进行赋值，由于js属性没有限制，可随意创建，所以可能会造成属性值被覆盖
WebForm.prototype.fill = function(obj, paramArr){
    if(!obj){
        obj = {};
    }
    if(paramArr){
        for(var i=0;i<paramArr.length;i++){
            obj[paramArr[i]] = this.params[paramArr[i]];
        }
    }else{
        for(var _k in this.params){
            if(_k.indexOf('_')!=0 && _k.indexOf('function')==-1){
                if(obj[_k]){
                    obj[_k] = this.params[_k];
                }
            }
        }
    }
};

WebForm.prototype.setData = function(data){this.data = data;};
WebForm.prototype.getData = function(){
	if(this.session){
		this.data['session'] = this.session.getData();
	}
	this.data['params'] = this.params;
    this.data['msg'] = this.msg;
	return this.data;
};
WebForm.prototype.addData = function(key, value){this.data[key] = value;};
WebForm.prototype.setRetType = function(type){this.retType = type;};
WebForm.prototype.getRetType = function(){return this.retType;};
WebForm.prototype.getError = function(){return this.error};
WebForm.prototype.setError = function(error){this.error = error};
WebForm.prototype.getMsg = function(){return this.msg};
WebForm.prototype.setMsg = function(msg){this.msg = msg};
WebForm.prototype.getReqType = function(){return this.reqType};
WebForm.prototype.setReqType = function(reqType){this.reqType = reqType};

exports.WebForm = WebForm;
