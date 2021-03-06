/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var path = require('path'),
    config = require(path.resolve('.')+'/conf/config'),
    logger = require( './logger').getLogger(),
    fs = require('fs');

var ViewEngine = function(templateType){
	this.templateType = templateType;
	this.templateEngine = require(templateType);
};
ViewEngine.prototype.getTemplateEngine = function(){
	return this.templateEngine;
};
ViewEngine.prototype.getTemplateType = function(){
	return this.templateType;
};
ViewEngine.prototype.render = function(filePath, data, callback){
	var resStr = "";
//	var fullPath = path.join(config.baseDir, filePath);
//	if(this.templateType=="jade"){
//		var str = fs.readFileSync(fullPath, 'utf8');
//		var fn = templateEngine.compile(str, ret);
//		resStr = fn(ret);
//	}
//	if(this.templateType=="jinjs"){
//		var pwilang = require("pwilang");
//		this.templateEngine.registerExtension(config.templateSuffix['jinjs'], function (txt) { 
//		    return pwilang.parse(txt); 
//		});
//		var template = require(fullPath);
//		resStr = template.render(data);
//	}
	if(this.templateType=="ejs"){
//		this.templateEngine.open = '${';
//		this.templateEngine.close = '}';
		var engine = this.templateEngine;
        logger.debug('template file path:'+filePath);
		fs.readFile(filePath, 'utf8', function(err, str){
            logger.debug('template content:'+str);
			var ejsData = {locals:data};
			try{
				resStr = engine.render(str, ejsData);
				callback(resStr);
			}catch(err){
				logger.error(err.stack);
                callback(resStr, err);
			}
		});
	}
    if(this.templateType=="liteview"){
        var engine = this.templateEngine;
        if(config.env=='dev'){
            engine.debug(true);
        }
        try{
            var retStr = engine.render(filePath, data);
            callback(resStr);
        }catch(e){
            logger.error(e.stack);
            callback(null, e);
        }
    }
};
exports.ViewEngine = ViewEngine;
