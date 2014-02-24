import "js/web.jsx";
import 'timer.jsx';

import 'Ctrl.jsx';
import 'Togl.jsx';
import 'HknwMap.jsx';
import 'Character.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインクラス

class _Main{
	static var map : HknwMap = new HknwMap();
	static var chara : BillballCharacter = new BillballCharacter();
	static var player : Player = new Player();
	
	// ----------------------------------------------------------------
	// main関数
	static function main(args : string[]) : void{
		Ctrl.init();
		Togl.init(Ctrl.canvas);
		ToglUtil.init();
		ImageLoader.init();
		_Main.init();
		
		// 画像などロードの完了待ちしてから開始する
		var waitLoaded = function() : void {
			if(ImageLoader.isLoaded()){
				ImageLoader.initTex();
				Timer.setInterval(function():void{
					Ctrl.calc();
					_Main.calc();
					_Main.draw();
					Ctrl.draw(ImageLoader.imgList["ctrl"]);
				}, 32);
			}else{
				Timer.setTimeout(waitLoaded, 1000);
			}
		};
		waitLoaded();
	}
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		Shadow.init();
		_Main.chara.init();
		_Main.map.init([[
			[ 4,  4,  4,  4,  4] : int[],
			[ 4,  4,  4,  4,  4] : int[],
			[ 4,  4,  4,  4,  4] : int[],
			[ 4,  4,  4,  4,  4] : int[],
			[ 4,  4,  4,  4,  4] : int[]
		],[
			[ 0,  0,  0, 10, 10] : int[],
			[ 0, 13,  0,  0, 10] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0, 14,  0,  0, 10] : int[],
			[14, 13, 14,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0, 14,  0,  0,  0] : int[],
			[14, 13, 14,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
			[ 0,  0,  0, 17,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0,  0,  0,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		]]);
		
		Ctrl.roth = Math.PI / 180 * 30;
		Ctrl.distance = 10;
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void{
		_Main.player.calc();
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// ----------------------------------------------------------------
		// 3D描画
		Togl.clear();
		Togl.setMode(0);
		// カメラ
		mat4.frustum(-0.05, 0.05, -0.05, 0.05, 0.1, 100, ToglUtil.worldmat);
		mat4.translate(ToglUtil.worldmat, [0, 0, -Ctrl.distance]);
		mat4.rotateX(ToglUtil.worldmat, Ctrl.roth);
		mat4.rotateY(ToglUtil.worldmat, Ctrl.rotv);
		mat4.translate(ToglUtil.worldmat, [-_Main.player.x, -_Main.player.z, -_Main.player.y]);
		
		// キャラクター
		Togl.bindTex(ImageLoader.texList["player"], 0);
		_Main.chara.draw(ToglUtil.worldmat, _Main.player.rotate, _Main.player.action, _Main.player.x, _Main.player.y, _Main.player.z, _Main.player.size);
		Shadow.draw(ToglUtil.worldmat, _Main.player.x, _Main.player.y, _Main.player.z - _Main.player.altitude, _Main.player.hsize);
		
		// マップ
		Togl.setMode(3);
		Togl.bindTex(ImageLoader.texList["mapchip"], 1);
		_Main.map.draw(ToglUtil.worldmat);
		
		// ----------------------------------------------------------------
		// ページに反映させる
		Togl.flush();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// プレイヤークラス
class Player extends HknwCharacter{
	// HknwCharacterより継承
	// x, y, z, vx, vy, vz, hsize, vsize
	// アクション変数
	var action : int = 0;
	var rotate : number = Math.PI / 180 *  90;
	// キャラクタ画像倍率
	var size : number = 1.5;
	// 地面との距離
	var altitude : number = 0;
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		this.action++;
		// 方向の計算
		if     (Ctrl.krt && Ctrl.kup){this.rotate = Math.PI * 1.74 + Ctrl.rotv;}
		else if(Ctrl.klt && Ctrl.kup){this.rotate = Math.PI * 1.26 + Ctrl.rotv;}
		else if(Ctrl.klt && Ctrl.kdn){this.rotate = Math.PI * 0.74 + Ctrl.rotv;}
		else if(Ctrl.krt && Ctrl.kdn){this.rotate = Math.PI * 0.26 + Ctrl.rotv;}
		else if(Ctrl.krt){this.rotate = Math.PI * 0.00 + Ctrl.rotv;}
		else if(Ctrl.kup){this.rotate = Math.PI * 1.50 + Ctrl.rotv;}
		else if(Ctrl.klt){this.rotate = Math.PI * 1.00 + Ctrl.rotv;}
		else if(Ctrl.kdn){this.rotate = Math.PI * 0.50 + Ctrl.rotv;}
		else{this.action = 0;}
		// 水平軸方向速度の計算
		if(this.action > 0){
			var speed = 3 / 30;
			this.vx = speed * Math.cos(this.rotate);
			this.vy = speed * Math.sin(this.rotate);
		}else{
			this.vx = 0;
			this.vy = 0;
		}
		
		// 垂直軸方向速度の計算
		if(this.altitude > 0.1){
			// 地面との距離がある場合は空中
			this.action = 1;
			this.vz -= 1.2 / 30;
			if(Ctrl.k_z && this.vz < 0){
			// 多段ジャンプ
				this.vz = 15 / 30;
			}
		}else if(Ctrl.k_z){
			// ジャンプ
			this.vz = 15 / 30;
		}else if(Ctrl.k_x){
			this.action = 1;
			this.vx = 0;
			this.vy = 0;
		}
		// あたり判定
		_Main.map.collision(this);
		this.altitude = _Main.map.getHeight(this);
		// 位置の計算
		this.x += this.vx;
		this.y += this.vy;
		this.z += this.vz;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 画像読み込みクラス

class ImageLoader{
	static var imgs : HTMLImageElement[] = new HTMLImageElement[];
	static var texes= {} : Map.<HTMLImageElement>;
	static var imgList = {} : Map.<HTMLImageElement>;
	static var texList = {} : Map.<WebGLTexture>;
	
	// ----------------------------------------------------------------
	// 全画像読み込み
	static function init() : void{
		ImageLoader.imgList["ctrl"] = ImageLoader.load("ctrl.png");
		ImageLoader.texes["mapchip"] = ImageLoader.load("mapchip.png");
		ImageLoader.texes["player"] = ImageLoader.load("player.png");
	}
	
	// ----------------------------------------------------------------
	// 画像をテクスチャに変換
	static function initTex() : void{
		for(var str in ImageLoader.texes){
			ImageLoader.texList[str] = Togl.createTexture(ImageLoader.texes[str]);
		}
	}
	
	// ----------------------------------------------------------------
	// 画像一つ読み込み
	static function load(url : string) : HTMLImageElement{
		var img = dom.createElement("img") as HTMLImageElement;
		img.src = url;
		ImageLoader.imgs.push(img);
		return img;
	}
	
	// ----------------------------------------------------------------
	// 読み込み完了確認
	static function isLoaded() : boolean{
		var flag : boolean = true;
		for(var i = 0; i < ImageLoader.imgs.length; i++){
			flag = flag && ImageLoader.imgs[i].complete;
		}
		return flag;
	}
}

