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

import "DataItem.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// アイテム情報表示ボタン
class PartsButtonDataItem extends PartsButton{
	// 並べ替え
	static function sort(list : PartsButtonDataItem[], type : string) : void{
		// TODO
	}

	// ----------------------------------------------------------------

	var data : DataItem;
	var iconBtn : PartsButton;
	var _labList = {} : Map.<PartsLabel>;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, response : variant){
		super(x, y, 180, 45, true);
		this.data = new DataItem(response);
		this._commonConstructor();
	}
	// コピーコンストラクタ
	function constructor(copy : PartsButtonDataItem){
		super(copy.x, copy.y, 180, 45, true);
		this.data = copy.data;
		this._commonConstructor();
	}
	// データ無しコンストラクタ
	function constructor(x : int, y : int){super(x, y, 180, 45, true);}
	// コンストラクタ共通処理
	function _commonConstructor() : void{
		this.iconBtn = new PartsButton(0, 0, 35, 35, true);
		this.children = [this.iconBtn];
		// ラベル作成
		this._labList["name"] = new PartsLabel(this.data.name, 45, 5, 130, 20);
		this._labList["name"].setSize(16);
		this._labList["name"].setAlign("left");
		this._labList["type"] = new PartsLabel("武器", 45, 25, 130, 15);
		this._labList["type"].setSize(10);
		this._labList["type"].setAlign("left");
		this._labList["level"] = new PartsLabel(this.data.num + "個", 45, 25, 130, 15);
		this._labList["level"].setSize(10);
		this._labList["level"].setAlign("right");
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc(clickable : boolean) : void{
		if(this.iconBtn != null){
			this.iconBtn.x = this.x + 5;
			this.iconBtn.y = this.y + 5;
			this.iconBtn.basex = this.basex + 5;
			this.iconBtn.basey = this.basey + 5;
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

		// アイコンの描画
		Ctrl.sctx.fillStyle = this.iconBtn.active ? "#999999" : "#ffffff";
		Ctrl.sctx.fillRect(this.x + 5, this.y + 5, 35, 35);
		//Ctrl.sctx.drawImage(Loader.imgs["img_item_icon_" + this.data.code], this.x + 5, this.y + 5, 50, 50);

		// ラベル描画
		var isInactive = (this.inactive && !this.active && !this.select);
		var color = isInactive ? "gray" : "black";
		this._labList["name"].setColor(color);
		this._labList["type"].setColor(color);
		this._labList["level"].setColor(color);
		for(var name in this._labList){this._labList[name].draw();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

