import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "../../bb3d/Bb3dCanvas.jsx";
import "../../bb3d/Bb3dDrawUnit.jsx";
import "../../bb3d/Bb3dDrawCharacter.jsx";

import "Bb3dDiceField.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報管理
class Bb3dDiceCanvas extends Bb3dCanvasFullscreen{
	var field : Bb3dDiceField;
	var member = {} : Map.<Bb3dDiceCharacter>;
	var center : Bb3dDiceCharacter[];
	var clist = new Bb3dDrawUnit[];
	var slist = new Bb3dDrawUnit[];

	// キャラクタの押下
	var _tappedChara : Bb3dDiceCharacter;
	var charaTrigger : Bb3dDiceCharacter;
	// フィールドの押下
	var _hexTapped : boolean;
	var hexTrigger : Bb3dDiceFieldCell;
	// マスクカラー
	var _maskColor = "";
	// 背景
	var _bgimg : HTMLImageElement;
	var _bgaction = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(response : variant){
		super(Math.PI / 180 * 30, Math.PI / 180 * 45, 1);

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
	// 計算
	function calc() : void{
		// キャンバス計算
		this.calcTouchCoordinate();
		this.calcTouchRotate();
		this.calcRotv(this.calcrotv, 0.2);
		this.calcRoth(Math.PI / 180 * 30, 0.1);
		this.scale -= (this.scale - 1.0) * 0.1;
		this.cx -= (this.cx - this.calcx) * 0.2;
		this.cy -= (this.cy - this.calcy) * 0.2;

		// キャラクター計算
		for(var id in this.member){
			this.member[id].calc(this);
			if(!this.member[id].exist){delete this.member[id];}
		}

		if(this.center != null && this.center.length > 0){
			// カメラ位置
			var cx = 0;
			var cy = 0;
			for(var i = 0; i < this.center.length; i++){
				cx += this.center[i].x;
				cy += this.center[i].y;
			}
			this.calcx = cx / this.center.length;
			this.calcy = cy / this.center.length;
		}

		// キャラクタータップ完了確認
		if(!Ctrl.ctdn && this._tappedChara != null){this.charaTrigger = this._tappedChara;}
		// キャラクタータップ中確認
		this._tappedChara = null;
		if(Ctrl.ctdn && !Ctrl.ctmv){
			var depth0 = 0;
			for(var id in this.member){
				var side = this.member[id].side;
				if(side != "player" && side != "enemy"){continue;}
				var depth1 = this.member[id].getDepth();
				if((this._tappedChara == null || depth0 < depth1) && this.member[id].isOver(Ctrl.ctx, Ctrl.cty)){
					depth0 = depth1;
					this._tappedChara = this.member[id];
				}
			}
		}

		// フィールドタップ完了確認
		if(!Ctrl.ctdn && this._hexTapped){this.hexTrigger = this.field.getHexFromCoordinate(this.tx, this.ty);}
		// フィールドタップ中確認
		this._hexTapped = (Ctrl.ctdn && !Ctrl.ctmv && this._tappedChara == null);

		// キャラクター描画設定
		if(this._maskColor == ""){
			for(var id in this.member){
				this.member[id].setColor((this._tappedChara == this.member[id]) ? "rgba(255, 255, 255, 0.5)" : "");
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		for(var id in this.member){this.member[id].preDraw(this);}

		// 背景描画
		this._drawBackground();
		// 地面描画
		this.field.draw(this, this.cx, this.cy, this._hexTapped);
		// 影描画
		Bb3dDrawUnit.drawList(this, this.slist);
		// 画面を暗くする
		if(this._maskColor != ""){
			Ctrl.gctx.fillStyle = this._maskColor;
			Ctrl.gctx.fillRect(0, 0, Ctrl.sw, Ctrl.sh);
		}
		// キャラクター描画
		Bb3dDrawUnit.drawList(this, this.clist);
	}

	// ----------------------------------------------------------------
	// 背景描画
	function _drawBackground() : void{
		if(this._bgimg == null){return;}
		var dw = this._bgimg.width * 480 / this._bgimg.height;
		var dx = -(this._bgaction++ % dw);
		var sh = this._bgimg.height * Ctrl.sh / 480;
		var sy = (this._bgimg.height - sh) * 0.5;
		while(dx < Ctrl.sw){
			Ctrl.gctx.drawImage(this._bgimg, 0, sy, this._bgimg.width, sh, dx, 0, dw, Ctrl.sh);
			dx += dw;
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
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

