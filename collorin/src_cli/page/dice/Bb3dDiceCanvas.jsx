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
import "../../bb3d/Bb3dDice.jsx";
import "../../bb3d/Bb3dDrawUnit.jsx";
import "../../bb3d/Bb3dDrawCharacter.jsx";
import "../../bb3d/Bb3dDrawEffect.jsx";
import "Bb3dDiceField.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dDiceCanvas extends Bb3dCanvasFullscreen{
	var field : Bb3dDiceField;
	var member = {} : Map.<Bb3dDiceCharacter>;
	var dices = new Bb3dDice[];
	var effect = new Bb3dDrawEffect[];
	var clist = new Bb3dDrawUnit[];
	var slist = new Bb3dDrawUnit[];

	// カメラ設定
	var isMapMode : boolean;
	var cameraLock : boolean;
	var cameraScale : number;
	var cameraCenter : Bb3dDiceCharacter[];
	// キャラクタの押下
	var isTapChara : boolean;
	var _tappedChara : Bb3dDiceCharacter;
	var charaTrigger : Bb3dDiceCharacter;
	// フィールドの押下
	var isTapHex : boolean;
	var _hexTapped : boolean;
	var hexTrigger : Bb3dDiceFieldCell;
	// マスクカラー
	var _maskColor = "";
	// 背景
	var _bgimg : HTMLImageElement;
	var _bgaction = 0;
	// 設定
	var isFastForward : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(Math.PI / 180 * 30, Math.PI / 180 * 45, 1);
		this.setting();

		// フィールド
		this.field = new Bb3dDiceField(this, response["hex"] as Bb3dDiceFieldCell[]);

		// キャラクター
		var charaInfoList = response["charaInfo"] as Map.<variant>;
		for(var id in charaInfoList){
			this.member[id] = new Bb3dDiceCharacter(this, charaInfoList[id]);
		}

		// 初期カメラ位置
		var hexx = response["camera"][0] as int;
		var hexy = response["camera"][1] as int;
		this.cx = this.calcx = this.field.calcHexCoordx(hexx, hexy);
		this.cy = this.calcy = this.field.calcHexCoordy(hexx, hexy);

		// 背景
		this._bgimg = Loader.imgs["img_background_" + response["background"] as string];
	}

	// ----------------------------------------------------------------
	// 設定
	function setting() : void{
		this.isFastForward = (dom.window.localStorage.getItem("setting_transition") == "off");
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// キャンバス計算
		this.calcBasicSize();
		this.calcTouchCoordinate();
		if(this.isMapMode){
			if(!this.cameraLock){this.calcTouchMove();}
			this.calcRotv(0, 0.2);
			this.calcRoth(Math.PI / 180 * 90, 0.1);
			this.cx -= (this.cx - this.calcx) * 0.5;
			this.cy -= (this.cy - this.calcy) * 0.5;
		}else{
			if(!this.cameraLock){this.calcTouchRotate();}
			this.calcRotv(this.calcrotv, 0.2);
			this.calcRoth(Math.PI / 180 * 30, 0.1);
			this.cx -= (this.cx - this.calcx) * 0.2;
			this.cy -= (this.cy - this.calcy) * 0.2;
		}
		this.scale -= (this.scale - this.cameraScale) * 0.1;

		// キャラクター計算
		for(var id in this.member){
			this.member[id].calc(this);
			if(!this.member[id].exist){delete this.member[id];}
		}

		// エフェクト計算
		for(var i = 0; i < this.effect.length; i++){
			this.effect[i].calc();
			if(!this.effect[i].exist){this.effect.splice(i--, 1);}
		}

		// カメラ位置を中心キャラクター位置にもってくる
		if(!this.isMapMode && this.cameraCenter != null && this.cameraCenter.length > 0){
			var cx = 0;
			var cy = 0;
			for(var i = 0; i < this.cameraCenter.length; i++){
				cx += this.cameraCenter[i].x;
				cy += this.cameraCenter[i].y;
			}
			this.calcx = cx / this.cameraCenter.length;
			this.calcy = cy / this.cameraCenter.length;
		}

		// キャラクタータップ完了確認
		if(!Ctrl.stdn && this._tappedChara != null){this.charaTrigger = this._tappedChara;}
		// キャラクタータップ中確認
		this._tappedChara = null;
		if(Ctrl.stdn && !Ctrl.stmv && !this.cameraLock && this.isTapChara){
			var depth0 = 0;
			for(var id in this.member){
				var side = this.member[id].side;
				if(side != "player" && side != "enemy"){continue;}
				var depth1 = this.member[id].getDepth();
				if((this._tappedChara == null || depth0 < depth1) && this.member[id].isOver(Ctrl.stx, Ctrl.sty)){
					depth0 = depth1;
					this._tappedChara = this.member[id];
				}
			}
		}

		// フィールドタップ完了確認
		if(!Ctrl.stdn && this._hexTapped){this.hexTrigger = this.field.getHexFromCoordinate(this.tx, this.ty);}
		// フィールドタップ中確認
		this._hexTapped = (Ctrl.stdn && !Ctrl.stmv && !this.cameraLock && this.isTapHex && this._tappedChara == null);
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var id in this.member){this.member[id].preDraw(this);}
		for(var i = 0; i < this.effect.length; i++){
			var effect = this.effect[i];
			effect.preDraw(this, effect.x - this.cx, effect.y - this.cy, effect.z);
		}

		// キャラクタータップ色設定
		if(this._maskColor == ""){
			for(var id in this.member){
				this.member[id].setColor((this._tappedChara == this.member[id]) ? "rgba(255, 255, 255, 0.5)" : "");
			}
		}

		// 背景描画
		this._drawBackground();
		// 地面描画
		this.field.draw(this, this.cx, this.cy, this._hexTapped);
		// 影描画
		Bb3dDrawUnit.drawList(this, this.slist);
		// 画面を暗くする
		if(this._maskColor != ""){
			Ctrl.gctx.fillStyle = this._maskColor;
			Ctrl.gctx.fillRect(0, 0, Ctrl.screen.w, Ctrl.screen.h);
		}
		// キャラクター描画
		Bb3dDrawUnit.drawList(this, this.clist);
		// さいころ描画
		for(var i = 0; i < this.dices.length; i++){this.dices[i].draw(this);}
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
			this._hexTapped = false;
		}
	}

	// ----------------------------------------------------------------
	// マスクカラー設定
	function setMaskColor(color : string) : void{
		if(this._maskColor == color){return;}
		this._maskColor = color;
		for(var id in this.member){
			this.member[id].setColor(color);
		}
	}

	// ----------------------------------------------------------------
	// エフェクト追加
	function pushEffect(effect : Bb3dDrawEffect) : void{
		this.effect.push(effect);
		this.clist.push(effect);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

