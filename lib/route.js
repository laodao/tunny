/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var parseURL = require('url').parse,
    path = require("path"),
    fs = require('fs'),
    config = require(path.resolve('.')+'/conf/config'),
    constant = require('./constant');
    WebForm = require('./webform').WebForm,
    Controller = require('./controller').Controller,
    Interceptor = require('./interceptor').Interceptor;
    HashMap = require('./HashMap').HashMap,
    Action = require('./action').Action;

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

exports.parseReq = function(req, fn){
    var url = req.url;
    if (url == '/') {
        url = config.indexPage;
    }
    var method = req.method;
    //var suffix = path.extname(pathname).toLowerCase();
    parseUrl(url, method, fn);
};

function parseUrl(url, method, fn){
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
        var controllerPath = controller.getPath();
        var actionName = controllerPath.substr(controllerPath.lastIndexOf("/")+1);
//        if(actionName===""){
//            actionName = method.toLowerCase();
//        }
        var action = controller.getAction(actionName);
        if(!action){
            actionName = method.toLowerCase();
            action = controller.getAction(actionName);
        }
        if(!action){
            if(require(controller.getFullPath())[actionName]){
                action = new Action(actionName, controller);
                var appPath = controller.getAppPath();
                var fullPath = controller.getFullPath();
                var controllerPath = fullPath.substr(fullPath.lastIndexOf('/')).replace(".js", "");
                var interceptor = getInterceptor(appPath, controllerPath, action);
                action.setInterceptor(interceptor);
                controller.addAction(actionName, action);
            }
        }
        form = new WebForm();
        //form.setUrl(url);
        var paramStr = reqPath.replace(controllerPath, '');
        if(paramStr.charAt(0)=="/"){
            paramStr = paramStr.substring(1);
        }
        var params = paramStr.split('/');
        //组装参数，url:/xxx/yyy/k1/v1/k2/v2/id中如果/xxx/yyy/找到匹配的controller，后面的全部作为参数处理。
        //如果后面参数只有一个，则作为id，如果有多个，偶数是作为key、value对处理，奇数时最后一个作为id，前面的作为key、value对处理。
        if(params.length==1){
            form.addParam("id", params[0]);
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
        fn({'form':form, 'action':action});
//        return {'form':form, 'action':action};
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
            if(!fs.existsSync(fullPath)){//动态请求没有后缀，没找到的时候就去寻找文件名为path+.js的文件，否则就是找到一个目录
                fullPath = fullPath+".js";
                if(fs.existsSync(fullPath)){
                    controllerName = pathPart[i];
                    if (config.env === constant.devEnv) {
                        delete( require.cache[ fullPath ] );
                    }
                    var temp = require(fullPath);
                    if(temp[pathPart[i+1]]){
                        actionName = pathPart[i+1];
                        //controllerPath = path.join(controllerPath, pathPart[i+1]);
                    }else{
                        if(method){
                            actionName = method.toLowerCase();
                        }
                    }
                    var paramStr = reqPath.replace(controllerPath, '');
                    var paramStr = paramStr.replace(actionName, '');
                    while(paramStr.charAt(0)==='/'){
                        paramStr = paramStr.substring(1);
                    }
                    var params = paramStr.split('/');
                    var controller = new Controller(fullPath, controllerPath, appPath);//actionName是方法名，fullpath是完整路径，controllerPath是请求路径,appPath是js文件在/app目录下的的相对路径
                    var action = new Action(actionName, controller);
                    var interceptor = getInterceptor(appPath, pathPart[i], action);
                    action.setInterceptor(interceptor);
                    controller.addAction(actionName, action);
                    if(config.env===constant.prdEnv){
                        controllers.put(controllerPath, controller);
                    }
                    form = new WebForm();
                    if(params.length==1){
                        form.addParam("id", params[0]);
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
                    fn({'form':form, 'action':action});
//                    return {'form':form, 'action':action};
                }else{
                    console.log("没有找到：/"+tempAppPath);
                    fn(null);
                }
            }else{
                appPath = tempAppPath;
            }
        }
        console.log("没找到：/"+appPath);
        fn(null);
    }
}

function getInterceptor(appPath, controllerName, action){
    appPath = appPath.substring(constant.appPath.length+1);
    var interceptor = null;
    var globalInterceptorPath = path.join(config.baseDir, constant.interceptorPath, constant.globalInterceptor);
    if(fs.existsSync(globalInterceptorPath)){
        interceptor = new Interceptor(globalInterceptorPath);
        interceptor.setType(constant.interceptorType.GLOBAL);
        interceptor.setAction(action);
    }
    if(appPath.length >0 && appPath!==""){
        if(appPath.charAt(0)==='/'){
            appPath = appPath.substring(1);
        }
        var pathDirNames = appPath.split('/');
        for(var i=0;i<pathDirNames.length;i++){
            var _name = pathDirNames[i];
            var globalInterceptorPath = path.join(config.baseDir, constant.interceptorPath, _name, constant.globalInterceptor);
            if(interceptor == null){
                interceptor = new Interceptor(globalInterceptorPath);
                interceptor.setType(constant.interceptorType.GLOBAL);
                interceptor.setAction(action);
            }else{
                var _interceptor = new Interceptor(globalInterceptorPath);
                _interceptor.setType(constant.interceptorType.GLOBAL);
                _interceptor.setAction(action);
                interceptor.add(_interceptor);
            }
        }
    }
    var interceptorPath = path.join(config.baseDir, constant.interceptorPath, _name, controllerName+'.js');
    if(fs.existsSync(interceptorPath)){
        var _interceptor = new Interceptor(interceptorPath);
        _interceptor.setType(constant.interceptorType.PRIVATE);
        _interceptor.setAction(action);
        interceptor.add(_interceptor);
    }
    return interceptor;
}

exports.parseSocketReq = function(conf, fn){
    var reqPath = conf.action+"/"+conf.event;//action是响应时间的js模块的相对路径
    if(controllers.get(reqPath)){
        var controller = controllers.get(reqPath);
        var webForm = new WebForm(controller);
        fn( {'form':webForm, 'action':controller.getAction(conf.event)});
    }
    var appPath = path.join(constant.appPath, conf.action);
    var temp = conf.action.split('/');
    var controllerName = temp[temp.length-1];
    var fullPath = path.join(config.baseDir, constant.appPath, conf.action);
    var controller = new Controller(fullPath, reqPath, appPath);//actionName是方法名，fullpath是完整路径，_path是请求路径,appPath是js文件在/app目录下的的相对路径
    var action = new Action(conf.event, controller);
//    var controller = new Controller(actionName, fullPath, _path);
    var interceptor = getInterceptor(appPath, controllerName, action);
    controller.addAction(conf.event, action);
    action.setInterceptor(interceptor);
    if(config.env==='prd'){
        controllers.put(reqPath, controller);
    }
    var webForm = new WebForm();
    fn( {'form':webForm, 'action':action});
};

exports.getModel = function(pkgPath){
    var packages = pkgPath.split("/");
    var fullPath = path.join(config.baseDir, constant.appPath, pkgPath);
//    for(var i=0;i<packages.length;i++){
//        fullPath = path.join(fullPath, "app", packages[i]);
//    }
    try{
        console.debug("model path:"+fullPath);
        var model = require(fullPath);
        return model;
    }catch(e){
        console.log(e.stack);
        console.log('未找到模块：'+fullPath);
    }
};

exports.getController = function(url){
    var urlParser = parseUrl(url, 'get');
    if(urlParser != null){
        return urlParser.controller;
    }else{
        return null;
    }
};