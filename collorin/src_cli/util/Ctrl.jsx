import "js.jsx";
import "js/web.jsx";

import "Sound.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// コントローラクラス
class Ctrl{
	static var window = new Ctrl.Box(0, 0, 0, 0);
	static var screen = new Ctrl.Box(0, 0, 0, 0);
	static const swmin = 320;
	static const swmax = 640;
	static const shmin = 240;
	static const shmax = 480;
	// ピクセルレシオ
	static var pixelRatio : number;
	// キャンバス要素
	static var _sdiv : HTMLDivElement;
	static var _scvs : HTMLCanvasElement;
	static var sctx : CanvasRenderingContext2D;
	// 入力要素
	static var input : HTMLInputElement;
	// タッチ状態
	static var isTouch : boolean;
	static var stdn : boolean;
	static var stmv : boolean;
	static var stx : int = 0;
	static var sty : int = 0;
	static var _tempstx : int;
	static var _tempsty : int;
	static var _info = new Ctrl._TouchInfo[];
	// キー押下状態
	static var kup : boolean;
	static var kdn : boolean;
	static var krt : boolean;
	static var klt : boolean;
	static var k_z : boolean;
	static var k_x : boolean;
	static var k_c : boolean;
	static var k_s : boolean;
	static var trigger_up : boolean;
	static var trigger_dn : boolean;
	static var trigger_rt : boolean;
	static var trigger_lt : boolean;
	static var trigger_z : boolean;
	static var trigger_x : boolean;
	static var trigger_c : boolean;
	static var trigger_s : boolean;
	static var trigger_enter : boolean;
	static var _tkup : boolean;
	static var _tkdn : boolean;
	static var _tkrt : boolean;
	static var _tklt : boolean;
	static var _tk_z : boolean;
	static var _tk_x : boolean;
	static var _tk_c : boolean;
	static var _tk_s : boolean;
	static var _kkup : boolean;
	static var _kkdn : boolean;
	static var _kkrt : boolean;
	static var _kklt : boolean;
	static var _kk_z : boolean;
	static var _kk_x : boolean;
	static var _kk_c : boolean;
	static var _kk_s : boolean;
	static var _keydownCode : int;
	// キー押下範囲
	static var arrowBox : Ctrl.Box;
	static var zBox : Ctrl.Box;
	static var xBox : Ctrl.Box;
	static var cBox : Ctrl.Box;
	static var sBox : Ctrl.Box;

	// ----------------------------------------------------------------
	// 初期化
	static function init(title : string) : void{
		// タイトル設定
		dom.document.title = title;
		// css設定
		var style = dom.document.createElement("style") as HTMLStyleElement;
		style.type = "text/css";
		style.innerHTML = """
			body{
				margin: 0;
				overflow: hidden;
				background-color: gray;
			}
			#screen canvas{
				position: absolute;
			}
			#cross{
				position: absolute;
				width: 100%;
				height: 100%;
				overflow: hidden;
			}
			#ctrl{
				position: absolute;
				width: 100%;
				height: 100%;
				overflow: hidden;
			}
			#ctrl input{display: none;}
			#ctrl input.textarea{
				position: absolute;
				display: block;
				font-size: 16px;
				text-align: center;
				box-sizing: border-box;
				-webkit-box-sizing: border-box;
				-moz-box-sizing: border-box;
			}
			#loading{
				position: absolute;
				display: block;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.5);
			}
			#loading::before{
				content: attr(txt);
				position: absolute;
				left: 50%;
				top: 50%;
				width: 80px;
				height: 30px;
				line-height: 32px;
				margin-left: -40px;
				margin-top: -15px;
				padding-left: 10px;
				color: white;
				background-color: black;
			}
		""";
		dom.document.head.appendChild(style);
		// dom設定
		dom.document.body.innerHTML = """
			<div id="screen"></div>
			<div id="cross"></div>
			<div id="ctrl"><input></div>
			<div id="loading" txt="loading"></div>
		""";

		Ctrl._sdiv = dom.document.getElementById("screen") as HTMLDivElement;
		var ctrlDiv = dom.document.getElementById("ctrl") as HTMLDivElement;
		Ctrl.input = ctrlDiv.getElementsByTagName("input").item(0) as HTMLInputElement;

		// リスナー追加
		Ctrl.isTouch = js.eval("'ontouchstart' in window") as boolean;
		if(Ctrl.isTouch){
			ctrlDiv.addEventListener("touchstart", Ctrl._ctdnfn);
			ctrlDiv.addEventListener("touchmove", Ctrl._ctmvfn);
			ctrlDiv.addEventListener("touchend", Ctrl._ctupfn);
			ctrlDiv.addEventListener("touchcancel", Ctrl._ctupfn);
		}else{
			ctrlDiv.addEventListener("mousedown", Ctrl._ctdnfn);
			ctrlDiv.addEventListener("mousemove", Ctrl._ctmvfn);
			ctrlDiv.addEventListener("mouseup", Ctrl._ctupfn);
			ctrlDiv.addEventListener("mouseout", function(e : Event) : void{
				var x = (e as MouseEvent).clientX;
				var y = (e as MouseEvent).clientY;
				if(x <= 0 || Ctrl.window.w <= x || y <= 0 || Ctrl.window.h <= y){
					Ctrl._ctupfn(e);
				}
			});
		}
		dom.document.addEventListener("keydown", Ctrl._kdnfn);
		dom.document.addEventListener("keyup", Ctrl._kupfn);
	}

