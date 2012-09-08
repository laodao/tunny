/**
 * Created with JetBrains WebStorm.
 * User: chengqiang
 * Date: 12-6-8
 * Time: 下午5:41
 * To change this template use File | Settings | File Templates.
 */
var path = require('path'),
    util = require('util'),
    uuid = require('node-uuid'),
    config = require(path.resolve('.')+'/conf/config'),
    conf = config.sessionConfig,
    EventEmitter = require('events').EventEmitter;

function LocalSession(){
    EventEmitter.call(this);
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
    };
    this.set = function(key, value){
        this.data[key] = value;
    };

    this.refresh = function(){
        var d = new Date();
        this.refreshTime = d.getTime();
    };

    this.isTimeOut = function(){
        var d = new Date();
        var currentTime = d.getTime();
        if(currentTime>((conf.sessionTimeout*60*1000)+this.refreshTime)){
            return true;
        }
        return false;
    };

    this.remove = function(){
        this.removeFromMgr();
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
};
util.inherits(LocalSession, EventEmitter);

exports.LocalSession = LocalSession;