function SocketNameSpace(ns){
	this.nameSpace = ns;
	this.socketConfig = [];
}

SocketNameSpace.prototype.addSocketConfig = function(socketConf){
	this.socketConfig[this.socketConfig.length] = socketConf;
};

SocketNameSpace.prototype.getNameSpace = function(){return this.nameSpace};

SocketNameSpace.prototype.getSocketConfig = function(){
	return this.socketConfig;
}

function SocketConfig(event, action, handler) {
	this.event = event;
	this.action = action;
    this.handler = handler;
}

SocketConfig.prototype.getEvent = function(){return this.event;};
SocketConfig.prototype.getAction = function(){return this.action;};
SocketConfig.prototype.getHandler = function(){return this.handler;};

exports.SocketNameSpace = SocketNameSpace;
exports.SocketConfig = SocketConfig;