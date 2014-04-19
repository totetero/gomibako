import "User.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// マスター情報 キャラクター基本情報
native class CharaBaseModel{
	var charaCode: string; // 固有キャラクターコード
	var name: string; // キャラクター名
	var imageCode: string; // 画像コード
	var drawInfoCode: string; // モーションコード
	var refbookIndex : number; // 図鑑番号
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function findOne(conditions : variant, callback : function(err:variant,model:CharaBaseModel):void) : void;
} = """require("mongoose").model("CharaBase", new require("mongoose").Schema({
	charaCode: {type: String},
	name: {type: String},
	imageCode: {type: String},
	drawInfoCode: {type: String},
	refbookIndex: {type: Number},
}))""";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ユーザー情報 キャラクター所有情報
native class CharaDataModel{
	var _id: string;
	var userId: string; // ひもづくユーザーID
	var charaCode: string; // ひもづくキャラクターコード
	var createDate: Date; // 作成日
	var sortTeamIndex: int; // ソート用チーム内位置
	var level: int; // キャラクターレベル
	function save(callback : function(err:variant):void) : void;
	function remove(callback : function(err:variant):void) : void;
	static function find(conditions : variant, callback : function(err:variant,models:CharaDataModel[]):void) : void;
	static function findById(id : string, callback : function(err:variant,model:CharaDataModel):void) : void;
} = """require("mongoose").model("CharaData", new require("mongoose").Schema({
	userId: {type: String},
	charaCode: {type: String},
	createDate: {type: Date, default: Date.now},
	sortTeamIndex: {type: Number, default: 65535},
	level: {type: Number, default: 1},
}))""";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class CharacterModelUtil{
	// キャラクター基本情報のキャッシュ
	static var charaBaseCache = {} : Map.<CharaBaseModel>;
	static function getCharaBase(charaCode: string, callback : function(err:variant,model:CharaBaseModel):void) : void{
		if(CharacterModelUtil.charaBaseCache[charaCode] == null){
			CharaBaseModel.findOne({charaCode: charaCode}, function(err : variant, model : CharaBaseModel) : void{
				if(err){callback(err, null); return;}
				CharacterModelUtil.charaBaseCache[charaCode] = model;
				callback(null, model);
			});
		}else{
			callback(null, CharacterModelUtil.charaBaseCache[charaCode]);
		}
	}
	// ユーザーにひもづくキャラクター全獲得
	static function getUserCharaList(user : UserModel, getData : function(charaBase:CharaBaseModel,charaData:CharaDataModel):void, finish : function(err:variant):void) : void{
		CharaDataModel.find({userId: user._id}, function(err : variant, charaDataList : CharaDataModel[]) : void{
			if(err){finish(err); return;}
			var count = charaDataList.length;
			if(count > 0){
				for(var i = 0; i < charaDataList.length; i++){
					(function(charaData : CharaDataModel){
						CharacterModelUtil.getCharaBase(charaData.charaCode, function(err : variant, charaBase : CharaBaseModel) : void{
							if(count > 0){
								if(err){
									count = 0;
									finish(err);
								}else{
									// キャラクター情報獲得 getData関数は所持キャラクター数だけ呼ばれる
									getData(charaBase, charaData);
									// 完了確認
									if(--count == 0){finish(null);}
								}
							}
						});
					})(charaDataList[i]);
				}
			}else{
				// キャラクター情報無し まずいかも
				finish(null);
			}
		});
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

