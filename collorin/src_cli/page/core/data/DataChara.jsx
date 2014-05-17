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

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, response : variant){
		super(response);
		this.boxBtn = new PartsButton(x, y, 180, 60, true);
		this.faceBtn = new PartsButton(x + 5, y + 5, 50, 50, true);
		this.boxBtn.children = [this.faceBtn as PartsButton];
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 領域全体の描画
		Ctrl.sctx.fillStyle = this.boxBtn.active ? "#bbbbbb" : "#eeeeee";
		Ctrl.sctx.fillRect(this.boxBtn.x, this.boxBtn.y, this.boxBtn.w, this.boxBtn.h);
		// 顔アイコンの描画
		Ctrl.sctx.fillStyle = this.faceBtn.active ? "#999999" : "#ffffff";
		Ctrl.sctx.fillRect(this.faceBtn.x, this.faceBtn.y, this.faceBtn.w, this.faceBtn.h);
		Ctrl.sctx.drawImage(Loader.imgs["img_chara_icon_" + this.code], this.faceBtn.x, this.faceBtn.y, this.faceBtn.w, this.faceBtn.h);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

