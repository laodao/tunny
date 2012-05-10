var config = require(process.cwd() + '/conf/config'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	conf = config.sessionConfig,
	dsConf = config.sessionDSConfig,
	uuid = require('node-uuid'),
	redis = require("redis-node"),
//	redis = require("redis"),
	LOCAL_SESSION = 'local',
	REMOTE_SESSION = 'remote';
	//client = redis.createClient();
var sessionType = conf.sessionType;

function RedisDS(dsConf){
	this.max  = dsConf.max||100;
	this.min  = dsConf.min||5;
	this.init = dsConf.init||10;
	this.step = dsConf.step||5;
	this.port = dsConf.port||6379;
	this.host = dsConf.host||'localhost';
	this.connPool = [];//所有的
	var instance = this;
	this.resizePool = function(){
		for(var i=0;i<this.step;i++){
			var client = redis.createClient(this.port, this.host);
			client.close = function(){
				instance.connPool.push(this);
			}
			this.connPool.push(client);
		}
	}
	for(var i=0;i<this.init;i++){
		var client = redis.createClient(this.port, this.host);
		client.close = function(){
			instance.connPool.push(this);
		}
		this.connPool.push(client);
	}
}
RedisDS.prototype.getConn = function(){
	if(this.connPool.length<=this.min){
		this.resizePool();
	}
	var conn = this.connPool.shift();
	if(!conn){
		conn = this.connPool.shift();
		this.resizePool();
	}
	return conn;
}
var redisDS;
if(sessionType==REMOTE_SESSION){
	redisDS = new RedisDS(dsConf);
}

function Session(sessionID){
	EventEmitter.call(this);
	if(sessionType==REMOTE_SESSION){
		return new RemoteSession(sessionID);
	}else{
		return new LocalSession();
	}
}

util.inherits(Session, EventEmitter);

Session.prototype.getData = function(){
	return this.data;
}

Session.prototype.getID = function(){
	return this.id;
}

Session.prototype.get = function(key){
	return this.data[key];
}

function LocalSession(){
	this.id = uuid();
	this.data = {};
	var d = new Date();
	this.refreshTime = d.getTime();
	var mgr;
	this.setMgr = function(_mgr){
		mgr = _mgr;
	}
	this.removeFromMgr = function(){
		mgr.remove(this.id);
		mgr = undefined;
	}
}
util.inherits(LocalSession, Session);

LocalSession.prototype.set = function(key, value){
	this.data[key] = value;
}

LocalSession.prototype.refresh = function(){
	var d = new Date();
	this.refreshTime = d.getTime();
}

LocalSession.prototype.isTimeOut = function(){
	var d = new Date();
	var currentTime = d.getTime();
	if(currentTime>((conf.sessionTimeout*60*1000)+this.refreshTime)){
		return true;
	}
	return false;
}

//LocalSession.prototype.setMgr = function(mgr){
//	this.mgr = mgr;
//}

LocalSession.prototype.remove = function(){
	this.removeFromMgr();
}

function RemoteSession(sessionID){
	this.data = {};
	this.id = sessionID;
}

util.inherits(RemoteSession, Session);

RemoteSession.prototype.init = function(){
	if(this.id&&this.id!='undefined'){
		var client = redisDS.getConn();
		var instance = this;
		client.hgetall(this.id, function(err, reply){
			if(reply){
				instance.data = reply;
			}else{
				instance.data = {};
				this.id = uuid();
			}
			instance.emit("_ready", instance);
            client.close();
		});
	}else{
		this.id = uuid();
		this.data = {id:this.id};
		var client = redisDS.getConn();
		client.hset(this.id, 'id', this.id);
		client.close();
		this.refresh();
		this.emit("_ready", this);
	}
}

RemoteSession.prototype.set = function(key, value){
	var client = redisDS.getConn();
	this.data[key] = value;
	client.hset(this.id, key, value);
	client.close();
}

RemoteSession.prototype.refresh = function(){
	var d = new Date();
	d.setMinutes(d.getMinutes()+conf.sessionTimeout);
	var client = redisDS.getConn();
	var expireTime = parseInt((+d) / 1000, 10);
	client.expireat(this.id, expireTime, function(err, rep){});
	client.close();
}

RemoteSession.prototype.remove = function(){
	this.data = undefined;
	var client = redisDS.getConn();
	client.del(this.id);
	client.close();
}

var SessionManager = function(){
	if(sessionType==REMOTE_SESSION){
		return new RemoteSessionMgr();
	}else{
		return new LocalSessionMgr();
	}
}

SessionManager.prototype.init = function(session){
	if(sessionType==REMOTE_SESSION){
		session.init();
	}else{
		session.emit("_ready", session);
	}
    session.refresh();
}

function LocalSessionMgr(){
	this.sessions = {};
}
util.inherits(LocalSessionMgr, SessionManager);

LocalSessionMgr.prototype.create = function(){
	var session = new Session();
	this.sessions[session.getID()] = session;
	session.setMgr(this);
	return session;
}

LocalSessionMgr.prototype.getSession = function(sessionID){
	if(sessionID=='undefined' || sessionID=='null'){
		sessionID = null;
	}
	var session;
	if(sessionID){
		session = this.sessions[sessionID];
	}else{
		session = this.create();
	}
	if(!session){
		session = this.create();
	}
	if(session.isTimeOut()){
		console.log('session is time out');
		session.remove();
		session = this.create();
	}
	return session;
}

LocalSessionMgr.prototype.remove = function(sessionID){
	this.sessions[sessionID] = undefined;
	delete this.sessions[sessionID];
}

function RemoteSessionMgr(){}

util.inherits(RemoteSessionMgr, SessionManager);

RemoteSessionMgr.prototype.create = function(){
	var session = new Session();
	return session;
}

RemoteSessionMgr.prototype.getSession = function(sessionID){
	var session = new Session(sessionID);
	return session;
}

RemoteSessionMgr.prototype.remove = function(sessionID){
	var session = new Session(sessionID);
	session.remove();
}

exports.SessionManager = SessionManager;
exports.Session = Session;