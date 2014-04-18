import "User.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーザー情報 編成基本情報
native class TeamModel{
	var _id: string;
	var userId: string; // ひもづくユーザーID
	var name: string; // チーム名
	var memberCharaId1: string; // チームメンバー1キャラクータID
	var memberCharaId2: string; // チームメンバー2キャラクータID
	var memberCharaId3: string; // チームメンバー3キャラクータID
	var index : int; // 表示順
	var lock : boolean; // 出撃中ロック
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:TeamModel[]):void) : void;
	static function findById(id : string, callback : function(err:variant,model:TeamModel):void) : void;
} = """require("mongoose").model("Team", new require("mongoose").Schema({
	userId: {type: String},
	name: {type: String},
	memberCharaId1: {type: String, default: ""},
	memberCharaId2: {type: String, default: ""},
	memberCharaId3: {type: String, default: ""},
	index: {type: Number},
	lock: {type: Boolean, default: false},
}))""";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class TeamModelUtil{
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

