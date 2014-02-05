import 'js/web.jsx';

import "Ccvs.jsx";

// Bb3d (billboard base 3d graphic library)
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class GridField{
	// マップキャンバス
	var _img : HTMLImageElement;
	var _canvas : HTMLCanvasElement;
	var _context : CanvasRenderingContext2D;
	// グリッド情報
	var _grid : int[][];
	var _gridxsize : int;
	var _gridysize : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : Ccvs, img : HTMLImageElement, map : int[][]){
		this._img = img;
		this._grid = map;

		// グリッドサイズ計算 
		this._gridxsize = this._grid[0].length;
		this._gridysize = this._grid.length;
		
		// 海岸線自動補正地形作成
		var exmap = new int[][];
		for(var j = 0; j < this._gridysize; j++){
			exmap[j * 2 + 0] = new int[];
			exmap[j * 2 + 1] = new int[];
			for(var i = 0; i < this._gridxsize; i++){
				var m = this.getGridFromIndex(i + 0, j + 0);
				var m00 = this.getGridFromIndex(i - 1, j - 1); var m00f = (m00 == m || m00 == -1);
				var m01 = this.getGridFromIndex(i + 0, j - 1); var m01f = (m01 == m || m01 == -1);
				var m02 = this.getGridFromIndex(i + 1, j - 1); var m02f = (m02 == m || m02 == -1);
				var m10 = this.getGridFromIndex(i - 1, j + 0); var m10f = (m10 == m || m10 == -1);
				var m12 = this.getGridFromIndex(i + 1, j + 0); var m12f = (m12 == m || m12 == -1);
				var m20 = this.getGridFromIndex(i - 1, j + 1); var m20f = (m20 == m || m20 == -1);
				var m21 = this.getGridFromIndex(i + 0, j + 1); var m21f = (m21 == m || m21 == -1);
				var m22 = this.getGridFromIndex(i + 1, j + 1); var m22f = (m22 == m || m22 == -1);
				var ex00 = m * 2 + 0;
				var ex01 = m * 2 + 1;
				var ex10 = m * 2 + 0;
				var ex11 = m * 2 + 1;
				if(m01f){
					if(m10f){if(m00f){ex00 += 10 * 32;}else{ex00 += 8 * 32;}}else{ex00 += 4 * 32;}
					if(m12f){if(m02f){ex01 += 10 * 32;}else{ex01 += 8 * 32;}}else{ex01 += 4 * 32;}
				}else{
					if(m10f){ex00 += 6 * 32;}else{ex00 += 2 * 32;}
					if(m12f){ex01 += 6 * 32;}else{ex01 += 2 * 32;}
				}
				if(m21f){
					if(m10f){if(m20f){ex10 += 11 * 32;}else{ex10 += 9 * 32;}}else{ex10 += 5 * 32;}
					if(m12f){if(m22f){ex11 += 11 * 32;}else{ex11 += 9 * 32;}}else{ex11 += 5 * 32;}
				}else{
					if(m10f){ex10 += 7 * 32;}else{ex10 += 3 * 32;}
					if(m12f){ex11 += 7 * 32;}else{ex11 += 3 * 32;}
				}
				exmap[j * 2 + 0][i * 2 + 0] = ex00;
				exmap[j * 2 + 0][i * 2 + 1] = ex01;
				exmap[j * 2 + 1][i * 2 + 0] = ex10;
				exmap[j * 2 + 1][i * 2 + 1] = ex11;
			}
		}
		// クラス内部キャンバスに描画
		this._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = 16 * this._gridxsize;
		this._canvas.height = 16 * this._gridysize;
		for(var i = 0; i < this._gridxsize * 2; i++){
			for(var j = 0; j < this._gridysize * 2; j++){
				var u = (exmap[j][i] % 32) * 8;
				var v = ((exmap[j][i] / 32) as int) * 8;
				this._context.drawImage(this._img, u, v, 8, 8, i * 8, j * 8, 8, 8);
			}
		}

		// グリッド
		this._context.strokeStyle = "rgba(0,0,0,0.1)";
		for(var i = 0; i < this._gridxsize + 1; i++){
			this._context.beginPath();
			this._context.moveTo(i * 16, 0);
			this._context.lineTo(i * 16, this._gridysize * 16);
			this._context.stroke();
		}
		for(var i = 0; i < this._gridysize + 1; i++){
			this._context.beginPath();
			this._context.moveTo(0, i * 16);
			this._context.lineTo(this._gridxsize * 16, i * 16);
			this._context.stroke();
		}

		// 穴の部分をクリア
		for(var i = 0; i < this._gridxsize; i++){
			for(var j = 0; j < this._gridysize; j++){
				if(this.getGridFromIndex(i, j) == 0){
					this._context.clearRect(i * 16, j * 16, 16, 16);
				}
			}
		}

		// 最大最小位置の確認
		ccvs.cxmax = 0;
		ccvs.cymax = 0;
		ccvs.cxmin = this._canvas.width;
		ccvs.cymin = this._canvas.height;
		for(var i = 0; i < this._gridxsize; i++){
			for(var j = 0; j < this._gridysize; j++){
				if(this.getGridFromIndex(i, j) > 0){
					ccvs.cxmax = Math.max(ccvs.cxmax, (i + 1) * 16);
					ccvs.cymax = Math.max(ccvs.cymax, (j + 1) * 16);
					ccvs.cxmin = Math.min(ccvs.cxmin, (i + 0) * 16);
					ccvs.cymin = Math.min(ccvs.cymin, (j + 0) * 16);
				}
			}
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
			// 座標をグリッド中心座に変換
			var cx = Math.floor(ccvs.tx / 16);
			var cy = Math.floor(ccvs.ty / 16);
			if(this.getGridFromIndex(cx, cy) > 0){
				ccvs.context.fillRect(cx * 16, cy * 16, 16, 16);
			}
		}

		// 描画終了
		ccvs.context.restore();
	}

	// ----------------------------------------------------------------
	// インデックスからグリッド情報獲得
	function getGridFromIndex(x : int, y : int) : int{
		if(x < 0 || this._gridxsize <= x){return -1;}
		if(y < 0 || this._gridysize <= y){return -1;}
		return this._grid[y][x];
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

