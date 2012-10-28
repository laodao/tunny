/**
 * Created by JetBrains WebStorm.
 * User: lonun
 * Date: 12-5-10
 * Time: 下午9:04
 * To change this template use File | Settings | File Templates.
 */
var path = require('path'),fs=require('fs'),config = require(path.resolve('.')+'/conf/config'),constant = require('./constant'),logger = require('./logger').getLogger();

function Interceptor(fullPath){
    this.type="";
    this.fullPath = fullPath;
//    this.controller = controller;
//    this.fullPath = controller.getFullPath().replace('/'+constant.appPath+'/', '/'+constant.interceptorPath+'/');
//    var fullPath = controller.getFullPath();
//    var controllerPath = fullPath.replace(config.baseDir, '').substring(config.appPath.length+1);
//    this.fullPath = path.join(config.baseDir, constant.interceptorPath, controllerPath);
    if(fs.existsSync(fullPath)){
        if (config.env == constant.devEnv) {
            delete( require.cache[ this.fullPath ] );
        }
        this.interceptorAction = require(this.fullPath);
    }else{
        this.interceptorAction = null;
    }
    this.next = null;
    this.action = null;
//    var interceptorPath = path.join(config.baseDir,constant.interceptorPath);
//    var appPath = controller.getAppPath().substring(config.appPath.length+1);
//    if(appPath.length==0 || appPath===""){
//        var globalInterceptorPath = path.join(config.baseDir, constant.interceptorPath, constant.globalInterceptor);
//        if(fs.existsSync(globalInterceptorPath)){
//            if (config.env == constant.devEnv) {
//                delete( require.cache[ globalInterceptorPath ] );
//            }
//            this.next = require(globalInterceptorPath);
//        }
//    }else{
//        var pathDirNames = appPath.split('/');
//        for(var i=0;i<pathDirNames.length;i++){
//            var _name = pathDirNames[i];
//            var _path = path.join(config.baseDir, constant.interceptorPath, _name);
//        }
//    }
}

Interceptor.prototype.setAction = function(action){this.action = action;};
Interceptor.prototype.getFullPath = function(){return this.fullPath};
Interceptor.prototype.getInterceptorAction = function(){return this.interceptorAction};
Interceptor.prototype.setType = function(type){this.type = type;};

Interceptor.prototype.add = function(interceptor){
    if(this.next == null){
        this.next = interceptor;
    }else{
        this.next.add(interceptor);
    }
}

Interceptor.prototype.before = function(webForm, fn){
    var instance = this;
    if(instance.interceptorAction){
        if(this.type===constant.interceptorType.GLOBAL){
            var beforeMethod = 'before';
        }else{
            var beforeMethod = 'before_'+this.action.getActionName();
        }
        //var beforeMethod = 'before_'+this.controller.getActionName();
        var before = instance.interceptorAction[beforeMethod];
        function callback(err){
            if(err){
                //错误处理
                logger.error(err);
            }else{
                if(instance.next){
                    instance.next.before(webForm, fn);
                }else{
                    fn();
                }
            }
        }
        fn.next = callback;
        if(before){
            before(webForm, fn);
        }else{
            fn();
        }
    }else{
        fn();
    }
};

Interceptor.prototype.after = function(webForm, fn){
    var instance = this;
    if(instance.interceptorAction){
        if(this.type===constant.interceptorType.GLOBAL){
            var afterMethod = 'after';
        }else{
            var afterMethod = 'after_'+this.action.getActionName();
        }
//        var afterMethod = 'after_'+this.controller.getActionName();
        var _after = instance.interceptorAction[afterMethod];
        if(_after){
            if(this.next){
                this.next.after(webForm, function(err){
                    if(err){
                        //错误处理
                        logger.error(err);
                    }else{
                        _after(webForm, function(err){
                            if(err){
                                //错误处理
                                logger.error(err);
                            }else{
                                fn();
                            }
                        });
                    }
                });
            }else{
                _after(webForm, function(err){
                    if(err){
                        //错误处理
                        logger.error(err);
                    }else{
                        fn();
                    }
                });
            }
        }else{
            fn();
        }
    }else{
        fn();
    }

};

exports.Interceptor = Interceptor;