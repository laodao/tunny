/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var http = require('http'), 
	sio = require('socket.io'),
	path = require("path"),
	util = require('util'),
	appUtil = require('./util'),
    config = require(path.resolve('.')+'/conf/config'),
    constant = require('./constant'),
	contentTypes = require('./contentTypes'),
	Cookie = require('./cookie'),
	SessionManager = require('./session').SessionManager,
	ApplicationContext = require('./appContext').ApplicationContext,
	httpHandler = require('./httpHandler'),
	route = require('./route'),
	logger = require('./logger').getLogger(),
	SocketNameSpace = require('./socketService').SocketNameSpace,
	SocketConfig = require('./socketService').SocketConfig,
    SocketManager = require('./SocketManager').SocketManager;

var socket = config.webSocket;
var context = new ApplicationContext();
context.set('socketConfig', config.socketConfig);
var sessionMgr = new SessionManager();

function each(obj, callBack){
	for(var k in obj){
		callBack.apply(obj[k]);
	}
}

var sm = new SocketManager();
context.set('socketMgr', sm);
function enableSocket() {
	var servicesConfig = context.get('socketConfig');
	servicesConfig.forEach(function(conf){
		var ns = conf.namespace;
		var handlerPath = conf.handler;
		var handler = route.getModel(handlerPath);
		for(var _name in handler){//handler是一个js模块，模块中每个方法对应一个和方法名同名的事件
    		var socketConf = new SocketConfig(_name, handlerPath+"/"+_name);
    		if(sm.getNameSpace(ns)){
    			sm.getNameSpace(ns).addSocketConfig(socketConf);
    		}else{
    			var socketNS = new SocketNameSpace(ns);
    			socketNS.addSocketConfig(socketConf);
    			sm.addNameSpace(ns, socketNS);
    		}
		}
	});
}

