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
		Ctrl.sctx.save();
		Ctrl.sctx.translate(bcvs.centerx, bcvs.centery);
		Ctrl.sctx.scale(bcvs.scale, bcvs.scale * bcvs.sinh);
		Ctrl.sctx.rotate(bcvs.rotv);
		Ctrl.sctx.translate(-x, -y);

		// 地形描画
		Ctrl.sctx.drawImage(this._canvas, 0, 0);

		// 選択テスト
		if(select){
			// タッチ位置描画
			Ctrl.sctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			Ctrl.sctx.beginPath();
			Ctrl.sctx.arc(bcvs.tx, bcvs.ty, 6, 0, Math.PI*2, false);
			Ctrl.sctx.fill();
			// 座標をグリッド中心座に変換
			var cx = Math.floor(bcvs.tx / 16);
			var cy = Math.floor(bcvs.ty / 16);
			if(this.getGridFromIndex(cx, cy) > 0){
				Ctrl.sctx.fillRect(cx * 16, cy * 16, 16, 16);
			}
		}

		// 描画終了
		Ctrl.sctx.restore();
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

// 経路探索クラス
class Bb3dChatFieldPathFinder{
	var _map : Bb3dChatField;
	var _openList = new int[];
	var _parents = new int[];
	var _costs = new int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(map : Bb3dChatField){
		this._map = map;
	}

	// ----------------------------------------------------------------
	// スタートノードのリセット
	function _snode(sx : int, sy : int) : void{
		// 全ノード初期化
		this._openList.length = 0;
		for(var i = 0; i < this._map.gridxsize * this._map.gridysize; i++){
			this._parents[i] = -1;
			this._costs[i] = 0;
		}
		// スタートノード登録
		var snode = this._map.gridxsize * sy + sx;
		this._parents[snode] = snode;
		this._openList.push(snode);
	}

	// ----------------------------------------------------------------
	// ゴールノードまでへの経路探索
	function _gnode(gx : int, gy : int) : void{
		// ゴールノード
		var gnode = this._map.gridxsize * gy + gx;
		// ダイクストラ法
		for(var loop = 0; loop < 9999; loop++){
			// openリストが空ならば終了
			if(this._openList.length == 0){break;}
			// openリストのうち最小コストのノードを取り出す
			var index = -1;
			var cnode = -1;
			var ccost = -1;
			for(var i = 0; i < this._openList.length; i++){
				if(i == 0 || this._costs[this._openList[i]] < ccost){
					index = i;
					cnode = this._openList[i];
					ccost = this._costs[cnode];
				}
			}
			// ゴールノードにたどり着いていたら終了
			if(cnode == gnode){break;}
			this._openList.splice(index, 1);
			// 隣接しているノードを調べる
			var cx : int = cnode % this._map.gridxsize;
			var cy : int = cnode / this._map.gridxsize;
			this._checkNode(cnode, cx + 1, cy);
			this._checkNode(cnode, cx - 1, cy);
			this._checkNode(cnode, cx, cy + 1);
			this._checkNode(cnode, cx, cy - 1);
			this._checkNode(cnode, cx + 1, cy + 1);
			this._checkNode(cnode, cx - 1, cy + 1);
			this._checkNode(cnode, cx + 1, cy - 1);
			this._checkNode(cnode, cx - 1, cy - 1);
		}
	}

	// ----------------------------------------------------------------
	// ノードへのコストを調べる
	function _checkNode(parent : int, tx : int, ty : int) : void{
		// マップチップの確認
		var mapchip = this._map.getGridFromIndex(tx, ty);
		if(mapchip <= 0){return;}
		// 既チェックの確認
		var tnode = this._map.gridxsize * ty + tx;
		if(this._parents[tnode] >= 0){return;}
		// コストの登録
		this._costs[tnode] = this._costs[parent] + 1;
		this._parents[tnode] = parent;
		this._openList.push(tnode);
	}

	// ----------------------------------------------------------------
	// 経路を調べる
	function getDstList(sx : int, sy : int, dst : int[]) : int[][]{
		var gx = dst[0];
		var gy = dst[1];
		this._snode(sx, sy);
		this._gnode(gx, gy);
		var node = this._map.gridxsize * gy + gx;
		var dstList = [dst];
		for(var i = 0; i < 9999; i++){
			if(this._costs[node] == 0){break;}
			var x : int = node % this._map.gridxsize;
			var y : int = node / this._map.gridxsize;
			dstList.unshift([x, y, -1]);
			node = this._parents[node];
		}
		return dstList;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