	// ----------------------------------------------------------------
	// キャンバス設定
	static function setCanvas() : void{
		// ピクセルレシオ設定
		Ctrl.pixelRatio = 1;
		var quality = dom.window.localStorage.getItem("setting_quality");
		if(quality == "high"){Ctrl.pixelRatio = dom.window.devicePixelRatio;}
		if(quality == "low"){Ctrl.pixelRatio = 0.75;}
		if(quality == "poor"){Ctrl.pixelRatio = 0.5;}
		// キャンバスリセット
		if(Ctrl._scvs != null){Ctrl._sdiv.removeChild(Ctrl._scvs);}
		Ctrl._scvs = dom.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.sctx = Ctrl._scvs.getContext("2d") as CanvasRenderingContext2D;
		// キャンバス設定
		if(Ctrl.pixelRatio == 1){
			Ctrl._scvs.width = Ctrl.screen.w;
			Ctrl._scvs.height = Ctrl.screen.h;
		}else{
			Ctrl._scvs.width = Math.floor(Ctrl.screen.w * Ctrl.pixelRatio);
			Ctrl._scvs.height = Math.floor(Ctrl.screen.h * Ctrl.pixelRatio);
			Ctrl.sctx.scale(Ctrl.pixelRatio, Ctrl.pixelRatio);
		}
		Ctrl._scvs.style.left = Ctrl.screen.x + "px";
		Ctrl._scvs.style.top = Ctrl.screen.y + "px";
		Ctrl._scvs.style.width = Ctrl.screen.w + "px";
		Ctrl._scvs.style.height = Ctrl.screen.h + "px";
		Ctrl._sdiv.appendChild(Ctrl._scvs);
	}

	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		// ウインドウサイズ確認
		var ww = dom.window.innerWidth;
		var wh = dom.window.innerHeight;
		if(Ctrl.window.w != ww || Ctrl.window.h != wh){
			Ctrl.window.w = ww;
			Ctrl.window.h = wh;
			Ctrl.screen.w = Math.min(Math.max(Ctrl.window.w, Ctrl.swmin), Ctrl.swmax);
			Ctrl.screen.h = Math.min(Math.max(Ctrl.window.h, Ctrl.shmin), Ctrl.shmax);
			Ctrl.screen.x = Math.max(Math.floor((Ctrl.window.w - Ctrl.screen.w) * 0.5), 0);
			Ctrl.screen.y = Math.max(Math.floor((Ctrl.window.h - Ctrl.screen.h) * 0.5), 0);
			Ctrl.setCanvas();
		}

