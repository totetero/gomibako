import 'js/web.jsx';

import "Ctrl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Field{
	// マップキャンバス
	var _canvas : HTMLCanvasElement;
	var _context : CanvasRenderingContext2D;
	// スゴロクマップ情報
	var _hex : Hex[];
	// グリッド情報
	var _grid : Hex[][];
	var _gridxsize : int;
	var _gridysize : int;
	var _gridxpos : number;
	var _gridypos : number;
	// グリッド定数
	var _marginx : int = 10;
	var _marginy : int = 10;
	var _draft : number = 1.1;
	var _size : int = 20;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(){
		this._hex = [
			new Hex(0, 3, 1),
			new Hex(0, 4, 1),
			new Hex(0, 5, 2),
			new Hex(1, 5, 1),
			new Hex(2, 4, 1),
			new Hex(2, 3, 1),
			new Hex(2, 2, 1),
			new Hex(1, 2, 1),
			new Hex(3, 4, 1),
			new Hex(4, 3, 1),
			new Hex(5, 3, 1),
			new Hex(5, 4, 1),
			new Hex(5, 5, 1),
			new Hex(5, 6, 1),
			new Hex(4, 7, 1),
			new Hex(3, 7, 1),
			new Hex(2, 7, 1),
			new Hex(1, 7, 1),
			new Hex(1, 6, 1),
			new Hex(3, 1, 1),
			new Hex(4, 0, 1),
			new Hex(5, 0, 1),
			new Hex(5, 1, 1),
			new Hex(4, 2, 1),
		];

		// グリッドサイズ計算
		this._gridxsize = 0;
		this._gridysize = 0;
		for(var i = 0; i < this._hex.length; i++){
			if(this._gridxsize < this._hex[i].x + 1){this._gridxsize = this._hex[i].x + 1;}
			if(this._gridysize < this._hex[i].y + 1){this._gridysize = this._hex[i].y + 1;}
		}

		// グリッド作成
		this._grid = new Hex[][];
		for(var j = 0; j < this._gridysize; j++){
			this._grid[j] = new Hex[];
			for(var i = 0; i < this._gridxsize; i++){
				this._grid[j][i] = new Hex(i, j, 0);
			}
		}
		// グリッド情報挿入
		for(var i = 0; i < this._hex.length; i++){
			this._grid[this._hex[i].y][this._hex[i].x] = this._hex[i];
		}

		// クラス内部キャンバスに描画
		this._canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = this._size * (this._gridxsize + (this._gridysize - 1) * 0.5) * 0.86602540378 * 2 * this._draft + this._marginx * 2;
		this._canvas.height = this._size * (this._gridysize * 1.5 + 0.5) * this._draft + this._marginy * 2;
		// 基準マス描画
		if(true){
			this._context.fillStyle = "yellow";
			this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
			for(var i = 0; i < this._gridxsize; i++){
				for(var j = 0; j < this._gridysize; j++){
					var cx = this.calcHexCoordx(i, j);
					var cy = this.calcHexCoordy(i, j);
					// 六角形
					this._context.fillStyle = "white";
					this.hexPath(cx, cy, this._context);
					this._context.fill();
					// 文字列
					var sx = this._size * 0.86602540378;
					var tx = cx - sx + 2;
					var ty = cy + this._size * 0.5 - 2;
					var ts = sx * 2 - 4;
					this._context.fillStyle = "black";
					this._context.fillText("(" + i + "," + j + ")", tx, ty, ts);
				}
			}
		}
		// スゴロクマス描画
		for(var i = 0; i < this._hex.length; i++){
			switch(this._hex[i].type){
				case 1: this._context.fillStyle = "red"; break;
				case 2: this._context.fillStyle = "blue"; break;
				default: continue;
			}
			// 六角形
			var cx = this.calcHexCoordx(this._hex[i].x, this._hex[i].y);
			var cy = this.calcHexCoordy(this._hex[i].x, this._hex[i].y);
			this.hexPath(cx, cy, this._context);
			this._context.fill();
			this._context.stroke();
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(x : number, y : number) : void {
		this._gridxpos = x;
		this._gridypos = y;
		// 描画開始
		Ctrl.context.save();
		Ctrl.context.translate(Ctrl.canvas.width * 0.5, Ctrl.canvas.height * 0.5);
		Ctrl.context.scale(Ccvs.scale, Ccvs.scale * Ccvs.sinh);
		Ctrl.context.rotate(Ccvs.rotv);
		Ctrl.context.translate(-this._gridxpos, -this._gridypos);

		// 地形描画
		Ctrl.context.drawImage(this._canvas, 0, 0);

		// テスト
		if(Ccvs.mdn){
			// キャンバスタッチ位置から座標獲得
			var x0 = (Ccvs.mx - Ctrl.canvas.width * 0.5) / Ccvs.scale;
			var y0 = (Ccvs.my - Ctrl.canvas.height * 0.5) / (Ccvs.scale * Ccvs.sinh);
			var px = (x0 *  Ccvs.cosv + y0 * Ccvs.sinv) + this._gridxpos;
			var py = (x0 * -Ccvs.sinv + y0 * Ccvs.cosv) + this._gridypos;
			// タッチ位置描画
			Ctrl.context.fillStyle = "rgba(0, 0, 0, 0.5)";
			Ctrl.context.beginPath();
			Ctrl.context.arc(px, py, 6, 0, Math.PI*2, false);
			Ctrl.context.fill();
			if(!Ctrl.mmv){
				// 座標をヘックス中心座に変換
				var hex = this.getHexFromCoordinate(px, py);
				var cx = this.calcHexCoordx(hex.x, hex.y);
				var cy = this.calcHexCoordy(hex.x, hex.y);
				// タッチヘックス描画
				this.hexPath(cx, cy, Ctrl.context);
				Ctrl.context.fill();
			}
		}

		// 描画終了
		Ctrl.context.restore();
	}

	// ----------------------------------------------------------------
	// インデックスからヘックス中心座標計算
	function calcHexCoordx(i : int, j : int) : number{return this._marginx + this._size * 0.86602540378 * (1 + i * 2 + j) * this._draft;}
	function calcHexCoordy(i : int, j : int) : number{return this._marginy + this._size * (1 + 1.5 * j) * this._draft;}

	// ----------------------------------------------------------------
	// ヘックス中心座標からヘックスパス作成
	function hexPath(cx : number, cy : number, context : CanvasRenderingContext2D) : void{
		context.beginPath();
		context.moveTo(cx + this._size * Math.sin(  0 / 180 * Math.PI), cy + this._size * Math.cos(  0 / 180 * Math.PI));
		context.lineTo(cx + this._size * Math.sin( 60 / 180 * Math.PI), cy + this._size * Math.cos( 60 / 180 * Math.PI));
		context.lineTo(cx + this._size * Math.sin(120 / 180 * Math.PI), cy + this._size * Math.cos(120 / 180 * Math.PI));
		context.lineTo(cx + this._size * Math.sin(180 / 180 * Math.PI), cy + this._size * Math.cos(180 / 180 * Math.PI));
		context.lineTo(cx + this._size * Math.sin(240 / 180 * Math.PI), cy + this._size * Math.cos(240 / 180 * Math.PI));
		context.lineTo(cx + this._size * Math.sin(300 / 180 * Math.PI), cy + this._size * Math.cos(300 / 180 * Math.PI));
		context.closePath();
	}

	// ----------------------------------------------------------------
	// 座標からヘックス情報獲得
	function getHexFromCoordinate(x : number, y : number) : Hex{
		var j = Math.round(((y - this._marginx) / (this._draft * this._size) - 1) / 1.5);
		var i = Math.round(((x - this._marginy) / (this._draft * this._size * 0.86602540378) - 1 - j) / 2);
		return this.getHexFromIndex(i, j);
	}

	// ----------------------------------------------------------------
	// インデックスからヘックス情報獲得
	function getHexFromIndex(i : int, j : int) : Hex{
		if(i < 0 || this._gridxsize <= i){return new Hex(i, j, 0);}
		if(j < 0 || this._gridysize <= j){return new Hex(i, j, 0);}
		return this._grid[j][i];
	}
}

class Hex{
	var x : int;
	var y : int;
	var type : int;
	function constructor(x : int, y : int, type : int){
		this.x = x;
		this.y = y;
		this.type = type;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

