import "js/web.jsx";
import 'timer.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 画像読み込みクラス

class ImageLoader{
	static var imgs : HTMLImageElement[] = new HTMLImageElement[];
	static var list = {} : Map.<HTMLImageElement>;
	
	// ----------------------------------------------------------------
	// 全画像読み込み
	static function init() : void {
		ImageLoader.list["player.png"] = ImageLoader.load("img/player.png");
		ImageLoader.list["mapchip.png"] = ImageLoader.load("img/mapchip.png");
		ImageLoader.list["enemy.png"] = ImageLoader.load("img/enemy.png");
	}
	
	// ----------------------------------------------------------------
	// 画像一つ読み込み
	static function load(url : string) : HTMLImageElement {
		var img = dom.createElement("img") as HTMLImageElement;
		//img.addEventListener("load", loaded);
		img.src = url;
		ImageLoader.imgs.push(img);
		return img;
	}
	
	// ----------------------------------------------------------------
	// 読み込み完了確認
	static function isLoaded() : boolean {
		var flag : boolean = true;
		for(var i = 0; i < ImageLoader.imgs.length; i++){
			flag = flag && ImageLoader.imgs[i].complete;
		}
		return flag;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// メインクラス

class _Main{
	static var canvas : HTMLCanvasElement;
	static var context : CanvasRenderingContext2D;
	static var field : Field = new Field();
	static var place : Place = new Place();
	static var battle : Battle = new Battle();
	
	// ----------------------------------------------------------------
	// main関数
	static function main() : void {
		_Main.canvas = dom.window.document.getElementById('canvas') as HTMLCanvasElement;
		_Main.context = _Main.canvas.getContext('2d') as CanvasRenderingContext2D;
		ImageLoader.init();
		Ctrl.init(_Main.canvas);
		_Main.init();
		
		// 画像などロードの完了待ちしてから開始する
		var isLoaded = function() : void {
			if(ImageLoader.isLoaded()){
				Timer.setInterval(function():void{
					_Main.calc();
					_Main.draw();
				}, 50);
			}else{
				Timer.setTimeout(isLoaded, 1000);
			}
		};
		isLoaded();
	}
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void {
		_Main.field.init();
		_Main.place.init();
		_Main.battle.init();
	}
	
	// ----------------------------------------------------------------
	// 計算
	static function calc() : void {
		if(_Main.battle.action != 0){
			_Main.battle.calc();
		}else if(_Main.place.flag){
			_Main.place.calc();
		}else{
			_Main.field.calc();
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void {
		_Main.field.draw(_Main.context);
		_Main.place.draw(_Main.context);
		_Main.battle.draw(_Main.context);
	}
	
	// ----------------------------------------------------------------
	// テスト用処理その1
	static function test01() : void {
		if(_Main.battle.action == 0){
			_Main.battle.action = 1;
		}else{
			_Main.battle.action *= -1;
		}
	}
	
	// ----------------------------------------------------------------
	// テスト用処理その2
	static function test02() : void {
		if(_Main.battle.action != 0){return;}
		_Main.place.flag = !_Main.place.flag;
	}
}

