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

import "../../bb3d/Bb3dCanvas.jsx";
import "../../bb3d/Bb3dDrawUnit.jsx";
import "../../bb3d/Bb3dDrawCharacter.jsx";
import "Bb3dChatField.jsx";
import "Bb3dChatCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dChatCanvas extends Bb3dCanvasFullscreen{
	var field : Bb3dChatField;
	var player : Bb3dChatCharacter;
	var member = new Bb3dChatCharacter[];
	var clist = new Bb3dDrawUnit[];
	var slist = new Bb3dDrawUnit[];

	// カメラ設定
	var cameraLock : boolean;
	// キャラクタの押下
	var isTapChara : boolean;
	var _tappedChara : Bb3dChatCharacter;
	var charaTrigger : Bb3dChatCharacter;
	// フィールドの押下
	var isTapGrid : boolean;
	var _gridTapped : boolean;
	var gridTrigger : int[];
	// 背景
	var _bgimg : HTMLImageElement;
	var _bgaction = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(Math.PI / 180 * 45, Math.PI / 180 * 45, 2);

		// フィールド
		this.field = new Bb3dChatField(this, Loader.imgs["img_grid"], response["grid"] as int[][]);

		// 初期カメラ位置
		this.cx = this.calcx = (this.cxmax + this.cxmin) * 0.5;
		this.cy = this.calcy = (this.cymax + this.cymin) * 0.5;

		// 背景
		this._bgimg = Loader.imgs["img_background_" + response["background"] as string];
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// キャンバス計算
		this.calcTouchCoordinate();
		if(!this.cameraLock){this.calcTouchRotate();}
		this.calcRotv(this.calcrotv, 0.2);
		this.calcRoth(Math.PI / 180 * 30, 0.1);
		this.cx -= (this.cx - this.calcx) * 0.2;
		this.cy -= (this.cy - this.calcy) * 0.2;
		this.scale -= (this.scale - 1) * 0.1;

		// キャラクター計算
		for(var i = 0; i < this.member.length; i++){
			this.member[i].calc(this);
			if(!this.member[i].exist){this.member.splice(i--,1);}
		}

		if(this.player != null){
			// カメラ位置をプレイヤーに
			this.calcx = this.player.x;
			this.calcy = this.player.y;
		}

		// キャラクタータップ完了確認
		if(!Ctrl.stdn && this._tappedChara != null){this.charaTrigger = this._tappedChara;}
		// キャラクタータップ中確認
		this._tappedChara = null;
		if(Ctrl.stdn && !Ctrl.stmv && !this.cameraLock && this.isTapChara){
			var depth0 = 0;
			for(var id in this.member){
				var depth1 = this.member[id].getDepth();
				if((this._tappedChara == null || depth0 < depth1) && this.member[id].isOver(Ctrl.stx, Ctrl.sty)){
					depth0 = depth1;
					this._tappedChara = this.member[id];
				}
			}
		}

		// フィールドタップ完了確認
		if(!Ctrl.stdn && this._gridTapped){this.gridTrigger = [Math.floor(this.tx / 16) as int, Math.floor(this.ty / 16) as int];}
		// フィールドタップ中確認
		this._gridTapped = (Ctrl.stdn && !Ctrl.stmv && !this.cameraLock && this.isTapGrid && this._tappedChara == null);
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var id in this.member){this.member[id].preDraw(this);}

		// キャラクタータップ色設定
		for(var id in this.member){
			this.member[id].setColor((this._tappedChara == this.member[id]) ? "rgba(255, 255, 255, 0.5)" : "");
		}

		// 背景描画
		this._drawBackground();
		// 地面描画
		this.field.draw(this, this.cx, this.cy, this._gridTapped);
		// 影描画
		Bb3dDrawUnit.drawList(this, this.slist);
		// キャラクター描画
		Bb3dDrawUnit.drawList(this, this.clist);
	}

	// ----------------------------------------------------------------
	// 背景描画
	function _drawBackground() : void{
		if(this._bgimg == null){return;}
		var dw = this._bgimg.width * 480 / this._bgimg.height;
		var dx = -(this._bgaction++ % dw);
		var sh = this._bgimg.height * Ctrl.screen.h / 480;
		var sy = (this._bgimg.height - sh) * 0.5;
		while(dx < Ctrl.screen.w){
			Ctrl.gctx.drawImage(this._bgimg, 0, sy, this._bgimg.width, sh, dx, 0, dw, Ctrl.screen.h);
			dx += dw;
		}
	}

	// ----------------------------------------------------------------
	// キャンバスへの影響を考慮したボタン計算
	function calcButton(btnList : Map.<PartsButton>) : void{
		this.cameraLock = false;
		for(var name in btnList){
			var btn = btnList[name];
			btn.calc(true);
			this.cameraLock = this.cameraLock || btn.active || btn.target;
		}
		if(this.cameraLock){
			this._tappedChara = null;
			this._gridTapped = false;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

