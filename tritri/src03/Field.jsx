import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 移動クラス

// 移動用地形クラス
class FieldMap{
	var img : HTMLImageElement;
	var canvas : HTMLCanvasElement = null;
	var context : CanvasRenderingContext2D;
	var map : int[][];
	var xsize : int;
	var ysize : int;
	
	function getChip(x : int, y : int) : int{
		if(x < 0 || this.xsize <= x){return -1;}
		if(y < 0 || this.ysize <= y){return -1;}
		return this.map[y][x];
	}
	
	// ----------------------------------------------------------------
	// 初期化
	function init(img : HTMLImageElement) : void {
		//NG var a : int[][] = [[1, 2], [3, 4]];
		//NG var a : int[][] = [[1, 2], [3, 4]] : int[][];
		//OK var a : int[][] = [[1, 2] : int[], [3, 4] : int[]] : int[][];
		//OK var a : int[][][] = [[[1, 2] : int[], [3, 4] : int[]], [[5, 6] : int[], [7, 8] : int[]]] : int[][][];
		//OK var a : int[][][] = [[[1, 2] : int[], [3, 4] : int[]], [[5, 6] : int[], [7, 8] : int[]]];
		//NG var a : int[][][] = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] : int[][][];
		this.map = [
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,1,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,3,3,3,3,3,1,1,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,3,3,3,3,3,3,3,3,3,3,1,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,1,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,1,1,1,1,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,1,1,1,5,5,5,5,5,1,1,1,3,3,3,3,1,1,7,7,7,7,7,7] : int[],
			[7,7,7,7,7,1,1,1,1,1,5,5,5,5,5,5,5,5,1,1,1,1,1,1,1,1,7,7,7,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,5,5,5,5,5,5,5,5,5,5,5,5,1,4,4,1,7,7,7,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,1,1,5,5,5,5,5,5,5,5,1,4,4,4,4,4,4,1,7,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,1,4,4,4,5,5,5,5,1,1,1,4,4,4,4,4,4,1,1,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,4,4,4,5,5,6,6,6,6,5,1,1,4,4,4,4,4,4,1,1,7,7,7] : int[],
			[7,7,7,7,7,7,7,1,4,4,4,5,6,6,6,6,6,6,6,5,1,1,4,4,4,1,1,1,1,7,7,7] : int[],
			[7,7,1,4,4,4,7,7,7,7,7,7,6,6,6,6,6,6,6,5,5,1,1,5,5,1,1,1,1,1,7,7] : int[],
			[7,7,1,1,4,4,4,4,4,4,4,7,7,7,7,6,6,6,5,5,5,5,1,1,5,5,1,1,1,1,7,7] : int[],
			[7,7,1,1,1,1,4,4,4,4,4,4,5,6,6,6,6,5,4,4,4,4,1,1,1,4,4,1,1,1,7,7] : int[],
			[7,7,1,1,1,1,1,1,4,4,4,4,4,5,5,5,4,4,4,4,4,4,4,4,4,4,4,4,1,1,7,7] : int[],
			[7,7,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,4,1,4,4,4,4,4,4,4,1,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,1,1,1,4,4,4,4,4,4,1,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,4,4,4,4,1,7,7,7,7] : int[],
			[7,7,7,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,1,7,7,1,1,1,1,4,4,1,7,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,2,2,2,2,2,2,2,1,1,7,7,7,1,1,1,1,1,1,7,7,7,7] : int[],
			[7,7,7,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,7,7,7,7,1,1,1,1,1,7,7,7,7,7] : int[],
			[7,7,7,1,1,3,3,3,3,3,3,1,1,1,1,1,1,1,7,7,7,7,7,1,1,1,1,7,7,7,7,7] : int[],
			[7,7,7,7,1,3,3,3,3,3,3,1,1,1,1,1,1,1,7,7,7,1,1,1,1,1,1,7,7,7,7,7] : int[],
			[7,7,7,7,1,1,3,3,3,3,1,1,1,1,1,1,1,1,7,7,7,1,1,1,1,1,1,7,7,7,7,7] : int[],
			[7,7,7,7,7,1,1,1,1,1,1,7,1,1,1,1,1,7,7,7,7,1,1,1,1,1,1,7,7,7,7,7] : int[],
			[7,7,7,7,7,7,1,1,1,1,1,7,7,7,1,1,7,7,7,7,7,7,1,1,1,1,7,7,7,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7] : int[],
			[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7] : int[]
		];
		this.xsize = this.map[0].length;
		this.ysize = this.map.length;
		this.img = img;
		this.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		
		// 海岸線自動補正地形作成
		var exmap : int[][]  = new int[][];
		for(var j = 0; j < this.ysize; j++){
			exmap[j * 2 + 0] = new int[];
			exmap[j * 2 + 1] = new int[];
			for(var i = 0; i < this.xsize; i++){
				var m = this.getChip(i + 0, j + 0);
				var m00 : int = this.getChip(i - 1, j - 1); var m00f : boolean = (m00 == m || m00 == -1);
				var m01 : int = this.getChip(i + 0, j - 1); var m01f : boolean = (m01 == m || m01 == -1);
				var m02 : int = this.getChip(i + 1, j - 1); var m02f : boolean = (m02 == m || m02 == -1);
				var m10 : int = this.getChip(i - 1, j + 0); var m10f : boolean = (m10 == m || m10 == -1);
				var m12 : int = this.getChip(i + 1, j + 0); var m12f : boolean = (m12 == m || m12 == -1);
				var m20 : int = this.getChip(i - 1, j + 1); var m20f : boolean = (m20 == m || m20 == -1);
				var m21 : int = this.getChip(i + 0, j + 1); var m21f : boolean = (m21 == m || m21 == -1);
				var m22 : int = this.getChip(i + 1, j + 1); var m22f : boolean = (m22 == m || m22 == -1);
				var ex00 : int = m * 2 + 0;
				var ex01 : int = m * 2 + 1;
				var ex10 : int = m * 2 + 0;
				var ex11 : int = m * 2 + 1;
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
		// キャンバスに描画
		this.canvas.width = 16 * this.xsize;
		this.canvas.height = 16 * this.ysize;
		for(var i = 0; i < this.xsize * 2; i++){
			for(var j = 0; j < this.ysize * 2; j++){
				var u : int = (exmap[j][i] % 32) * 8;
				var v : int = (Math.floor(exmap[j][i] / 32)) * 8;
				this.context.drawImage(this.img, u, v, 8, 8, i * 8, j * 8, 8, 8);
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D, x : number, y : number) : void {
		context.drawImage(this.canvas, x, y);
	}
	
	// ----------------------------------------------------------------
	// マップチップの移動コスト
	function getCost(x : int, y : int) : int{return this.getCost(this.getChip(x, y));}
	function getCost(mapchip : int) : int{
		switch(mapchip){
			case 1: return 2;
			case 2: return 1;
			case 3: return 4;
			case 4: return 4;
			case 5: return 8;
			case 6: return 16;
		}
		return 9999;
	}
}

// 経路探索クラス
class PathFinder{
	var map : FieldMap;
	var openList : int[];
	var parents : int[];
	var costs : int[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init(map : FieldMap) : void {
		this.map = map;
		this.openList = new int[];
		this.parents = new int[];
		this.costs = new int[];
		this.snode(0, 0);
	}
	
	// ----------------------------------------------------------------
	// スタートノードのリセット
	function snode(sx : int, sy : int) : void {
		// 全ノード初期化
		this.openList.length = 0;
		for(var i = 0; i < this.map.xsize * this.map.ysize; i++){
			this.parents[i] = -1;
			this.costs[i] = 0;
		}
		// スタートノード登録
		var snode : int = this.map.xsize * sy + sx;
		this.parents[snode] = snode;
		this.openList.push(snode);
	}
	
	// ----------------------------------------------------------------
	// ゴールノードまでへの経路探索
	function gnode(gx : int, gy : int) : void {
		// ゴールノード
		var gnode : int = this.map.xsize * gy + gx;
		// ダイクストラ法
		for(var loop = 0; loop < 9999; loop++){
			// openリストが空ならば終了
			if(this.openList.length == 0){break;}
			// openリストのうち最小コストのノードを取り出す
			var index : int = -1;
			var cnode : int = -1;
			var ccost : int = -1;
			for(var i = 0; i < this.openList.length; i++){
				if(i == 0 || this.costs[this.openList[i]] < ccost){
					index = i;
					cnode = this.openList[i];
					ccost = this.costs[cnode];
				}
			}
			// ゴールノードにたどり着いていたら終了
			if(cnode == gnode){break;}
			this.openList.splice(index, 1);
			// 隣接しているノードを調べる
			var cx : int = cnode % this.map.xsize;
			var cy : int = cnode / this.map.xsize;
			this.checkNode(cnode, cx + 1, cy);
			this.checkNode(cnode, cx - 1, cy);
			this.checkNode(cnode, cx, cy + 1);
			this.checkNode(cnode, cx, cy - 1);
		}
	}
	
	// 内部関数 ノードへのコストを調べる
	function checkNode(parent : int, tx : int, ty : int) : void {
		// マップチップの確認
		var mapchip : int = this.map.getChip(tx, ty);
		if(mapchip < 0){return;}
		// 既チェックの確認
		var tnode : int = this.map.xsize * ty + tx;
		if(this.parents[tnode] >= 0){return;}
		// マップチップのコスト
		var cost : int = this.map.getCost(mapchip);
		if(cost > 127){return;}
		// コストの登録
		this.costs[tnode] = this.costs[parent] + cost;
		this.parents[tnode] = parent;
		this.openList.push(tnode);
	}
}

