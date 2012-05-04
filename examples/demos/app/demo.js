/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var fs = require('fs');
var config = require(process.cwd() + '/config');

exports.index = function(fn) {
	var cookies = form.reqCookies;
	fn( {title : '我的首页'} );
};

exports.newPicture = function(fn) {
	fn({title : '上传图片'}) ;
};
exports.add = function(fn) {
	var temp = this.appContext.get('temp');
	if (temp) {
		temp += 1;
		this.appContext.set('temp', temp);
	} else {
		this.appContext.set('temp', 1)
	}
	fn({t : temp});
};
exports.savePicture = function(fn) {
	for ( var f in this.files) {
		var tmpF = this.files[f];
		var d = new Date();
		var tempName = tmpF.name;
		var suffix = '';
		if (tempName.indexOf('.') > -1) {
			suffix = tempName.substring(tempName.lastIndexOf('.'));
		}
		var fname = '' + d.getFullYear() + (d.getMonth() + 1) + d.getDay()
				+ d.getHours() + d.getMinutes() + d.getSeconds()
				+ Math.random().toString().substring(2);
		fs.renameSync(tmpF.path, config.uploadDir + '/' + fname + suffix);
	}
}

exports.testSession = function(form, fn) {
	var s = form.getSession();
	var t = s.get('test');
	if (!t) {
		s.set('test', 1);
	} else {
		t += 1;
		s.set('test', t);
	}
	fn();
}

exports.testCookie = function(form, fn){
}

exports.getSession = function(form) {
	var t = form.getSession().get('test');
	if (!t) {
		form.session.set('test', 1);
	} else {
		t = t+1;
		form.session.set('test', t);
	}
	return null;
}
