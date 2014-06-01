import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../core/load/SECloadTransition.jsx";
import "Bb3dJumpCanvas.jsx";
//import "SocketJump.jsx";
import "SECjumpMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ジャンプページ
class PageJump extends Page{
	var bcvs : Bb3dJumpCanvas;
//	var socket : SocketJump;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "jump";
		this.depth = 21;
		this.bgm = "test02";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ロードと画面遷移
		this.serialPush(new SECloadTransition(this, "/jump", null, function(response : variant) : void{
			// クロス要素設定
			this.header.setType("", "");
			this.bust.set(null);
			// ソケット準備
			this.bcvs = new Bb3dJumpCanvas(response);
//			this.socket = new SocketJump();
			// カートリッジ装填
			this.serialPush(new SECjumpMain(this, response));
		}));
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(this.bcvs != null){this.bcvs.calc();}
//		if(this.socket != null){this.socket.calc(this.bcvs);}
		return super.calc();
	}

	// ----------------------------------------------------------------
	// クロス要素の描画 最初に行うほう
	function drawBeforeCross() : void{
		// 画面クリア
		Ctrl.sctx.clearRect(0, 0, Ctrl.screen.w, Ctrl.screen.h);
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
	// 破棄
	override function dispose() : void{
		super.dispose();
//		this.socket.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

