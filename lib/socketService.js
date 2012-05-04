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

function SocketConfig(event, action) {
	this.event = event;
	this.action = action;
}

SocketConfig.prototype.getEvent = function(){return this.event;};
SocketConfig.prototype.getAction = function(){return this.action;};

exports.SocketNameSpace = SocketNameSpace;
exports.SocketConfig = SocketConfig;