import "Character.jsx";
import "Team.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーザー情報 ユーザー認証系情報
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

// ユーザー情報 ユーザーゲーム系情報
native class UserStatusModel{
	var _id: string;
	var userId: string; // ひもづくユーザーID
	var partnerCharaId: string; // パートナーキャラクターID
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function findOne(conditions : variant, callback : function(err:variant,model:UserStatusModel):void) : void;
} = """require("mongoose").model("UserStatus", new require("mongoose").Schema({
	userId: {type: String},
	partnerCharaId: {type: String},
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

		// 適当にキャラクター付与
		var pool = ["player0", "player1", "player2", "player3", "enemy1", "enemy2", "enemy3"];
		var charaDaraList = new CharaDataModel[];
		for(var i = 0; i < 3; i++){
			var charaDara = new CharaDataModel();
			charaDara.userId = user._id;
			charaDara.charaCode = pool[Math.floor(Math.random() * pool.length)];
			charaDara.save(function(err : variant) : void{});
			charaDaraList.push(charaDara);
		}

		// ユーザーゲーム系情報作成
		var status = new UserStatusModel();
		status.userId = user._id;
		status.partnerCharaId = charaDaraList[0]._id;
		status.save(function(err : variant) : void{});

		// チーム作成
		var team = new TeamModel();
		team.userId = user._id;
		team.name = "チーム1";
		team.memberCharaId1 = charaDaraList[0]._id;
		team.index = 1;
		team.save(function(err : variant) : void{});
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

