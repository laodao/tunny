var dbutil = require('../lib/dbutil');
var mongoose = dbutil.getDBConn("album");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserInfo = new Schema();
var UserAccount = new Schema();
var Place = new Schema();
var Picture = new Schema();
var Article = new Schema();
var TimeLineItem = new Schema();
var SpaceLine = new Schema();
var SocialCircle = new Schema();
var Footprint = new Schema();
var Address = new Schema();

UserInfo.add({
	'id':ObjectId,
	'account':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'sex':{type:String},
	'birthDay':{ type: Date, index:true },
	'age':{type:Number},
	'phone':{type:String},
	'address':{ type: Schema.ObjectId, ref: 'Address' }
});

UserAccount.add({
	'id':ObjectId,
	'nickname':{type:String},
	'passwd':{type:String},
	'email':{ type: String, index: { unique: true } },
	'domain':{type:String},
	'regTime':{type:Date},
	'status':{type:String},
	'lastLoginIp':{type:String},
	'lastLoginTime':{type:Date},
	'userinfo':{ type: Schema.ObjectId, ref: 'UserInfo' },
	'friends':[{ type: Schema.ObjectId, ref: 'UserAccount' }],
	'isAdmin':{type:Boolean}
});

Address.add({
	'id':ObjectId,
	'country':{type:String},
	'province':{type:String},
	'city':{type:String},
	'region':{type:String},
	'address':{type:String}
});

Place.add({
	'id':ObjectId,
	'country':{type:String},
	'province':{type:String},
	'city':{type:String},
	'region':{type:String},
	'address':{type:String},
	'parentSpace':{type: Schema.ObjectId, ref: 'Place'},
	'lng':{type:String},//经度
	'lat':{type:String}//纬度
});

Picture.add({
	'id':ObjectId,
	'title':{type:String},
	'description':{type:String},
	'filePath':{type:String},
	'thumbnail':{type:String},
	'createUser':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'createDate':{type:Date},
	'uploadTime':{type:Date},
	'theme':{type:String},//主题
	'timeLineItem':{type: Schema.ObjectId, ref: 'TimeLineItem'},
	'place':{ type: Schema.ObjectId, ref: 'Place' },
	'lng':{type:String},//经度
	'lat':{type:String}//纬度
});

Article.add({
	'id':ObjectId,
	'title':{type:String},
	'content':{type:String},
	'createUser':[{ type: Schema.ObjectId, ref: 'UserAccount' }],
	'createDate':{type:Date},
	'theme':{type:String},//主题
	'place':{ type: Schema.ObjectId, ref: 'Place' },
	'lng':{type:String},//经度
	'lat':{type:String}//纬度
});

TimeLineItem.add({
	'id':ObjectId,
	'description':{type:String},
	'createUser':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'createDate':{type:Date, index: { unique: true }},
	//'pictures':[{ type: Schema.ObjectId, ref: 'Picture' }],
	//'footprints':[{ type: Schema.ObjectId, ref: 'Footprint' }],
	'cover':{ type: Schema.ObjectId, ref: 'Picture' }
});

TimeLineItem.virtual('createDate.day').get(function(){
	return this.createDate.getTime()/1000/60/60/24;
})

SpaceLine.add({
	'id':ObjectId,
	'description':{type:String},
	'createUser':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'createDate':{type:Date},
	'spaces':[{ type: Schema.ObjectId, ref: 'Space' }],
	'startTime':{type:Date},
	'endTime':{type:Date}
});

Footprint.add({
	'id':ObjectId,
	'description':{type:String},
	'createUser':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'space':{ type: Schema.ObjectId, ref: 'Space' },
	'createDate':{type:Date},
	'place':{ type: Schema.ObjectId, ref: 'Place' },
	'lng':{type:String},//经度
	'lat':{type:String}//纬度
});

SocialCircle.add({
	'id':ObjectId,
	'name':{type:String},
	'owner':{ type: Schema.ObjectId, ref: 'UserAccount' },
	'createDate':{type:Date},
	'members':[{ type: Schema.ObjectId, ref: 'UserAccount' }],
	'createTime':{type:Date}
});

var CSDNUser = new Schema();
CSDNUser.add({'username':{type:String}, 'passwd':{type:String}, 'email':{type:String}});
mongoose.model('CSDNUser', CSDNUser);


mongoose.model('UserAccount', UserAccount);
mongoose.model('UserInfo', UserInfo);
mongoose.model('Address', Address);
mongoose.model('Place', Place);
mongoose.model('Picture', Picture);
mongoose.model('Article', Article);
mongoose.model('TimeLineItem', TimeLineItem);
mongoose.model('SpaceLine', SpaceLine);
mongoose.model('Footprint', Footprint);
mongoose.model('SocialCircle', SocialCircle);

exports.get = function(modelName){
	return mongoose.model(modelName);
}
