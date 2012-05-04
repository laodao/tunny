var models = require('../model/models'),
    User = models.get('UserAccount'),
    ChatRoom = models.get('ChatRoom'),
    ChatMessage = models.get('ChatMessage'),
    ChatRoomMessage = models.get('ChatRoomMessage');
    
exports.roomMsg = function(form, socket, fn){
    var rommID = form.get('roomID');
    var msg = form.get('msg');
    socket.broadcast.to(rommID).send(msg);
}

exports.privateMsg = function(form, socket, fn){
    var targetID = form.get('to');
    var msg = form.get('msg');
    var targetSocket = form.getSocketContext().get(targetID);
    targetSocket.emit('privateMsg', msg);
    fn( {event:'done'});
}
