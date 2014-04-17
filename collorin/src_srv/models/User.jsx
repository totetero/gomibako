import "Character.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーザー認証系情報
native class UserModel{
	var _id: string;
	var domain: string; // OAuthドメイン
	var name: string; // ログイン名
	var pass: string; // ログインパスワード
	var nickname: string;
	var imgurl: string;
	var createDate: Date; // 作成日
	var count: number; // ログイン数
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:UserModel[]):void) : void;
	static function findOne(conditions : variant, callback : function(err:variant,model:UserModel):void) : void;
	static function findById(id : string, callback : function(err:variant,model:UserModel):void) : void;
} = """require("mongoose").model("User", new require("mongoose").Schema({
	domain: {type: String},
	name: {type: String},
	pass: {type: String},
	nickname: {type: String},
	imgurl: {type: String},
	createDate: {type: Date, default: Date.now},
	count: {type: Number, default: 1},
}))""";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class UserModelUtil{
	// ユーザー作成
	static function createUser(setFunc : function(model:UserModel):void, callback : function(err:variant,model:UserModel):void) : void{
		var user = new UserModel();
		setFunc(user);
		user.save(function(err : variant) : void{
			callback(err, user);
		});
		// test 適当にキャラクター付与
		var list = new string[];
		var pool = ["player0", "player1", "player2", "player3", "enemy1", "enemy2", "enemy3"];
		for(var i = 0; i < 3; i++){list.push(pool[Math.floor(Math.random() * pool.length)]);}
		for(var i = 0; i < list.length; i++){
			var charaDara = new CharaDataModel();
			charaDara.userId = user._id;
			charaDara.charaCode = list[i];
			charaDara.save(function(err : variant) : void{});
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

