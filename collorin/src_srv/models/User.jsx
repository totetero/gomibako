native class UserModel{
	var _id: string;
	var domain: string;
	var name: string;
	var pass: string;
	var nickname: string;
	var imgurl: string;
	var count: number;
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:UserModel[]):void) : void;
	static function findOne(conditions : variant, callback : function(err:variant,model:UserModel):void) : void;
	static function findById(id : string, callback : function(err:variant,model:UserModel):void) : void;
} = '''require("mongoose").model("User", new require("mongoose").Schema({
	domain: {type: String},
	name: {type: String},
	pass: {type: String},
	nickname: {type: String},
	imgurl: {type: String},
	count: {type: Number},
}))''';

