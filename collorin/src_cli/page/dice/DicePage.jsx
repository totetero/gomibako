import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../page/Page.jsx";
import "../page/Transition.jsx";

import "DiceCanvas.jsx";

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
			this.parallelPush(new PECopenLctrl(true));
			this.parallelPush(new PECopenRctrl("ほげ", "", "", ""));
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
	var _player : DiceCharacter;

	var _tappedCharacter : int = -1;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage){
		this._page = page;
		this._player = this._page.ccvs.member[0];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		this._page.ccvs.trigger_mup = false;
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス座標回転と押下確認
		ccvs.calcTouchCoordinate(true);
		ccvs.calcTouchRotate();
		ccvs.calcRotate(ccvs.rotv, Math.PI / 180 * 30, 2.5);

		// キャラクター計算
		if(Ctrl.kup || Ctrl.kdn || Ctrl.krt || Ctrl.klt){this._player.dstList.length = 0;}
		if(this._player.dstList.length > 0){
			this._player.calc(ccvs);
		}else{
			this._player.action++;
			if     (Ctrl.krt && Ctrl.kup){this._player.r = Math.PI * 1.74 - ccvs.rotv;}
			else if(Ctrl.klt && Ctrl.kup){this._player.r = Math.PI * 1.26 - ccvs.rotv;}
			else if(Ctrl.klt && Ctrl.kdn){this._player.r = Math.PI * 0.74 - ccvs.rotv;}
			else if(Ctrl.krt && Ctrl.kdn){this._player.r = Math.PI * 0.26 - ccvs.rotv;}
			else if(Ctrl.krt){this._player.r = Math.PI * 0.00 - ccvs.rotv;}
			else if(Ctrl.kup){this._player.r = Math.PI * 1.50 - ccvs.rotv;}
			else if(Ctrl.klt){this._player.r = Math.PI * 1.00 - ccvs.rotv;}
			else if(Ctrl.kdn){this._player.r = Math.PI * 0.50 - ccvs.rotv;}
			else{this._player.action = 0;}
			if(this._player.action > 0){
				var speed = 3;
				this._player.x += speed * Math.cos(this._player.r);
				this._player.y += speed * Math.sin(this._player.r);
				this._player.motion = "walk";
			}else{
				this._player.motion = "stand";
			}
		}

		// カメラ位置をプレイヤーに
		ccvs.cx = this._player.x;
		ccvs.cy = this._player.y;

		// キャラクターフィールド押下確認
		if(ccvs.trigger_mup){
			ccvs.trigger_mup = false;
			if(!Ctrl.mmv){
				if(this._tappedCharacter < 0){
					// フィールド押下による移動
					var hex = ccvs.field.getHexFromCoordinate(ccvs.tx, ccvs.ty);
					this._player.dstList.push([hex.x, hex.y]);
				}else{
					// キャラクター押下
					log "chara " + this._tappedCharacter;
				}
			}
		}

		// キャラクタータップ確認
		if(ccvs.mdn && !Ctrl.mmv){
			var index = -1;
			var depth = 0;
			for(var i = 0; i < ccvs.member.length; i++){
				var cdepth = ccvs.member[i].getDepth();
				if((index < 0 || depth < cdepth) && ccvs.member[i].isOver(ccvs.mx, ccvs.my)){
					depth = cdepth;
					this._tappedCharacter = index = i;
				}
			}
		}else{
			this._tappedCharacter = -1;
		}

		// キャラクター描画設定
		for(var i = 0; i < ccvs.member.length; i++){ccvs.member[i].setColor((this._tappedCharacter == i) ? "rgba(255, 255, 255, 0.5)" : "");}
		// フィールド描画設定
		ccvs.tapped = (ccvs.mdn && !Ctrl.mmv && this._tappedCharacter < 0);

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