		if(Ctrl.arrowBox == null){Ctrl._tkup = Ctrl._tkdn = Ctrl._tkrt = Ctrl._tklt = false;}
		if(Ctrl.zBox == null){Ctrl._tk_z = false;}
		if(Ctrl.xBox == null){Ctrl._tk_x = false;}
		if(Ctrl.cBox == null){Ctrl._tk_c = false;}
		if(Ctrl.sBox == null){Ctrl._tk_s = false;}
		Ctrl.kup = Ctrl._tkup || Ctrl._kkup;
		Ctrl.kdn = Ctrl._tkdn || Ctrl._kkdn;
		Ctrl.krt = Ctrl._tkrt || Ctrl._kkrt;
		Ctrl.klt = Ctrl._tklt || Ctrl._kklt;
		Ctrl.k_z = Ctrl._tk_z || Ctrl._kk_z;
		Ctrl.k_x = Ctrl._tk_x || Ctrl._kk_x;
		Ctrl.k_c = Ctrl._tk_c || Ctrl._kk_c;
		Ctrl.k_s = Ctrl._tk_s || Ctrl._kk_s;
	}

	// ----------------------------------------------------------------
	// タッチ位置がボックス範囲内にあるか確認
	static function _checkTouchBox(box : Ctrl.Box, tx : int, ty : int) : boolean{
		if(box == null){return false;}
		var x0 = box.x >= 0 ? box.x : Ctrl.window.w + box.x;
		var y0 = box.y >= 0 ? box.y : Ctrl.window.h + box.y;
		var x1 = x0 + box.w;
		var y1 = y0 + box.h;
		return (x0 < tx && tx < x1 && y0 < ty && ty < y1);
	}

	// ----------------------------------------------------------------
	// ボタンタッチ時の処理
	static function _calcTouchButton(box : Ctrl.Box, tx : int, ty : int, trigger : boolean) : void{
		if(box == Ctrl.arrowBox){
			Ctrl._tkup = Ctrl._tkdn = Ctrl._tkrt = Ctrl._tklt = false;
			var x = tx - (box.x >= 0 ? box.x : Ctrl.window.w + box.x) - box.w * 0.5;
			var y = ty - (box.y >= 0 ? box.y : Ctrl.window.h + box.y) - box.h * 0.5;
			if(x * x + y * y < 72 * 72){
				if(y < 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){Ctrl.trigger_up = true;}else{Ctrl._tkup = true;}}
				if(y > 0 && x < y * y * 0.18 && x > y * y * -0.18){if(trigger){Ctrl.trigger_dn = true;}else{Ctrl._tkdn = true;}}
				if(x > 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){Ctrl.trigger_rt = true;}else{Ctrl._tkrt = true;}}
				if(x < 0 && y < x * x * 0.18 && y > x * x * -0.18){if(trigger){Ctrl.trigger_lt = true;}else{Ctrl._tklt = true;}}
			}
		}
		else if(box == Ctrl.zBox){Ctrl._tk_z = false; if(Ctrl._checkTouchBox(Ctrl.zBox, tx, ty)){if(trigger){Ctrl.trigger_z = true;}else{Ctrl._tk_z = true;}}}
		else if(box == Ctrl.xBox){Ctrl._tk_x = false; if(Ctrl._checkTouchBox(Ctrl.xBox, tx, ty)){if(trigger){Ctrl.trigger_x = true;}else{Ctrl._tk_x = true;}}}
		else if(box == Ctrl.cBox){Ctrl._tk_c = false; if(Ctrl._checkTouchBox(Ctrl.cBox, tx, ty)){if(trigger){Ctrl.trigger_c = true;}else{Ctrl._tk_c = true;}}}
		else if(box == Ctrl.sBox){Ctrl._tk_s = false; if(Ctrl._checkTouchBox(Ctrl.sBox, tx, ty)){if(trigger){Ctrl.trigger_s = true;}else{Ctrl._tk_s = true;}}}
	}

	// ----------------------------------------------------------------
	// タッチとマウスの処理振り分け
	static function _calcEvent(e : Event, calc : function(tx:int,ty:int,id:int):boolean) : void{
		var active = false;
		if(Ctrl.isTouch){
			var te = e as TouchEvent;
			for(var i = 0; i < te.changedTouches.length; i++){
				var touch = te.changedTouches[i];
				active = calc(touch.clientX, touch.clientY, touch.identifier) || active;
			}
		}else{
			var me = e as MouseEvent;
			active = calc(me.clientX, me.clientY, 0);
		}

		if(active){
			// 上位ノードイベントキャンセル
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ開始
	static function _ctdnfn(e : Event) : void{
		// input要素フォーカス処理
		if(e.target == Ctrl.input){return;}
		if(dom.document.activeElement == Ctrl.input){Ctrl.input.blur();}

		Ctrl._calcEvent(e, function(tx : int, ty : int, id : int) : boolean{
			// タッチ範囲確認
			var box : Ctrl.Box;
			if(Ctrl._checkTouchBox(Ctrl.arrowBox, tx, ty)){box = Ctrl.arrowBox;}
			else if(Ctrl._checkTouchBox(Ctrl.zBox, tx, ty)){box = Ctrl.zBox;}
			else if(Ctrl._checkTouchBox(Ctrl.xBox, tx, ty)){box = Ctrl.xBox;}
			else if(Ctrl._checkTouchBox(Ctrl.cBox, tx, ty)){box = Ctrl.cBox;}
			else if(Ctrl._checkTouchBox(Ctrl.sBox, tx, ty)){box = Ctrl.sBox;}
			else if(Ctrl._checkTouchBox(Ctrl.screen, tx, ty)){box = Ctrl.screen;}
			else{return false;}
			// マルチタッチ情報重複確認
			for(var i = 0; i < Ctrl._info.length; i++){if(box == Ctrl._info[i].box){return false;}}
			// マルチタッチ情報作成
			Ctrl._info.push(new Ctrl._TouchInfo(id, box));

			if(box == Ctrl.screen){
				// スクリーンタッチ情報更新
				Ctrl.stx = tx - Ctrl.screen.x;
				Ctrl.sty = ty - Ctrl.screen.y;
				Ctrl.stdn = true;
				Ctrl.stmv = false;
				Ctrl._tempstx = Ctrl.stx;
				Ctrl._tempsty = Ctrl.sty;
			}else{
				// ボタンタッチ情報更新
				Ctrl._calcTouchButton(box, tx, ty, false);
			}
			return true;
		});

		// タップによるサウンド再生許可 サウンド準備が完了してから1回だけ処理が行われる
		Sound.setPlayable();
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ移動
	static function _ctmvfn(e : Event) : void{
		Ctrl._calcEvent(e, function(tx : int, ty : int, id : int) : boolean{
			// マルチタッチ情報確認
			var box : Ctrl.Box = null;
			for(var i = 0; i < Ctrl._info.length; i++){if(id == Ctrl._info[i].id){box = Ctrl._info[i].box; break;}}
			if(box == null){return false;}

			if(box == Ctrl.screen){
				// スクリーンタッチ情報更新
				Ctrl.stx = tx - Ctrl.screen.x;
				Ctrl.sty = ty - Ctrl.screen.y;
				if(Ctrl.stdn && !Ctrl.stmv){
					var x = Ctrl._tempstx - Ctrl.stx;
					var y = Ctrl._tempsty - Ctrl.sty;
					Ctrl.stmv = (x * x + y * y > 10);
				}
			}else{
				// ボタンタッチ情報更新
				Ctrl._calcTouchButton(box, tx, ty, false);
			}
			return true;
		});
	}

	// ----------------------------------------------------------------
	// ルート要素 タッチ完了
	static function _ctupfn(e : Event) : void{
		Ctrl._calcEvent(e, function(tx : int, ty : int, id : int) : boolean{
			// マルチタッチ情報確認
			var box : Ctrl.Box = null;
			for(var i = 0; i < Ctrl._info.length; i++){if(id == Ctrl._info[i].id){box = Ctrl._info.splice(i--, 1)[0].box; break;}}
			if(box == null){return false;}

			if(box == Ctrl.screen){
				// スクリーンタッチ情報更新
				Ctrl.stx = tx - Ctrl.screen.x;
				Ctrl.sty = ty - Ctrl.screen.y;
				Ctrl.stdn = false;
			}else{
				// ボタンタッチ情報更新
				Ctrl._calcTouchButton(box, tx, ty, true);
			}
			return true;
		});
	}

	// ----------------------------------------------------------------
	// キーを押す
	static function _kdnfn(e : Event) : void{
		var keyCode = (e as KeyboardEvent).keyCode;
		if(dom.document.activeElement == Ctrl.input){
			// インプットモード
			Ctrl._keydownCode = keyCode;
		}else if(Ctrl.input.className != "" && 65 <= keyCode && keyCode <= 90){
			// 入力要素を表示中にアルファベットキー押下でインプットモードに移行
			Ctrl.input.focus();
		}else{
			// コントローラーモード
			switch(keyCode){
				case 37: Ctrl._kklt = true; break;
				case 38: Ctrl._kkup = true; break;
				case 39: Ctrl._kkrt = true; break;
				case 40: Ctrl._kkdn = true; break;
				case 88: Ctrl._kk_x = true; break;
				case 90: Ctrl._kk_z = true; break;
				case 67: Ctrl._kk_c = true; break;
				case 32: Ctrl._kk_s = true; break;
			}
			// キーイベント終了
			e.preventDefault();
			e.stopPropagation();
		}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function _kupfn(e : Event) : void{
		var keyCode = (e as KeyboardEvent).keyCode;
		if(dom.document.activeElement == Ctrl.input){
			// インプットモード
			if(keyCode == 13 && Ctrl._keydownCode == 13){
				Ctrl.trigger_enter = true;
				Ctrl.input.blur();
			}
		}else{
			// コントローラーモード
			switch(keyCode){
				case 37: Ctrl._kklt = false; Ctrl.trigger_lt = true; break;
				case 38: Ctrl._kkup = false; Ctrl.trigger_up = true; break;
				case 39: Ctrl._kkrt = false; Ctrl.trigger_rt = true; break;
				case 40: Ctrl._kkdn = false; Ctrl.trigger_dn = true; break;
				case 88: Ctrl._kk_x = false; Ctrl.trigger_x = true; break;
				case 90: Ctrl._kk_z = false; Ctrl.trigger_z = true; break;
				case 67: Ctrl._kk_c = false; Ctrl.trigger_c = true; break;
				case 32: Ctrl._kk_s = false; Ctrl.trigger_s = true; break;
			}
			// キーイベント終了
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ----------------------------------------------------------------
	// 範囲設定クラス
	class Box{
		var x : int;
		var y : int;
		var w : int;
		var h : int;
		function constructor(x : int, y : int, w : int, h : int){
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
		}
	}

	// ----------------------------------------------------------------
	// マルチタッチ情報管理クラス
	class _TouchInfo{
		var id : int;
		var box : Ctrl.Box;
		function constructor(id : int, box : Ctrl.Box){
			this.id = id;
			this.box = box;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
