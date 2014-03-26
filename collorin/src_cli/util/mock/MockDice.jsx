import "js/web.jsx";

import "../../../src_srv/data/CharacterDrawInfo.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくモッククラス
class MockDice{
	static var isInit : boolean;

	// ----------------------------------------------------------------
	// XMLhttpリクエストエミュレート
	static function loadxhr(url : string, request : variant, successFunc : function(response:variant):void) : void{
		if(!MockDice.isInit){
			// すごろくモック初期化
			MockDice.isInit = true;
			CharacterDrawInfo.init();
		}

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

		// さいころ画像
		imgs["img_dice"] = "/img/dice/test.png";

		// キャラクター情報
		var charaInfoList = [[
			// プレイヤー情報
			{code: "player1", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 1, y : 7, r: Math.PI * 1.5},
			{code: "player2", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 7, r: Math.PI * 1.5},
		],[
			// 敵情報
			{code: "enemy1", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 4, r: Math.PI * 0.5},
		]];

		// 初期カメラ位置
		jdat["camera"] = [charaInfoList[0][0]["x"], charaInfoList[0][0]["y"]];

		// キャラクター情報の画像読み込み
		for(var i = 0; i < charaInfoList.length; i++){
			for(var j = 0; j < charaInfoList[i].length; j++){
				var code = charaInfoList[i][j]["code"] as string;
				imgs["img_dot_" + code] = "/img/character/" + code + "/dot.png";
				imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
				imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
				imgs["css_damage_" + code] = "/img/character/" + code + "/damage.png";
			}
		}

		jdat["charaInfo"] = charaInfoList;
		jdat["imgs"] = imgs;
		successFunc(jdat);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

