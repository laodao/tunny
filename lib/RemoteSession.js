/**
 * Created with JetBrains WebStorm.
 * User: chengqiang
 * Date: 12-6-8
 * Time: 下午5:40
 * To change this template use File | Settings | File Templates.
 */
var path = require('path'),
    config = require(path.resolve('.')+'/conf/config'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    conf = config.sessionConfig,
    dsConf = config.sessionDSConfig,
    uuid = require('node-uuid'),
    redis = require("redis"),
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
};
var redisDS;
if(sessionType==REMOTE_SESSION){
    redisDS = new RedisDS(dsConf);
}

function RemoteSession(sessionID){
    EventEmitter.call(this);
    this.data = {};
    this.id = sessionID;
    this.init = function(){
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
    };
    this.set = function(key, value){
        var client = redisDS.getConn();
        this.data[key] = value;
        client.hset(this.id, key, value);
        client.close();
    };

    this.refresh = function(){
        var d = new Date();
        d.setMinutes(d.getMinutes()+conf.sessionTimeout);
        var client = redisDS.getConn();
        var expireTime = parseInt((+d) / 1000, 10);
        client.expireat(this.id, expireTime, function(err, rep){});
        client.close();
    };

    this.remove = function(){
        this.data = undefined;
        var client = redisDS.getConn();
        client.del(this.id);
        client.close();
    };

    this.getData = function(){
        return this.data;
    };

    this.getID = function(){
        return this.id;
    };

    this.get = function(key){
        return this.data[key];
    };
}
util.inherits(RemoteSession, EventEmitter);

exports.RemoteSession = RemoteSession;