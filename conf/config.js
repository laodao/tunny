/**
 * @author lonun@gmail.com
 */
var path = require('path');
/********************************************************************
 * 全局配置
 ********************************************************************/
exports.defaultPort = 6060;
exports.templateSuffix = {"jade":".jade","ejs":"html"};
exports.templateType = "ejs";
exports.templatePath = "views";
exports.baseDir = path.resolve('.');
exports.basePath = '';
exports.staticDir = 'static';
exports.uploadDir = '/upload';
exports.indexPage = '/index.html';
exports.err404Page = '/html/404.html';
exports.err500Page = '/html/500.html';
exports.env = 'dev';

/********************************************************************
 * 数据库配置
 ********************************************************************/
var _dataSource = {
	dev:[
        {
            "host": "127.0.0.1",
            "database": "tunny",
            "port" : 27017,
            "username": "",
            "password": ""
        }
	],
	test:[
        {
            "host": "127.0.0.1",
            "database": "tunny",
            "port" : 27017,
            "username": "",
            "password": ""
        }
    ],
	prd:[
        {
            "host": "127.0.0.1",
            "database": "tunny",
            "port" : 27017,
            "username": "",
            "password": ""
        }
    ]
};
exports.dbType = 'mongodb';
exports.dataSource = _dataSource[exports.env];

/********************************************************************
 * websocket配置
 ********************************************************************/
exports.webSocket = 'on';
exports.socketConfig = [
                          {
                        	  namespace  : '/ns2', 
                        	  handler    : 'socketTest'
                          }];

/********************************************************************
 * session配置
 ********************************************************************/
exports.sessionConfig = {
		sessionTimeout : 20,
		sessionType    : 'local'
};
exports.sessionDSConfig = {
		port  : 6379,
		host  : '127.0.0.1',
		max   : 1000,
		min   : 5,
		init  : 10,
		step  : 10
};

/********************************************************************
 * 日志配置
 ********************************************************************/
exports.logPath = 'e:/logs/tunny.log';
exports.logLevel = "INFO";

/********************************************************************
 * 安全认证配置
 ********************************************************************/
exports.authorize = 'on';
exports.loginUrl = '/login';
exports.noRight = '/noRight.html';
exports.noId = "/noId.html";
exports.logout = '/logout';
exports.currentUser = 'CURRENT_USER';

