import "js/web.jsx";

import "../../../util/Ctrl.jsx";
import "../../../util/Sound.jsx";
import "../../../util/Drawer.jsx";
import "../../../util/Loader.jsx";
import "../../../util/Loading.jsx";
import "../../../util/EventCartridge.jsx";
import "../../../util/PartsLabel.jsx";
import "../../../util/PartsButton.jsx";
import "../../../util/PartsScroll.jsx";
import "../Page.jsx";

import "../popup/SECpopup.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報
class DataChara{
	var id : string;
	var code : string;
	var name : string;
	var level : int;
	var hp : int;
	var sp : int;
	var maxhp : int;
	var maxsp : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		this.id = response["id"] as string;
		this.code = response["code"] as string;
		this.name = response["name"] as string;
		this.level = response["level"] as int;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報表示
class DataCharaBox extends DataChara{
	var boxBtn : PartsButton;
	var faceBtn : PartsButton;
	var _labList = {} : Map.<PartsLabel>;

	// 並べ替え情報
	var sortIndex : int;
	var sortTeam : int;
	var sortKind : int;
	var sortDate : Date;

	// ロックアイコン情報
	var favorite : int;
	var partner : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, response : variant){
		super(response);
		this.sortTeam = response["team"] as int;
		this.sortKind = response["refbook"] as int;
		this.sortDate = new Date(response["date"] as string);
		this.partner = response["partner"] as boolean;
		this.favorite = response["favorite"] as int;
		this.boxBtn = new PartsButton(x, y, 180, 60, true);
		this.faceBtn = new PartsButton(x + 5, y + 5, 50, 50, true);
		this.boxBtn.children = [this.faceBtn as PartsButton];

		// ラベル作成
		this._labList["name"] = new PartsLabel(this.name, 60, 5, 115, 20);
		this._labList["name"].setSize(16);
		this._labList["name"].setAlign("left");
		this._labList["level"] = new PartsLabel("Lv." + this.level, 60, 25, 50, 15);
		this._labList["level"].setSize(10);
		this._labList["level"].setAlign("left");
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 位置調整
		for(var name in this._labList){
			var lab = this._labList[name];
			lab.x = lab.basex + this.boxBtn.x;
			lab.y = lab.basey + this.boxBtn.y;
		}

		// 領域全体の描画
		Ctrl.sctx.fillStyle = this.boxBtn.active ? "#bbbbbb" : "#eeeeee";
		Ctrl.sctx.fillRect(this.boxBtn.x, this.boxBtn.y, this.boxBtn.w, this.boxBtn.h);

		// 顔アイコンの描画
		Ctrl.sctx.fillStyle = this.faceBtn.active ? "#999999" : "#ffffff";
		Ctrl.sctx.fillRect(this.faceBtn.x, this.faceBtn.y, this.faceBtn.w, this.faceBtn.h);
		Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + this.code], this.faceBtn.x, this.faceBtn.y, this.faceBtn.w, this.faceBtn.h);

		// アイテムアイコンの描画
		Ctrl.sctx.fillStyle = "#bbbbbb";
		Ctrl.sctx.fillRect(60 + this.boxBtn.x, 40 + this.boxBtn.y, 15, 15);
		Ctrl.sctx.fillRect(90 + this.boxBtn.x, 40 + this.boxBtn.y, 15, 15);

		// チームアイコン設定
		if(this.sortTeam > 0 && this.sortTeam != 65535){
			var team = Math.floor(this.sortTeam / 128);
			Ctrl.sctx.drawImage(Loader.imgs["img_system_character_team" + team], this.boxBtn.x, this.boxBtn.y, 20, 20);
		}

		// ロックアイコン設定
		if(this.partner){Ctrl.sctx.drawImage(Loader.imgs["img_system_character_partner"], 35 + this.boxBtn.x, 40 + this.boxBtn.y, 20, 20);}
		else if(this.favorite > 0){Ctrl.sctx.drawImage(Loader.imgs["img_system_character_favorite" + this.favorite], 35 + this.boxBtn.x, 40 + this.boxBtn.y, 20, 20);}

		// ゲージの描画
		Ctrl.sctx.fillStyle = "white";
		Ctrl.sctx.fillRect(111 + this.boxBtn.x, 30 + this.boxBtn.y, 64, 10);
		Ctrl.sctx.fillRect(111 + this.boxBtn.x, 45 + this.boxBtn.y, 54, 10);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(113 + this.boxBtn.x, 32 + this.boxBtn.y, 60, 6);
		Ctrl.sctx.fillRect(113 + this.boxBtn.x, 47 + this.boxBtn.y, 50, 6);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

