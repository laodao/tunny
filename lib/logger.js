var config = require('../config'),
	log4js = require('log4js'),
	path = require('path');

var logPath = path.join(config.logPath);
//log4js.addAppender(log4js.consoleAppender());
log4js.addAppender(log4js.fileAppender(logPath), 'tunny');


exports.getLogger = function (){
	var logger = log4js.getLogger('tunny');
	logger.setLevel(config.logLevel);
	return logger;
}
