import "js/web.jsx";

import "../../../src_srv/data/CharacterDrawInfo.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくモッククラス
class MockDice{
	static var isInit : boolean;

	// 管理情報
	static var _hex : MockDiceHexFieldCell[];
	static var _cinfo : MockDiceCharaInfo[];
	static var _turnId : string;

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
		// --------------------------------
		// 管理情報作成

		// フィールド情報
		MockDice._hex = [
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
		MockDice._cinfo = [
			new MockDiceCharaInfo("p00", "player", "player1", "human", 1, 7, Math.PI * 1.5, 1.2),
			new MockDiceCharaInfo("p01", "player", "player2", "human", 2, 7, Math.PI * 1.5, 1.2),
			new MockDiceCharaInfo("e00", "enemy", "enemy1", "human", 2, 4, Math.PI * 0.5, 1.2),
		];

		MockDice._turnId = "";

		// --------------------------------
		// 送信情報作成
		var jdat = {} : Map.<variant>;
		jdat["type"] = "entry";

		// 送信用フィールド情報
		var jdatHex = new variant[];
		for(var i = 0; i < MockDice._hex.length; i++){
			var hex = MockDice._hex[i];
			jdatHex.push({
				x: hex.x,
				y: hex.y,
				type: hex.type,
			});
		}
		jdat["hex"] = jdatHex;

		// 送信用キャラクター情報
		var jdatCharaInfo = {} : Map.<variant>;
		for(var i = 0; i < MockDice._cinfo.length; i++){
			var cinfo = MockDice._cinfo[i];
			// 送信用キャラクター情報作成
			jdatCharaInfo[cinfo.id] = {
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
		jdat["charaInfo"] = jdatCharaInfo;

		// 初期カメラ位置
		jdat["camera"] = [MockDice._cinfo[0].x, MockDice._cinfo[0].y];

		// さいころ画像
		imgs["img_dice"] = "/img/dice/test.png";
		// エフェクト画像
		imgs["img_effect_star01"] = "/img/effect/star01.png";

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
		list.push({type: "moveManual", id: MockDice._turnId, pip: pipTotal});
	}

	// ----------------------------------------------------------------
	// 移動処理
	static function _move(list : variant[], imgs : Map.<string>, request : variant) : void{
		// 移動キャラクター情報獲得
		var id0 = MockDice._turnId;
		var chara0 : MockDiceCharaInfo = null;
		for(var i = 0; i < MockDice._cinfo.length; i++){
			if(MockDice._cinfo[i].id == id0){chara0 = MockDice._cinfo[i];}
		}

		// 移動の確認
		var dst = request["dst"] as int[][];
		for(var i = 0; i < dst.length; i++){
			chara0.x = dst[i][0];
			chara0.y = dst[i][1];
		}

		if(request["face"] != null){
			// 対面キャラクター情報獲得
			var id1 = request["face"] as string;
			var chara1 : MockDiceCharaInfo = null;
			for(var i = 0; i < MockDice._cinfo.length; i++){
				if(MockDice._cinfo[i].id == id1){chara1 = MockDice._cinfo[i];}
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
		if(MockDice._turnId == ""){
			// 最初のターン
			turnChara = MockDice._cinfo[0];
		}else{
			// ターン切り替え
			for(var i = 0; i < MockDice._cinfo.length; i++){
				if(MockDice._cinfo[i].id == MockDice._turnId){
					turnChara = MockDice._cinfo[(i + 1) % MockDice._cinfo.length];
					break;
				}
			}
		}
		MockDice._turnId = turnChara.id;

		if(turnChara.side == "player"){
			// コマンド入力待ち
			list.push({type: "command", id: MockDice._turnId});
		}else if(turnChara.side == "enemy"){
			// ランダム行動
			var pip = Math.floor(1 + Math.random() * 6);
			var dst = new int[][];
			var x0 = turnChara.x;
			var y0 = turnChara.y;
			var x1 = x0;
			var y1 = y0;
			var faceId = "";
			for(var i = 0; i < pip; i++){
				// 直前にいなかった隣接ヘックス確認
				var temp = new int[][];
				for(var j = 0; j < MockDice._hex.length; j++){
					var x2 = MockDice._hex[j].x;
					var y2 = MockDice._hex[j].y;
					if(x2 == x0 && y2 == y0){continue;}
					if(x2 == x1 + 1 && y2 == y1 + 0){temp.push([x2, y2]);}
					if(x2 == x1 + 0 && y2 == y1 + 1){temp.push([x2, y2]);}
					if(x2 == x1 - 1 && y2 == y1 + 1){temp.push([x2, y2]);}
					if(x2 == x1 - 1 && y2 == y1 + 0){temp.push([x2, y2]);}
					if(x2 == x1 + 0 && y2 == y1 - 1){temp.push([x2, y2]);}
					if(x2 == x1 + 1 && y2 == y1 - 1){temp.push([x2, y2]);}
				}
				if(temp.length > 0){
					// 隣接ヘックスランダム選択
					var next = temp[Math.floor(temp.length * Math.random())];
					// 対面イベント確認
					for(var j = 0; j < MockDice._cinfo.length; j++){
						var cinfo = MockDice._cinfo[j];
						if(cinfo.x == next[0] && cinfo.y == next[1]){
							faceId = cinfo.id;
							break;
						}
					}
					if(faceId != ""){
						// 対面イベント発生 移動完了
						break;
					}else{
						// ヘックス移動
						x0 = x1;
						y0 = y1;
						x1 = next[0];
						y1 = next[1];
						dst.push(next);
					}
				}else{
					// 移動先が無い
					break;
				}
			}
			turnChara.x = x1;
			turnChara.y = y1;
			if(dst.length > 0){list.push({type: "moveAuto", id: turnChara.id, dst: dst});}
			if(faceId != ""){list.push({type: "face", id0: turnChara.id, id1: faceId});}
			// ターン切り替え
			MockDice._turn(list, imgs);
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

