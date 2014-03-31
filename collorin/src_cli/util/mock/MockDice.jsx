import "js/web.jsx";

import "../../../src_srv/data/CharacterDrawInfo.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくモッククラス
class MockDice{
	static var isInit : boolean;

	static var hex : MockDiceHexFieldCell[];
	static var cinfo : MockDiceCharaInfo[];
	static var turnId : string;

	// ----------------------------------------------------------------
	// XMLhttpリクエストエミュレート
	static function loadxhr(url : string, request : variant, successFunc : function(response:variant):void) : void{
		if(!MockDice.isInit){
			// すごろくモック初期化
			MockDice.isInit = true;
			CharacterDrawInfo.init();
		}

		var imgs = {} : Map.<string>;
		var list = new variant[];

		switch(request["type"] as string){
			case "entry": MockDice._entry(list, imgs); break;
			case "dice": MockDice._dice(list, imgs, request); break;
			case "move": MockDice._move(list, imgs, request); break;
		}

		var jdat = {} : Map.<variant>;
		jdat["imgs"] = imgs;
		jdat["list"] = list;
		successFunc(jdat);
	}

	// ----------------------------------------------------------------
	// ゲーム開始
	static function _entry(list : variant[], imgs : Map.<string>) : void{
		var jdat = {} : Map.<variant>;
		jdat["type"] = "entry";

		// フィールド情報
		MockDice.hex = [
			new MockDiceHexFieldCell(0, 3, 1),
			new MockDiceHexFieldCell(0, 4, 1),
			new MockDiceHexFieldCell(0, 5, 2),
			new MockDiceHexFieldCell(1, 5, 1),
			new MockDiceHexFieldCell(2, 4, 1),
			new MockDiceHexFieldCell(2, 3, 1),
			new MockDiceHexFieldCell(2, 2, 1),
			new MockDiceHexFieldCell(1, 2, 1),
			new MockDiceHexFieldCell(3, 4, 1),
			new MockDiceHexFieldCell(4, 3, 1),
			new MockDiceHexFieldCell(5, 3, 1),
			new MockDiceHexFieldCell(5, 4, 1),
			new MockDiceHexFieldCell(5, 5, 1),
			new MockDiceHexFieldCell(5, 6, 1),
			new MockDiceHexFieldCell(4, 7, 1),
			new MockDiceHexFieldCell(3, 7, 1),
			new MockDiceHexFieldCell(2, 7, 1),
			new MockDiceHexFieldCell(1, 7, 1),
			new MockDiceHexFieldCell(1, 6, 1),
			new MockDiceHexFieldCell(3, 1, 1),
			new MockDiceHexFieldCell(4, 0, 1),
			new MockDiceHexFieldCell(5, 0, 1),
			new MockDiceHexFieldCell(5, 1, 1),
			new MockDiceHexFieldCell(4, 2, 1),
		];

		// キャラクター情報
		MockDice.cinfo = [
			new MockDiceCharaInfo("p00", "player", "player1", "human", 1, 7, Math.PI * 1.5, 1.2),
			new MockDiceCharaInfo("p01", "player", "player2", "human", 2, 7, Math.PI * 1.5, 1.2),
			new MockDiceCharaInfo("e00", "enemy", "enemy1", "human", 2, 4, Math.PI * 0.5, 1.2),
		];

		// さいころ画像
		imgs["img_dice"] = "/img/dice/test.png";

		// エフェクト画像
		imgs["img_effect_star01"] = "/img/effect/star01.png";

		// キャラクター情報
		var charaInfoList = {} : Map.<variant>;
		for(var i = 0; i < MockDice.cinfo.length; i++){
			var cinfo = MockDice.cinfo[i];
			// 送信用キャラクター情報作成
			charaInfoList[cinfo.id] = {
				side: cinfo.side,
				code: cinfo.code,
				drawInfo: CharacterDrawInfo.data[cinfo.drawInfo],
				x: cinfo.x,
				y: cinfo.y,
				r: cinfo.r,
				size: cinfo.s,
			};
			// 画像情報作成
			imgs["img_dot_" + cinfo.code] = "/img/character/" + cinfo.code + "/dot.png";
			imgs["css_icon_" + cinfo.code] = "/img/character/" + cinfo.code + "/icon.png";
			imgs["css_bust_" + cinfo.code] = "/img/character/" + cinfo.code + "/bust.png";
			imgs["css_damage_" + cinfo.code] = "/img/character/" + cinfo.code + "/damage.png";
		}

		// 初期カメラ位置
		jdat["camera"] = [MockDice.cinfo[0].x, MockDice.cinfo[0].y];

		// ゲーム情報
		jdat["hex"] = MockDice.hex;
		jdat["charaInfo"] = charaInfoList;
		list.push(jdat);

		// ターン開始
		MockDice._turn(list, imgs);
	}

