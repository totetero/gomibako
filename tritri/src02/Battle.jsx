// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 戦闘クラス

class Battle{
	var map : BattleMap = new BattleMap();
	// キャラクター
	var hero : Hero = new Hero();
	var enemy : Enemy = new Enemy();
	var clist : BattleCharacter[] = new BattleCharacter[];
	// サークルサイズ
	var radius : number = 0;
	var action : int = 0;
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {
		this.map.init(ImageLoader.list["mapchip.png"]);
		this.hero.init(ImageLoader.list["player.png"], 0, 0);
		this.enemy.init(ImageLoader.list["enemy.png"], 100, 0);
		this.clist.push(this.hero);
		this.clist.push(this.enemy);
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {
		this.map.calc();
		// サークルサイズ更新
		if(this.action != 0 && this.action < 5){this.action++;}
		this.radius = Math.abs(128 * this.action * 0.2);
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D) : void {
		if(this.action == 0){return;}
		
		this.hero.calc();
		this.enemy.calc(this.hero);
		//var t : number = 1 - this.radius * 0.5 / 128;
		var t : number = 0.5;
		var mx : number = this.hero.x * t + this.enemy.x * (1 - t);
		var my : number = this.hero.y * t + this.enemy.y * (1 - t);
		var px : number = this.hero.x - mx;
		var py : number = this.hero.y - my;
		var ex : number = this.enemy.x - mx;
		var ey : number = this.enemy.y - my;
		
		this.hero.preDraw(px, py);
		this.enemy.preDraw(ex, ey);
		this.clist.sort(function(c0 : Nullable.<BattleCharacter>, c1 : Nullable.<BattleCharacter>) : number {return (c0.z - c1.z) * 1000;});
		this.map.draw(context, mx, my, this.radius);
		for(var i = 0; i < this.clist.length; i++){
			this.clist[i].draw(context, this.radius);
		}
	}
}

// 戦闘用地形クラス
class BattleMap{
	var img : HTMLImageElement;
	var map : int[][][];
	var xsize : int;
	var ysize : int;
	var mapid : int;
	// 回転
	static var rotv : number = Math.PI * -0.1;
	var mdn : boolean = false;
	var tempmx : int;
	var temprv : number;
	
	// ----------------------------------------------------------------
	// 初期化
	function init(img : HTMLImageElement) : void {
		this.map = [[
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[],
			[1,1,1,1,1,1,1,1] : int[]
		],[
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[],
			[2,2,2,2,2,2,2,2] : int[]
		]];
		this.xsize = this.map[0][0].length;
		this.ysize = this.map[0].length;
		this.mapid = 1;
		this.img = img;
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {
		// マウスの状態変化確認
		if(this.mdn != Ctrl.mdn){
			this.mdn = Ctrl.mdn;
			if(this.mdn){
				// マウス押したとき
				this.tempmx = Ctrl.mx;
				this.temprv = BattleMap.rotv;
			}
		}
		// マウスのドラッグによる回転確認
		if(this.mdn){BattleMap.rotv = this.temprv - (Ctrl.mx - this.tempmx) * 0.03;}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D, x : number, y : number, rad : number) : void {
		context.save();
		context.translate(Ctrl.w * 0.5, Ctrl.h * 0.5);
		context.scale(1, 0.5);
		context.rotate(BattleMap.rotv);
		// 円形の枠線
		context.beginPath();
		context.fillStyle = "#000";
		context.arc(0, 0, rad + 18, 0, Math.PI * 2.0, true);
		context.fill();
		// 円形のくりぬき
		context.beginPath();
		context.arc(0, 0, rad, 0, Math.PI * 2.0, true);
		context.clip();
		// マップ描画
		context.translate(-x, -y);
		context.scale(16, 16);
		var size : int = 9;
		var i0 : int = x / 16;
		var j0 : int = y / 16;
		for(var j = j0 - size; j < j0 + size; j++){
			for(var i = i0 - size; i < i0 + size; i++){
				var i1 = i % this.xsize; if(i1 < 0){i1 += this.xsize;}
				var j1 = j % this.ysize; if(j1 < 0){j1 += this.ysize;}
				var u : int = (this.map[this.mapid][j1][i1] % 16) * 16;
				var v : int = (Math.floor(this.map[this.mapid][j1][i1] * 0.0625)) * 16;
				context.drawImage(this.img, u, v, 16, 16, i, j, 1, 1);
			}
		}
		context.restore();
	}
}

// 戦闘用キャラクタークラス
class BattleCharacter extends Character{
	var radrad : number;
	
	// ----------------------------------------------------------------
	// 描画準備
	function preDraw(x : number, y : number) : void {
		this.radrad = x * x + y * y;
		super.preDraw(x, y, BattleMap.rotv);
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(context : CanvasRenderingContext2D, rad : number) : void {
		if(rad * rad > this.radrad){super.draw(context);}
	}
}

// 戦闘用プレイヤークラス
class Hero extends BattleCharacter{
	// ----------------------------------------------------------------
	// 計算
	override function calc() : void {
		this.action++;
		// 方向の確認
		if     (Ctrl.krt && Ctrl.kup){this.r = Math.PI * 1.74 - BattleMap.rotv;}
		else if(Ctrl.klt && Ctrl.kup){this.r = Math.PI * 1.26 - BattleMap.rotv;}
		else if(Ctrl.klt && Ctrl.kdn){this.r = Math.PI * 0.74 - BattleMap.rotv;}
		else if(Ctrl.krt && Ctrl.kdn){this.r = Math.PI * 0.26 - BattleMap.rotv;}
		else if(Ctrl.krt){this.r = Math.PI * 0.00 - BattleMap.rotv;}
		else if(Ctrl.kup){this.r = Math.PI * 1.50 - BattleMap.rotv;}
		else if(Ctrl.klt){this.r = Math.PI * 1.00 - BattleMap.rotv;}
		else if(Ctrl.kdn){this.r = Math.PI * 0.50 - BattleMap.rotv;}
		else{this.action = 0;}
		// 移動
		if(this.action > 0){
			var speed : number = 1;
			this.x += speed * Math.cos(this.r);
			this.y += speed * Math.sin(this.r);
		}
	}
}

// 敵クラス
class Enemy extends BattleCharacter{
	// ----------------------------------------------------------------
	// 計算
	function calc(obj : BattleCharacter) : void {
		var x : number = obj.x - this.x;
		var y : number = obj.y - this.y;
		this.r = Math.atan2(y, x);
	}
}

