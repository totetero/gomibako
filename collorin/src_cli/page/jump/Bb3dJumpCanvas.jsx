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
import "Bb3dJumpCharacter.jsx";
import "Bb3dJumpFoothold.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dJumpCanvas extends Bb3dCanvas{
	var player : Bb3dJumpCharacter;
	var foothold : Bb3dJumpFoothold;
	var member = new Bb3dJumpCharacter[];
	var clist = new Bb3dDrawUnit[];

	// ゲーム座標カメラ位置
	var cx : number;
	var cy : number;
	var calcx : number;
	var calcy : number;

	// カメラ設定
	var cameraLock : boolean;
	var cameraScale : number;
	// キャラクタの押下
	var isTapChara : boolean;
	var _tappedChara : Bb3dJumpCharacter;
	var charaTrigger : Bb3dJumpCharacter;
	// 背景
	var _bgimg : HTMLImageElement;
	var _bgaction = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(0, Math.PI / 180 * 30, 2);
		this.cameraScale = 1.5;

		// 初期カメラ位置
		this.cx = this.calcx = 0;
		this.cy = this.calcy = 0;

		// 背景
		this._bgimg = Loader.imgs["img_background_" + response["background"] as string];

		// テストキャラクタ
		if(Loader.imgs["img_chara_dot_player1"] != null){
			this.member.push(new Bb3dJumpCharacter(this, {
				"code": "player1", 
				"name": "プレイヤー",
				"motion": "human", 
				"side": "player", 
				"size": 1.2, 
			}));
		}

		// テスト足場
		this.foothold = new Bb3dJumpFoothold(this);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// キャンバス計算
		this.w = Ctrl.screen.w;
		this.h = Ctrl.screen.h;
		this.centerx = this.w * 0.5;
		this.centery = this.h - (6 + 66 * (Ctrl.screen.h - Ctrl.shmin) / (Ctrl.shmax - Ctrl.shmin));
		this.cx -= (this.cx - this.calcx) * 0.2;
		this.cy -= (this.cy - this.calcy) * 0.2;
		this.scale -= (this.scale - this.cameraScale) * 0.1;

		// キャラクター計算
		for(var i = 0; i < this.member.length; i++){
			this.member[i].calc(this);
			if(!this.member[i].exist){this.member.splice(i--,1);}
		}

		// 足場計算テスト
		this.foothold.calc(this);

//		if(this.player != null){
//			// カメラ位置をプレイヤーに
//			this.calcx = this.player.x;
//			this.calcz = this.player.z;
//		}

		// キャラクタータップ完了確認
		if(!Ctrl.stdn && this._tappedChara != null){this.charaTrigger = this._tappedChara;}
		// キャラクタータップ中確認
		this._tappedChara = null;
		if(Ctrl.stdn && !Ctrl.stmv && !this.cameraLock && this.isTapChara){
			var depth0 = 0;
			for(var i = 0; i < this.member.length; i++){
				var depth1 = this.member[i].getDepth();
				if((this._tappedChara == null || depth0 < depth1) && this.member[i].isOver(Ctrl.stx, Ctrl.sty)){
					depth0 = depth1;
					this._tappedChara = this.member[i];
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}
		// キャラクタータップ色設定
		for(var i = 0; i < this.member.length; i++){this.member[i].setColor((this._tappedChara == this.member[i]) ? "rgba(255, 255, 255, 0.5)" : "");}

		// 背景描画
		this._drawBackground();
		// 足場描画テスト
		this.foothold.draw(this);
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
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

