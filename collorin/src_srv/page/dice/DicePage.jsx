import "../../require/nodejs.jsx";
import "../../require/express.jsx";
import "../../require/redis.jsx";

import "../../models/User.jsx";
import "../../data/CharacterDrawInfo.jsx";

// マイページ
class DicePage{
	static var _rcli : RedisClient;
	static const _rhead = "dice:";

	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication, rcli : RedisClient) : void{
		DicePage._rcli = rcli;

		// -------- expressページ --------
		app.post("/dice", function(req : ExRequest, res : ExResponse, next : function():void) : void{
			DicePage._entry(function(jdat : Map.<variant>) : void{res.send(JSON.stringify(jdat));});
		});
	}

	// ----------------------------------------------------------------
	// ゲーム開始
	static function _entry(callback : function(jdat:Map.<variant>):void) : void{
		var jdat = {} : Map.<variant>;
		var imgs = {} : Map.<string>;

		// フィールド情報
		jdat["hex"] = [
			{x: 0, y: 3, type: 1},
			{x: 0, y: 4, type: 1},
			{x: 0, y: 5, type: 2},
			{x: 1, y: 5, type: 1},
			{x: 2, y: 4, type: 1},
			{x: 2, y: 3, type: 1},
			{x: 2, y: 2, type: 1},
			{x: 1, y: 2, type: 1},
			{x: 3, y: 4, type: 1},
			{x: 4, y: 3, type: 1},
			{x: 5, y: 3, type: 1},
			{x: 5, y: 4, type: 1},
			{x: 5, y: 5, type: 1},
			{x: 5, y: 6, type: 1},
			{x: 4, y: 7, type: 1},
			{x: 3, y: 7, type: 1},
			{x: 2, y: 7, type: 1},
			{x: 1, y: 7, type: 1},
			{x: 1, y: 6, type: 1},
			{x: 3, y: 1, type: 1},
			{x: 4, y: 0, type: 1},
			{x: 5, y: 0, type: 1},
			{x: 5, y: 1, type: 1},
			{x: 4, y: 2, type: 1},
		];

		// キャラクター情報
		var charaInfoList = [[
			// プレイヤー情報
			{code: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 1, y : 7, r: Math.PI * 1.5},
			{code: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 7, r: Math.PI * 1.5},
		],[
			// 敵情報
			{code: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 4, r: Math.PI * 0.5},
		]];

		// 初期カメラ位置
		jdat["camera"] = [charaInfoList[0][0]["x"], charaInfoList[0][0]["y"]];

		// キャラクター情報の画像読み込み
		for(var i = 0; i < charaInfoList.length; i++){
			for(var j = 0; j < charaInfoList[i].length; j++){
				var code = charaInfoList[i][j]["code"] as string;
				imgs["dot_" + code] = "img/character/" + code + "/dot.png";
				if(i == 0){imgs["b64_bust_" + code] = "img/character/" + code + "/bust.png";}
			}
		}

		jdat["charaInfo"] = charaInfoList;
		jdat["imgs"] = imgs;
		callback(jdat);
	}
}

