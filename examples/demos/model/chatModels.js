/**
 * Created by JetBrains WebStorm.
 * User: chengqiang
 * Date: 12-5-2
 * Time: 下午2:36
 * To change this template use File | Settings | File Templates.
 */
var dbutil = require('../lib/dbutil'),
    mongoose = dbutil.getDBConn("album"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

    ChatRoom = new Schema(),
    ChatMessage = new Schema(),
    ChatRoomMessage = new Schema(),
    UserAccount = new Schema();

UserAccount.add({
    'id':ObjectId,
    'nickname':{type:String},
    'passwd':{type:String},
    'email':{ type: String, index: { unique: true } },
    'regTime':{type:Date},
    'status':{type:String},
    'lastLoginIp':{type:String},
    'lastLoginTime':{type:Date},
    'isAdmin':{type:Boolean}
});

ChatRoom.add({
    'id':ObjectId,
    'title':{type:String},
    'creater':{ type: Schema.ObjectId, ref: 'UserAccount' },
    'members':[{ type: Schema.ObjectId, ref: 'UserAccount' }],
    'createDate':{type:Date},
    'description':{type:String},
    'status':{type:Number}
});

ChatMessage.add({
    'id':ObjectId,
    'content':{type:String},
    'from':{ type: Schema.ObjectId, ref: 'UserAccount' },
    'to':{ type: Schema.ObjectId, ref: 'UserAccount' },
    'createTime':{type:Date}
});

ChatRoomMessage.add({
    'id':ObjectId,
    'content':{type:String},
    'creater':{ type: Schema.ObjectId, ref: 'UserAccount' },
    'room':{ type: Schema.ObjectId, ref: 'ChatRoom' },
    'createTime':{type:Date}
});