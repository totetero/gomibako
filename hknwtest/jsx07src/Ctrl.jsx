import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 操作用クラス

native class JsCtrlUtil{static function isTouch() : boolean;}

class Ctrl{
	// ゲーム画面用 divとcanvas
	static var div : HTMLDivElement;
	static var canvas : HTMLCanvasElement;
	// コントローラー用 divとcanvas
	static var rcvs : HTMLCanvasElement;
	static var lcvs : HTMLCanvasElement;
	static var rctx : CanvasRenderingContext2D;
	static var lctx : CanvasRenderingContext2D;
	// キー状態
	static var kup : boolean = false;
	static var kdn : boolean = false;
	static var krt : boolean = false;
	static var klt : boolean = false;
	static var k_z : boolean = false;
	static var k_x : boolean = false;
	static var k_s : boolean = false;
	// ゲーム画面のマウス状態
	static var isTouch : boolean = false;
	static var mdn : boolean = false;
	static var mx : int = -1;
	static var my : int = -1;
	// 画面回転拡大
	static var rotv : number = 0;
	static var roth : number = 0;
	static var roth_max : number = Math.PI / 180 *  60;
	static var roth_min : number = Math.PI / 180 * -60;
	static var distance : number = 10;
	
	// 内部演算用 ウインドウサイズ
	static var ww : int = 0;
	static var wh : int = 0;
	// 内部演算用 ゲットしたマウス座標
	static var tempmx : int = 0;
	static var tempmy : int = 0;
	// 内部演算用 左右コントローラー押下
	static var rdn : boolean = false;
	static var ldn : boolean = false;
	// 内部演算用 回転開始時の状態
	static var temprotx : int;
	static var temproty : int;
	static var temprotv : number;
	static var temproth : number;
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		// divの準備
		Ctrl.div = dom.window.document.createElement("div") as HTMLDivElement;
		Ctrl.div.style.position = "absolute";
		dom.window.document.body.appendChild(Ctrl.div);
		// canvasの準備
		Ctrl.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.canvas.style.position = "absolute";
		Ctrl.canvas.width = 320;
		Ctrl.canvas.height = 320;
		Ctrl.div.appendChild(Ctrl.canvas);
		// 左コントローラーcanvasの準備
		Ctrl.lcvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.lctx = Ctrl.lcvs.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.lcvs.style.position = "absolute";
		Ctrl.lcvs.width = Ctrl.lcvs.height = 128;
		Ctrl.div.appendChild(Ctrl.lcvs);
		// 右コントローラーcanvasの準備
		Ctrl.rcvs = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		Ctrl.rctx = Ctrl.rcvs.getContext("2d") as CanvasRenderingContext2D;
		Ctrl.rcvs.style.position = "absolute";
		Ctrl.rcvs.width = Ctrl.rcvs.height = 128;
		Ctrl.div.appendChild(Ctrl.rcvs);
		
