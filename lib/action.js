/**
 * Created with JetBrains WebStorm.
 * User: chengqiang
 * Date: 12-9-7
 * Time: 下午4:24
 * To change this template use File | Settings | File Templates.
 */
var path = require("path"),constant = require('./constant'),config = require(path.resolve('.')+'/conf/config'),logger = require('./logger').getLogger();

function Action(actionName, controller){
    this.actionName = actionName;
    this.controller = controller;
}

Action.prototype.getActionName = function(){
    return this.actionName;
};

Action.prototype.getController = function(){
    return this.controller;
};

Action.prototype.getViewPath = function(){
    var viewPath = this.controller.getFullPath().replace(path.join(config.baseDir, 'app'), path.join(config.baseDir,constant.templatePath));
    viewPath = viewPath.replace('.js', '');
    viewPath = path.join(viewPath, this.actionName+ '.'+config.templateSuffix[config.templateType]);
    return viewPath;
};
Action.prototype.getInterceptor = function(){return this.interceptor;};
Action.prototype.setInterceptor = function(interceptor){this.interceptor = interceptor;};
Action.prototype.getHandler = function(){
    var controllerPath = this.controller.getFullPath();
    if (config.env == constant.devEnv) {
        delete( require.cache[ controllerPath ] );
    }
    logger.info("actionname:"+this.actionName);
    logger.info("controllerPath:"+controllerPath);
    return require(controllerPath)[this.actionName];
};

exports.Action = Action;