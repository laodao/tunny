/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var parseURL = require('url').parse,
    path = require("path"),
    fs = require('fs'),
    config = require(process.cwd() +'/conf/config.js'),
    WebForm = require('./webform').WebForm,
    Controller = require('./controller').Controller,
    HashMap = require('./HashMap').HashMap;

function ControllerCache(){
    this.controllerMap = new HashMap();
    this.urlStr = "";
};
ControllerCache.prototype.put = function(url, controller){
    this.urlStr+=url+',';
    this.controllerMap.put(url, controller);
};
ControllerCache.prototype.get = function(url){
    var _url = url;
    while(this.urlStr.indexOf(_url)==-1){
        _url = _url.substring(0,_url.lastIndexOf('/'));
    }
    return this.controllerMap.get(_url);
};
var controllers = new ControllerCache();
var htmlFiles = new HashMap();

exports.getWebForm = function(req){
    var url = req.url;
    if (url == '/') {
        url = config.indexPage;
    }
    var method = req.method;
    //var suffix = path.extname(pathname).toLowerCase();
    var urlObj = parseURL(url, true);
    // 如果url为：/user/add?id=1 ,则pathname为：/user/add
    var reqPath = urlObj.pathname;
    if(reqPath.charAt(0)=="/"){
        reqPath = reqPath.substring(1);
    }
    if(reqPath.charAt(reqPath.length-1)=="/"){
        reqPath = reqPath.substring(0,reqPath.length-1);
    }
    var query = urlObj.query;
    var form = null;
    if(controllers.get(reqPath)){
        var controller = controllers.get(reqPath);
        form = new WebForm(controller);
        //form.setUrl(url);
        var paramStr = reqPath.replace(controller.getPath(), '');
        if(paramStr.charAt(0)=="/"){
            paramStr = paramStr.substring(1);
        }
        var params = paramStr.split('/');
        //组装参数，url:/xxx/yyy/k1/v1/k2/v2/id中如果/xxx/yyy/找到匹配的controller，后面的全部作为参数处理。
        //如果后面参数只有一个，则作为id，如果有多个，偶数是作为key、value对处理，奇数时最后一个作为id，前面的作为key、value对处理。
        if(params.length==1){
            form.addParam("key", params[0]);
        }else{
            var _length = params.length;
            if(_length%2==0){//偶数
                for(var i=0;i<_length;i+=2){
                    form.addParam(params[i], params[i+1]);
                }
            }else{//奇数
                form.addParam("key", params[_length-1]);
                for(var i=0;i<_length-1;i+=2){
                    form.addParam(params[i], params[i+1]);
                }
            }
        }
        if(query){
            form.addAllParam(query);
            if(query['_dataType']){
                form.setRetType(query['_dataType']);
            }
        }
        return form;
    }else{
        var pathPart = reqPath.split("/");
        var appPath = "app";
        //var controllerPath = "";
        var controllerName = "";
        var actionName = "";
        var controllerPath = "";
        for(var i=0;i<pathPart.length;i++){
            controllerPath = path.join(controllerPath, pathPart[i]);
            var tempAppPath = path.join(appPath, pathPart[i]);
            var fullPath = path.join(config.baseDir, tempAppPath);
            if(!path.existsSync(fullPath)){//动态请求没有后缀，没找到的时候就去寻找文件名为path+.js的文件，否则就视为找到一个目录
                fullPath = fullPath+".js";
                if(path.existsSync(fullPath)){
                    controllerName = pathPart[i];
                    var temp = require(fullPath);
                    if(temp[pathPart[i+1]]){
                        actionName = pathPart[i+1];
                        controllerPath = path.join(controllerPath, pathPart[i+1]);
                    }else{
                        if(method){
                            actionName = method.toLowerCase();
                        }
                    }
                    var paramStr = reqPath.replace(controllerPath, '');
                    if(paramStr.charAt(0)=='/'){
                        paramStr = paramStr.substring(1);
                    }
                    var params = paramStr.split('/');

                    var controller = new Controller(controllerName, actionName, fullPath, controllerPath);
                    controllers.put(url, controller);
                    form = new WebForm(controller);
                    if(params.length==1){
                        form.addParam("key", params[0]);
                    }else{
                        var _length = params.length;
                        if(_length%2==0){
                            for(var i=0;i<_length;i+=2){
                                form.addParam(params[i], params[i+1]);
                            }
                        }else{
                            form.addParam("key", params[_length-1]);
                            for(var i=0;i<_length-1;i+=2){
                                form.addParam(params[i], params[i+1]);
                            }
                        }
                    }
                    if(query){
                        form.addAllParam(query);
                        /*if(query['_dataType']){
                            form.setRetType(query['_dataType']);
                        }*/
                    }
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

//exports.getHtmlFile = function(url){
//    if(htmlFiles.get(url)){
//        return htmlFiles.get(url);
//    }else{
//        var fullPath = path.join('html', url);
//        if(path.existsSync(fullPath)){
//            htmlFiles.put(url, fullPath);
//            htmlFiles.put(url, fullPath);
//        var paramStr = null;
//        var urlObj = parseURL(url, true);
//        var pathname = urlObj.pathname;
//        if(pathname.charAt(0)=="/"){
//            paramStr = pathname.substring(1);
//        }else{
//            paramStr = pathname;
//        }
//        if(paramStr.charAt(paramStr.length-1)=="/"){
//            paramStr = paramStr.substring(0,paramStr.length-1);
//        }
//        var params = paramStr.split("/");
//        var htmlPath = "html";
//        var suffix = path.extname(pathname).toLowerCase();
//        for(var i=0;i<params.length;i++){
//            var _param = params[i];
//            if(_param.indexOf(suffix)>-1){//如果有后缀，则去掉后缀
//                _param = _param.replace(suffix, '');
//            }
//            var tempAppPath = path.join(htmlPath, _param);
//            var fullPath = path.join(config.baseDir, tempAppPath);
//            if(!path.existsSync(fullPath)){//由于去掉了后缀，所以没找到的时候就去寻找文件名为path+后缀的文件，否则就视为找到一个目录
//                fullPath = path.join(config.baseDir, appPath, "html", _param+suffix);
//                if(path.existsSync(fullPath)){
//                    htmlFiles.put(url, fullPath);
////                    form = new WebForm(path.join(appPath, "app"), null, null);
////                    form = new WebForm(path.join(appPath, "app"), null, null);
////                    form.setUrl(url);
////                    form.setActionPath(fullPath);
//                    return fullPath;
//                }else{
//                    console.log("没有找到html文件：/"+tempAppPath);
//                    return null;
//                }
//            }else{
//                appPath = tempAppPath;
//            }
//        }
//    }
//}

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