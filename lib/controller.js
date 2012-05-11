/**
 * Created by JetBrains WebStorm.
 * User: lonun
 * Date: 12-4-29
 * Time: 下午12:03
 * To change this template use File | Settings | File Templates.
 */
var config = require(process.cwd() + '/conf/config'),path = require('path'),constant = require('./constant');
var Controller = function(actionName, fullPath, path){
//    this.appPath = appPath;
    //this.controllerName = controllerName;
    this.actionName = actionName;
    this.fullPath = fullPath;
    this.path = path;
    if (config.env == constant.devEnv) {
        delete( require.cache[ fullPath ] );
    }
    //this.action = require(fullPath);
    this.interceptor = null;
};

//Controller.prototype.getControllerName = function(){return this.controllerName};
//Controller.prototype.getAction = function(){return this.controller};
Controller.prototype.getActionName = function(){return this.actionName};
//Controller.prototype.getAppPath = function(){return this.appPath};
Controller.prototype.getFullPath = function(){return this.fullPath};
Controller.prototype.getPath = function(){return this.path};
Controller.prototype.getViewPath = function(){return path.join(constant.templatePath, this.path,this.actionName+'.'+config.templateSuffix[config.templateType]);};
Controller.prototype.getInterceptor = function(){return this.interceptor;};
Controller.prototype.setInterceptor = function(interceptor){this.interceptor = interceptor;};

exports.Controller = Controller;