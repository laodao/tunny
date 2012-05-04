var models = require('../model/models'),
	du = require('../lib/dateUtil'),
	util = require('util'),
	moment = require('moment'),
	TimeLineItem = models.get('TimeLineItem'),
	User = models.get('UserAccount');

exports.get = function(form, fn){
	if(form.get('date')){
		var date = moment(form.get('date'), "MM-DD-YYYY");
	}else{
		var date = new Date();
	}
	var now = moment(date);
	var d = now.format('YYYY-MM-DD');
	var domain = form.get('domain');
	User.findOne({'domain':domain}, function(err, user){
        if(err){

        }else{
            TimeLineItem.find({"createUser":user._id, "createDate":{"$lte":d}}, [], {limit:20}, function(err, items){
                form.addData('items', items);
                fn();
            });
        }
	});
}

exports.getNext = function(form, fn){
	var num = form.get('num');
	var d = form.get('date')||new Date();
	var dateStr = du.formatDate(d).split(" ")[0];
	var domain = form.get('domain');
	User.findOne({'domain':domain}, function(err, user){
		TimeLineItem.find({"createUser":user.id, "createDate":{"$gt":dateStr}}, [], {limit:num}, function(err, items){
			form.addData('items', items);
			fn();
		});
	});
}

exports.getPre = function(form, fn){
	var num = form.get('num');
	var d = form.get('date');
	var id = form.get('key');
	TimeLineItem.find({"id":id, "createDate":{"$lt":d}}, [], {limit:num}, function(err, items){
		form.addData('items', items);
		fn();
	});
}
