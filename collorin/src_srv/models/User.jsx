import "../require/mongo.jsx";

native class UserModel extends mongooseModel{
	var domain: string;
	var uid: string;
	var uname: string;
	var imgurl: string;
	var count: number;
	var gamestat: boolean;
	static function find(conditions : variant, callback : function(err:variant,models:UserModel[]):void) : void;
	static function findOne(conditions : variant, callback : function(err:variant,model:UserModel):void) : void;
	static function findById(id : string, callback : function(err:variant,model:UserModel):void) : void;
} = '''require("mongoose").model("User", new require("mongoose").Schema({
	domain: String,
	uid: String,
	uname: String,
	imgurl: String,
	count: Number,
	gamestat: Boolean,
}))''';

