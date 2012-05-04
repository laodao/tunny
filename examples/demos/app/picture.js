/**
 * @author lonun
 * @blog http://www.lonun.com
 */

var fs = require('fs'),
	path = require('path'),
	util = require('util'),
	gm = require('gm'),
	moment = require('moment'),
	du = require('../lib/dateUtil'),
	config = require(process.cwd() + '/config'),
	logger = require(process.cwd() + '/lib/logger').getLogger(),
	models = require('../model/models'),
	Pic = models.get('Picture'),
	TimeLineItem = models.get('TimeLineItem');

exports.create = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		session.set('redirect', '/picture/create');
		form.addData('msg', {title:'错误' ,content:'您没有权限查看该页面，请先登录！', redirect:'/user/login'});
		fn('_f:/msg')
		return;
	}
	fn();
}

exports.savePicture = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有权限查看该页面，请先登录！'});
		fn('_f:/msg')
		return;
	}
	var _files = [];
	for ( var f in form.files) {
		var tmpF = form.files[f];
		if(!tmpF.name){
			continue;
		}
		var d = new Date();
		var tempName = tmpF.name;
		var suffix = '';
		if (tempName.indexOf('.') > -1) {
			suffix = tempName.substring(tempName.lastIndexOf('.'));
		}
		var fname = '' + d.getFullYear() + (d.getMonth() + 1) + d.getDay()
				+ d.getHours() + d.getMinutes() + d.getSeconds()
				+ Math.random().toString().substring(2);
		var fullPath = path.join(config.baseDir, config.staticDir, config.uploadDir, fname + suffix);
		fs.renameSync(tmpF.path, fullPath);
		_files[_files.length] = config.uploadDir + '/' +fname + suffix;
	}
	var now = moment();
	var d = now.format('YYYY-MM-DD');
	TimeLineItem.findOne({'createDate':d}, function(err, item){
		if(item){
			savePics(item);
		}else{
			var timeLineItem = new TimeLineItem();
			timeLineItem.createUser = currentUser.id;
			timeLineItem.createDate = d;
			timeLineItem.save(function(){
				savePics(timeLineItem);
			});
		}
	});
	function savePics(item){
		var pics = [];
		for ( var i=0;i<_files.length;i++) {
			var pic = new Pic();
			pic.filePath = _files[i];
			pic.createDate = new Date();
			pic.createUser = currentUser.id;
			pic.timeLineItem = item._id;
			pics[pics.length] = pic;
		}
		function resize(_pics, i, _fn){
			var pic = _pics[i];
			var fullPath = path.join(config.baseDir, config.staticDir, pic.filePath);
			var suffix = path.extname(fullPath);
			var thumbnail = pic.filePath.replace(suffix, '_small'+suffix);
			var newPath = path.join(config.baseDir, config.staticDir, thumbnail);
			gm(fullPath).resize(240,240).noProfile().write(newPath, function (err) {
				  if(!err){
					  _pics[i].thumbnail = thumbnail;
					  if(i<_pics.length-1){
						  resize(_pics, i+1, _fn);
					  }else{
						  _fn(_pics);
					  }
				  }else{
					  console.log(err);
				  }
			});
		}
		resize(pics, 0, function(_pics){
			Pic.create(_pics, function(err, pics) {
				form.addData('msg', {title:'上传成功' ,content:'照片上传成功！'} );
				fn('_f:/msg');
			});
		});
	}
}

exports.pic2map = function(form, fn){
	var picid = form.get(picid);
	Pic.findOne({'id':picid}, function(err, pic){
		if(err){
			logger.error(err);
		}
		if(pic){
			form.addData('pic', pic);
			fn();
		}
	});
}

exports.getPicsByTime = function(form, fn){
	var page = form.get('page')||1;
	var pageSize = form.get('pageSize')||20;
	var start = (page-1)*pageSize;
	var currentUser = form.getSession().get('currentUser');
	var timeLintItemID = form.get('key');
	var Picture = models.get('Picture');
	Picture.find({'timeLineItem':timeLintItemID}, [], { skip:start, limit:pageSize, sort: ['createDate', 'descending'] }, function(err, pictures){
		if(err){
			console.log(err);
		}
		form.addData('pictures', pictures);
		fn();
	});
//	var Footprint = models.get('Footprint');
//	Footprint.find({'createUser':userID}, [], { sort: ['createDate', 'descending'] }, function(err, footprints){
//		if(err){
//			console.log(err);
//		}
//		form.addData('footprints', footprints);
//	});
}

exports.comment = function(form, fn){
	fn();
};