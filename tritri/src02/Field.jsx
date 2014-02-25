// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 移動クラス

class Field{
	var map : FieldMap = new FieldMap();
	var place : FieldPlace[] = new FieldPlace[];
	var player : Player = new Player();
	var pathFinder : PathFinder = new PathFinder();
	
	// test
	var mdn : boolean = false;
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {
		this.map.init(ImageLoader.list["mapchip.png"]);
		for(var i = 0; i < 9; i++){this.place[i] = new FieldPlace();}
		this.place[0].init(ImageLoader.list["mapchip.png"], 0, 5, 21);
		this.place[1].init(ImageLoader.list["mapchip.png"], 0, 17, 23);
		this.place[2].init(ImageLoader.list["mapchip.png"], 0, 25, 23);
		this.place[3].init(ImageLoader.list["mapchip.png"], 0, 20, 11);
		this.place[4].init(ImageLoader.list["mapchip.png"], 0, 6, 13);
		this.place[5].init(ImageLoader.list["mapchip.png"], 1, 12, 27);
		this.place[6].init(ImageLoader.list["mapchip.png"], 1, 27, 4);
		this.place[7].init(ImageLoader.list["mapchip.png"], 1, 13, 13);
		this.place[8].init(ImageLoader.list["mapchip.png"], 1, 21, 26);
		this.player.init(ImageLoader.list["player.png"], 5 * 16 + 8, 22 * 16 + 8);
		this.pathFinder.init(this.map);
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {
		
		// test マウスの状態変化確認
		if(this.mdn != Ctrl.mdn){
			this.mdn = Ctrl.mdn;
			if(!this.mdn){
				// マウス離したとき
				this.player.setdst(this.pathFinder);
			}
		}
		
		this.player.calc();
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D) : void {
		this.map.draw(context, this.player.x, this.player.y);
		for(var i = 0; i < this.place.length; i++){this.place[i].draw(context, this.player.x, this.player.y);}
		this.player.preDraw(0, 0, 0);
		this.player.draw(context);
	}
}

// 移動先クラス
class FieldPlace{
	var img : HTMLImageElement;
	var type : int;
	var x : int;
	var y : int;
	
	// ----------------------------------------------------------------
	// 初期化
	function init(img : HTMLImageElement, type : int, x : int, y : int) : void {
		this.img = img;
		this.type = type;
		this.x = x;
		this.y = y;
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D, x : int, y : int) : void {
		context.save();
		context.translate(Ctrl.w * 0.5 - Math.floor(x), Ctrl.h * 0.5 - Math.floor(y));
		context.scale(16, 16);
		switch(this.type){
			case 0: context.drawImage(this.img, 0, 144, 16, 16, this.x, this.y, 1, 1); break;
			case 1: context.drawImage(this.img, 96, 144, 16, 32, this.x, this.y - 1, 1, 2); break;
		}

		context.restore();
	}
}

// 移動用地形クラス
class FieldMap{
	var img : HTMLImageElement;
	var map : int[][];
	var exmap : int[][];
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
		
