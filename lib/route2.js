/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var parseURL = require('url').parse,
	path = require("path"),
    EventEmitter = require('events').EventEmitter,
	config = require('../config'),
	WebForm = require('./webform').WebForm;

var Route = function(){
    this.req=null;
    this.url=null;
    this.method=null;
    EventEmitter.call(this);
};

Route.prototype.process = function(req){
    var instance = this;
    this.req = req;
    this.url = req.url;
    this.method = req.method ? req.method.toLowerCase() : 'get';
    var paramStr = null;
    var urlObj = parseURL(this.url, true);
    // 如果url为：/user/add?id=1 ,则pathname为：/user/add
    var pathname = urlObj.pathname;
    var query = urlObj.query;
    if(pathname.charAt(0)=="/"){
        paramStr = pathname.substring(1);
    }else{
        paramStr = pathname;
    }
    if(paramStr.charAt(paramStr.length-1)=="/"){
        paramStr = paramStr.substring(0,paramStr.length-1);
    }
    var suffix = path.extname(pathname).toLowerCase();
    var params = paramStr.split("/");
    //var actionParam;
    //var subApp = params[0];
    var appPath = "";
    var controllerPath = "";
    var controllerName = "";
    var actionName = "";
    var form = null;
    if('.html' == suffix || '.htm' == suffix){//解析html文件的地址，/xx/yy/cc/index.html的文件路径应该是：/app/xx/app/yy/app/cc/index.html
        var fullPath = "";
        for(var i=0;i<params.length;i++){
            (function(i){
                var _param = params[i];
                if(_param.indexOf(suffix)>-1){//如果有后缀，则去掉后缀
                    _param = _param.replace(suffix, '');
                }
                var tempAppPath = path.join(appPath, "app", _param);
                fullPath = path.join(config.baseDir, tempAppPath);
                path.exists(fullPath, function(exists){
                    if(!exists){//由于去掉了后缀，所以没找到的时候就去寻找文件名为path+后缀的文件，否则就视为找到一个目录
                        fullPath = path.join(config.baseDir, appPath, "html", _param+suffix);
                        (function(i){
                            path.exists(fullPath, function(_exsits){
                                if(_exsits){
                                    form = new WebForm(path.join(appPath, "app"), null, null);
                                    form.setUrl(instance.url);
                                    form.setActionPath(fullPath);
                                    this.emit("staticReq", form);
                                }else{
                                    console.log("没有找到html文件：/"+tempAppPath);
                                    this.emit("error", 404);
                                }
                            });
                        })(i);
                    }else{
                        appPath = tempAppPath;
                    }
                });
            })(i);
        }
    }else{
        for(var i=0;i<params.length;i++){
            (function(i){
                var tempAppPath = path.join(appPath, "app", params[i]);
                var fullPath = path.join(config.baseDir, tempAppPath);
                path.exists(fullPath, function(exists){//动态请求没有后缀，没找到的时候就去寻找文件名为path+.js的文件，否则就视为找到一个目录
                    if(!exists){
                        fullPath = fullPath+".js";
                        (function(i){
                            path.exists(fullPath, function(_exists){
                                if(_exists){
                                    controllerPath = tempAppPath;
                                    controllerName = params[i];
                                    if(params[i+1]){
                                        actionName = params[i+1];
                                    }else{
                                        if(instance.method){
                                            actionName = instance.method;
                                        }else{
                                            actionName = "index";
                                        }
                                    }
                                    form = new WebForm(path.join(appPath, "app"), controllerName, actionName);
                                    form.setUrl(instance.url);
                                    if(params.length=i+3){
                                        form.addParam("key", params[i+2]);
                                    }
                                    if(query){
                                        form.addAllParam(query);
                                        if(query['_dataType']){
                                            form.setRetType(query['_dataType']);
                                        }
                                    }
                                    form.setActionPath(fullPath);
                                    //form.setReq(req);
                                    this.emit("dynamicReq", form);
                                }else{
                                    console.log("没有找到：/"+tempAppPath);
                                    this.emit("error", 404);
                                }
                            });
                        })(i);
                    }else{
                        appPath = tempAppPath;
                    }
                });
            } )(i);
        }
    }
    console.log("没找到：/"+appPath);
    this.emit("error", 404);
};

