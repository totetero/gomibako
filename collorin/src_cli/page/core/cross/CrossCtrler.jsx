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

// コントローラクラス ページをまたぐクロス要素
class CrossCtrler{
	static const _lActionMax = 10;
	static const _rActionMax = 5;

	// ボタン判定領域
	var _arrowBox : Ctrl.Box;
	var _zBox : Ctrl.Box;
	var _xBox : Ctrl.Box;
	var _cBox : Ctrl.Box;
	var _sBox : Ctrl.Box;
	// DOM要素
	var _lDiv : HTMLDivElement;
	var _rDiv : HTMLDivElement;
	var _upDiv : HTMLDivElement;
	var _dnDiv : HTMLDivElement;
	var _rtDiv : HTMLDivElement;
	var _ltDiv : HTMLDivElement;
	var _zbDiv : HTMLDivElement;
	var _xbDiv : HTMLDivElement;
	var _cbDiv : HTMLDivElement;
	var _sbDiv : HTMLDivElement;

	var _nextZlavel : string;
	var _nextXlavel : string;
	var _nextClavel : string;
	var _nextSlavel : string;
	var _lShow : boolean;
	var _rShow : boolean;
	var _lAction = CrossCtrler._lActionMax;
	var _rAction = CrossCtrler._rActionMax;

	var _beforeLaction : int;
	var _beforeRaction : int;
	var _beforeKup : boolean;
	var _beforeKdn : boolean;
	var _beforeKrt : boolean;
	var _beforeKlt : boolean;
	var _beforeK_z : boolean;
	var _beforeK_x : boolean;
	var _beforeK_c : boolean;
	var _beforeK_s : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		// css設定
		var style = dom.document.createElement("style") as HTMLStyleElement;
		style.type = "text/css";
		style.innerHTML = """
			#cross .ctrler.ldiv{
				position: absolute;
				left: 0px;
				bottom: 0px;
				width: 144px;
				height: 144px;
			}
			#cross .ctrler.ldiv .up{
				position: absolute;
				left: 55px;
				top: 13px;
				width: 34px;
				height: 48px;
				background-size: 34px 48px;
			}
			#cross .ctrler.ldiv .dn{
				position: absolute;
				left: 55px;
				top: 81px;
				width: 34px;
				height: 48px;
				background-size: 34px 48px;
			}
			#cross .ctrler.ldiv .rt{
				position: absolute;
				left: 83px;
				top: 53px;
				width: 46px;
				height: 36px;
				background-size: 46px 36px;
			}
			#cross .ctrler.ldiv .lt{
				position: absolute;
				left: 15px;
				top: 53px;
				width: 46px;
				height: 36px;
				background-size: 46px 36px;
			}

			#cross .ctrler.rdiv{
				position: absolute;
				right: 0px;
				bottom: 0px;
				width: 144px;
				height: 144px;
			}
			#cross .ctrler.rdiv .btn{
				position: absolute;
				left: 0px;
				width: 144px;
				height: 36px;
				background-size: 144px 36px;
				text-align: center;
			}
			#cross .ctrler.rdiv .zb{top: 0px;}
			#cross .ctrler.rdiv .xb{top: 36px;}
			#cross .ctrler.rdiv .cb{top: 72px;}
			#cross .ctrler.rdiv .sb{top: 108px;}
			#cross .ctrler.rdiv .cssimg_system_button_ctrlButton_normal{line-height: 34px;}
			#cross .ctrler.rdiv .cssimg_system_button_ctrlButton_active{line-height: 36px;}
		""";
		dom.document.head.appendChild(style);
		// dom設定
		var tempDiv = dom.document.createElement("div");
		tempDiv.innerHTML = """
			<div class="ctrler ldiv">
				<div class="up cssimg_system_button_ctrlArrow_up_normal"></div>
				<div class="dn cssimg_system_button_ctrlArrow_dn_normal"></div>
				<div class="rt cssimg_system_button_ctrlArrow_rt_normal"></div>
				<div class="lt cssimg_system_button_ctrlArrow_lt_normal"></div>
			</div>
			<div class="ctrler rdiv">
				<div class="btn zb cssimg_system_button_ctrlButton_normal"></div>
				<div class="btn xb cssimg_system_button_ctrlButton_normal"></div>
				<div class="btn cb cssimg_system_button_ctrlButton_normal"></div>
				<div class="btn sb cssimg_system_button_ctrlButton_normal"></div>
			</div>
		""";
		this._lDiv = tempDiv.getElementsByClassName("ctrler ldiv").item(0) as HTMLDivElement;
		this._rDiv = tempDiv.getElementsByClassName("ctrler rdiv").item(0) as HTMLDivElement;
		this._upDiv = this._lDiv.getElementsByClassName("up").item(0) as HTMLDivElement;
		this._dnDiv = this._lDiv.getElementsByClassName("dn").item(0) as HTMLDivElement;
		this._rtDiv = this._lDiv.getElementsByClassName("rt").item(0) as HTMLDivElement;
		this._ltDiv = this._lDiv.getElementsByClassName("lt").item(0) as HTMLDivElement;
		this._zbDiv = this._rDiv.getElementsByClassName("zb").item(0) as HTMLDivElement;
		this._xbDiv = this._rDiv.getElementsByClassName("xb").item(0) as HTMLDivElement;
		this._cbDiv = this._rDiv.getElementsByClassName("cb").item(0) as HTMLDivElement;
		this._sbDiv = this._rDiv.getElementsByClassName("sb").item(0) as HTMLDivElement;
		var crossDiv = dom.document.getElementById("cross") as HTMLDivElement;
		crossDiv.appendChild(this._lDiv);
		crossDiv.appendChild(this._rDiv);

