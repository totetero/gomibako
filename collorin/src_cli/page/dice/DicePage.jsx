import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

import "DiceCanvas.jsx";
import "SECdiceThrow.jsx";
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
			page.serialPush(new SECdiceTest(page));
		});
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceTest extends EventCartridge{
	var _page : DicePage;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
		this._page.ccvs.player = this._page.ccvs.member[0][0];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// トリガーリセット
		Ctrl.trigger_zb = false;
		Ctrl.trigger_cb = false;
		Ctrl.trigger_sb = false;
		this._page.ccvs.trigger_mup = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(true));
		this._page.parallelPush(new PECopenRctrl("さいころ", "", "マップ", "メニュー"));
		this._page.parallelPush(new PECopenCharacter("", 0));
		return false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, 0, function() : void{
			// フィールド押下による移動
			var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			ccvs.player.dstList.push([hex.x, hex.y]);
		}, function() : void{
			// キャラクター押下
			log ccvs.member[ccvs.tappedType][ccvs.tappedCharacter];
		});

		// キャラクター計算
		if(Ctrl.kup || Ctrl.kdn || Ctrl.krt || Ctrl.klt){ccvs.player.dstList.length = 0;}
		if(ccvs.player.dstList.length == 0){
			ccvs.player.action++;
			if     (Ctrl.krt && Ctrl.kup){ccvs.player.r = Math.PI * 1.74 - ccvs.rotv;}
			else if(Ctrl.klt && Ctrl.kup){ccvs.player.r = Math.PI * 1.26 - ccvs.rotv;}
			else if(Ctrl.klt && Ctrl.kdn){ccvs.player.r = Math.PI * 0.74 - ccvs.rotv;}
			else if(Ctrl.krt && Ctrl.kdn){ccvs.player.r = Math.PI * 0.26 - ccvs.rotv;}
			else if(Ctrl.krt){ccvs.player.r = Math.PI * 0.00 - ccvs.rotv;}
			else if(Ctrl.kup){ccvs.player.r = Math.PI * 1.50 - ccvs.rotv;}
			else if(Ctrl.klt){ccvs.player.r = Math.PI * 1.00 - ccvs.rotv;}
			else if(Ctrl.kdn){ccvs.player.r = Math.PI * 0.50 - ccvs.rotv;}
			else{ccvs.player.action = 0;}
			if(ccvs.player.action > 0){
				var speed = 3;
				ccvs.player.x += speed * Math.cos(ccvs.player.r);
				ccvs.player.y += speed * Math.sin(ccvs.player.r);
				ccvs.player.motion = "walk";
			}else{
				ccvs.player.motion = "stand";
			}
		}

		// さいころボタン
		if(Ctrl.trigger_zb){
			this._page.serialPush(new SECdiceRoll(this._page));
			exist = false;
		}

		// もどるボタン
		if(Ctrl.trigger_cb){
			this._page.serialPush(new SECdiceMap(this._page, this));
			exist = false;
		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

