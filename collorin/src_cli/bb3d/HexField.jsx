import 'js/web.jsx';

import "Ccvs.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class HexField{
	// マップキャンバス
	var _canvas : HTMLCanvasElement;
	var _context : CanvasRenderingContext2D;
	// スゴロクマップ情報
	var _hex : HexFieldCell[];
	// グリッド情報
	var grid : HexFieldCell[][];
	var gridxsize : int;
	var gridysize : int;
	// グリッド定数
	static const _marginx : int = 10;
	static const _marginy : int = 10;
	static const _draft : number = 1.1;
	static const _size : int = 20;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : Ccvs, hex : HexFieldCell[]){
		this._hex = hex;

		// グリッドサイズ計算
		this.gridxsize = 0;
		this.gridysize = 0;
		for(var i = 0; i < this._hex.length; i++){
			if(this.gridxsize < this._hex[i].x + 1){this.gridxsize = this._hex[i].x + 1;}
			if(this.gridysize < this._hex[i].y + 1){this.gridysize = this._hex[i].y + 1;}
		}

		// グリッド作成
		this.grid = new HexFieldCell[][];
		for(var j = 0; j < this.gridysize; j++){
			this.grid[j] = new HexFieldCell[];
			for(var i = 0; i < this.gridxsize; i++){
				this.grid[j][i] = new HexFieldCell(i, j, 0);
			}
		}
		// グリッド情報挿入
		for(var i = 0; i < this._hex.length; i++){
			this.grid[this._hex[i].y][this._hex[i].x] = this._hex[i];
		}

		// クラス内部キャンバスに描画
		this._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = HexField._size * (this.gridxsize + (this.gridysize - 1) * 0.5) * 0.86602540378 * 2 * HexField._draft + HexField._marginx * 2;
		this._canvas.height = HexField._size * (this.gridysize * 1.5 + 0.5) * HexField._draft + HexField._marginy * 2;
		if(false){
			// 基準マス描画
			this._context.fillStyle = "yellow";
			this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
			for(var i = 0; i < this.gridxsize; i++){
				for(var j = 0; j < this.gridysize; j++){
					var cx = this.calcHexCoordx(i, j);
					var cy = this.calcHexCoordy(i, j);
					// 六角形
					this._context.fillStyle = "white";
					this._hexPath(this._context, cx, cy);
					this._context.fill();
					// 文字列
					var sx = HexField._size * 0.86602540378;
					var tx = cx - sx + 2;
					var ty = cy + HexField._size * 0.5 - 2;
					var ts = sx * 2 - 4;
					this._context.fillStyle = "black";
					this._context.fillText("(" + i + "," + j + ")", tx, ty, ts);
				}
			}
		}
		// 最大最小位置の確認準備
		ccvs.cxmax = 0;
		ccvs.cymax = 0;
		ccvs.cxmin = this._canvas.width;
		ccvs.cymin = this._canvas.height;
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
			this._hexPath(this._context, cx, cy);
			this._context.fill();
			this._context.stroke();
			// 最大最小位置の確認
			ccvs.cxmax = Math.max(ccvs.cxmax, cx + HexField._size * 0.86602540378);
			ccvs.cymax = Math.max(ccvs.cymax, cy + HexField._size);
			ccvs.cxmin = Math.min(ccvs.cxmin, cx - HexField._size * 0.86602540378);
			ccvs.cymin = Math.min(ccvs.cymin, cy - HexField._size);
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(ccvs : Ccvs, x : number, y : number, select : boolean) : void {
		// 描画開始
		ccvs.context.save();
		ccvs.context.translate(ccvs.width * 0.5, ccvs.height * 0.5);
		ccvs.context.scale(ccvs.scale, ccvs.scale * ccvs.sinh);
		ccvs.context.rotate(ccvs.rotv);
		ccvs.context.translate(-x, -y);

		// 地形描画
		ccvs.context.drawImage(this._canvas, 0, 0);

		// 選択テスト
		if(select){
			// タッチ位置描画
			ccvs.context.fillStyle = "rgba(0, 0, 0, 0.5)";
			ccvs.context.beginPath();
			ccvs.context.arc(ccvs.tx, ccvs.ty, 6, 0, Math.PI*2, false);
			ccvs.context.fill();
			// 座標をヘックス中心座に変換
			var hex = this.getHexFromCoordinate(ccvs.tx, ccvs.ty);
			if(hex.type > 0){
				var cx = this.calcHexCoordx(hex.x, hex.y);
				var cy = this.calcHexCoordy(hex.x, hex.y);
				// タッチヘックス描画
				this._hexPath(ccvs.context, cx, cy);
				ccvs.context.fill();
			}
		}

		// 描画終了
		ccvs.context.restore();
	}

	// ----------------------------------------------------------------
	// ヘックス中心座標からヘックスパス作成
	function _hexPath(context : CanvasRenderingContext2D, cx : number, cy : number) : void{
		context.beginPath();
		context.moveTo(cx + HexField._size * Math.sin(  0 / 180 * Math.PI), cy + HexField._size * Math.cos(  0 / 180 * Math.PI));
		context.lineTo(cx + HexField._size * Math.sin( 60 / 180 * Math.PI), cy + HexField._size * Math.cos( 60 / 180 * Math.PI));
		context.lineTo(cx + HexField._size * Math.sin(120 / 180 * Math.PI), cy + HexField._size * Math.cos(120 / 180 * Math.PI));
		context.lineTo(cx + HexField._size * Math.sin(180 / 180 * Math.PI), cy + HexField._size * Math.cos(180 / 180 * Math.PI));
		context.lineTo(cx + HexField._size * Math.sin(240 / 180 * Math.PI), cy + HexField._size * Math.cos(240 / 180 * Math.PI));
		context.lineTo(cx + HexField._size * Math.sin(300 / 180 * Math.PI), cy + HexField._size * Math.cos(300 / 180 * Math.PI));
		context.closePath();
	}

	// ----------------------------------------------------------------
	// インデックスからヘックス中心座標計算
	function calcHexCoordx(i : int, j : int) : number{return HexField._marginx + HexField._size * 0.86602540378 * (1 + i * 2 + j) * HexField._draft;}
	function calcHexCoordy(i : int, j : int) : number{return HexField._marginy + HexField._size * (1 + 1.5 * j) * HexField._draft;}

	// ----------------------------------------------------------------
	// 座標からヘックス情報獲得
	function getHexFromCoordinate(x : number, y : number) : HexFieldCell{
		var j = Math.round(((y - HexField._marginx) / (HexField._draft * HexField._size) - 1) / 1.5);
		var i = Math.round(((x - HexField._marginy) / (HexField._draft * HexField._size * 0.86602540378) - 1 - j) / 2);
		return this.getHexFromIndex(i, j);
	}

	// ----------------------------------------------------------------
	// インデックスからヘックス情報獲得
	function getHexFromIndex(i : int, j : int) : HexFieldCell{
		if(i < 0 || this.gridxsize <= i){return new HexFieldCell(i, j, 0);}
		if(j < 0 || this.gridysize <= j){return new HexFieldCell(i, j, 0);}
		return this.grid[j][i];
	}
}

class HexFieldCell{
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

