import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../core/Page.jsx";
import "../core/sec/SECloadTransition.jsx";

import "Bb3dDiceCanvas.jsx";
import "CrossDiceGauge.jsx";
import "SECdiceCommand.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// すごろくページ
class PageDice extends Page{
	var bcvs : Bb3dDiceCanvas;
	var gauge = new CrossDiceGauge();

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
		// ロードと画面遷移
		this.serialPush(new SECloadTransition(this, "/dice", {"type": "entry"}, function(response : variant) : void{
			// ヘッダ設定
			this.header.setType("", "");
			// ロードしたデータの解析
			this.parse(response["list"] as variant[]);
		}));
	}

	// ----------------------------------------------------------------
	// クロス要素の描画 最初に行うほう
	function drawBeforeCross() : void{
		// 画面クリア
		Ctrl.sctx.clearRect(0, 0, Ctrl.sw, Ctrl.sh);
		// ゲージ描画
		this.gauge.draw();
	}

	// ----------------------------------------------------------------
	// クロス要素の描画 最後に行うほう
	function drawAfterCross() : void{
		// ヘッダ描画
		this.header.draw();
		// キャンバス描画
		this.bcvs.draw();
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this.bcvs != null){this.bcvs.calc();}
		this.gauge.calc();
		return super.calc();
	}

	// ----------------------------------------------------------------
	// ロードしたデータの解析
	function parse(list : variant[]) : variant{
		var response : variant = null;
		for(var i = 0; i < list.length; i++){
			switch(list[i]["type"] as string){
				case "entry": this.bcvs = new Bb3dDiceCanvas(list[i]); break;
				case "command": this.serialPush(new SECdiceCommand(this, list[i])); break;
//				case "dice": response = list[i]; break;
//				case "face": this.serialPush(new SECdiceFace(this, list[i])); break;
//				case "beam": this.serialPush(new SECdiceFaceBeam(this, list[i])); break;
//				case "moveAuto": this.serialPush(new SECdiceMoveAuto(this, list[i])); break;
//				case "moveManual": this.serialPush(new SECdiceMoveManual(this, list[i])); break;
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

