var models = require('../model/models'),util = require('util');

exports.index = function(form, fn) {
	var domain = form.get('domain');
	form.addData('domain', domain);
	fn();
}
