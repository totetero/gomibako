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
		var list = new variant[];

		switch(request["type"] as string){
			case "entry":
				list.push(MockDice._entry(imgs));
				list.push({type: "command", id: "p00"});
				break;
			case "dice":
				var num = request["num"] as int;
				var pipList = new int[];
				var pipTotal = 0;
				for(var i = 0; i < num; i++){
					var pip = Math.floor(1 + Math.random() * 6);
					pipList.push(pip);
					pipTotal += pip;
				}
				list.push({type: "dice", pip: pipList});
				list.push({type: "move", id: "p00", pip: pipTotal});
				break;
			case "move":
				list.push({type: "face", id0: "p00", id1: "p01"});
				list.push({type: "command", id: "p00"});
				break;
		}

		jdat["imgs"] = imgs;
		jdat["list"] = list;
		successFunc(jdat);
	}

	// ----------------------------------------------------------------
	// ゲーム開始
	static function _entry(imgs : Map.<string>) : variant{
		var jdat = {} : Map.<variant>;
		jdat["type"] = "entry";

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

		// エフェクト画像
		imgs["img_effect_star01"] = "/img/effect/star01.png";

		// キャラクター情報
		var charaInfoList = {
			"p00": {side: "player", code: "player1", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 1, y : 7, r: Math.PI * 1.5},
			"p01": {side: "player", code: "player2", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 7, r: Math.PI * 1.5},
			"e00": {side: "enemy", code: "enemy1", drawInfo: CharacterDrawInfo.data["human"], size: 1.2, x: 2, y : 4, r: Math.PI * 0.5},
		};

		// 初期カメラ位置
		jdat["camera"] = [charaInfoList["p00"]["x"], charaInfoList["p00"]["y"]];

		// キャラクター情報の画像読み込み
		for(var id in charaInfoList){
			var code = charaInfoList[id]["code"] as string;
			imgs["img_dot_" + code] = "/img/character/" + code + "/dot.png";
			imgs["css_icon_" + code] = "/img/character/" + code + "/icon.png";
			imgs["css_bust_" + code] = "/img/character/" + code + "/bust.png";
			imgs["css_damage_" + code] = "/img/character/" + code + "/damage.png";
		}

		jdat["charaInfo"] = charaInfoList;
		return jdat;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