exports.getWebForm = function(url, method){
	//var url = req.url;
    //var method = req.method ? req.method.toLowerCase() : 'get';
    var paramStr = null;
    var urlObj = parseURL(url, true);
    // 如果url为：/user/add?id=1 ,则pathname为：/user/add
    var pathname = urlObj.pathname;
    var query = urlObj.query;
    if(pathname.charAt(0)=="/"){
    	paramStr = pathname.substring(1);
    }else{
    	paramStr = pathname;
    }
    if(paramStr.charAt(paramStr.length-1)=="/"){
    	paramStr = paramStr.substring(0,paramStr.length-1);
    }
    var suffix = path.extname(pathname).toLowerCase();
    var params = paramStr.split("/");
    //var actionParam;
    //var subApp = params[0];
    var appPath = "";
    var controllerPath = "";
    var controllerName = "";
    var actionName = "";
    var form = null;
    if('.html' == suffix || '.htm' == suffix){//解析html文件的地址，/xx/yy/cc/index.html的文件路径应该是：/app/xx/app/yy/app/cc/index.html
    	for(var i=0;i<params.length;i++){
            (function(i){
                var _param = params[i];
                if(_param.indexOf(suffix)>-1){//如果有后缀，则去掉后缀
                    _param = _param.replace(suffix, '');
                }
                var tempAppPath = path.join(appPath, "app", _param);
                var fullPath = path.join(config.baseDir, tempAppPath);
                path.exists(fullPath, function(exists){
                    if(!exists){//由于去掉了后缀，所以没找到的时候就去寻找文件名为path+后缀的文件，否则就视为找到一个目录
                        fullPath = path.join(config.baseDir, appPath, "html", _param+suffix);
                        (function(i){
                            path.exists(fullPath, function(_exsits){
                                if(_exsits){
                                    form = new WebForm(path.join(appPath, "app"), null, null);
                                    form.setUrl(url);
                                    form.setActionPath(fullPath);
                                    return form;
                                }else{
                                    console.log("没有找到html文件：/"+tempAppPath);
                                    return null;
                                }
                            });
                        })(i);
                    }else{
                        appPath = tempAppPath;
                    }
                });
            })(i);
	    }
    }else{
	    for(var i=0;i<params.length;i++){
            (function(i){
                var tempAppPath = path.join(appPath, "app", params[i]);
                var fullPath = path.join(config.baseDir, tempAppPath);
                path.exists(fullPath, function(exists){//动态请求没有后缀，没找到的时候就去寻找文件名为path+.js的文件，否则就视为找到一个目录
                    if(!exists){
                        fullPath = fullPath+".js";
                        (function(i){
                            path.exists(fullPath, function(_exists){
                                if(_exists){
                                    controllerPath = tempAppPath;
                                    controllerName = params[i];
                                    if(params[i+1]){
                                        actionName = params[i+1];
                                    }else{
                                        if(method){
                                            actionName = method;
                                        }else{
                                            actionName = "index";
                                        }
                                    }
                                    form = new WebForm(path.join(appPath, "app"), controllerName, actionName);
                                    form.setUrl(url);
                                    if(params.length=i+3){
                                        form.addParam("key", params[i+2]);
                                    }
                                    if(query){
                                        form.addAllParam(query);
                                        if(query['_dataType']){
                                            form.setRetType(query['_dataType']);
                                        }
                                    }
                                    form.setActionPath(fullPath);
                                    //form.setReq(req);
                                    return form;
                                }else{
                                    console.log("没有找到：/"+tempAppPath);
                                    return null;
                                }
                            });
                        })(i);
                    }else{
                        appPath = tempAppPath;
                    }
                });
            } )(i);
        }
    }
    console.log("没找到：/"+appPath);
	return null;
};

exports.getModel = function (pkgPath) {
    var packages = pkgPath.split("/");
    var fullPath = config.baseDir;
    for (var i = 0; i < packages.length; i++) {
        fullPath = path.join(fullPath, "app", packages[i]);
    }
    try {
        console.log(fullPath);
        var model = require(fullPath);
        return model;
    } catch (e) {
        console.log(e.stack);
        console.log('未找到模块：' + fullPath);
    }
};

