var path = require('path'),
    config = require(path.resolve('.')+'/conf/config'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    conf = config.sessionConfig,
    uuid = require('node-uuid'),
    redis = require("redis-node"),
    REMOTE_SESSION = 'remote',
    sessionType = conf.sessionType,
    LocalSession = require('./LocalSession').LocalSession,
    RemoteSession = require('./RemoteSession').RemoteSession;

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
	var session = new LocalSession();
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
	var session = new RemoteSession();
	return session;
}

RemoteSessionMgr.prototype.getSession = function(sessionID){
    if(sessionID){
        var session = new RemoteSession(sessionID);
    }else{
        var session = this.create();
    }
	return session;
}

RemoteSessionMgr.prototype.remove = function(sessionID){
	var session = new RemoteSession(sessionID);
	session.remove();
}

exports.SessionManager = SessionManager;
//exports.Session = Session;