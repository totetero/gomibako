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

import "DataChara.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター情報表示ボタン
class PartsButtonDataChara extends PartsButton{
	// 並べ替え
	static function sort(list : PartsButtonDataChara[], type : string) : void{
		for(var i = 0; i < list.length; i++){
			list[i].sortIndex = i;
			switch(type){
				case "hp": break;
				case "sp": break;
				case "level": list[i].sortIndex += -list[i].data.level * list.length; break;
				case "team": list[i].sortIndex += list[i].sortTeam * list.length; break;
				case "favorite": list[i].sortIndex += -(list[i].partner ? 5 : list[i].favorite) * list.length; break;
				case "type": list[i].sortIndex += list[i].sortKind * list.length; break;
				case "new": list[i].sortIndex = -list[i].sortDate.getTime(); break;
			}
		}
		list.sort(function(i0 : Nullable.<PartsButtonDataChara>, i1 : Nullable.<PartsButtonDataChara>):number{return i0.sortIndex - i1.sortIndex;});
	}

	// ----------------------------------------------------------------

	var data : DataChara;
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
		super(x, y, 180, 60, true);
		this.data = new DataChara(response);
		this.sortTeam = response["team"] as int;
		this.sortKind = response["refbook"] as int;
		this.sortDate = new Date(response["date"] as string);
		this.partner = response["partner"] as boolean;
		this.favorite = response["favorite"] as int;
		this._commonConstructor();
	}
	// コピーコンストラクタ
	function constructor(copy : PartsButtonDataChara){
		super(copy.x, copy.y, 180, 60, true);
		this.data = copy.data;
		this.sortTeam = copy.sortTeam;
		this.sortKind = copy.sortKind;
		this.sortDate = copy.sortDate;
		this.partner = copy.partner;
		this.favorite = copy.favorite;
		this._commonConstructor();
	}
	// データ無しコンストラクタ
	function constructor(x : int, y : int){super(x, y, 180, 60, true);}
	// コンストラクタ共通処理
	function _commonConstructor() : void{
		this.faceBtn = new PartsButton(0, 0, 50, 50, true);
		this.children = [this.faceBtn];
		// ラベル作成
		this._labList["name"] = new PartsLabel(this.data.name, 60, 5, 115, 20);
		this._labList["name"].setSize(16);
		this._labList["name"].setAlign("left");
		this._labList["level"] = new PartsLabel("Lv." + this.data.level, 60, 25, 50, 15);
		this._labList["level"].setSize(10);
		this._labList["level"].setAlign("left");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc(clickable : boolean) : void{
		if(this.faceBtn != null){
			this.faceBtn.x = this.x + 5;
			this.faceBtn.y = this.y + 5;
			this.faceBtn.basex = this.basex + 5;
			this.faceBtn.basey = this.basey + 5;
		}
		super.calc(clickable);
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		// 位置調整
		for(var name in this._labList){
			var lab = this._labList[name];
			lab.x = lab.basex + this.x;
			lab.y = lab.basey + this.y;
		}

		// 領域全体の描画
		Ctrl.sctx.fillStyle = this.active ? "#bbbbbb" : this.select ? "red" : "#eeeeee";
		Ctrl.sctx.fillRect(this.x, this.y, this.w, this.h);

		// データが無ければ以下の描画は行わない
		if(this.data == null){return;}

		// 顔アイコンの描画
		Ctrl.sctx.fillStyle = this.faceBtn.active ? "#999999" : "#ffffff";
		Ctrl.sctx.fillRect(this.x + 5, this.y + 5, 50, 50);
		Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + this.data.code], this.x + 5, this.y + 5, 50, 50);

		// アイテムアイコンの描画
		Ctrl.sctx.fillStyle = "#bbbbbb";
		Ctrl.sctx.fillRect(60 + this.x, 40 + this.y, 15, 15);
		Ctrl.sctx.fillRect(90 + this.x, 40 + this.y, 15, 15);

		// チームアイコン設定
		if(this.sortTeam > 0 && this.sortTeam != 65535){
			var img = Loader.imgs["img_system_character_team" + Math.floor(this.sortTeam / 128)];
			if(img != null){Ctrl.sctx.drawImage(img, this.x, this.y, 20, 20);}
		}

		// ロックアイコン設定
		var img = null;
		if(this.partner){img = Loader.imgs["img_system_character_partner"];}
		else if(this.favorite > 0){img = Loader.imgs["img_system_character_favorite" + this.favorite];}
		if(img != null){Ctrl.sctx.drawImage(img, 35 + this.x, 40 + this.y, 20, 20);}

		// ゲージの描画
		Ctrl.sctx.fillStyle = "white";
		Ctrl.sctx.fillRect(111 + this.x, 30 + this.y, 64, 10);
		Ctrl.sctx.fillRect(111 + this.x, 45 + this.y, 54, 10);
		Ctrl.sctx.fillStyle = "black";
		Ctrl.sctx.fillRect(113 + this.x, 32 + this.y, 60, 6);
		Ctrl.sctx.fillRect(113 + this.x, 47 + this.y, 50, 6);

		// ラベル描画
		for(var name in this._labList){this._labList[name].draw();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

