var require = function(moduleName){
	console.log('---');
	return global.require(moduleName);
};
var uuid = require('node-uuid');
a=uuid();
console.log(a);