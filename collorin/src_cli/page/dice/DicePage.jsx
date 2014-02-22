import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

import "DiceCanvas.jsx";
import "SECdiceThrow.jsx";
import "SECdiceCommand.jsx";
import "SECdiceMap.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくページクラス
class DicePage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
	""";

	// キャンバス
	var ccvs : DiceCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "すごろく";
		this.depth = 3;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page dice";
		this.div.innerHTML = this._htmlTag;
		// キャンバス
		this.ccvs = new DiceCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// イベント設定
		this.serialPush(new SECloadDice(this, {"stage": "test"}));
		this.serialPush(new ECone(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 0));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくページ情報読み込み
class SECloadDice extends SECloadPage{
	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, request : variant){
		super("/dice", request, function(response : variant) : void{
			// データの形成
			page.ccvs.init(response);
			page.serialPush(new SECdiceCommand(page));
		});
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

