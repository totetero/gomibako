import 'js/web.jsx';
import 'timer.jsx';

import 'Main.jsx';
import 'Field.jsx';
import 'Character.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ゲームクラス

class Game{
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {}
	// ----------------------------------------------------------------
	// 計算
	function calc() : void {}
	// ----------------------------------------------------------------
	// 描画
	function draw() : void {}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ゲームクラス

class GameField extends Game{
	static var game : GameField;
	var map : FieldMap = new FieldMap();
	var town : FieldPlace = new FieldPlace();
	var olist : FieldObject[] = new FieldObject[];
	var plist : FieldCharacter[] = new FieldCharacter[];
	var elist : FieldCharacter[] = new FieldCharacter[];
	var timer : int = 0;
	// 選択情報
	var oselected : FieldObject = null;
	var selectedx : int = 0;
	var selectedy : int = 0;
	var selectedtype : int = 0;
	// スクロール情報
	var mdn : boolean = false;
	var mmv : boolean = false;
	var scrollx : number = 20;
	var scrolly : number = 140;
	var scrollvx : number = 0;
	var scrollvy : number = 0;
	var scrollmx : number = 0;
	var scrollmy : number = 0;
	// ----------------------------------------------------------------
	// 初期化
	override function init() : void {
		GameField.game = this;
		this.map.init(ImageLoader.list["map"]);
		// 拠点
		this.town.init(0, 5, 21);
		this.olist.push(this.town);
		// プレイヤー
		for(var i = 0; i < 3; i++){
			var player : FieldPlayer = new FieldPlayer();
			player.init(i + 1);
			for(var j = 0; j < 9999; j++){
				var x : int = (this.town.x + Math.random() * 120 - 60) / 16;
				var y : int = (this.town.y + Math.random() * 120 - 60) / 16;
				if(this.map.getCost(x, y) < 128){
					player.x = x * 16 + 8;
					player.y = y * 16 + 8;
					player.dstx = player.x;
					player.dsty = player.y;
					player.r = Math.PI * 0.5;
					this.olist.push(player);
					this.plist.push(player);
					break;
				}
			}
		}
		// 敵キャラ
		for(var i = 0; i < 32; i++){
			var enemy : FieldEnemy = new FieldEnemy();
			enemy.init();
			for(var j = 0; j < 9999; j++){
				var x : int = Math.random() * this.map.xsize;
				var y : int = Math.random() * this.map.ysize;
				if(Math.abs(x - this.town.x / 16) < 5 && Math.abs(y - this.town.y / 16) < 5){continue;}
				if(this.map.getCost(x, y) < 128){
					enemy.x = x * 16 + 8;
					enemy.y = y * 16 + 8;
					enemy.r = Math.random() * Math.PI * 2;
					this.olist.push(enemy);
					this.elist.push(enemy);
					break;
				}
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : void {
		// 選択確認
		if(this.oselected == null && !this.mmv && Ctrl.mdn){
			var mx : number = this.scrollx + Ctrl.mx;
			var my : number = this.scrolly + Ctrl.my;
			for(var i = 0; i < this.olist.length; i++){
				if(this.olist[i].select(mx, my)){
					this.oselected = this.olist[i];
					break;
				}
			}
		}
		
		if(this.oselected != null){
			// 選択処理
			if(!this.oselected.selecting()){this.oselected = null;}
		}else if(this.mdn != Ctrl.mdn){
			// クリック処理
			this.mdn = Ctrl.mdn;
			if(!this.mdn){
				this.mmv = false;
			}
		}else if(Ctrl.mdn){
			// スクロール処理
			var x : number = this.scrollmx - Ctrl.mx;
			var y : number = this.scrollmy - Ctrl.my;
			if(this.mmv || x * x + y * y > 3 * 3){
				this.mmv = true;
				this.scrollvx = this.scrollmx - Ctrl.mx;
				this.scrollvy = this.scrollmy - Ctrl.my;
			}
		}
		this.scrollx += this.scrollvx;
		this.scrolly += this.scrollvy;
		this.scrollvx *= 0.5;
		this.scrollvy *= 0.5;
		this.scrollmx = Ctrl.mx;
		this.scrollmy = Ctrl.my;
		var maxx : int = 16 * this.map.xsize - Ctrl.w;
		var maxy : int = 16 * this.map.ysize - Ctrl.h;
		if(this.scrollx < 0){this.scrollx = 0;}else if(this.scrollx > maxx){this.scrollx = maxx;}
		if(this.scrolly < 0){this.scrolly = 0;}else if(this.scrolly > maxy){this.scrolly = maxy;}
		
		// キャラクター計算
		for(var i = 0; i < this.olist.length; i++){this.olist[i].calc();}
		// あたり判定
		for(var i = 0; i < this.plist.length; i++){
			if(this.plist[i].status != 0){continue;}
			for(var j = 0; j < this.elist.length; j++){
				if(this.elist[j].status != 0){continue;}
				var x = this.plist[i].x - this.elist[j].x;
				var y = this.plist[i].y - this.elist[j].y;
				if(x * x + y * y < 8 * 8){
					switch((3 + this.plist[i].type - this.elist[j].type) % 3){
						case 2: // プレイヤーの勝ち
							this.plist[i].status = 1;
							this.elist[j].status = 3;
							this.plist[i].action = 0;
							this.elist[j].action = 0;
							break;
						case 0: // あいこ
							this.plist[i].status = 2;
							this.elist[j].status = 2;
							this.plist[i].action = 0;
							this.elist[j].action = 0;
							break;
						case 1: // プレイヤーの負け
							this.plist[i].status = 3;
							this.elist[j].status = 1;
							this.plist[i].action = 0;
							this.elist[j].action = 0;
							break;
					}
					this.elist[j].r = Math.atan2(y, x);
					this.plist[i].r = this.elist[j].r + Math.PI;
				}
			}
		}
		// 生存判定
		for(var i = 0; i < this.olist.length; i++){if(!this.olist[i].exist){this.olist.splice(i--, 1);}}
		for(var i = 0; i < this.plist.length; i++){if(!this.plist[i].exist){this.plist.splice(i--, 1);}}
		for(var i = 0; i < this.elist.length; i++){if(!this.elist[i].exist){this.elist.splice(i--, 1);}}
		// タイマー
		if(this.elist.length > 0){this.timer++;}
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw() : void {
		// 地形描画
		this.map.draw(Ctrl.context, -this.scrollx, -this.scrolly);
		// 選択カーソル描画
		if(this.oselected != null && this.selectedtype > 0){
			switch(this.selectedtype){
				case 1: Ctrl.context.strokeStyle = "rgb(256, 0, 0)"; break;
				case 2: Ctrl.context.strokeStyle = "rgb(0, 128, 0)"; break;
				case 3: Ctrl.context.strokeStyle = "rgb(0, 0, 256)"; break;
				default: Ctrl.context.strokeStyle = "rgb(0, 0, 0)"; break;
			}
			var x : int = this.selectedx * 16 - this.scrollx;
			var y : int = this.selectedy * 16 - this.scrolly;
			Ctrl.context.strokeRect(x, y, 16, 16);
			Ctrl.context.strokeRect(x - 5, y - 5, 26, 26);
			Ctrl.context.strokeRect(x - 10, y - 10, 36, 36);
		}
		// キャラクター描画
		for(var i = 0; i < this.olist.length; i++){this.olist[i].preDraw(-this.scrollx, -this.scrolly, 0);}
		this.olist.sort(function(p0 : Nullable.<FieldObject>, p1 : Nullable.<FieldObject>) : number {return (p0.z - p1.z) * 1000;});
		for(var i = 0; i < this.olist.length; i++){this.olist[i].draw(Ctrl.context);}
		
		// 相関図
		Ctrl.context.drawImage(ImageLoader.list["map"],  216, 224, 40, 32, Ctrl.w - 50, Ctrl.h - 42, 40, 32);
		// 生存マーカー
		Ctrl.context.drawImage(ImageLoader.list["map"],  0 + (this.town.pflag[0] ? 16 : 0), 240, 16, 16, 10, Ctrl.h - 26, 16, 16);
		Ctrl.context.drawImage(ImageLoader.list["map"], 32 + (this.town.pflag[1] ? 16 : 0), 240, 16, 16, 31, Ctrl.h - 26, 16, 16);
		Ctrl.context.drawImage(ImageLoader.list["map"], 64 + (this.town.pflag[2] ? 16 : 0), 240, 16, 16, 52, Ctrl.h - 26, 16, 16);
		// 敵カウンタ
		Ctrl.context.drawImage(ImageLoader.list["map"],  0, 192, 16, 16, 10, 10, 16, 16);
		var num : int = this.elist.length;
		Ctrl.context.drawImage(ImageLoader.list["map"],  16 * Math.floor(num / 10), 208, 16, 16, 26, 10, 16, 16);
		Ctrl.context.drawImage(ImageLoader.list["map"],  16 * (num % 10), 208, 16, 16, 42, 10, 16, 16);
		// タイマー
		Ctrl.context.drawImage(ImageLoader.list["map"],  16, 192, 16, 16, Ctrl.w - 26, 10, 16, 16);
		var num : int = this.timer / 30;
		for(var i = 0; i < 8; i++){
			Ctrl.context.drawImage(ImageLoader.list["map"],  16 * (num % 10), 208, 16, 16, Ctrl.w - 42 - i * 16, 10, 16, 16);
			num = Math.floor(num / 10);
			if(num == 0){break;}
		}
		// タイトル表示
		if(this.timer < 90){
			Ctrl.context.globalAlpha = Math.min(1, (90 - this.timer) / 30);
			Ctrl.context.drawImage(ImageLoader.list["title"], 0, 0);
			Ctrl.context.globalAlpha = 1;
		}
		// 終了表示
		if(this.elist.length == 0){
			Ctrl.context.drawImage(ImageLoader.list["map"],  176, 208, 80, 16, (Ctrl.w - 80) * 0.5, (Ctrl.h - 16) * 0.5, 80, 16);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// フィールド物体クラス

class FieldObject{
	var x : number;
	var y : number;
	var z : number;
	var exist : boolean = true;
	function calc() : void {}
	function preDraw(x : number, y : number, rotv : number) : void {}
	function draw(context : CanvasRenderingContext2D) : void {}
	function select(mx : number, my : number) : boolean {return false;}
	function selecting() : boolean {return false;}
}

class FieldCharacter extends FieldObject{
	var type : int;
	var status : int = 0;
	var action : int = 0;
	var r : number = Math.PI * 0;
	function move(vx : number, vy : number) : boolean{
		var x1 = Math.floor((this.x + vx) / 16);
		var y1 = Math.floor((this.y + vy) / 16);
		if(GameField.game.map.getCost(x1, y1) <= 128){
			this.x += vx;
			this.y += vy;
		}else if(GameField.game.map.getCost(x1, Math.floor(this.y / 16)) <= 128 && Math.abs(vx) > 0.1){
			this.x += vx;
		}else if(GameField.game.map.getCost(Math.floor(this.x / 16), y1) <= 128 && Math.abs(vy) > 0.1){
			this.y += vy;
		}else{
			return false;
		}
		return true;
	}
}

// キャラクタの移動先クラス
class FieldDistination{
	var x : int;
	var y : int;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// プレイヤークラス

class FieldPlayer extends FieldCharacter{
	var character : Character = new Character();
	var dstx : int;
	var dsty : int;
	
	// ----------------------------------------------------------------
	// 初期化
	function init(type : int) : void {
		this.type = type;
		switch(this.type){
			case 1: this.character.init(ImageLoader.list["pl1"]); break;
			case 2: this.character.init(ImageLoader.list["pl2"]); break;
			case 3: this.character.init(ImageLoader.list["pl3"]); break;
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : void {
		if(this.status == 0){
			// 通常状態
			if(this.action > 0){
				var x : number = this.dstx - this.x;
				var y : number = this.dsty - this.y;
				var speed : number = 2;
				if(x * x + y * y < speed * speed){
					// 静止
					var vx = this.dstx - this.x;
					var vy = this.dsty - this.y;
					this.move(vx, vy);
					this.action = 0;
				}else{
					this.action++;
					// 方向の確認
					this.r = Math.atan2(y, x);
					// 移動
					var vx = speed * Math.cos(this.r);
					var vy = speed * Math.sin(this.r);
					if(!this.move(vx, vy)){this.action = 0;}
				}
			}
		}else if(this.status == 1){
			// 勝利状態
			this.action = 1;
			this.status = 0;
		}else if(this.status == 2){
			// あいこ状態
			switch(this.action++){
				case 0: this.character.jump = 3; break;
				case 1: this.character.jump = 5; break;
				case 2: this.character.jump = 6; break;
				case 3: this.character.jump = 5; break;
				case 4: this.character.jump = 3; break;
				case 5: this.character.jump = 0; break;
				default: this.status = 0; this.action = 0; break;
			}
			var speed : number = 1;
			var vx = speed * Math.cos(this.r + Math.PI);
			var vy = speed * Math.sin(this.r + Math.PI);
			if(!this.move(vx, vy)){this.action = 0;}
		}else if(this.status == 3){
			// 敗北状態
			switch(this.action++){
				case 0: this.character.jump = 5; break;
				case 1: this.character.jump = 9; break;
				case 2: this.character.jump = 12; break;
				case 3: this.character.jump = 14; break;
				case 4: this.character.jump = 15; break;
				case 5: this.character.jump = 14; break;
				case 6: this.character.jump = 12; break;
				case 7: this.character.jump = 9; break;
				case 8: this.character.jump = 5; break;
				case 9: this.character.jump = 0; break;
				default: this.status = 4; break;
			}
		}else if(this.status == 4){
			// 逃走状態
			this.dstx = GameField.game.town.x;
			this.dsty = GameField.game.town.y;
			var x : number = this.dstx - this.x;
			var y : number = this.dsty - this.y;
			var speed : number = 8;
			if(x * x + y * y < speed * speed){
				// 静止
				this.x = this.dstx;
				this.y = this.dsty;
				this.exist = false;
				GameField.game.town.pflag[this.type - 1] = false;
			}else{
				this.action++;
				// 方向の確認
				this.r = Math.atan2(y, x);
				// 移動
				this.x += speed * Math.cos(this.r);
				this.y += speed * Math.sin(this.r);
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(x : number, y : number, rotv : number) : void {
		this.character.x = this.x;
		this.character.y = this.y;
		this.character.r = this.r;
		this.character.action = this.action;
		this.character.preDraw(x, y, rotv);
		this.z = this.character.z;
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw(context : CanvasRenderingContext2D) : void {
		this.character.draw(context);
		if(this.action < 0){
			context.drawImage(this.character.img, 0, 96, 32, 32, this.character.ppx - 16, this.character.ppy - 55, 32, 32);
		}
	}
	
	// ----------------------------------------------------------------
	// 選択開始処理
	override function select(mx : number, my : number) : boolean{
		var x : number = this.x - mx;
		var y : number = this.y - my - 8;
		return (x * x + y * y < 16 * 16);
	}
	
	// ----------------------------------------------------------------
	// 選択中処理
	override function selecting() : boolean{
		if(Ctrl.mdn){
			this.action = -1;
			this.r = Math.PI * 0.5;
			GameField.game.selectedx = Math.floor((Ctrl.mx + GameField.game.scrollx) / 16);
			GameField.game.selectedy = Math.floor((Ctrl.my + GameField.game.scrolly) / 16);
			GameField.game.selectedtype = this.type;
			return true;
		}else{
			this.dstx = GameField.game.selectedx * 16 + 8;
			this.dsty = GameField.game.selectedy * 16 + 8;
			this.action = 1;
			return false;
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 敵クラス

class FieldEnemy extends FieldCharacter{
	var character : Character = new Character();
	var pathFinder : PathFinder = new PathFinder();
	var dstList : FieldDistination[] = new FieldDistination[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void {
		this.type = Math.floor(Math.random() * 3) + 1;
		switch(this.type){
			case 1: this.character.init(ImageLoader.list["en1"]); break;
			case 2: this.character.init(ImageLoader.list["en2"]); break;
			case 3: this.character.init(ImageLoader.list["en3"]); break;
		}
		this.pathFinder.init(GameField.game.map);
	}
	
	// ----------------------------------------------------------------
	// 計算
	override function calc() : void {
		if(this.status == 0){
			// 通常状態
			if(this.action >= 0){
				if(this.dstList.length > 0){
					this.action++;
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
					// 静止
					this.action = 0;
					if(GameField.game.timer > 120){
						var x : int = Math.random() * 16 * GameField.game.map.xsize;
						var y : int = Math.random() * 16 * GameField.game.map.ysize;
						if(GameField.game.map.getCost(x, y) < 128){this.setdst(x, y);}
					}
				}
			}
		}else if(this.status == 1){
			// 勝利状態
			this.action = 1;
			this.status = 0;
		}else if(this.status == 2){
			// あいこ状態
			switch(this.action++){
				case 0: this.character.jump = 3; break;
				case 1: this.character.jump = 5; break;
				case 2: this.character.jump = 6; break;
				case 3: this.character.jump = 5; break;
				case 4: this.character.jump = 3; break;
				case 5: this.character.jump = 0; break;
				default: this.status = 0; this.dstList.length = 0; break;
			}
			var speed : number = 1;
			var vx = speed * Math.cos(this.r + Math.PI);
			var vy = speed * Math.sin(this.r + Math.PI);
			if(!this.move(vx, vy)){this.action = 0;}
		}else if(this.status == 3){
			// 敗北状態
			switch(this.action++){
				case 0: this.character.jump = 5; break;
				case 1: this.character.jump = 9; break;
				case 2: this.character.jump = 12; break;
				case 3: this.character.jump = 14; break;
				case 4: this.character.jump = 15; break;
				case 5: this.character.jump = 14; break;
				case 6: this.character.jump = 12; break;
				case 7: this.character.jump = 9; break;
				case 8: this.character.jump = 5; break;
				case 9: this.character.jump = 0; break;
				default: this.exist = false; break;
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(x : number, y : number, rotv : number) : void {
		this.character.x = this.x;
		this.character.y = this.y;
		this.character.r = this.r;
		this.character.action = this.action;
		this.character.preDraw(x, y, rotv);
		this.z = this.character.z;
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw(context : CanvasRenderingContext2D) : void {
		this.character.draw(context);
	}
	
	// ----------------------------------------------------------------
	// 移動先リストの更新
	function setdst(gx : int, gy : int) : void {
		var sx : int = this.x / 16;
		var sy : int = this.y / 16;
		if(this.pathFinder.map.getChip(gx, gy) < 0){return;}
		if(this.pathFinder.map.getChip(sx, sy) < 0){return;}
		// 経路探索
		this.pathFinder.snode(sx, sy);
		this.pathFinder.gnode(gx, gy);
		var node : int = this.pathFinder.map.xsize * gy + gx;
		if(this.pathFinder.parents[node] < 0){return;}
		// 移動先リストの初期化
		this.dstList.length = 0;
		for(var i = 0; i < 9999; i++){
			// スタートノードチェック
			if(this.pathFinder.costs[node] == 0){break;}
			// ノードを登録
			var dst : FieldDistination = new FieldDistination();
			dst.x = (node % this.pathFinder.map.xsize) * 16 + 8;
			dst.y = Math.floor(node / this.pathFinder.map.xsize) * 16 + 8;
			this.dstList.unshift(dst);
			// 次のノードへ
			node = this.pathFinder.parents[node];
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// フィールド拠点クラス

class FieldPlace extends FieldObject{
	var img : HTMLImageElement;
	var type : int;
	var posx : int;
	var posy : int;
	var action : int = 0;
	var pflag : boolean[] = new boolean[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init(type : int, x : int, y : int) : void {
		this.img = ImageLoader.list["map"];
		this.type = type;
		this.x = x * 16 + 8;
		this.y = y * 16 + 8;
		this.pflag[0] = true;
		this.pflag[1] = true;
		this.pflag[2] = true;
	}
	
	// ----------------------------------------------------------------
	// 描画準備
	override function preDraw(x : number, y : number, rotv : number) : void {
		this.posx = this.x + x - 8;
		this.posy = this.y + y - 8;
		this.z = this.posy;
	}
	
	// ----------------------------------------------------------------
	// 描画
	override function draw(context : CanvasRenderingContext2D) : void {
		context.drawImage(this.img, 80, 144, 16, 16, this.posx, this.posy, 16, 16);
		//context.drawImage(this.img, 96, 144, 16, 32, this.posx, this.posy - 16, 16, 32);
		if(this.action > 0){
			var r : number = 30;
			var t : number = 0;
			if(this.action++ < 10){
				r = this.action * 3;
				t = (10 - this.action) * 0.1;
			}
			context.drawImage(this.img,  0 + (this.pflag[0] ? 0 : 16), 240, 16, 16, this.posx + r * Math.cos(t + Math.PI * 1.50), this.posy + r * Math.sin(t + Math.PI * 1.50), 16, 16);
			context.drawImage(this.img, 32 + (this.pflag[1] ? 0 : 16), 240, 16, 16, this.posx + r * Math.cos(t + Math.PI * 0.16), this.posy + r * Math.sin(t + Math.PI * 0.16), 16, 16);
			context.drawImage(this.img, 64 + (this.pflag[2] ? 0 : 16), 240, 16, 16, this.posx + r * Math.cos(t + Math.PI * 0.83), this.posy + r * Math.sin(t + Math.PI * 0.83), 16, 16);
		}
	}
	
	// ----------------------------------------------------------------
	// 選択開始処理
	override function select(mx : number, my : number) : boolean{
		var x : number = this.x - mx;
		var y : number = this.y - my;
		return (x * x + y * y < 12 * 12);
	}
	
	// ----------------------------------------------------------------
	// 選択中処理
	override function selecting() : boolean{
		if(Ctrl.mdn){
			if(this.action <= 0){this.action = 1;}
			var x : number = Ctrl.mx + GameField.game.scrollx;
			var y : number = Ctrl.my + GameField.game.scrolly;
			var x0 : number = x - this.x;
			var y0 : number = y - this.y;
			var r : number = x0 * x0 + y0 * y0;
			if(r < 20 * 20){
				// ユニット選択
				GameField.game.selectedtype = 0;
				var r : number = Math.atan2(y0, x0);
				if(!this.pflag[0] && !this.pflag[1] && !this.pflag[2]){
					// 全部呼び出せる
					if(-0.83 * Math.PI <= r && r < -0.17 * Math.PI){this.type = 1;}
					else if(-0.17 * Math.PI <= r && r < 0.50 * Math.PI){this.type = 2;}
					else{this.type = 3;}
				}else if(this.pflag[0] && !this.pflag[1] && !this.pflag[2]){
					// 青と緑が呼び出せる
					if(-0.50 * Math.PI <= r && r < 0.50 * Math.PI){this.type = 2;}
					else{this.type = 3;}
				}else if(!this.pflag[0] && this.pflag[1] && !this.pflag[2]){
					// 赤と青が呼び出せる
					if(-0.83 * Math.PI <= r && r < 0.17 * Math.PI){this.type = 1;}
					else{this.type = 3;}
				}else if(!this.pflag[0] && !this.pflag[1] && this.pflag[2]){
					// 赤と緑が呼び出せる
					if(-0.17 * Math.PI <= r && r < 0.83 * Math.PI){this.type = 2;}
					else{this.type = 1;}
				}else if(!this.pflag[0] && this.pflag[1] && this.pflag[2]){
					this.type = 1;
				}else if(this.pflag[0] && !this.pflag[1] && this.pflag[2]){
					this.type = 2;
				}else if(this.pflag[0] && this.pflag[1] && !this.pflag[2]){
					this.type = 3;
				}
			}else{
				if(!this.pflag[this.type - 1]){GameField.game.selectedtype = this.type;}
			}
			if(GameField.game.selectedtype == 0){
				// ユニット出撃不可
				GameField.game.selectedx = Math.floor(this.x / 16);
				GameField.game.selectedy = Math.floor(this.y / 16);
			}else{
				// ユニット出撃位置
				GameField.game.selectedx = Math.floor(x / 16);
				GameField.game.selectedy = Math.floor(y / 16);
			}
			return true;
		}else{
			if(GameField.game.selectedtype != 0){
				// ユニット生産
				var player : FieldPlayer = new FieldPlayer();
				player.init(GameField.game.selectedtype);
				player.x = this.x;
				player.y = this.y;
				player.dstx = GameField.game.selectedx * 16 + 8;
				player.dsty = GameField.game.selectedy * 16 + 8;
				player.action = 1;
				player.r = Math.random() * Math.PI * 2;
				GameField.game.olist.push(player);
				GameField.game.plist.push(player);
				GameField.game.timer += 900;
				this.pflag[GameField.game.selectedtype - 1] = true;
			}
			this.action = 0;
			return false;
		}
	}
}