		// 海岸線自動補正地形作成
		this.exmap = new int[][];
		for(var j = 0; j < this.ysize; j++){
			this.exmap[j * 2 + 0] = new int[];
			this.exmap[j * 2 + 1] = new int[];
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
				this.exmap[j * 2 + 0][i * 2 + 0] = ex00;
				this.exmap[j * 2 + 0][i * 2 + 1] = ex01;
				this.exmap[j * 2 + 1][i * 2 + 0] = ex10;
				this.exmap[j * 2 + 1][i * 2 + 1] = ex11;
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D, x : number, y : number) : void {
		context.save();
		context.translate(Ctrl.w * 0.5 - Math.floor(x), Ctrl.h * 0.5 - Math.floor(y));
		if(false){
			// 通常地形の描画
			context.scale(16, 16);
			for(var j = 0; j < this.ysize; j++){
				for(var i = 0; i < this.xsize; i++){
					var u : int = (this.map[j][i] % 16) * 16;
					var v : int = (Math.floor(this.map[j][i] / 16)) * 16;
					context.drawImage(this.img, u, v, 16, 16, i, j, 1, 1);
				}
			}
		}else{
			// 海岸線自動補正地形の描画
			context.scale(8, 8);
			var xmax : int = this.xsize * 2;
			var ymax : int = this.ysize * 2;
			var i0 = Math.floor(x / 8) - 22;
			var i1 = Math.floor(x / 8) + 22;
			var j0 = Math.floor(y / 8) - 22;
			var j1 = Math.floor(y / 8) + 22;
			for(var j = j0; j < j1; j++){
				var jy : int = j; if(jy < 0){jy = (2 + jy % 2) % 2;}else if(jy >= ymax){jy = ymax - 2 + jy % 2;}
				for(var i = i0; i < i1; i++){
					var ix : int = i; if(ix < 0){ix = (2 + ix % 2) % 2;}else if(ix >= xmax){ix = xmax - 2 + ix % 2;}
					var u : int = (this.exmap[jy][ix] % 32) * 8;
					var v : int = (Math.floor(this.exmap[jy][ix] / 32)) * 8;
					context.drawImage(this.img, u, v, 8, 8, i, j, 1, 1);
				}
			}
		}
		context.restore();
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
		var cost : int = 9999;
		switch(mapchip){
			case 1: cost =  2; break;
			case 2: cost =  1; break;
			case 3: cost =  4; break;
			case 4: cost =  4; break;
			case 5: cost =  8; break;
			case 6: cost = 16; break;
		}
		if(cost > 127){return;}
		// コストの登録
		this.costs[tnode] = this.costs[parent] + cost;
		this.parents[tnode] = parent;
		this.openList.push(tnode);
	}
}

// 移動用プレイヤークラス
class Player extends Character{
	var dstList : FieldDistination[] = new FieldDistination[];
	
	// ----------------------------------------------------------------
	// 移動先リストの更新
	function setdst(pathFinder : PathFinder) : void {
		var gx : int = (Ctrl.mx - (Ctrl.w * 0.5 - Math.floor(this.x))) / 16;
		var gy : int = (Ctrl.my - (Ctrl.h * 0.5 - Math.floor(this.y))) / 16;
		var sx : int = this.x / 16;
		var sy : int = this.y / 16;
		if(pathFinder.map.getChip(gx, gy) < 0){return;}
		if(pathFinder.map.getChip(sx, sy) < 0){return;}
		// 経路探索
		pathFinder.snode(sx, sy);
		pathFinder.gnode(gx, gy);
		var node : int = pathFinder.map.xsize * gy + gx;
		if(pathFinder.parents[node] < 0){return;}
		// 移動先リストの初期化
		this.dstList.length = 0;
		for(var i = 0; i < 9999; i++){
			// スタートノードチェック
			if(pathFinder.costs[node] == 0){break;}
			// ノードを登録
			var dst : FieldDistination = new FieldDistination();
			dst.x = (node % pathFinder.map.xsize) * 16 + 8;
			dst.y = Math.floor(node / pathFinder.map.xsize) * 16 + 8;
			this.dstList.unshift(dst);
			// 次のノードへ
			node = pathFinder.parents[node];
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : void {
		this.action++;
		if(this.dstList.length > 0){
			// 移動先リストによる方向の確認
			var x : int = this.dstList[0].x - this.x;
			var y : int = this.dstList[0].y - this.y;
			this.r = Math.atan2(y, x);
			// 移動
			var speed : number = 3;
			if(x * x + y * y < speed * speed){
				this.x = this.dstList[0].x;
				this.y = this.dstList[0].y;
				this.dstList.shift();
			}else{
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
		}else{
			// 十字キーによる方向の確認
			if     (Ctrl.krt && Ctrl.kup){this.r = Math.PI * 1.74;}
			else if(Ctrl.klt && Ctrl.kup){this.r = Math.PI * 1.26;}
			else if(Ctrl.klt && Ctrl.kdn){this.r = Math.PI * 0.74;}
			else if(Ctrl.krt && Ctrl.kdn){this.r = Math.PI * 0.26;}
			else if(Ctrl.krt){this.r = Math.PI * 0.00;}
			else if(Ctrl.kup){this.r = Math.PI * 1.50;}
			else if(Ctrl.klt){this.r = Math.PI * 1.00;}
			else if(Ctrl.kdn){this.r = Math.PI * 0.50;}
			else{this.action = 0;}
			// 移動
			if(this.action > 0){
				var speed : number = 1;
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
		}

	}
}

// プレイヤーの移動先クラス
class FieldDistination{
	var x : int;
	var y : int;
}

