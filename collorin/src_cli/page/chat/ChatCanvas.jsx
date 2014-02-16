import "js/web.jsx";

import "../../util/Loader.jsx";
import "../../bb3d/Ccvs.jsx";
import "../../bb3d/Character.jsx";
import "../../bb3d/GridField.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャンバス
class ChatCanvas extends Ccvs{
	var field : GridField;
	var player : ChatCharacter;
	var member = new ChatCharacter[];
	var clist = new DrawUnit[];
	var slist = new DrawUnit[];
	var pathFinder : ChatPathFinder;
	var tapped : boolean;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(canvas : HTMLCanvasElement){
		super(canvas, 320, 480, Math.PI / 180 * 45, Math.PI / 180 * 45, 2);
	}

	// ----------------------------------------------------------------
	// 初期化
	function init(response : variant) : void{
		// フィールド
		this.field = new GridField(this, Loader.imgs["grid"], response["grid"] as int[][]);
		this.pathFinder = new ChatPathFinder(this.field);
		// 初期カメラ位置
		this.cx = (this.cxmax + this.cxmin) * 0.5;
		this.cy = (this.cymax + this.cymin) * 0.5;
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		this.context.clearRect(0, 0, this.width, this.height);
		this.field.draw(this, this.cx, this.cy, this.tapped);
		for(var i = 0; i < this.member.length; i++){this.member[i].preDraw(this);}
		DrawUnit.drawList(this, this.slist);
		DrawUnit.drawList(this, this.clist);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタークラス
class ChatCharacter{
	var _character : DrawCharacter;
	var _nametag : DrawText;
	var _balloon : DrawBalloon;
	var _shadow : DrawShadow;

	var uid : int;
	var name : string;
	var bust : string;

	var exist : boolean;
	var x : number;
	var y : number;
	var r : number;
	var action : int;
	var dstList = new int[][];

	var _color : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(ccvs : ChatCanvas, charaInfo : variant){
		var img = Loader.imgs["dot_" + charaInfo["code"] as string];
		var drawInfo = new DrawInfo(charaInfo["drawInfo"]);
		var size = charaInfo["size"] as number;

		this.uid = charaInfo["uid"] as int;
		this.name = charaInfo["name"] as string;
		this.bust = Loader.b64imgs["b64_bust_" + charaInfo["code"] as string];
		this.x = charaInfo["x"] as int * 16 + 8;
		this.y = charaInfo["y"] as int * 16 + 8;
		this.r = charaInfo["r"] as int * Math.PI * 0.25;

		this._character = new DrawCharacter(img, drawInfo, size);
		this._nametag = new DrawText(this.name);
		this._balloon = new DrawBalloon();
		this._shadow = new DrawShadow(size);
		ccvs.clist.push(this._character);
		ccvs.clist.push(this._nametag);
		ccvs.clist.push(this._balloon);
		ccvs.slist.push(this._shadow);

		this.exist = true;
		this.setTalk(charaInfo["serif"] as string);
	}

	// ----------------------------------------------------------------
	// 表示深度獲得
	function getDepth() : number{
		return this._character.drz;
	}

	// ----------------------------------------------------------------
	// 色設定
	function setColor(color : string) : void{
		if(this._color == color){return;}
		this._color = color;
		this._character.setColor(color);
	}

	// ----------------------------------------------------------------
	// 会話設定
	function setTalk(message : string) : void{
		this._balloon.setText(message, -1);
	}

	// ----------------------------------------------------------------
	// 計算
	function calc(ccvs : Ccvs) : void{
		if(this.dstList.length > 0){
			// グリッド目的地に向かう
			this.action++;
			var dx = this.dstList[0][0] * 16 + 8;
			var dy = this.dstList[0][1] * 16 + 8;
			var x = dx - this.x;
			var y = dy - this.y;
			var speed = 3.0;
			if(x * x + y * y < speed * speed){
				this.x = dx;
				this.y = dy;
				if(this.dstList[0][2] >= 0){this.r = this.dstList[0][2] * Math.PI * 0.25;}
				this.dstList.shift();
			}else{
				this.r = Math.atan2(y, x);
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
		}
	}

	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(ccvs : Ccvs) : void{
		var x = this.x - ccvs.cx;
		var y = this.y - ccvs.cy;
		this._nametag.preDraw(ccvs, x, y, 40, 1.0);
		this._balloon.preDraw(ccvs, x, y, 50, 1.0);
		this._shadow.preDraw(ccvs, x, y, 0);
		if(this.dstList.length > 0){
			this._character.preDraw(ccvs, x, y, 0, this.r, "walk", ((this.action / 6) as int) % this._character.getLen("walk"));
		}else{
			this._character.preDraw(ccvs, x, y, 0, this.r, "stand", 0);
		}
	}

	// ----------------------------------------------------------------
	// 破棄
	function dispose() : void{
		this.exist = false;
		this._character.exist = false;
		this._nametag.exist = false;
		this._balloon.exist = false;
		this._shadow.exist = false;
	}
}

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

