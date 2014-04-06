import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";
import "../core/Page.jsx";
import "../core/Transition.jsx";
import "../core/SECload.jsx";

import "DiceCanvas.jsx";
import "SECdiceCommand.jsx";
import "SECdiceMoveAuto.jsx";
import "SECdiceMoveManual.jsx";
import "SECdiceFace.jsx";
import "SECdiceBeam.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくページクラス
class DicePage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<canvas></canvas>
		<div class="status player">
			<div class="icon"></div>
			<div class="gauge hp"><div class="param under"></div><div class="param over"></div><div class="wrap"></div></div>
			<div class="gauge sp"><div class="param under"></div><div class="param over"></div><div class="wrap"></div></div>
		</div>
		<div class="status enemy">
			<div class="icon"></div>
			<div class="gauge hp"><div class="param under"></div><div class="param over"></div><div class="wrap"></div></div>
			<div class="gauge sp"><div class="param under"></div><div class="param over"></div><div class="wrap"></div></div>
		</div>
		<div class="message"></div>
	""";

	// キャンバス
	var ccvs : DiceCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "dice";
		this.depth = 21;
		this.bgm = "test02";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page dice";
		this.div.innerHTML = DicePage._htmlTag;
		// 敵ステータスアイコン反転
		Util.cssTransform(this.div.getElementsByClassName("status enemy").item(0).getElementsByClassName("icon").item(0) as HTMLDivElement, "scaleX(-1)");
		// キャンバス
		this.ccvs = new DiceCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// イベント設定
		this.serialPush(new SECload("/dice", {"type": "entry"}, function(response : variant) : void{
			// ロード完了 データの形成
			this.parse(response["list"] as variant[]);
		}));
		this.serialPush(new ECone(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
			// コントローラー展開
			this.parallelPush(new PECopenHeader("", 0));
			this.parallelPush(new PECopenLctrl(false));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
		}));
		this.serialPush(new SECtransitionsPage(this));
	}

	// ----------------------------------------------------------------
	// ロードしたデータの解析
	function parse(list : variant[]) : variant{
		var response : variant = null;
		for(var i = 0; i < list.length; i++){
			switch(list[i]["type"] as string){
				case "entry": this.ccvs.init(list[i]); break;
				case "command": this.serialPush(new SECdiceCommand(this, list[i])); break;
				case "dice": response = list[i]; break;
				case "face": this.serialPush(new SECdiceFace(this, list[i])); break;
				case "beam": this.serialPush(new SECdiceBeam(this, list[i])); break;
				case "moveAuto": this.serialPush(new SECdiceMoveAuto(this, list[i])); break;
				case "moveManual": this.serialPush(new SECdiceMoveManual(this, list[i])); break;
			}
		}
		return response;
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

