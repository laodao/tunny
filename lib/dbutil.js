var config = require(process.cwd() + '/conf/config');
var HashMap = require('./HashMap').HashMap;
var ds = config.dataSource;
var dbType = config.dbType;
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://'+ds.host+'/'+ds.database);

var dbPools = new HashMap();

function MongoDBPool(_ds) {
	this.conns = [];
	var instance = this;
	for(var i=1;i<=20;i++){
		var conn = mongoose.connect('mongodb://'+_ds.host+'/'+_ds.database);
		conn.close = function(){instance.conns.push(conn);};
		this.conns.push(conn);
	}
}

MongoDBPool.prototype.getConn = function(){
	return this.conns.pop();
}

MongoDBPool.prototype.resize = function(){
	var instance = this;
	for(var i=1;i<=20;i++){
		var conn = mongoose.connect('mongodb://'+ds.host+'/'+ds.database);
		conn.close = function(){instance.conns.push(conn);};
		this.conns.push(conn);
	}
}

ds.forEach(function(_ds){
    dbPools.put(_ds.database, new MongoDBPool(_ds));
})

exports.getDBConn = function(database){
    var dbpool = ds.get(database);
    if(!dbpool){
        //此处应抛出异常
        return null;
    }
	var conn = dbpool.getConn();
	if(conn){
		return conn;
	}else{
		dbpool.resize();
		return exports.getDBConn(database);
	}
}