		// ボタン判定領域作成
		this._arrowBox = new Ctrl.Box(0, -144, 144, 144);
		this._zBox = new Ctrl.Box(0 - 144, 36 * 0 - 144, 144, 36);
		this._xBox = new Ctrl.Box(0 - 144, 36 * 1 - 144, 144, 36);
		this._cBox = new Ctrl.Box(0 - 144, 36 * 2 - 144, 144, 36);
		this._sBox = new Ctrl.Box(0 - 144, 36 * 3 - 144, 144, 36);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 展開処理
		if(this._lAction > 0 || (0 > this._lAction && this._lShow)){this._lAction++;}
		if(this._rAction > 0 || (0 > this._rAction && this._rShow)){this._rAction++;}
		if(this._lAction > CrossCtrler._lActionMax){this._lAction = -CrossCtrler._lActionMax;}
		if(this._rAction > CrossCtrler._rActionMax){this._rAction = -CrossCtrler._rActionMax;}
		if(this._lAction == -CrossCtrler._lActionMax){this._lToggle();}
		if(this._rAction == -CrossCtrler._rActionMax){this._rToggle();}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		if(this._beforeLaction != this._lAction){this._beforeLaction = this._lAction; this._lDiv.style.left = (-144 * Math.abs(this._lAction / CrossCtrler._lActionMax)) + "px";}
		if(this._beforeRaction != this._rAction){this._beforeRaction = this._rAction; this._rDiv.style.right = (-144 * Math.abs(this._rAction / CrossCtrler._rActionMax)) + "px";}
		if(this._beforeKup != Ctrl.kup){var press = this._beforeKup = Ctrl.kup; this._upDiv.className = this._upDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeKdn != Ctrl.kdn){var press = this._beforeKdn = Ctrl.kdn; this._dnDiv.className = this._dnDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeKrt != Ctrl.krt){var press = this._beforeKrt = Ctrl.krt; this._rtDiv.className = this._rtDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeKlt != Ctrl.klt){var press = this._beforeKlt = Ctrl.klt; this._ltDiv.className = this._ltDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeK_z != Ctrl.k_z){var press = this._beforeK_z = Ctrl.k_z; this._zbDiv.className = this._zbDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeK_x != Ctrl.k_x){var press = this._beforeK_x = Ctrl.k_x; this._xbDiv.className = this._xbDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeK_c != Ctrl.k_c){var press = this._beforeK_c = Ctrl.k_c; this._cbDiv.className = this._cbDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
		if(this._beforeK_s != Ctrl.k_s){var press = this._beforeK_s = Ctrl.k_s; this._sbDiv.className = this._sbDiv.className.replace(press ? "_normal" : "_active", press ? "_active" : "_normal");}
	}

	// ----------------------------------------------------------------
	// 左コントローラの表示設定
	function setLctrl(open : boolean) : void{
		if(this._lShow != open){
			this._lShow = open;
			this._lAction = (this._lAction == 0) ? 1 : Math.abs(this._lAction);
		}

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._lAction = this._lShow ? 0 : CrossCtrler._lActionMax;
			this._lToggle();
		}
	}

	// ----------------------------------------------------------------
	// 右コントローラの表示設定
	function setRctrl(zLabel : string, xLabel : string, cLabel : string, sLabel : string) : void{
		if(zLabel == "" && xLabel == "" && cLabel == "" && sLabel == ""){
			// 右コントローラを隠す
			this._rShow = false;
			this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);
		}else{
			// 右コントローラを表示
			this._rShow = true;
			var change = false;
			change = change || this._nextZlavel != zLabel;
			change = change || this._nextXlavel != xLabel;
			change = change || this._nextClavel != cLabel;
			change = change || this._nextSlavel != sLabel;
			if(change){this._rAction = (this._rAction == 0) ? 1 : Math.abs(this._rAction);}
		}
		this._nextZlavel = zLabel;
		this._nextXlavel = xLabel;
		this._nextClavel = cLabel;
		this._nextSlavel = sLabel;

		// 演出スキップ確認
		if(dom.window.localStorage.getItem("setting_transition") == "off"){
			this._rAction = this._rShow ? 0 : CrossCtrler._rActionMax;
			this._rToggle();
		}
	}

	// ----------------------------------------------------------------
	// 左切り替え
	function _lToggle() : void{
		Ctrl.arrowBox = this._lShow ? this._arrowBox : null;
		this._lDiv.style.display = (Ctrl.arrowBox != null) ? "block" : "none";
	}

	// ----------------------------------------------------------------
	// 右切り替え
	function _rToggle() : void{
		if(this._rShow){
			this._zbDiv.innerHTML = this._nextZlavel;
			this._xbDiv.innerHTML = this._nextXlavel;
			this._cbDiv.innerHTML = this._nextClavel;
			this._sbDiv.innerHTML = this._nextSlavel;
			Ctrl.zBox = (this._nextZlavel != "") ? this._zBox : null;
			Ctrl.xBox = (this._nextXlavel != "") ? this._xBox : null;
			Ctrl.cBox = (this._nextClavel != "") ? this._cBox : null;
			Ctrl.sBox = (this._nextSlavel != "") ? this._sBox : null;
		}else{
			Ctrl.zBox = null;
			Ctrl.xBox = null;
			Ctrl.cBox = null;
			Ctrl.sBox = null;
		}
		this._zbDiv.style.display = (Ctrl.zBox != null) ? "block" : "none";
		this._xbDiv.style.display = (Ctrl.xBox != null) ? "block" : "none";
		this._cbDiv.style.display = (Ctrl.cBox != null) ? "block" : "none";
		this._sbDiv.style.display = (Ctrl.sBox != null) ? "block" : "none";
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

