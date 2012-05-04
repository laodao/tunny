exports.test = function(form, socket, fn){
	form.addData('m', 'c');
	fn( {event:'msg'});
}

exports.sendMsg = function(form, socket, fn){
	var t = form.getSession().get('m');
	if (!t) {
		t=1;
	} else {
		t = t+1;
	}
	form.session.set('m', t);
	form.addData('m', t);
	fn( {event:'msg'});
}