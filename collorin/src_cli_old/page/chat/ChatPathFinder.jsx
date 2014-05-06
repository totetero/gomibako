import "../../bb3d/GridField.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 経路探索クラス
class ChatPathFinder{
	var _map : GridField;
	var _openList = new int[];
	var _parents = new int[];
	var _costs = new int[];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(map : GridField){
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

