var models = require('../model/models');

exports.index = function(form, fn) {
	var ret = {};
	var currentUser = form.getSession().get('currentUser');
	var userID;
	function getUserPic(userID, fn){
		
	}
	if(currentUser){
		userID = currentUser.id;
	}else{
		var userID = form.get('key');
	}
	var Footprint = models.get('Footprint');
	var footprint = new Footprint();
	footprint.find({'Footprint.createUser.id':userID}, [], { sort: ['createDate', 'descending'] }, function(err, footprints){
		form.addData('footprints', footprints);
		var Picture = models.get('Picture');
		var picture = new Picture();
		picture.find({'Picture.createUser.id':userID}, [], { sort: ['createDate', 'descending'] }, function(err, pictures){
			form.addData('pictures', pictures);
		});
	});
	fn();
}