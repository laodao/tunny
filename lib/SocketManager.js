/**
 * Created by JetBrains WebStorm.
 * User: lonun
 * Date: 12-5-10
 * Time: 下午11:06
 * To change this template use File | Settings | File Templates.
 */

function SocketManager(){//全局变量，存放所有的socket、room、namespace、socketservice等
    this.rooms = {};
    this.clients = {};//客户端socket
    this.namespaces = {};
    this.ioServices = [];
};

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

exports.SocketManager = SocketManager;