/**
 * Created by JetBrains WebStorm.
 * User: lonun
 * Date: 12-4-29
 * Time: 下午12:03
 * To change this template use File | Settings | File Templates.
 */
var Controller = function(appPath, controllerName, actionName, fullPath){
    this.appPath = appPath;
    this.controllerName = controllerName;
    this.actionName = actionName;
    this.fullPath = fullPath;
}

Controller.prototype.getControllerName = function(){return this.controllerName};
Controller.prototype.getActionName = function(){return this.actionName};
Controller.prototype.getAppPath = function(){return this.appPath};
Controller.prototype.getFullPath = function(){return this.fullPath};

exports.Controller = Controller;