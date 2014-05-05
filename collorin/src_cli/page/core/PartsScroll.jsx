import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";

import "PartsLabel.jsx";
import "PartsButton.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用スクロールクラス
class PartsScroll{
	var basex : int;
	var basey : int;
	var x : int;
	var y : int;
	var cw : int;
	var ch : int;
	var sw : int;
	var sh : int;
	var labList = {} : Map.<PartsLabel>;
	var btnList = {} : Map.<PartsButton>;
	var active : boolean;
	var inactive : boolean;
	var scrollx : number;
	var scrolly : number;
	var barx : int;
	var bary : int;
	var barw : int;
	var barh : int;
	var _speedx : number;
	var _speedy : number;
	var _ctdn : boolean;
	var _prevctx : int;
	var _prevcty : int;
	var _clipx0 : int;
	var _clipy0 : int;
	var _clipx1 : int;
	var _clipy1 : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(x : int, y : int, cw : int, ch : int, sw : int, sh : int){
		this.basex = x;
		this.basey = y;
		this.x = this.basex;
		this.y = this.basey;
		// コンテナサイズ
		this.cw = cw;
		this.ch = ch;
		// スクローラサイズ
		this.sw = sw;
		this.sh = sh;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		// スクロール開始終了の確認
		var btnActive = false;
		if(this._ctdn != Ctrl.ctdn){
			this._ctdn = Ctrl.ctdn;
			if(this.inactive || !clickable){
				// スクロール無効状態
				this.active = false;
			}else if(this._ctdn){
				var x0 = this.x;
				var y0 = this.y;
				var x1 = x0 + this.cw;
				var y1 = y0 + this.ch;
				this.active = (x0 < Ctrl.ctx && Ctrl.ctx < x1 && y0 < Ctrl.cty && Ctrl.cty < y1);
				this._prevctx = Ctrl.ctx;
				this._prevcty = Ctrl.cty;
			}else{
				this.active = false;
				btnActive = true;
			}
		}
		btnActive = btnActive || this.active;

		// スクロール処理
		if(this.active && Ctrl.ctmv){
			this._speedx = Ctrl.ctx - this._prevctx + this._speedx * 0.3;
			this._speedy = Ctrl.cty - this._prevcty + this._speedy * 0.3;
			this.scrollx += Ctrl.ctx - this._prevctx;
			this.scrolly += Ctrl.cty - this._prevcty;
			this._prevctx = Ctrl.ctx;
			this._prevcty = Ctrl.cty;
		}else{
			this._speedx *= 0.8;
			this._speedy *= 0.8;
			this.scrollx += this._speedx;
			this.scrolly += this._speedy;
		}
		var maxx = this.sw - this.cw;
		var maxy = this.sh - this.ch;
		if(this.scrollx < -maxx){this.scrollx = -maxx;}
		if(this.scrolly < -maxy){this.scrolly = -maxy;}
		if(this.scrollx > 0){this.scrollx = 0;}
		if(this.scrolly > 0){this.scrolly = 0;}

		// スクロールバー描画情報
		this.barx = -this.scrollx * this.cw / this.sw;
		this.bary = -this.scrolly * this.ch / this.sh;
		this.barw = (this.cw < this.sw) ? (this.cw * this.cw / this.sw) : 0;
		this.barh = (this.ch < this.sh) ? (this.ch * this.ch / this.sh) : 0;

		// スクロール内ボタン計算用に位置確認
		for(var name in this.btnList){
			var btn = this.btnList[name];
			btn.x = btn.basex + this.x + this.scrollx;
			btn.y = btn.basey + this.y + this.scrolly;
		}
		// スクロール内ボタン計算
		for(var name in this.btnList){
			this.btnList[name].calc(btnActive && !Ctrl.ctmv);
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(drawContents : function():void, x : int, y : int, cw : int, ch : int) : void{
		Ctrl.sctx.save();
		// クリッピング 引数のcはクリッピングのc
		this._clipx0 = x;
		this._clipy0 = y;
		this._clipx1 = this._clipx0 + cw;
		this._clipy1 = this._clipy0 + ch;
		Ctrl.sctx.beginPath();
		Ctrl.sctx.moveTo(this._clipx0, this._clipy0);
		Ctrl.sctx.lineTo(this._clipx1, this._clipy0);
		Ctrl.sctx.lineTo(this._clipx1, this._clipy1);
		Ctrl.sctx.lineTo(this._clipx0, this._clipy1);
		Ctrl.sctx.closePath();
		Ctrl.sctx.clip();
		// ラベルの描画
		for(var name in this.labList){
			var lab = this.labList[name];
			lab.x = lab.basex + this.x + this.scrollx;
			lab.y = lab.basey + this.y + this.scrolly;
			if(this.isDrawClip(lab.basex, lab.basey, lab.w, lab.h)){lab.draw();}
		}
		// ボタンの描画
		for(var name in this.btnList){
			var btn = this.btnList[name];
			btn.x = btn.basex + this.x + this.scrollx;
			btn.y = btn.basey + this.y + this.scrolly;
			if(this.isDrawClip(btn.basex, btn.basey, btn.w, btn.h)){btn.draw();}
		}
		// その他要素の描画
		if(drawContents != null){
			Ctrl.sctx.save();
			Ctrl.sctx.translate((this.x + this.scrollx), (this.y + this.scrolly));
			drawContents();
			Ctrl.sctx.restore();
		}
		// スクロールバーの描画
		Ctrl.sctx.fillStyle = "rgba(0, 0, 0, 0.5)";
		if(this.barw > 0){Ctrl.sctx.fillRect(this.x + this.barx, this.y + this.ch - 3, this.barw, 3);}
		if(this.barh > 0){Ctrl.sctx.fillRect(this.x + this.cw - 3, this.y + this.bary, 3, this.barh);}
		Ctrl.sctx.restore();
	}
	// 描画関数のオーバーロード
	function draw() : void{this.draw(null, this.x, this.y, this.cw, this.ch);}
	function draw(drawContents : function():void) : void{this.draw(drawContents, this.x, this.y, this.cw, this.ch);}

	// ----------------------------------------------------------------
	// その他要素描画中の領域描画確認
	function isDrawClip(x : int, y : int, w : int, h : int) : boolean{
		var x0 = x + this.x + this.scrollx;
		var y0 = y + this.y + this.scrolly;
		var x1 = x0 + w;
		var y1 = y0 + h;
		return (x1 > this._clipx0 && x0 < this._clipx1 && y1 > this._clipy0 && y0 < this._clipy1);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

