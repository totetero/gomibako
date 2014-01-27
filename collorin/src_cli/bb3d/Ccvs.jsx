import "js/web.jsx";

import "../util/EventCartridge.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス情報
class Ccvs{
	var width : int;
	var height : int;
	var canvas : HTMLCanvasElement;
	var context : CanvasRenderingContext2D;

	// コンストラクタ
	function constructor(width : int, height : int, canvas : HTMLCanvasElement){
		this.width = width;
		this.height = height;
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		// ピクセルレシオ設定
		var PixelRatio = dom.window.devicePixelRatio;
		if(PixelRatio == 1){
			this.canvas.width = this.width;
			this.canvas.height = this.height;
		}else{
			this.canvas.width = Math.floor(this.width * PixelRatio);
			this.canvas.height = Math.floor(this.height * PixelRatio);
			this.context.scale(PixelRatio, PixelRatio);
		}
	}

	// 破棄
	function dispose() : void{
		this.canvas = null;
		this.context = null;
	}
}

// キャンバスコントローラーカートリッジ
class SECctrlCanvas extends EventCartridge{
	var ccvs : Ccvs;

	// コンストラクタ
	function constructor(ccvs : Ccvs){
		this.ccvs = ccvs;
	}

	// 初期化
	override function init() : void{
	}

	// 計算
	override function calc() : boolean{
		return true;
	}

	// 描画
	override function draw() : void{
	}

	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

