var models = require('../model/chatModels'),
    HashMap = require('HashMap').HashMap,
    User = models.get('UserAccount'),
    ChatRoom = models.get('ChatRoom'),
    ChatMessage = models.get('ChatMessage'),
    ChatRoomMessage = models.get('ChatRoomMessage');

exports.get = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有登录，请先登录！'});
		fn('_f:/msg');
		return;
	}
	var roomID = form.get('roomID');
	ChatRoom.findOne({'_id':roomID}, function(err, chatRoom){
		if(err||!chatRoom){
			form.addData('msg', {title:'错误' ,content:'没有找到指定的聊天室！'});
			fn('_f:/msg');
			return;
		}
		if(chatRoom.status==0){
			form.addData('msg', {title:'错误' ,content:'该聊天室没有启动！'});
			fn('_f:/msg');
		}else{
		    fn('_f:/chatRoom/listRoom');
			//exports.listRoom(form, fn);
		}
	});
}

exports.startRoom = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有登录，请先登录！'});
		fn('_f:/msg');
		return;
	}
	var roomID = form.get('roomID');
	ChatRoom.findOne({'_id':roomID}, function(err, chatRoom){
        var context = form.getContext();
        var rooms = context.get('roomMgr');
        if(!rooms){
            var roomMgr = new HashMap();
            roomMgr.put(roomID, chatRoom);
            context.set('roomMgr', roomMgr);
        }
        var room = rooms.get(roomID);
    });
}

exports.stopRoom = function(form, fn){
    var session = form.getSession();
    var currentUser = session.get('currentUser');
    if(!currentUser){
        form.addData('msg', {title:'错误' ,content:'您没有登录，请先登录！'});
        fn('_f:/msg');
        return;
    }
    var roomID = form.get('roomID');
    ChatRoom.findOne({'_id':roomID}, function(err, chatRoom){
        var context = form.getContext();
        var rooms = context.get('roomMgr');
        if(!rooms){
            var roomMgr = new HashMap();
            roomMgr.put(roomID, chatRoom);
            context.set('roomMgr', roomMgr);
        }
        var room = rooms.get(roomID);
    });
}

exports.listRoom = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有登录，请先登录！'});
		fn('_f:/msg');
		return;
	}
	ChatRoom.find({}, [], {}, function(err, chatRooms){
		form.addData('chatRooms', chatRooms);
		fn();
	});
}

exports.room = function(form, fn){
	var session = form.getSession();
	var currentUser = session.get('currentUser');
	if(!currentUser){
		form.addData('msg', {title:'错误' ,content:'您没有登录，请先登录！'});
		fn('_f:/msg');
		return;
	}
	var context = form.getContext();
	var rooms
	var roomID = form.get('roomID');
}
