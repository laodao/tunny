var models = require('../model/models'),
	SpaceLine = models.get('SpaceLine');

exports.testMap = function(form, fn){
	fn();
};

exports.get = function(form, fn){
//	var session = form.getSession();
//	var currentUser = session.get('currentUser');
//	if(!currentUser){
//		form.addData('msg', {title:'错误' ,content:'对不起，您没有访问该页面的权限，请先登录！'});
//		fn('_f:/msg')
//		return;
//	}
	var spaceLineID = this.get('key');
	SpaceLine.findOne({'id':spaceLineID}, function(err, spaceLine){
		this.addData('spaceLine', spaceLine);
		fn();
	});
};

exports.index = function(form, fn){
	var domain = form.get('domain');
	form.addData('domain', domain);
	fn();
};

exports.create = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'对不起，您没有访问该页面的权限，请先登录！'});
		fn('_f:/msg')
		return;
	}
	var spaceLine = new SpaceLine();
	form.fill(spaceLine);
	spaceLine.save(function(){
		fn();
	});
};

exports.addDay = function(form, fn){
	fn();
};

