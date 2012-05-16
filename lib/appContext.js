var ApplicationContext = function(){
	var ins = this;
	this.data = {};
//	return function(){
//		return ins;
//	}
}

ApplicationContext.prototype.get = function(key){
	return this.data[key];
};

ApplicationContext.prototype.set = function(key, value){
	this.data[key] = value;
};

exports.ApplicationContext = ApplicationContext;