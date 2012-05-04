/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var http = require('http'), 
	sio = require('socket.io'),
	formidable = require('formidable'), 
	path = require("path"), 
	util = require('util'),
	appUtil = require('./util'), 
	config = require('../config'),
	contentTypes = require('./contentTypes'),
	WebForm = require('./webform').WebForm,
	Cookie = require('./cookie'),
	ViewEngine = require('./view').ViewEngine,
	SessionManager = require('./session').SessionManager,
	ApplicationContext = require('./appContext').ApplicationContext,
	httpHandler = require('./httpHandler'), 
	route = require('./route'),
	logger = require('./logger').getLogger(),
	SocketNameSpace = require('./socketService').SocketNameSpace,
	SocketConfig = require('./socketService').SocketConfig;

var socket = config.webSocket;
var context = new ApplicationContext();
context['socketServices'] = config.socketServices;
var sessionMgr = new SessionManager();

var socketServices = {};

function each(obj, callBack){
	for(var k in obj){
		callBack.apply(obj[k]);
	}
}

//function SocketNameSpace(ns){
//	this.nameSpace = ns;
//	this.socketConfig = [];
//}
//
//SocketNameSpace.prototype.addSocketConfig = function(socketConf){
//	this.socketConfig[this.socketConfig.length] = socketConf;
//};
//
//SocketNameSpace.prototype.getNameSpace = function(){return this.nameSpace};
//
//SocketNameSpace.prototype.getSocketConfig = function(){
//	return this.socketConfig;
//}
//
//function SocketConfig(event, action) {
//	this.event = event;
//	this.action = action;
//}
//
//SocketConfig.prototype.getEvent = function(){return this.event;};
//SocketConfig.prototype.getAction = function(){return this.action;};

function SocketManager(){//全局变量，存放所有的socket、room、namespace、socketservice等
	this.rooms = {};
	this.clients = {};//客户端socket
	this.namespaces = {};
	this.ioServices = [];
}

SocketManager.prototype.addRoom = function(roomid, room){
	this.rooms[roomid] = room;
};

SocketManager.prototype.addNameSpace = function(nsName, ns){
	this.namespaces[nsName] = ns;
};

SocketManager.prototype.addClient = function(key, socket){
    this.clients[key] = socket;
};

SocketManager.prototype.getClient = function(key){
    return this.clients[key];
};

SocketManager.prototype.getRoom = function(roomid){return this.rooms[roomid];};
SocketManager.prototype.getNameSpace = function(nsName){return this.namespaces[nsName];};
SocketManager.prototype.getNameSpaces = function(nsName){return this.namespaces;};
SocketManager.prototype.getIOServices = function(){return this.ioServices;};

var sm = new SocketManager();
context['socketMgr'] = sm;
function enableSocket() {
	var servicesConfig = context['socketServices'];
	servicesConfig.forEach(function(conf){
		var ns = conf.namespace;
		var handlerPath = conf.handler;
		var handler = route.getModel(handlerPath);
		for(var _name in handler){
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
//		var clientIP = req.headers['x-forwarded-for']
//				|| req.connection.remoteAddress;
		if (url == '/') {
			url = config.indexPage;
		}
//		if(url.indexOf('/socket.io')==0){
//			
//		}
		var suffix = path.extname(url).toLowerCase();
		if (contentTypes.contentTypes[suffix]) {// 静态文件直接返回
			httpHandler.handleStaticFile(req, res);
			return;
		}
        if(contentTypes.htmlContentTypes[suffix]){// html文件直接返回
            var htmlFilePath = route.getHtmlFile(url);
            httpHandler.handleHtmlFile(req, res, htmlFilePath);
            return;
        }
		var method = req.method
		var webForm = route.getWebForm(url, method);
		if(webForm==null){//没有找到webForm时返回404
			httpHandler.handleHtmlFile(req, res, config.err404Page);
			return;
		}

		
		var httpCookie = req.headers.cookie;
		var sessionID;
		if(httpCookie){//获取cookie，并存入webForm
			var _cookie = appUtil.parseCookie(req.headers.cookie);
			sessionID = _cookie.sessionID;
//			webForm.setCookies(new Cookie(req, {key:'sessionID', val:sessionID}));
		}
		webForm.setContext(context);
		function process(_session){
			webForm.setSession(_session);
			webForm.addCookie('sessionID', _session.getID());
			httpHandler.handleDynamicFile(req, res, webForm);
		}
		//session与cookie处理
		var session = sessionMgr.getSession(sessionID);
		session.once("_ready", process);
		sessionMgr.init(session);
		session.refresh();
	});
	if(socket=='on'){
		enableSocket();
		createSocketServer(server);
	}
	server.listen(port);
	logger.info('Server running at http://127.0.0.1:' + port + '/');
};
var io;
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
				//sc.addClient(socket);
				function EventHandler(action){//事件处理类，封装webform，然后调用action，最后返回给客户端
					this.webForm = route.getWebForm(action);
					this.webForm.setSession(session);
					//this.webForm.setSocketContext(sc);
					var controllerPath = path.join(this.webForm.getAppPath(), this.webForm.getControllerName());
					var controller = require("../" + controllerPath);
					var actionName = this.webForm.getActionName();
					this.action = controller[actionName];
					var instance = this;
					return function(data){
						instance.webForm.addAllParam(data);
						instance.action(instance.webForm, socket, function(ret){
							if(ret && ret['event']){
								socket.emit(ret['event'], instance.webForm.getData());
							}else{
								socket.send(instance.webForm.getData());
							}
						});
					};
				}
				ioInstance.getSocketConf().forEach(function(conf){
					//if(socket.listeners(conf.event).length==0){
    				 //   console.log(socket.listeners(conf.event).length);
    				 //   console.log(conf.event);
					socket.on(conf.event, new EventHandler(conf.action));
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
