import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Util.jsx";

import "../page/PartsButton.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ページ用スクロールクラス
class PartsScroll{
	var containerDiv : HTMLDivElement;
	var scrollDiv : HTMLDivElement;
	var xbarDiv : HTMLDivElement;
	var ybarDiv : HTMLDivElement;
	var btnList : Map.<PartsButton>;
	var active : boolean;
	var inactive : boolean;
	var scrollx : number;
	var scrolly : number;
	var _speedx : number;
	var _speedy : number;
	var _mdn : boolean;
	var _prevmx : int;
	var _prevmy : int;
	var _tempsw : int;
	var _tempsh : int;
	var _tempscrollx : number;
	var _tempscrolly : number;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(containerDiv : HTMLDivElement, scrollDiv : HTMLDivElement, xbarDiv : HTMLDivElement, ybarDiv : HTMLDivElement){
		this.containerDiv = containerDiv;
		this.scrollDiv = scrollDiv;
		this.xbarDiv = xbarDiv;
		this.ybarDiv = ybarDiv;
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(clickable : boolean) : void{
		var cbox = this.containerDiv.getBoundingClientRect();
		var sbox = this.scrollDiv.getBoundingClientRect();

		// スクロール開始終了の確認
		var btnActive = false;
		if(this._mdn != Ctrl.mdn){
			this._mdn = Ctrl.mdn;
			if(this.inactive || !clickable){
				// スクロール無効状態
				this.active = false;
			}else if(this._mdn){
				var x0 = cbox.left - Ctrl.sx;
				var y0 = cbox.top - Ctrl.sy;
				var x1 = x0 + cbox.width;
				var y1 = y0 + cbox.height;
				this.active = (x0 < Ctrl.mx && Ctrl.mx < x1 && y0 < Ctrl.my && Ctrl.my < y1);
				this._prevmx = Ctrl.mx;
				this._prevmy = Ctrl.my;
			}else{
				this.active = false;
				btnActive = true;
			}
		}
		btnActive = btnActive || this.active;

		// スクロール処理
		if(this.active && Ctrl.mmv){
			this._speedx = Ctrl.mx - this._prevmx + this._speedx * 0.3;
			this._speedy = Ctrl.my - this._prevmy + this._speedy * 0.3;
			this.scrollx += Ctrl.mx - this._prevmx;
			this.scrolly += Ctrl.my - this._prevmy;
			this._prevmx = Ctrl.mx;
			this._prevmy = Ctrl.my;
		}else{
			this._speedx *= 0.8;
			this._speedy *= 0.8;
			this.scrollx += this._speedx;
			this.scrolly += this._speedy;
		}
		var maxx = sbox.width - cbox.width;
		var maxy = sbox.height - cbox.height;
		if(this.scrollx < -maxx){this.scrollx = -maxx;}
		if(this.scrolly < -maxy){this.scrolly = -maxy;}
		if(this.scrollx > 0){this.scrollx = 0;}
		if(this.scrolly > 0){this.scrolly = 0;}

		// スクロール内ボタン処理
		if(this.btnList != null){
			for(var name in this.btnList){
				this.btnList[name].calc(btnActive && !Ctrl.mmv);
			}
		}

		// スクロール描画
		var dx = Math.abs(this._tempscrollx - this.scrollx);
		var dy = Math.abs(this._tempscrolly - this.scrolly);
		if(dx > 0.5 || dy > 0.5){
			this._tempscrollx = this.scrollx;
			this._tempscrolly = this.scrolly;
			Util.cssTranslate(this.scrollDiv, this.scrollx, this.scrolly);
		}
		// スクロールバー描画
		if(dx > 0.5 || dy > 0.5 || this._tempsw != Ctrl.sw || this._tempsh != Ctrl.sh){
			this._tempsw = Ctrl.sw;
			this._tempsh = Ctrl.sh;
			if(this.xbarDiv != null){
				if(cbox.width < sbox.width){
					this.xbarDiv.style.left = (-this.scrollx * cbox.width / sbox.width) + "px";
					this.xbarDiv.style.width = (cbox.width * cbox.width / sbox.width) + "px";
				}else{
					this.xbarDiv.style.width = "0px";
				}
			}
			if(this.ybarDiv != null){
				if(cbox.height < sbox.height){
					this.ybarDiv.style.top = (-this.scrolly * cbox.height / sbox.height) + "px";
					this.ybarDiv.style.height = (cbox.height * cbox.height / sbox.height) + "px";
				}else{
					this.ybarDiv.style.height = "0px";
				}
			}
		}


		// 押下描画
		var isActive = this.containerDiv.className.indexOf(" active") >= 0;
		if(this.active && !isActive){this.containerDiv.className += " active";}
		else if(!this.active && isActive){this.containerDiv.className = this.containerDiv.className.replace(/ active/g , "");}
		// 無効化描画
		var isInactive = this.containerDiv.className.indexOf(" inactive") >= 0;
		if(this.inactive && !isInactive){this.containerDiv.className += " inactive";}
		else if(!this.inactive && isInactive){this.containerDiv.className = this.containerDiv.className.replace(/ inactive/g , "");}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