	// ----------------------------------------------------------------
	// さいころ投擲
	static function _dice(list : variant[], imgs : Map.<string>, request : variant) : void{
		var num = request["num"] as int;
		var pipList = new int[];
		var pipTotal = 0;
		for(var i = 0; i < num; i++){
			var pip = Math.floor(1 + Math.random() * 6);
			pipList.push(pip);
			pipTotal += pip;
		}
		list.push({type: "dice", pip: pipList});
		list.push({type: "move", id: MockDice.turnId, pip: pipTotal});
	}

	// ----------------------------------------------------------------
	// 移動処理
	static function _move(list : variant[], imgs : Map.<string>, request : variant) : void{
		if(request["face"] != null){
			var id0 = MockDice.turnId;
			var id1 = request["face"] as string;

			// キャラクター情報獲得
			var chara0 : MockDiceCharaInfo = null;
			var chara1 : MockDiceCharaInfo = null;
			for(var i = 0; i < MockDice.cinfo.length; i++){
				if(MockDice.cinfo[i].id == id0){chara0 = MockDice.cinfo[i];}
				if(MockDice.cinfo[i].id == id1){chara1 = MockDice.cinfo[i];}
			}

			if(chara0.side != chara1.side){list.push({type: "face", id0: id0, id1: id1});}
		}

		// ターン切り替え
		MockDice._turn(list, imgs);
	}

	// ----------------------------------------------------------------
	// ターン開始処理
	static function _turn(list : variant[], imgs : Map.<string>) : void{
		var turnChara : MockDiceCharaInfo = null;
		if(MockDice.turnId == ""){
			// 最初のターン
			turnChara = MockDice.cinfo[0];
		}else{
			// ターン切り替え
			for(var i = 0; i < MockDice.cinfo.length; i++){
				if(MockDice.cinfo[i].id == MockDice.turnId){
					turnChara = MockDice.cinfo[(i + 1) % MockDice.cinfo.length];
					break;
				}
			}
		}
		MockDice.turnId = turnChara.id;

		if(turnChara.side == "player"){
			list.push({type: "command", id: MockDice.turnId});
		}else{
			// ターン切り替え
			MockDice._turn(list, imgs);
		}
	}

}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class MockDiceCharaInfo{
	var id : string;
	var side : string;
	var code : string;
	var drawInfo : string;
	var x : int;
	var y : int;
	var r : number;
	var s : number;
	function constructor(id : string, side : string, code : string, drawInfo : string, x : int, y : int, r : number, s : number){
		this.id = id;
		this.side = side;
		this.code = code;
		this.drawInfo = drawInfo;
		this.x = x;
		this.y = y;
		this.r = r;
		this.s = s;
	}
}

class MockDiceHexFieldCell{
	var x : int;
	var y : int;
	var type : int;
	function constructor(x : int, y : int, type : int){
		this.x = x;
		this.y = y;
		this.type = type;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

