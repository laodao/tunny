/**
 * Created by JetBrains WebStorm.
 * User: lonun
 * Date: 12-4-29
 * Time: 下午12:03
 * To change this template use File | Settings | File Templates.
 */
var path = require('path'),config = require(path.resolve('.')+'/conf/config'),constant = require('./constant'),Action = require("./action").Action,HashMap = require('./HashMap').HashMap;
var Controller = function(fullPath, path, appPath){//actionName是方法名，fullpath是完整路径，path是请求路径,appPath是js文件在/app目录下的的相对路径
    this.appPath = appPath;
    //this.controllerName = controllerName;
//    this.actionName = actionName;//actionName是方法名
    this.fullPath = fullPath;
    this.path = path;
    if (config.env == constant.devEnv) {
        delete( require.cache[ fullPath ] );
    }
    //this.action = require(fullPath);
    this.interceptor = null;
    this.actions = new HashMap();
};

//Controller.prototype.getControllerName = function(){return this.controllerName};
//Controller.prototype.getAction = function(){return this.controller};
//Controller.prototype.getActionName = function(){return this.actionName};
Controller.prototype.getAppPath = function(){return this.appPath};
Controller.prototype.getFullPath = function(){return this.fullPath};
Controller.prototype.getPath = function(){return this.path};
//Controller.prototype.createAction = function(actionName){
//    return new Action(actionName, this);
//};
Controller.prototype.getAction = function(actionName){
    return this.actions.get(actionName);
};
Controller.prototype.addAction = function(actionName, action){
    this.actions.put(actionName, action);
}
//Controller.prototype.getViewPath = function(){
//    var viewPath = this.fullPath.replace(path.join(config.baseDir, 'app'), path.join(config.baseDir,constant.templatePath));
//    viewPath = viewPath.replace('.js', '');
//    viewPath = path.join(viewPath, this.actionName+ '.'+config.templateSuffix[config.templateType]);
//    return viewPath;
//};
////Controller.prototype.getViewPath = function(){return path.join(constant.templatePath, this.path,this.actionName+'.'+config.templateSuffix[config.templateType]);};
//Controller.prototype.getInterceptor = function(){return this.interceptor;};
//Controller.prototype.setInterceptor = function(interceptor){this.interceptor = interceptor;};

exports.Controller = Controller;