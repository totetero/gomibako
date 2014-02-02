import "../require/nodejs.jsx";
import "../require/express.jsx";

import "../models/User.jsx";
import "../data/CharacterDrawInfo.jsx";

// マイページ
class GamePage{
	// ----------------------------------------------------------------
	// ページの設定
	static function setPage(app : ExApplication) : void{
		app.get("/game", function(req : ExRequest, res : ExResponse, next : function():void) : void{
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
				{id: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 1, y : 7, r: Math.PI * 1.5},
				{id: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 7, r: Math.PI * 1.5},
			],[
				// 敵情報
				{id: "player0", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 4, r: Math.PI * 0.5},
			]];

			// キャラクター情報の画像読み込み
			for(var i = 0; i < charaInfoList.length; i++){
				for(var j = 0; j < charaInfoList[i].length; j++){
					var id = charaInfoList[i][j]["id"] as string;
					imgs["dot_" + id] = "img/character/" + id + "/dot.png";
					if(i == 0){imgs["b64_bust_" + id] = "img/character/" + id + "/bust.png";}
				}
			}

			jdat["charaInfo"] = charaInfoList;
			jdat["imgs"] = imgs;
			res.send(JSON.stringify(jdat));
		});
	}
}