		// キーリスナー追加
		dom.window.document.addEventListener("keydown", Ctrl.kdnfn, true);
		dom.window.document.addEventListener("keyup", Ctrl.kupfn, true);
		// マウスリスナー追加
		Ctrl.isTouch = JsCtrlUtil.isTouch();
		if(Ctrl.isTouch){
			Ctrl.canvas.addEventListener("touchstart", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("touchmove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("touchend", Ctrl.mupfn, true);
			Ctrl.lcvs.addEventListener("touchstart", Ctrl.lbtndnfn, true);
			Ctrl.lcvs.addEventListener("touchmove", Ctrl.lbtnmvfn, true);
			Ctrl.lcvs.addEventListener("touchend", Ctrl.lbtnupfn, true);
			Ctrl.rcvs.addEventListener("touchstart", Ctrl.rbtndnfn, true);
			Ctrl.rcvs.addEventListener("touchmove", Ctrl.rbtnmvfn, true);
			Ctrl.rcvs.addEventListener("touchend", Ctrl.rbtnupfn, true);
		}else{
			Ctrl.canvas.addEventListener("mousedown", Ctrl.mdnfn, true);
			Ctrl.canvas.addEventListener("mousemove", Ctrl.mmvfn, true);
			Ctrl.canvas.addEventListener("mouseup", Ctrl.mupfn, true);
			Ctrl.canvas.addEventListener("mouseout", Ctrl.mupfn, true);
			Ctrl.lcvs.addEventListener("mousedown", Ctrl.lbtndnfn, true);
			Ctrl.lcvs.addEventListener("mousemove", Ctrl.lbtnmvfn, true);
			Ctrl.lcvs.addEventListener("mouseup", Ctrl.lbtnupfn, true);
			Ctrl.lcvs.addEventListener("mouseout", Ctrl.lbtnupfn, true);
			Ctrl.rcvs.addEventListener("mousedown", Ctrl.rbtndnfn, true);
			Ctrl.rcvs.addEventListener("mousemove", Ctrl.rbtnmvfn, true);
			Ctrl.rcvs.addEventListener("mouseup", Ctrl.rbtnupfn, true);
			Ctrl.rcvs.addEventListener("mouseout", Ctrl.rbtnupfn, true);
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void {
		// ウインドウサイズの変更確認
		var w : int = dom.window.innerWidth;
		var h : int = dom.window.innerHeight;
		if(Ctrl.ww != w || Ctrl.wh != h){
			Ctrl.ww = w;
			Ctrl.wh = h;
			if(w <= h){
				// 正方形もしくは縦長
				var hspace : number = (Ctrl.canvas.width - Ctrl.lcvs.width - Ctrl.rcvs.width) / 5;
				Ctrl.div.style.left = ((w - Ctrl.canvas.width) * 0.5) as string + "px";
				Ctrl.lcvs.style.left = hspace as string + "px";
				Ctrl.rcvs.style.left = (hspace * 4 + Ctrl.lcvs.width) as string + "px";
				if(h > Ctrl.canvas.height + Ctrl.lcvs.height){
					var vspace : number = (h - Ctrl.canvas.height - Ctrl.lcvs.height) / 3;
					Ctrl.div.style.top = vspace as string + "px";
					Ctrl.lcvs.style.top = (vspace + Ctrl.canvas.height) as string + "px";
					Ctrl.rcvs.style.top = (vspace + Ctrl.canvas.height) as string + "px";
				}else{
					Ctrl.div.style.top = "0px";
					Ctrl.lcvs.style.top = (h - Ctrl.lcvs.height) as string + "px";
					Ctrl.rcvs.style.top = (h - Ctrl.rcvs.height) as string + "px";
				}
			}else{
				// 横長
				Ctrl.div.style.top = ((h - Ctrl.canvas.height) * 0.5) as string + "px";
				Ctrl.lcvs.style.top = ((Ctrl.canvas.height - Ctrl.lcvs.height) * 0.5) as string + "px";
				Ctrl.rcvs.style.top = ((Ctrl.canvas.height - Ctrl.rcvs.height) * 0.5) as string + "px";
				var hposition : int = ((w - Ctrl.canvas.width) * 0.5);
				Ctrl.div.style.left = hposition as string + "px";
				if(w > Ctrl.canvas.width + Ctrl.lcvs.width + Ctrl.rcvs.width){
					Ctrl.lcvs.style.left = (Ctrl.canvas.width * 0.25 - w * 0.25 - Ctrl.lcvs.width * 0.5) as string + "px";
					Ctrl.rcvs.style.left = (Ctrl.canvas.width * 0.75 + w * 0.25 - Ctrl.rcvs.width * 0.5) as string + "px";
				}else{
					Ctrl.lcvs.style.left = "-" + hposition as string + "px";
					Ctrl.rcvs.style.left = (w - hposition - Ctrl.rcvs.width) as string + "px";
				}

			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw(img : HTMLImageElement) : void {
		Ctrl.lctx.clearRect(0, 0, Ctrl.lcvs.width, Ctrl.lcvs.height);
		Ctrl.rctx.clearRect(0, 0, Ctrl.rcvs.width, Ctrl.rcvs.height);
		// 十字キー
		var lx : int = (Ctrl.lcvs.width - 112) * 0.5;
		var ly : int = (Ctrl.lcvs.height - 112) * 0.5;
		Ctrl.lctx.drawImage(img, Ctrl.kup ?  88 :  0,  0, 40, 48, lx + 36, ly +  0, 40, 48);
		Ctrl.lctx.drawImage(img, Ctrl.kdn ? 136 : 48, 40, 40, 48, lx + 36, ly + 64, 40, 48);
		Ctrl.lctx.drawImage(img, Ctrl.krt ? 128 : 40,  0, 48, 40, lx + 64, ly + 36, 48, 40);
		Ctrl.lctx.drawImage(img, Ctrl.klt ?  88 :  0, 48, 48, 40, lx +  0, ly + 36, 48, 40);
		// zxスペースキー
		var rx : int = (Ctrl.rcvs.width - 128) * 0.5;
		var ry : int = (Ctrl.rcvs.height - 112) * 0.5;
		Ctrl.rctx.drawImage(img, 176, Ctrl.k_z ?  64 :  0,  64, 64, rx +  0, ry + 32, 64, 64);
		Ctrl.rctx.drawImage(img, 176, Ctrl.k_x ?  64 :  0,  64, 64, rx + 64, ry +  0, 64, 64);
		Ctrl.rctx.drawImage(img,   0, Ctrl.k_s ? 104 : 88, 128, 16, (Ctrl.rcvs.width - 128) * 0.5, Ctrl.rcvs.height - 16, 128, 16);
		Ctrl.rctx.drawImage(img, 128, 88, 24, 24, rx + 20, ry + 52, 24, 24);
		Ctrl.rctx.drawImage(img, 152, 88, 24, 24, rx + 84, ry + 20, 24, 24);
	}
	
	// ----------------------------------------------------------------
	// 十字キー押下
	static function lbtnfn(e : Event) : void {
		Ctrl.getmmv(e);
		var x : int = Ctrl.tempmx - Ctrl.lcvs.width * 0.5;
		var y : int = Ctrl.tempmy - Ctrl.lcvs.height * 0.5;
		Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;
		Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = false;
		if(x * x + y * y < 56 * 56){
			if(y < 0 && x < y * y * 0.1 && x > y * y * -0.1){Ctrl.kup = true;}
			if(y > 0 && x < y * y * 0.1 && x > y * y * -0.1){Ctrl.kdn = true;}
			if(x > 0 && y < x * x * 0.1 && y > x * x * -0.1){Ctrl.krt = true;}
			if(x < 0 && y < x * x * 0.1 && y > x * x * -0.1){Ctrl.klt = true;}
		}
	}
	static function lbtndnfn(e : Event) : void {Ctrl.lbtnfn(e); Ctrl.ldn = Ctrl.kup || Ctrl.kdn || Ctrl.krt || Ctrl.klt;}
	static function lbtnmvfn(e : Event) : void {if(Ctrl.ldn){Ctrl.lbtnfn(e);}}
	static function lbtnupfn(e : Event) : void {Ctrl.ldn = Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;}
	
	// ----------------------------------------------------------------
	// zxスペースキー押下
	static function rbtnfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = false;
		var x1 : int = Ctrl.tempmx - Ctrl.lcvs.width * 0.5;
		var y1 : int = Ctrl.tempmy - (Ctrl.lcvs.height - 16) * 0.5;
		var x2 : int = x1;
		var y2 : int = Ctrl.tempmy - (Ctrl.lcvs.height - 8);
		// ZXキー
		if(-8 < x1 && x1 < 8 && -8 < y1 && y1 < 8){Ctrl.k_z = Ctrl.k_x = true;} // 同時押し
		else if(-64 < x1 && x1 <  0 && -16 < y1 && y1 < 48){Ctrl.k_z = true; Ctrl.k_x = false;} // z押し
		else if(  0 < x1 && x1 < 64 && -48 < y1 && y1 < 16){Ctrl.k_x = true; Ctrl.k_z = false;} // x押し
		else{Ctrl.k_z = Ctrl.k_x = false;}
		// スペースキー
		if(-64 < x2 && x2 < 64 && -8 < y2 && y2 < 8){Ctrl.k_s = true;}
		else{Ctrl.k_s = false;}
	}
	static function rbtndnfn(e : Event) : void {Ctrl.rbtnfn(e); Ctrl.rdn = Ctrl.k_z || Ctrl.k_x || Ctrl.k_s;}
	static function rbtnmvfn(e : Event) : void {if(Ctrl.rdn){Ctrl.rbtnfn(e);}}
	static function rbtnupfn(e : Event) : void {Ctrl.rdn = Ctrl.kup = Ctrl.kdn = Ctrl.krt = Ctrl.klt = Ctrl.k_z = Ctrl.k_x = Ctrl.k_s = false;}
	
	// ----------------------------------------------------------------
	// キーを押す
	static function kdnfn(e : Event) : void {
		var getkey : boolean = true;
		var ke : KeyboardEvent = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.klt = true; break;
			case 38: Ctrl.kup = true; break;
			case 39: Ctrl.krt = true; break;
			case 40: Ctrl.kdn = true; break;
			case 88: Ctrl.k_x = true; break;
			case 90: Ctrl.k_z = true; break;
			case 32: Ctrl.k_s = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// キーを離す
	static function kupfn(e : Event) : void {
		var getkey : boolean = true;
		var ke : KeyboardEvent = e as KeyboardEvent;
		switch(ke.keyCode){
			case 37: Ctrl.klt = false; break;
			case 38: Ctrl.kup = false; break;
			case 39: Ctrl.krt = false; break;
			case 40: Ctrl.kdn = false; break;
			case 88: Ctrl.k_x = false; break;
			case 90: Ctrl.k_z = false; break;
			case 32: Ctrl.k_s = false; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){e.preventDefault();}
	}
	
	// ----------------------------------------------------------------
	// マウス座標確認
	static function getmmv(e : Event) : void {
		// 座標を獲得する
		var rect : ClientRect = (e.target as Element).getBoundingClientRect();
		if(Ctrl.isTouch){
			var te : TouchEvent = e as TouchEvent;
			Ctrl.tempmx = te.changedTouches[0].clientX - rect.left;
			Ctrl.tempmy = te.changedTouches[0].clientY - rect.top;
		}else{
			var me : MouseEvent = e as MouseEvent;
			Ctrl.tempmx = me.clientX - rect.left;
			Ctrl.tempmy = me.clientY - rect.top;
		}
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを押す
	static function mdnfn(e : Event) : void {
		Ctrl.mdn = true;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		Ctrl.rotEvent0();
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウス移動
	static function mmvfn(e : Event) : void {
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		if(Ctrl.mdn){Ctrl.rotEvent1();}
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// マウスボタンを離す
	static function mupfn(e : Event) : void {
		Ctrl.mdn = false;
		Ctrl.getmmv(e);
		Ctrl.mx = Ctrl.tempmx;
		Ctrl.my = Ctrl.tempmy;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// 回転開始
	static function rotEvent0() : void{
		Ctrl.temprotx = Ctrl.mx;
		Ctrl.temproty = Ctrl.my;
		Ctrl.temprotv = Ctrl.rotv;
		Ctrl.temproth = Ctrl.roth;
	}
	
	// ----------------------------------------------------------------
	// 回転中
	static function rotEvent1() : void{
		Ctrl.rotv = Ctrl.temprotv + (Ctrl.mx - Ctrl.temprotx) * 0.03;
		Ctrl.roth = Ctrl.temproth + (Ctrl.my- Ctrl.temproty) * 0.03;
		if(Ctrl.roth > Ctrl.roth_max){Ctrl.roth = Ctrl.roth_max;}
		if(Ctrl.roth < Ctrl.roth_min){Ctrl.roth = Ctrl.roth_min;}
	}
}

