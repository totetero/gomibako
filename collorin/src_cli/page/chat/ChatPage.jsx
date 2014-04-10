import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../core/Page.jsx";
import "../core/Transition.jsx";
import "../core/SECload.jsx";

import "ChatCanvas.jsx";
import "ChatSocket.jsx";
import "SECchatMain.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チャットページクラス
class ChatPage extends Page{
	// HTMLタグ
	static const _htmlTag = """
		<canvas></canvas>
		<div class="core-btn send">送信</div>
		<div class="core-btn exit">退出</div>
	""";

	// チャットソケット
	var socket : ChatSocket;
	// キャンバス
	var ccvs : ChatCanvas;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// プロパティ設定
		this.type = "chat";
		this.depth = 21;
		this.bgm = "test02";
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// ページ要素作成
		this.div = dom.document.createElement("div") as HTMLDivElement;
		this.div.className = "page chat";
		this.div.innerHTML = ChatPage._htmlTag;
		// 入力リセット
		(Ctrl.sDiv.getElementsByTagName("input").item(0) as HTMLInputElement).value = "";
		// ソケット
		this.socket = new ChatSocket();
		// キャンバス
		this.ccvs = new ChatCanvas(this.div.getElementsByTagName("canvas").item(0) as HTMLCanvasElement);

		// イベント設定
		this.serialPush(new SECload("/chat", {"stage": "test"}, function(response : variant) : void{
			// ロード完了 データの形成
			this.ccvs.init(response);
			this.socket.init(this.ccvs);
		}));
		this.serialPush(new ECone(function() : void{
			// ページ遷移前描画
			this.ccvs.draw(false);
			// コントローラー展開
			this.parallelPush(new PECopenHeader("", 0));
			this.parallelPush(new PECopenRctrl("", "", "", ""));
			this.parallelPush(new PECopenCharacter("", ""));
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

