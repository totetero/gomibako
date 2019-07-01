import "js/web.jsx";
import 'Ctrl.jsx';
import 'Togl.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ビルボードによるキャラクタ表示クラス

class BillboardCharacter{
	var texcBufferList : WebGLBuffer[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void{
		// テクスチャバッファリスト
		this.texcBufferList = new WebGLBuffer[];
		for(var i = 0; i < 4; i++){
			for(var j = 0; j < 4; j++){
				var texc : number[] = new number[];
				var u0 : number = 0.25 * i;
				var v0 : number = 0.25 * j;
				var u1 : number = u0 + 0.25;
				var v1 : number = v0 + 0.25;
				texc.push(u1, v0);
				texc.push(u0, v0);
				texc.push(u0, v1);
				texc.push(u1, v1);
				// VBOを作成し、データを転送
				this.texcBufferList[i * 4 + j] = Togl.createVBO(texc);
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(mat : Float32Array, rotate : number, action : int, x : number, y : number, z : number, size : number) : void{
		// 歩行アクション
		var index : int = 0;
		if(action > 0){
			switch(Math.floor(action / 4) % 4){
				case 0: index = 4; break;
				case 2: index = 12; break;
				default: index = 8; break;
			}
		}
		// 回転
		rotate = (rotate - Ctrl.rotv) / Math.PI * 180;
		while(rotate > 360 - 45){rotate -= 360;}
		while(rotate <=  0 - 45){rotate += 360;}
		if(rotate < 45){index += 3;}
		else if(rotate <= 135){index += 0;}
		else if(rotate < 225){index += 1;}
		else{index += 2;}
		// 行列作成
		mat4.set(mat, ToglUtil.tmpmat1);
		mat4.translate(ToglUtil.tmpmat1, [x, z, y]);
		mat4.rotateY(ToglUtil.tmpmat1, -Ctrl.rotv);
		mat4.scale(ToglUtil.tmpmat1, [size, size, size]);
		mat4.translate(ToglUtil.tmpmat1, [0, 0.5, 0]);
		Togl.setMatrix(ToglUtil.tmpmat1);
		// 描画
		Togl.bindVertBuf(ToglUtil.tetraVertBuffer);
		Togl.bindTexcBuf(this.texcBufferList[index]);
		Togl.drawTetra();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// ビルボードでできたボールの組み合わせによるキャラクタ表示クラス
class BillballCharacter{
	// ----------------------------------------------------------------
	// ユーティリティ
	
	// テクスチャバッファ構造体作成
	function createTexuv(u0 : number, v0 : number, uw : number, vh : number) : WebGLBuffer[]{
		var texc : number[] = new number[];
		var u1 : number = u0 + uw;
		var v1 : number = v0 + vh;
		texc.push(u1, v0);
		texc.push(u0, v0);
		texc.push(u0, v1);
		texc.push(u1, v1);
		// VBOを作成しリスト化
		var texcBuffer : WebGLBuffer = Togl.createVBO(texc);
		var texes = new WebGLBuffer[];
		for(var i = 0; i < 12; i++){texes[i] = texcBuffer;}
		return texes;
	}
	
	// テクスチャバッファリスト構造体作成
	function createTexuvList(u0 : number, v0 : number, uw : number, vh : number, swap : boolean) : WebGLBuffer[]{
		var texes = new WebGLBuffer[];
		for(var i = 0; i < 12; i++){
			var texc : number[] = new number[];
			var iw : int = (i % 4);
			var ih : int =  Math.floor(i / 4);
			if(swap){iw = (4 - iw) % 4;}
			var u1 : number = u0 + uw * iw;
			var v1 : number = v0 + vh * ih;
			var u2 : number = u1 + uw;
			var v2 : number = v1 + vh;
			if(swap){var tmp : number = u1; u1 = u2; u2 = tmp;}
			texc.push(u2, v1);
			texc.push(u1, v1);
			texc.push(u1, v2);
			texc.push(u2, v2);
			// VBOを作成し構造体に保存
			texes[i] = Togl.createVBO(texc);
		}
		return texes;
	}
	
	// 描画準備関数
	var drawRot : number;
	var drawAngh : int;
	var drawAngv : int;
	function preDraw(mat : Float32Array, rotate : number, x : number, y : number, z : number, size : number) : void{
		this.drawRot = rotate;
		// 行列作成
		mat4.set(mat, ToglUtil.tmpmat1);
		mat4.translate(ToglUtil.tmpmat1, [x, z, y]);
		mat4.rotateY(ToglUtil.tmpmat1, -rotate);
		mat4.scale(ToglUtil.tmpmat1, [size, size, size]);
		// 頂点バッファ
		Togl.bindVertBuf(ToglUtil.tetraVertBuffer);
		
		// テクスチャ水平軸角度フレーム
		var angleh : number = 180 / Math.PI * Ctrl.roth;
		if(angleh < -30){this.drawAngh = 2;}else if(angleh < 30){this.drawAngh = 1;}else{this.drawAngh = 0;}
		// テクスチャ垂直軸角度フレーム
		var anglev : number = 45 + 180 / Math.PI * (Ctrl.rotv - rotate);
		while(anglev > 360){anglev -= 360;} while(anglev <= 0){anglev += 360;}
		if(anglev < 90){this.drawAngv = 1;}else if(anglev <= 180){this.drawAngv = 2;}else if(anglev < 270){this.drawAngv = 3;}else{this.drawAngv = 0;}
	}
	
	// 部分描画関数
	function drawParts(texes : WebGLBuffer[], size: number, x: number, y: number, z: number, rot : int, transposed : boolean) : void{
			mat4.set(ToglUtil.tmpmat1, ToglUtil.tmpmat2);
			mat4.translate(ToglUtil.tmpmat2, [x, z, y]);
			mat4.rotateY(ToglUtil.tmpmat2, -Ctrl.rotv + this.drawRot);
			mat4.rotateX(ToglUtil.tmpmat2, -Ctrl.roth);
			var temph : int = 0;
			var tempv : int = 0;
			if(!transposed){
				temph = this.drawAngh;
				tempv = (this.drawAngv + rot) % 4;
				mat4.scale(ToglUtil.tmpmat2, [size, size, size]);
			}else{
				// 上下回転逆さ状態
				temph = 2 - this.drawAngh;
				tempv = (4 - this.drawAngv + rot) % 4;
				mat4.scale(ToglUtil.tmpmat2, [-size, -size, size]);
			}
			Togl.setMatrix(ToglUtil.tmpmat2);
			Togl.bindTexcBuf(texes[temph * 4 + tempv]);
			Togl.drawTetra();
	}
	
	// ----------------------------------------------------------------
	var texBufStruct_head : WebGLBuffer[];
	var texBufStruct_body : WebGLBuffer[];
	var texBufStruct_foot1 : WebGLBuffer[];
	var texBufStruct_foot2 : WebGLBuffer[];
	var texBufStruct_hand : WebGLBuffer[];
	var texBufStruct_hairr : WebGLBuffer[];
	var texBufStruct_hairl : WebGLBuffer[];
	var texBufStruct_tail : WebGLBuffer[];
	
	// ----------------------------------------------------------------
	// 初期化
	function init() : void{
		// 各パーツのテクスチャバッファリスト
		this.texBufStruct_head  = this.createTexuvList(0.0, 0.000, 0.125, 0.125, false);
		this.texBufStruct_body  = this.createTexuvList(0.0, 0.375, 0.125, 0.125, false);
		this.texBufStruct_foot1 = this.createTexuvList(0.00, 0.75, 0.0625, 0.0625, false);
		this.texBufStruct_foot2 = this.createTexuvList(0.25, 0.75, 0.0625, 0.0625, false);
		this.texBufStruct_hand  = this.createTexuv(0, 0.9375, 0.0625, 0.0625);
		this.texBufStruct_hairr = this.createTexuvList(0.5, 0.000, 0.125, 0.125, false);
		this.texBufStruct_hairl = this.createTexuvList(0.5, 0.000, 0.125, 0.125, true);
		this.texBufStruct_tail  = this.createTexuvList(0.5, 0.375, 0.125, 0.125, false);
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(mat : Float32Array, rotate : number, action : int, x : number, y : number, z : number, size : number) : void{
		// 描画準備
		this.preDraw(mat, rotate, x, y, z, size);
		
		if(action > 0){
			// 走る
			switch(Math.floor(action / 6) % 4){
				case 0:
					this.drawParts(this.texBufStruct_head,  0.5,   0.12,  0.00, 0.45, 0, false);
					this.drawParts(this.texBufStruct_body,  0.5,   0.00,  0.00, 0.23, 0, false);
					this.drawParts(this.texBufStruct_foot2, 0.25, -0.20, -0.07, 0.20, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25,  0.10,  0.07, 0.10, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25,  0.10, -0.15, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25, -0.10,  0.15, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hairr, 0.5,   0.06,  0.20, 0.43, 0, false);
					this.drawParts(this.texBufStruct_hairl, 0.5,   0.06, -0.20, 0.43, 0, false);
					this.drawParts(this.texBufStruct_tail,  0.5,  -0.07,  0.00, 0.36, 0, false);break;
				case 1:
					this.drawParts(this.texBufStruct_head,  0.5,   0.12,  0.00, 0.47, 0, false);
					this.drawParts(this.texBufStruct_body,  0.5,   0.00,  0.00, 0.26, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25, -0.00, -0.07, 0.15, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25,  0.00,  0.07, 0.10, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25,  0.05, -0.18, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25, -0.05,  0.18, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hairr, 0.5,   0.06,  0.20, 0.45, 0, false);
					this.drawParts(this.texBufStruct_hairl, 0.5,   0.06, -0.20, 0.45, 0, false);
					this.drawParts(this.texBufStruct_tail,  0.5,  -0.07,  0.00, 0.38, 0, false);break;
				case 2:
					this.drawParts(this.texBufStruct_head,  0.5,   0.12,  0.00, 0.45, 0, false);
					this.drawParts(this.texBufStruct_body,  0.5,   0.00,  0.00, 0.23, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25,  0.10, -0.07, 0.10, 0, false);
					this.drawParts(this.texBufStruct_foot2, 0.25, -0.20,  0.07, 0.20, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25, -0.10, -0.15, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25,  0.10,  0.15, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hairr, 0.5,   0.06,  0.20, 0.43, 0, false);
					this.drawParts(this.texBufStruct_hairl, 0.5,   0.06, -0.20, 0.43, 0, false);
					this.drawParts(this.texBufStruct_tail,  0.5,  -0.07,  0.00, 0.36, 0, false);break;
				case 3:
					this.drawParts(this.texBufStruct_head,  0.5,   0.12,  0.00, 0.47, 0, false);
					this.drawParts(this.texBufStruct_body,  0.5,   0.00,  0.00, 0.26, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25,  0.00, -0.07, 0.10, 0, false);
					this.drawParts(this.texBufStruct_foot1, 0.25, -0.00,  0.07, 0.15, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25, -0.05, -0.18, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hand,  0.25,  0.05,  0.18, 0.25, 0, false);
					this.drawParts(this.texBufStruct_hairr, 0.5,   0.06,  0.20, 0.45, 0, false);
					this.drawParts(this.texBufStruct_hairl, 0.5,   0.06, -0.20, 0.45, 0, false);
					this.drawParts(this.texBufStruct_tail,  0.5,  -0.07,  0.00, 0.38, 0, false);break;
			}
		}else{
			// 静止状態
			this.drawParts(this.texBufStruct_head,  0.50,  0.00,  0.00, 0.52, 0, false);
			this.drawParts(this.texBufStruct_body,  0.50, -0.02,  0.00, 0.27, 0, false);
			this.drawParts(this.texBufStruct_foot1, 0.25, -0.02, -0.10, 0.10, 0, false);
			this.drawParts(this.texBufStruct_foot1, 0.25,  0.02,  0.10, 0.10, 0, false);
			this.drawParts(this.texBufStruct_hand,  0.25,  0.02, -0.20, 0.25, 0, false);
			this.drawParts(this.texBufStruct_hand,  0.25, -0.02,  0.20, 0.25, 0, false);
			this.drawParts(this.texBufStruct_hairr, 0.50, -0.05,  0.20, 0.50, 0, false);
			this.drawParts(this.texBufStruct_hairl, 0.50, -0.05, -0.20, 0.50, 0, false);
			this.drawParts(this.texBufStruct_tail,  0.50, -0.15,  0.00, 0.40, 0, false);
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ビルボードによるキャラクタ表示クラス

class Shadow{
	static var vertBuffer : WebGLBuffer;
	static var texture : WebGLTexture;
	
	// ----------------------------------------------------------------
	// 初期化
	static function init() : void{
		var vert : number[] = new number[];
		vert.push(-0.5, 0.05,  0.5);
		vert.push( 0.5, 0.05,  0.5);
		vert.push( 0.5, 0.05, -0.5);
		vert.push(-0.5, 0.05, -0.5);
		// VBOを作成し、データを転送
		Shadow.vertBuffer = Togl.createVBO(vert);
		
		// 影画像作成
		var canvas = dom.window.document.createElement("canvas") as HTMLCanvasElement;
		var context = canvas.getContext("2d") as CanvasRenderingContext2D;
		canvas.width = canvas.height = 32;
		context.fillStyle = "#000000";
		context.arc(16, 16, 15, 0, Math.PI * 2.0, true);
		context.fill();
		Shadow.texture = Togl.createTexture(canvas);
	}
	
	// ----------------------------------------------------------------
	// 描画
	static function draw(mat : Float32Array, x : number, y : number, z : number, size : number) : void{
		// 行列作成
		mat4.set(mat, ToglUtil.tmpmat1);
		mat4.translate(ToglUtil.tmpmat1, [x, z, y]);
		mat4.scale(ToglUtil.tmpmat1, [size, 1, size]);
		Togl.setMatrix(ToglUtil.tmpmat1);
		// 描画
		Togl.bindTex(Shadow.texture, 0);
		Togl.bindVertBuf(Shadow.vertBuffer);
		Togl.bindTexcBuf(ToglUtil.tetraTexcBuffer);
		Togl.drawTetra();
	}
}