exports.createServer = function(port) {
	port = port || config.defaultPort;
	var server = http.createServer(function(req, res) {
		var url = req.url;
		url = url.substring(config.basePath.length);
        var clientIP = req.headers['x-forwarded-for']
            || req.connection.remoteAddress;
        logger.info('request at '+new Date().toString()+",client ip:"+clientIP+',method:'+req.method);
		if (url == '/') {
			url = config.indexPage;
		}
		var suffix = path.extname(url).toLowerCase();
		if (contentTypes.contentTypes[suffix]) {// 静态文件直接返回
			httpHandler.handleStaticFile(req, res);
			return;
		}
        if(contentTypes.htmlContentTypes[suffix]){// html文件直接返回
            var htmlFilePath = path.join(config.baseDir, 'html', url);
            httpHandler.handleHtmlFile(req, res, htmlFilePath);
            return;
        }

		var reqParser = route.parseReq(req);
        var webForm = reqParser.form;
        var controller = reqParser.controller;
		if(webForm==null){//没有找到webForm时返回404
			httpHandler.handleHtmlFile(req, res, config.err404Page);
			return;
		}

		var httpCookie = req.headers.cookie;
		var sessionID;
		if(httpCookie){//获取cookie，并存入webForm
			var _cookie = appUtil.parseCookie(req.headers.cookie);
			sessionID = _cookie.sessionID;
			webForm.setCookies(new Cookie(req, {key:'sessionID', val:sessionID}));
		}
		webForm.setContext(context);
        webForm.setReq(req);
        webForm.setRes(res);
		function process(_session){
			webForm.setSession(_session);
			webForm.addCookie('sessionID', _session.getID());
			httpHandler.handleDynamicFile(req, res, controller, webForm);
		}
		//session与cookie处理
		var session = sessionMgr.getSession(sessionID);
		session.once("_ready", process);
		sessionMgr.init(session);
//        session.refresh();
	});
	if(socket=='on'){
		enableSocket();
		createSocketServer(server);
	}
	server.listen(port);
	logger.info('Server running at http://127.0.0.1:' + port + '/');
};
var io;
var conns = {};
function createSocketServer(server){
	io = sio.listen(server, {'log level': 0});
	io.set('authorization', function(handshakeData, callback){
		// 通过客户端的cookie字符串来获取其session数据
		var cookieStr = handshakeData.headers.cookie;
		function setSession(_session){
			handshakeData.session = _session;
		}
		var sessionID;
		if(cookieStr){
			handshakeData.cookie = appUtil.parseCookie(cookieStr);
			sessionID = handshakeData.cookie.sessionID;
		}
		var session = sessionMgr.getSession(sessionID);
		session.once("_ready", setSession);
		sessionMgr.init(session);
		session.refresh();
		callback(null, true);
	});
	initWebSocket(io);
	logger.info('socket started...');
	
	function initWebSocket(io){
		var ios = sm.getIOServices();//存放io.of()返回的对象和事件配置
		function IOService(io){
			this.io = io;
			this.socketConf = [];
		}
		IOService.prototype.setSocketConf = function(socketConf){
			this.socketConf = socketConf;
		};
		IOService.prototype.getIo = function(){return this.io;};
		IOService.prototype.getSocketConf = function(){return this.socketConf;};
		var socketServices = sm.getNameSpaces();
		each(socketServices, function(){
			var _io = io.of(this.getNameSpace());
			var ioService = new IOService(_io);
			ioService.setSocketConf(this.getSocketConfig());
			ios[ios.length] = ioService;
		});
		ios.forEach(function(ioService){
			var ioInstance = ioService;
			ioService.getIo().on('connection', function(socket) {
				//var socketServices = config.socketServices;
				var session = socket.handshake.session;
                var userId = '_'+session.get(constant.currentUserId);
                if(!conns[userId]){
                    conns[userId] = socket;
                }
				//sc.addClient(socket);
				function EventHandler(conf){//事件处理类，封装webform，然后调用action，最后返回给客户端
                    var reqPath = conf.action;//action是响应时间的js模块的相对路径
                    var event = conf.event;//方法名和事件名一样，例：方法A响应事件A。
                    var parserObj = route.parseSocketReq(reqPath);
                    this.controller = parserObj.controller;
					this.webForm = parserObj.form;
					this.webForm.setSession(session);
					//this.webForm.setSocketContext(sc);
					var controllerPath = this.controller.getFullPath();
                    if (config.env == constant.devEnv) {
                        delete( require.cache[ controllerPath ] );
                    }
					var controllerObj = require(controllerPath);
					this.action = controllerObj[event];
					var instance = this;
					return function(data){
						instance.webForm.addAllParam(data);
                        var interceptor = controllerObj.getInterceptor();
                        interceptor.before(instance.webForm, function(beforeRet){//执行before拦截器
                            if(beforeRet && beforeRet['event']){
                                socket.emit(beforeRet, instance.webForm.getData());
                            }
                            if(beforeRet['event']!='error'){
                                instance.action(instance.webForm, socket, function(ret){
                                    interceptor.after(instance.webForm, function(afterRet){//执行after拦截器，无论after拦截器返回什么，请求都将正常执行下去
                                        if(afterRet && afterRet['event']){
                                            socket.emit(afterRet, instance.webForm.getData());
                                        }
                                        if(ret && ret['event']){
                                            socket.emit(ret['event'], instance.webForm.getData());
                                        }else{
                                            socket.send(instance.webForm.getData());
                                        }
                                    });
                                });
                            }
                        });
					};
				}
				ioInstance.getSocketConf().forEach(function(conf){
					//if(socket.listeners(conf.event).length==0){
					socket.on(conf.event, new EventHandler(conf));
					//}
				});
				socket.on('error', function(error){logger.error("socket error:"+error);});
			});
		});
	}
}
process.on('uncaughtException', function(err) {
	console.log(err.stack);
});

exports.dbutil = require('./dbutil');