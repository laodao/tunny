/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var parseURL = require('url').parse,
    path = require("path"),
    fs = require('fs'),
    config = require('../config'),
    WebForm = require('./webform').WebForm,
    Controller = require('./controller').Controller,
    HashMap = require('./HashMap').HashMap;

var controllers = new HashMap();
var htmlFiles = new HashMap();

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
    var form = null;
    if(controllers.get(url)){
        var controller = controllers.get(url);
        form = new WebForm(controller.getAppPath(), controller.getControllerName(), controller.getActionName());
        form.setUrl(url);
        if(params.length==i+3){
            form.addParam("key", params[i+2]);
        }
        if(query){
            form.addAllParam(query);
            if(query['_dataType']){
                form.setRetType(query['_dataType']);
            }
        }
        form.setActionPath(controller.getFullPath());
        return form;
    }else{
        var actionParam;
        var subApp = params[0];
        var appPath = "";
        var controllerPath = "";
        var controllerName = "";
        var actionName = "";
        for(var i=0;i<params.length;i++){
            var tempAppPath = path.join(appPath, "app", params[i]);
            var fullPath = path.join(config.baseDir, tempAppPath);
            if(!path.existsSync(fullPath)){//动态请求没有后缀，没找到的时候就去寻找文件名为path+.js的文件，否则就视为找到一个目录
                fullPath = fullPath+".js";
                if(path.existsSync(fullPath)){
                    var appPath = path.join(appPath, "app");
                    var controller = new Controller(appPath, controllerName, actionName, fullPath);
                    controllers.put(url, controller);
                    controllerPath = tempAppPath;
                    controllerName = params[i];
                    if(params[i+1]){
                        actionName = params[i+1];
                    }else{
                        if(method){
                            actionName = method.toLowerCase();
                        }
                    }
                    form = new WebForm(appPath, controllerName, actionName);
                    form.setUrl(url);
                    if(params.length==i+3){
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
            }else{
                appPath = tempAppPath;
            }
        }
        console.log("没找到：/"+appPath);
        return null;
    }
};

exports.getHtmlFile = function(url){
    if(htmlFiles.get(url)){
        return htmlFiles.get(url);
    }else{
        var paramStr = null;
        var urlObj = parseURL(url, true);
        var pathame = urlObj.pathname;
        if(pathname.charAt(0)=="/"){
            paramStr = pathname.substring(1);
        }else{
            paramStr = pathname;
        }
        if(paramStr.charAt(paramStr.length-1)=="/"){
            paramStr = paramStr.substring(0,paramStr.length-1);
        }
        var params = paramStr.split("/");
        for(var i=0;i<params.length;i++){
            var _param = params[i];
            if(_param.indexOf(suffix)>-1){//如果有后缀，则去掉后缀
                _param = _param.replace(suffix, '');
            }
            var tempAppPath = path.join(appPath, "app", _param);
            var fullPath = path.join(config.baseDir, tempAppPath);
            if(!path.existsSync(fullPath)){//由于去掉了后缀，所以没找到的时候就去寻找文件名为path+后缀的文件，否则就视为找到一个目录
                fullPath = path.join(config.baseDir, appPath, "html", _param+suffix);
                if(path.existsSync(fullPath)){
                    htmlFiles.put(url, fullPath);
//                    form = new WebForm(path.join(appPath, "app"), null, null);
//                    form = new WebForm(path.join(appPath, "app"), null, null);
//                    form.setUrl(url);
//                    form.setActionPath(fullPath);
                    return fullPath;
                }else{
                    console.log("没有找到html文件：/"+tempAppPath);
                    return null;
                }
            }else{
                appPath = tempAppPath;
            }
        }
    }
}

exports.getModel = function(pkgPath){
    var packages = pkgPath.split("/");
    var fullPath = config.baseDir;
    for(var i=0;i<packages.length;i++){
        fullPath = path.join(fullPath, "app", packages[i]);
    }
    try{
        console.log(fullPath);
        var model = require(fullPath);
        return model;
    }catch(e){
        console.log(e.stack);
        console.log('未找到模块：'+fullPath);
    }
}