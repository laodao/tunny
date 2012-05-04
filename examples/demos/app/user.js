/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var models = require('../model/models'),
	User = models.get('UserAccount'),
	logger = require(process.cwd() + '/lib/logger').getLogger(),
	HashMap = require('../lib/HashMap').HashMap,
	util = require('util'),
	crypto = require('crypto');

exports.reg = function(form, fn){
	fn();
}

exports.saveUser = function(form, fn) {
	var email = form.get('email');
	var passwd = form.get('passwd');
	var User = models.get('UserAccount');
	User.findOne({'email':email},function(err, user){
		if(user){
			form.addData('msg', {title:'注册失败' ,content:'email已经注册！'});
			fn('_f:/msg');
			return;
		}
	});
	var user = new User();
	passwd = crypto.createHash('md5').update(passwd).digest('hex');
	user.email = email;
	user.passwd = passwd;
	user.save(function(err) {
		if (err) {
			console.log(err);
			form.addData('msg', {title:'注册失败' ,content:'注册失败！'});
			fn('_f:/msg');
		}
		form.addData('msg', {title:'注册成功' ,content:'注册成功！'});
		fn('_f:/msg');
	});
}

exports.addUserInfo = function(form, fn){
	
};

exports.saveUserInfo = function(form, fn){
	
};

exports.login = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(currentUser){
		form.addData('msg', {title:'登录成功' ,content:'登录成功！'});
		fn('_f:/msg');
		return;
	}
	var email = form.get('email');
	var passwd = form.get('passwd');
	if(email && passwd){
		User.findOne({'email':email},function(err, user){
			if(err){
				console.log(err.stack);
			}
			if(user){
				var _passwd = user.passwd;
				passwd = crypto.createHash('md5').update(passwd).digest('hex');
				if(passwd == _passwd){
					user.passwd = null;
					var sessionUser = {};
					sessionUser['id'] = user._id;
					sessionUser['nickName'] = user.nickName;
					sessionUser['email'] = user.email;
					session.set('currentUser', sessionUser);
					var context = form.getContext();
					var onlineUser = context.get('onlineUser');
					if(onlineUser){
					    onlineUser.put(user._id, sessionUser);
					}else{
					    onlineUser = new HashMap();
					    onlineUser.put(user._id, sessionUser);
					    context.set('onlineUser', onlineUser);
					}
					form.addData('msg', {title:'登录成功' ,content:'登录成功！', redirect:session.get('redirect')});
					fn('_f:/msg');
				}else{
					form.addData('msg', {title:'登录失败' ,content:'登录失败，用户名或者密码错误！'});
					fn('_f:/msg');
				}
			}else{
				form.addData('msg', {title:'登录失败' ,content:'登录失败，用户名或者密码错误！'});
				fn('_f:/msg');
			}
		});
	}else{
		fn();
	}
}

exports.logout = function(form, fn){
	var session = form.getSession();
	session.remove();
	form.delCookie('sessionID');
	form.addData('msg', {title:'退出成功' ,content:'退出成功！'});
	fn('_f:/msg');
}

exports.insertAll = function(form, fn){
	var User = models.get('UserAccount');
	var userList = [];
	for(var i=0;i<5;i++){
		var u = new User();
		u['username']='username'+i;
		u['passwd']='passwd'+i;
	}
	User.collection.insert(userList, null, function(){
		fn();
	});
}

exports.setDomain = function(form, fn){
	fn();
}

exports.saveDomain = function(form, fn){
	var domain = form.get('domain');
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有权限查看该页面，请先登录！'});
		fn('_f:/msg');
		return;
	}
	var id = currentUser.id;
	User.findOne({'_id':id}, function(err, u){
		console.log('err:'+err);
		u.domain = domain;
		u.save(function(){
			form.addData('msg', {title:'成功' ,content:'设置domain成功！'});
			fn('_f:/msg');
		});
	});
}
