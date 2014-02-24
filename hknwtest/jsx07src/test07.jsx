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
	static var water : Water = new Water();
	static var framebuffer : WaterFrambuffer = new WaterFrambuffer();
	
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
		_Main.water.init();
		_Main.framebuffer.init(256, 256);
		_Main.map.init([[
			[ 2,  2,  2,  2,  2] : int[],
			[ 2,  2,  2,  2,  2] : int[],
			[ 2,  2,  2,  2,  2] : int[],
			[ 2,  2,  2,  2,  2] : int[],
			[ 2,  2,  2,  9,  9] : int[]
		],[
			[ 2,  2,  2,  2,  2] : int[],
			[ 2,  2,  2,  0,  2] : int[],
			[ 2,  2,  2,  0,  2] : int[],
			[ 2,  2,  2,  0,  0] : int[],
			[ 2,  2,  0,  0,  0] : int[]
		],[
			[ 2,  2,  2,  4,  4] : int[],
			[ 2, 13,  0,  0,  4] : int[],
			[ 4,  0,  0,  0,  0] : int[],
			[ 4,  0,  0,  0,  0] : int[],
			[ 2,  0,  0,  0,  0] : int[]
		],[
			[ 0,  0,  0,  0,  0] : int[],
			[ 0, 13,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0, 14,  0,  0,  0] : int[],
			[14, 13, 14,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0, 14,  0,  0,  0] : int[],
			[14, 13, 14,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[],
			[ 0,  0,  0,  0,  0] : int[]
		],[
			[ 0,  0,  0,  0,  0] : int[],
			[ 0, 14,  0,  0,  0] : int[],
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
		_Main.water.calc();
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw() : void{
		// ----------------------------------------------------------------
		// 3D描画
		Togl.clear();
		Togl.setHeight(99);
		// カメラ
		mat4.frustum(-0.05, 0.05, -0.05, 0.05, 0.1, 100, ToglUtil.worldmat);
		mat4.translate(ToglUtil.worldmat, [0, 0, -Ctrl.distance]);
		mat4.rotateX(ToglUtil.worldmat, Ctrl.roth);
		mat4.rotateY(ToglUtil.worldmat, Ctrl.rotv);
		mat4.translate(ToglUtil.worldmat, [-_Main.player.x, -_Main.player.z, -_Main.player.y]);
		Togl.setWorldMatrix(ToglUtil.worldmat);
		
		// 世界描画関数 3回描画する必要があるので。。。
		var drawWorld = function(mat : Float32Array) : void{
			// キャラクター
			Togl.bindTex(ImageLoader.texList["player"], 0);
			_Main.chara.draw(mat, _Main.player.rotate, _Main.player.action, _Main.player.x, _Main.player.y, _Main.player.z, _Main.player.size);
			Shadow.draw(mat, _Main.player.x, _Main.player.y, _Main.player.z - _Main.player.altitude, _Main.player.hsize);
			// マップ
			Togl.bindTex(ImageLoader.texList["mapchip"], 1);
			_Main.map.draw(mat);
		};
		
		//水面描画準備
		var tmpmat : Float32Array = mat4.create();
		// 上下を縮小して水面下の屈折
		_Main.framebuffer.bind();
		Togl.setHeight(2.5);
		mat4.set(ToglUtil.identmat, tmpmat);
		mat4.translate(tmpmat, [0, 2.5, 0]);
		mat4.scale(tmpmat, [1, 0.5, 1]);
		mat4.translate(tmpmat, [0, -2.5, 0]);
		drawWorld(tmpmat);
		_Main.framebuffer.unbind(0);
		// 上下を反転して反射
		_Main.framebuffer.bind();
		Togl.setHeight(2.5);
		Togl.gl.cullFace(Togl.gl.FRONT);
		Ctrl.roth *= -1;
		mat4.set(ToglUtil.identmat, tmpmat);
		mat4.translate(tmpmat, [0, 2.5, 0]);
		mat4.scale(tmpmat, [1, -1, 1]);
		mat4.translate(tmpmat, [0, -2.5, 0]);
		drawWorld(tmpmat);
		Togl.gl.cullFace(Togl.gl.BACK);
		Ctrl.roth *= -1;
		_Main.framebuffer.unbind(1);
		// 水面テクスチャ準備
		_Main.framebuffer.draw();
		
		Togl.setHeight(99);
		// 水面描画
		_Main.water.draw(ToglUtil.identmat);
		// 世界描画
		drawWorld(ToglUtil.identmat);
		
		
		// ----------------------------------------------------------------
		// ページに反映させる
		Togl.flush();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 水表現クラス

class Water{
	// 描画情報
	var vertBuffer : WebGLBuffer;
	var clorBuffer : WebGLBuffer;
	var texcBuffer : WebGLBuffer;
	var faceBuffer : WebGLBuffer;
	var faceNum : int;
	var divide  : int = 16;
	var x0 : number = 0.5; var x1 : number = 5.0;
	var y0 : number = 0.5; var y1 : number = 5.0;
	var z0 : number = 2.5;
	
	var vert : number[] = new number[];
	var velo : number[] = new number[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void{
		
		var clor : number[] = new number[];
		var face : int[] = new int[];
		
		// 頂点データを作成
		for(var j = 0; j < this.divide; j++){
			for(var i = 0; i < this.divide; i++){
				var x = this.x0 + (this.x1 - this.x0) * (i / (this.divide - 1));
				var y = this.z0;
				var z = this.y0 + (this.y1 - this.y0) * (j / (this.divide - 1));
				this.vert.push(x, y, z);
				this.velo.push(0);
				clor.push(1.0, 1.0, 1.0);
			}
		}
		
		// インデックスデータを作成
		for(var j = 0; j < this.divide - 1; j++){
			for(var i = 0; i < this.divide - 1; i++){
				var i0 = i; var i1 = i0 + 1;
				var j0 = j; var j1 = j0 + 1;
				face.push(this.divide * j0 + i0);
				face.push(this.divide * j1 + i0);
				face.push(this.divide * j1 + i1);
				face.push(this.divide * j0 + i0);
				face.push(this.divide * j1 + i1);
				face.push(this.divide * j0 + i1);
			}
		}
		this.faceNum = face.length;
		
		
		this.clorBuffer = Togl.createVBO(clor);
		this.faceBuffer = Togl.createIBO(face);
	}
	
	// ----------------------------------------------------------------
	// 計算
	function calc() : void{
		// 波を立てる
		var flag : boolean = _Main.player.z < this.z0 && this.z0 < _Main.player.z + _Main.player.vsize;
		flag = flag && this.x0 < _Main.player.x && _Main.player.x < this.x1;
		flag = flag && this.y0 < _Main.player.y && _Main.player.y < this.y1;
		flag = flag && _Main.player.vx + _Main.player.vy + _Main.player.vz != 0;
		if(flag){
			var x : int = Math.floor((_Main.player.x - this.x0) / (this.x1 - this.x0) * this.divide);
			var y : int = Math.floor((_Main.player.y - this.y0) / (this.y1 - this.y0) * this.divide);
			this.velo[this.divide * y + x] += 0.03;
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(mat : Float32Array) : void{
		// 頂点バッファ更新
		for(var j = 0; j < this.divide; j++){
			for(var i = 0; i < this.divide; i++){
				var sum = 0; var num = 0;
				for(var n = -1; n <= 1; n++){
					for(var m = -1; m <= 1; m++){
						if(m == 0 && n == 0){}
						else if(i + m < 0 || i + m >= this.divide){sum += 0; num++;}
						else if(j + n < 0 || j + n >= this.divide){sum += 0; num++;}
						else{sum += this.vert[((i + m) * this.divide + (j + n)) * 3 + 1] - this.z0; num++;}
					}
				}
				var average = sum / num;
				var height : number = this.vert[(i * this.divide + j) * 3 + 1] - this.z0;
				this.velo[i * this.divide + j] += (average - height) * 0.1;
				this.velo[i * this.divide + j] *= 0.95;
			}
		}
		for(var j = 0; j < this.divide; j++){
			for(var i = 0; i < this.divide; i++){
				this.vert[(i * this.divide + j) * 3 + 1] += this.velo[i * this.divide + j];
			}
		}
		
		this.vertBuffer = Togl.createVBO(this.vert);
		
		// テクスチャバッファ更新
		var texc : number[] = new number[];
		var r : number;
		mat4.set(ToglUtil.worldmat, ToglUtil.tmpmat1);
		mat4.multiply(ToglUtil.tmpmat1, mat);
		var v00 : number[] = this.multiplyVec4(ToglUtil.tmpmat1, [this.x0, this.z0, this.y0, 1]);
		var v01 : number[] = this.multiplyVec4(ToglUtil.tmpmat1, [this.x1, this.z0, this.y0, 1]);
		var v10 : number[] = this.multiplyVec4(ToglUtil.tmpmat1, [this.x0, this.z0, this.y1, 1]);
		var v11 : number[] = this.multiplyVec4(ToglUtil.tmpmat1, [this.x1, this.z0, this.y1, 1]);
		// テクスチャ座標データを作成
		for(var j = 0; j < this.divide; j++){
			for(var i = 0; i < this.divide; i++){
				var t1 : number = i / (this.divide - 1); var t2 : number = 1 - t1;
				var s1 : number = j / (this.divide - 1); var s2 : number = 1 - s1;
				var x1 = t2 * v00[0] + t1 * v01[0]; var y1 = t2 * v00[1] + t1 * v01[1];
				var x2 = t2 * v10[0] + t1 * v11[0]; var y2 = t2 * v10[1] + t1 * v11[1];
				var u = s2 * x1 + s1 * x2;
				var v = s2 * y1 + s1 * y2;
				texc.push(u, v);
			}
		}
		this.texcBuffer = Togl.createVBO(texc);
		
		// 行列作成
		Togl.setLocalMatrix(mat);
		// 描画
		Togl.bindVertBuf(this.vertBuffer);
		Togl.bindClor3Buf(this.clorBuffer);
		Togl.bindTexcBuf(this.texcBuffer);
		Togl.bindFaceBuf(this.faceBuffer);
		Togl.draw(0, this.faceNum);
	}
	
	// 行列を使って画面座標に変換する
	function multiplyVec4(mat : Float32Array, vec : number[]) : number[]{
		var dest : number[] = new number[];
		var iw : number = 1 / (mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15]);
		dest[0] = ((mat[0] * vec[0] + mat[4] * vec[1] + mat[ 8] * vec[2] + mat[12]) * iw + 1) * 0.5;
		dest[1] = ((mat[1] * vec[0] + mat[5] * vec[1] + mat[ 9] * vec[2] + mat[13]) * iw + 1) * 0.5;
		return dest;
	}
}

// ----------------------------------------------------------------
// フレームバッファ
class WaterFrambuffer{
	var w : int;
	var h : int;
	var framebuffer : WebGLFramebuffer;
	var canvas : HTMLCanvasElement;
	var context : CanvasRenderingContext2D;
	var cvs : HTMLCanvasElement[];
	var ctx : CanvasRenderingContext2D[];
	var imdat : ImageData[];
	var pixels : Uint8Array[];
	
	// フレームバッファ初期化
	function init(w : int, h : int) : void{
		var gl = Togl.gl;
		this.w = w;
		this.h = h;
		// フレームバッファ
		this.framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
		var renderbuffer1 : WebGLRenderbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer1);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this.w, this.h);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer1);
		var renderbuffer2 : WebGLRenderbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer2);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.w, this.h);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer2);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		// 描画用キャンバス
		this.canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.canvas.width = this.w;
		this.canvas.height = this.h;
		// データ読み取り用キャンバス
		this.cvs = new HTMLCanvasElement[];
		this.ctx = new CanvasRenderingContext2D[];
		this.imdat = new ImageData[];
		for(var i = 0; i < 2; i++){
			this.cvs[i] = dom.window.document.createElement("canvas") as HTMLCanvasElement;
			this.ctx[i] = this.cvs[i].getContext("2d") as CanvasRenderingContext2D;
			this.cvs[i].width = this.w;
			this.cvs[i].height = this.h;
			this.imdat[i] = this.ctx[i].createImageData(this.cvs[i].width, this.cvs[i].height);
		}
		// test
		this.pixels = new Uint8Array[];
		this.pixels[0] = new Uint8Array(this.w * this.h * 4);
		this.pixels[1] = new Uint8Array(this.w * this.h * 4);
	}
	
	// フレームバッファ使用開始
	function bind() : void{
		var gl = Togl.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		Togl.clear();
	}
	
	// フレームバッファ終了 指定したデータ読み取り用キャンバスにデータを格納
	function unbind(id : int) : void{
		var gl = Togl.gl;
		//gl.readPixels(0, 0, this.w, this.h, gl.RGBA, gl.UNSIGNED_BYTE, this.imdat[id].data); // やっぱりImagedata.dataを直接使うのはよくないな
		gl.readPixels(0, 0, this.w, this.h, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels[id]);
		for (var i = 0; i < this.pixels[id].length; i++) {this.imdat[id].data[i] = this.pixels[id][i];}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, Togl.canvas.width, Togl.canvas.height);
	}
	
	// データ読み取り用キャンバスのデータを描画用キャンバスに合成
	function draw() : void{
		var gl = Togl.gl;
		this.ctx[0].putImageData(this.imdat[0], 0, 0);
		this.ctx[1].putImageData(this.imdat[1], 0, 0);
		this.context.fillStyle = "#8ff";
		this.context.globalAlpha = 1;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.globalAlpha = 0.8;
		this.context.drawImage(this.cvs[0], 0, 0);
		this.context.globalAlpha = 0.2;
		this.context.drawImage(this.cvs[1], 0, 0);
		Togl.bindTex(Togl.createTexture(this.canvas), 0);
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
			this.vz -= (this.z > 2.5 ? 1.2 : 0.2) / 30;
		}else if(Ctrl.k_z){
			// ジャンプ
			this.vz = 8 / 30;
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

