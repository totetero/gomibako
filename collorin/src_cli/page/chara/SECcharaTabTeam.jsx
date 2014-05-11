import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/parts/PartsButton.jsx";
import "../core/data/DataChara.jsx";

import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター編成タブカートリッジ
class SECcharaTabTeam extends SECcharaTab{
	var _btnList = {} : Map.<PartsButton>;
	var _charaList = new DataCharaBox[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, response : variant){
		super(page, "team");

		this._btnList["test"] = new PartsButtonBasic("てす", 60, 60, 250, 30);

		var chara = new DataCharaBox(60, 100, response["list"][0]);
		this._charaList.push(chara);
		this._btnList["charaBox" + 0] = chara.boxBtn;
		this._btnList["charaFace" + 0] = chara.faceBtn;
	}

	// ----------------------------------------------------------------
	// 計算
	override function tabCalc() : boolean{
		for(var name in this._btnList){this._btnList[name].calc(true);}

		// キャラクターボタン処理
		for(var i = 0; i < this._charaList.length; i++){
			// キャラクター情報ポップアップ
			var btn = this._charaList[i].faceBtn;
			if(btn.trigger){
				btn.trigger = false;
				Sound.playSE("ok");
				this.page.serialPush(new SECpopupDataChara(this.page, this, this._charaList[i]));
				return false;
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function tabDraw() : void{
		// ボタン描画
		for(var name in this._btnList){this._btnList[name].draw();}

		// キャラクター描画
		for(var i = 0; i < this._charaList.length; i++){this._charaList[i].draw();}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

