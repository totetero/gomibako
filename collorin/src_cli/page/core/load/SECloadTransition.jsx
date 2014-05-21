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

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ遷移演出カートリッジ
class SECloadTransition implements SerialEventCartridge{
	static const _actionMax = 10;
	static var invisiblePopup = false;
	static var invisibleHeaderCount = 0;

	var _prevPage : Page;
	var _nextPage : Page;
	var _nextCartridge : SerialEventCartridge;

	var _loading = true;
	var _action = 0;
	var _next : boolean;
	var _same : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(nextPage : Page, url : string, request : variant, callback : function(response:variant):void){
		// 前のページを記憶 Page継承クラスのinit関数でフレーム内にコンストラクタを呼び出す想定
		this._prevPage = Page.current;
		this._nextPage = nextPage;

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){this._prevPage = null;}

		if(this._prevPage != null){
			// 進行方向の確認
			var ddepth = this._nextPage.depth - this._prevPage.depth;
			if(this._prevPage.type != this._nextPage.type){ddepth = Math.floor(ddepth / 10);} // TODO 負の時想定外だった
			if(ddepth > 0){this._same = false; this._next = true;}
			if(ddepth < 0){this._same = false; this._next = false;}
			if(ddepth == 0){this._same = true; this._next = true;}
		}

		// ロード開始
		Loading.show();
		Loader.loadxhr(url, request, function(response : variant) : void{
			Loader.loadContents(response["contents"] as Map.<string>, function() : void{
				this._loading = false;
				callback(response);
				this._nextCartridge = this._nextPage.getSerialNext();
				this._nextCartridge.init();
				// ヘッダ無効化
				this._nextPage.header.setActive(false);
				Loading.hide();
			});
		});
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		if(!this._loading){
			if(this._prevPage == null || ++this._action >= SECloadTransition._actionMax){
				Sound.playBGM(this._nextPage.bgm);
				return false;
			}
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		if(this._action > 0){
			// ポップアップは遷移中描画しないので隠す
			SECloadTransition.invisiblePopup = true;
			// ヘッダはページと同時には遷移しないので一時的に隠す
			SECloadTransition.invisibleHeaderCount++;

			// コンテキスト設定関数
			var setCtx = function(ctx : CanvasRenderingContext2D, x : number) : void{
				ctx.save();
				ctx.translate(x, 0);
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(Ctrl.screen.w, 0);
				ctx.lineTo(Ctrl.screen.w, Ctrl.screen.h);
				ctx.lineTo(0, Ctrl.screen.h);
				ctx.closePath();
				ctx.clip();
			};

			// 遷移演出
			var num = this._action / SECloadTransition._actionMax;
			var x0 = 0;
			var x1 = 0;
			if(this._next){
				x1 = Ctrl.screen.w * (1 - num * num);
				if(this._same){x0 = Ctrl.screen.w * (0 - num * num);}

				setCtx(Ctrl.sctx, x0);
				setCtx(Ctrl.gctx, x0);
				this._prevPage.draw();
				Ctrl.sctx.restore();
				Ctrl.gctx.restore();

				setCtx(Ctrl.sctx, x1);
				setCtx(Ctrl.gctx, x1);
				this._nextCartridge.draw();
				Ctrl.sctx.restore();
				Ctrl.gctx.restore();
			}else{
				x0 = Ctrl.screen.w * (num * num);
				if(this._same){x1 = Ctrl.screen.w * (num * num - 1);}

				setCtx(Ctrl.sctx, x1);
				setCtx(Ctrl.gctx, x1);
				this._nextCartridge.draw();
				Ctrl.sctx.restore();
				Ctrl.gctx.restore();

				setCtx(Ctrl.sctx, x0);
				setCtx(Ctrl.gctx, x0);
				this._prevPage.draw();
				Ctrl.sctx.restore();
				Ctrl.gctx.restore();
			}

			// ポップアップ隠蔽フラグとりのぞき
			SECloadTransition.invisiblePopup = false;
			// ヘッダ描画
			SECloadTransition.invisibleHeaderCount--;
			this._nextPage.header.draw();
		}else{
			// ロード中
			if(this._prevPage != null){this._prevPage.draw();}
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		if(this._prevPage != null){this._prevPage.dispose();}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

