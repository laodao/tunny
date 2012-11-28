var path = require('path'),config = require(path.resolve('.')+'/conf/config'),
    HashMap = require('./HashMap').HashMap,
    ds = config.dataSource,
    dbType = config.dbType,
    mongoose = require('mongoose'),
    logger = require('./logger').getLogger();
//var db = mongoose.connect('mongodb://'+ds.host+'/'+ds.database);

//var dbPools = new HashMap();
//
//function MongoDBPool(_ds) {
//	this.conns = [];
//	var instance = this;
//	for(var i=1;i<=20;i++){
//		var conn = mongoose.connect('mongodb://'+_ds.host+'/'+_ds.database);
//		conn.close = function(){instance.conns.push(conn);};
//		this.conns.push(conn);
//	}
//}
//
//MongoDBPool.prototype.getConn = function(){
//	return this.conns.pop();
//}
//
//MongoDBPool.prototype.resize = function(){
//	var instance = this;
//	for(var i=1;i<=20;i++){
//		var conn = mongoose.connect('mongodb://'+ds.host+'/'+ds.database);
//		conn.close = function(){instance.conns.push(conn);};
//		this.conns.push(conn);
//	}
//}
//
//ds.forEach(function(_ds){
//    dbPools.put(_ds.database, new MongoDBPool(_ds));
//})
//var connManager = new HashMap();
//
//ds.forEach(function(_ds){
//    var conn = mongoose.createConnection(_ds.host, _ds.database);
//    connManager.put(_ds.database, conn);
//})
//
//exports.getDBConn = function(database){
//	var conn = connManager.get(database);
//    if(conn){
//        return conn;
//    }else{
//        logger.error("没有找到数据库连接："+database);
//        return null;
//    }
//}
