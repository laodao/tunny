var path = require('path'),
    config = require(path.resolve('.')+'/conf/config'),
	log4js = require('log4js');

var logPath = path.join(config.logPath);
//log4js.addAppender(log4js.consoleAppender());
log4js.addAppender(log4js.fileAppender(logPath), 'tunny');


exports.getLogger = function (){
	var logger = log4js.getLogger('tunny');
	logger.setLevel(config.logLevel);
	return logger;
}
