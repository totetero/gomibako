import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";
import "../page/SECload.jsx";

import "ChatCanvas.jsx";
import "ChatSocket.jsx";
import "SECchatMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページクラス
class ChatPage extends Page{
	// HTMLタグ
	var _htmlTag = """
		<canvas></canvas>
		<input type="text" maxlength="20">
		<div class="core-btn send">送信</div>
		<div class="core-btn exit">退出</div>
		<div class="core-popup"></div>
	""";

	// チャットソケット
	var socket : ChatSocket;
	// キャンバス
	var ccvs : ChatCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.name = "チャット";
		this.depth = 3;
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chat";
		this.div.innerHTML = this._htmlTag;
		// ソケット
		this.socket = new ChatSocket();
		// キャンバス
		this.ccvs = new ChatCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// ロード設定
		var loader = new SECload();
		loader.eventPlayer.serialPush(new ECloadInfo("/chat", {"stage": "test"}, function(response : variant) : void{
			loader.eventPlayer.serialPush(new ECloadImgs(response["imgs"] as Map.<string>));
			loader.eventPlayer.serialPush(new ECone(function() : void{
				// データの形成
				this.ccvs.init(response);
				this.socket.init(this.ccvs);
			}));
		}));
		// イベント設定
		this.serialPush(loader);
		this.serialPush(new ECone(function() : void{
			// ページ遷移前描画
			this.ccvs.draw();
			// コントローラー展開
			this.parallelPush(new PECopenHeader(this.name, 0));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", 0));
		}));
		this.serialPush(new SECtransitionsPage(this));
		this.serialPush(new SECchatMain(this));
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		super.dispose();
		this.socket.dispose();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

