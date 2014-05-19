import 'js/web.jsx';

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "Bb3dChatCanvas.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class Bb3dChatField{
	// マップキャンバス
	var _img : HTMLImageElement;
	var _canvas : HTMLCanvasElement;
	var _context : CanvasRenderingContext2D;
	// グリッド情報
	var grid : int[][];
	var gridxsize : int;
	var gridysize : int;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(bcvs : Bb3dChatCanvas, img : HTMLImageElement, map : int[][]){
		this._img = img;
		this.grid = map;

		// グリッドサイズ計算 
		this.gridxsize = this.grid[0].length;
		this.gridysize = this.grid.length;
		
		// 海岸線自動補正地形作成
		var exmap = new int[][];
		for(var j = 0; j < this.gridysize; j++){
			exmap[j * 2 + 0] = new int[];
			exmap[j * 2 + 1] = new int[];
			for(var i = 0; i < this.gridxsize; i++){
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
		this._canvas.width = 16 * this.gridxsize;
		this._canvas.height = 16 * this.gridysize;
		for(var i = 0; i < this.gridxsize * 2; i++){
			for(var j = 0; j < this.gridysize * 2; j++){
				var u = (exmap[j][i] % 32) * 8;
				var v = ((exmap[j][i] / 32) as int) * 8;
				this._context.drawImage(this._img, u, v, 8, 8, i * 8, j * 8, 8, 8);
			}
		}

		// グリッド
		this._context.strokeStyle = "rgba(0,0,0,0.1)";
		for(var i = 0; i < this.gridxsize + 1; i++){
			this._context.beginPath();
			this._context.moveTo(i * 16, 0);
			this._context.lineTo(i * 16, this.gridysize * 16);
			this._context.stroke();
		}
		for(var i = 0; i < this.gridysize + 1; i++){
			this._context.beginPath();
			this._context.moveTo(0, i * 16);
			this._context.lineTo(this.gridxsize * 16, i * 16);
			this._context.stroke();
		}

		// 穴の部分をクリア
		for(var i = 0; i < this.gridxsize; i++){
			for(var j = 0; j < this.gridysize; j++){
				if(this.getGridFromIndex(i, j) == 0){
					this._context.clearRect(i * 16, j * 16, 16, 16);
				}
			}
		}

		// 最大最小位置の確認
		bcvs.cxmax = 0;
		bcvs.cymax = 0;
		bcvs.cxmin = this._canvas.width;
		bcvs.cymin = this._canvas.height;
		for(var i = 0; i < this.gridxsize; i++){
			for(var j = 0; j < this.gridysize; j++){
				if(this.getGridFromIndex(i, j) > 0){
					bcvs.cxmax = Math.max(bcvs.cxmax, (i + 1) * 16);
					bcvs.cymax = Math.max(bcvs.cymax, (j + 1) * 16);
					bcvs.cxmin = Math.min(bcvs.cxmin, (i + 0) * 16);
					bcvs.cymin = Math.min(bcvs.cymin, (j + 0) * 16);
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画
	function draw(bcvs : Bb3dChatCanvas, x : number, y : number, select : boolean) : void {
		// 描画開始
		Ctrl.gctx.save();
		Ctrl.gctx.translate(Ctrl.screen.w * 0.5, Ctrl.screen.h * 0.5);
		Ctrl.gctx.scale(bcvs.scale, bcvs.scale * bcvs.sinh);
		Ctrl.gctx.rotate(bcvs.rotv);
		Ctrl.gctx.translate(-x, -y);

		// 地形描画
		Ctrl.gctx.drawImage(this._canvas, 0, 0);

		// 選択テスト
		if(select){
			// タッチ位置描画
			Ctrl.gctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			Ctrl.gctx.beginPath();
			Ctrl.gctx.arc(bcvs.tx, bcvs.ty, 6, 0, Math.PI*2, false);
			Ctrl.gctx.fill();
			// 座標をグリッド中心座に変換
			var cx = Math.floor(bcvs.tx / 16);
			var cy = Math.floor(bcvs.ty / 16);
			if(this.getGridFromIndex(cx, cy) > 0){
				Ctrl.gctx.fillRect(cx * 16, cy * 16, 16, 16);
			}
		}

		// 描画終了
		Ctrl.gctx.restore();
	}

	// ----------------------------------------------------------------
	// インデックスからグリッド情報獲得
	function getGridFromIndex(x : int, y : int) : int{
		if(x < 0 || this.gridxsize <= x){return -1;}
		if(y < 0 || this.gridysize <= y){return -1;}
		return this.grid[y][x];
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

