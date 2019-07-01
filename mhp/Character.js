// ビルボードでできたボールの組み合わせによるキャラクタ表示クラス
function BillballCharacter(){
	// ----------------------------------------------------------------
	// ユーティリティ
	
	// テクスチャバッファ構造体作成
	this.createTexuv = function(e3d, u0, v0, uw, vh){
		var texc = new Array();
		var u1 = u0 + uw;
		var v1 = v0 + vh;
		texc.push(u1, v0);
		texc.push(u0, v0);
		texc.push(u0, v1);
		texc.push(u1, v1);
		// VBOを作成し構造体に保存
		var texStruct = new Object();
		texStruct.texcBuffer = e3d.createVBO(texc);
		texStruct.getbuf = function(){return this.texcBuffer;}
		return texStruct;
	}
	
	// テクスチャバッファリスト構造体作成
	this.createTexuvList = function(e3d, u0, v0, uw, vh, swap){
		var texStruct = new Object();
		texStruct.texcBufferList = new Array();
		for(var i = 0; i < 12; i++){
			var texc = new Array();
			var iw = (i % 4);
			var ih =  Math.floor(i / 4)
			if(swap){iw = (4 - iw) % 4;}
			var u1 = u0 + uw * iw;
			var v1 = v0 + vh * ih;
			var u2 = u1 + uw;
			var v2 = v1 + vh;
			if(swap){var tmp = u1; u1 = u2; u2 = tmp;}
			texc.push(u2, v1);
			texc.push(u1, v1);
			texc.push(u1, v2);
			texc.push(u2, v2);
			// VBOを作成し構造体に保存
			texStruct.texcBufferList[i] = e3d.createVBO(texc);
		}
		texStruct.getbuf = function(h, v){return this.texcBufferList[h * 4 + v];}
		return texStruct;
	}
	
	// ローカル座標系を用いる描画関数作成
	this.createDrawFunc = function(e3d, mat, ctrl, rotate, x, y, z, size){
		// 行列作成
		mat4.set(mat, e3d.tmpmat1);
		mat4.translate(e3d.tmpmat1, [x, z, y]);
		mat4.rotateY(e3d.tmpmat1, -rotate);
		mat4.scale(e3d.tmpmat1, [size, size, size]);
		// 頂点バッファ
		e3d.bindVertBuf(e3d.tetraVertBuffer);
		
		// テクスチャ水平軸角度フレーム
		var angleh = 180 / Math.PI * ctrl.roth;
		if(angleh < -30){angleh = 2;}else if(angleh < 30){angleh = 1;}else{angleh = 0;}
		// テクスチャ垂直軸角度フレーム
		var anglev = 45 + 180 / Math.PI * (ctrl.rotv - rotate);
		while(anglev > 360){anglev -= 360;} while(anglev <= 0){anglev += 360;}
		if(anglev < 90){anglev = 1;}else if(anglev <= 180){anglev = 2;}else if(anglev < 270){anglev = 3;}else{anglev = 0;}
		
		// 描画関数作成
		return function(texBufStruct, size, x, y, z, rot, transposed){
			mat4.set(e3d.tmpmat1, e3d.tmpmat2);
			mat4.translate(e3d.tmpmat2, [x, z, y]);
			mat4.rotateY(e3d.tmpmat2, -ctrl.rotv + rotate);
			mat4.rotateX(e3d.tmpmat2, -ctrl.roth);
			if(!transposed){
				var temph = angleh;
				var tempv = (anglev + rot) % 4;
				mat4.scale(e3d.tmpmat2, [size, size, size]);
			}else{
				// 上下回転逆さ状態
				var temph = 2 - angleh;
				var tempv = (4 - anglev + rot) % 4;
				mat4.scale(e3d.tmpmat2, [-size, -size, size]);
			}
			e3d.setMatrix(e3d.tmpmat2);
			e3d.bindTexcBuf(texBufStruct.getbuf(temph, tempv));
			e3d.drawTetra();
		}
	}
	
	// グローバル座標系を用いる描画関数作成
	this.createDrawFunc_global = function(e3d, mat, ctrl, rotate, size0){
		// 頂点バッファ
		e3d.bindVertBuf(e3d.tetraVertBuffer);
		
		// テクスチャ水平軸角度フレーム
		var angleh = 180 / Math.PI * ctrl.roth;
		if(angleh < -30){angleh = 2;}else if(angleh < 30){angleh = 1;}else{angleh = 0;}
		// テクスチャ垂直軸角度フレーム
		var anglev = 45 + 180 / Math.PI * (ctrl.rotv - rotate);
		while(anglev > 360){anglev -= 360;} while(anglev <= 0){anglev += 360;}
		if(anglev < 90){anglev = 1;}else if(anglev <= 180){anglev = 2;}else if(anglev < 270){anglev = 3;}else{anglev = 0;}
		
		// 描画関数作成 ローカル座標系版と比べてパラメータを減らして簡略化してある
		return function(texBufStruct, size, x, y, z){
			size *= size0;
			mat4.set(mat, e3d.tmpmat1);
			mat4.translate(e3d.tmpmat1, [x, z, y]);
			mat4.rotateY(e3d.tmpmat1, -ctrl.rotv);
			mat4.rotateX(e3d.tmpmat1, -ctrl.roth);
			mat4.scale(e3d.tmpmat1, [size, size, size]);
			e3d.setMatrix(e3d.tmpmat1);
			e3d.bindTexcBuf(texBufStruct.getbuf(angleh, anglev));
			e3d.drawTetra();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 影クラス
function Shadow(){
	this.vertBuffer;
	this.texture;
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		var vert = new Array();
		vert.push(-0.5, 0.05,  0.5);
		vert.push( 0.5, 0.05,  0.5);
		vert.push( 0.5, 0.05, -0.5);
		vert.push(-0.5, 0.05, -0.5);
		// VBOを作成し、データを転送
		this.vertBuffer = e3d.createVBO(vert);
		
		// 影画像作成
		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = 32;
		var g = canvas.getContext("2d");
		g.fillStyle = "#000000";
		g.arc(16, 16, 15, 0, Math.PI * 2.0, true);
		g.fill();
		this.texture = e3d.createTexture(canvas);
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat, x, y, z, size){
		// 行列作成
		mat4.set(mat, e3d.tmpmat1);
		mat4.translate(e3d.tmpmat1, [x, z, y]);
		mat4.scale(e3d.tmpmat1, [size, 1, size]);
		e3d.setMatrix(e3d.tmpmat1);
		// 描画
		e3d.bindVertBuf(this.vertBuffer);
		e3d.bindTexcBuf(e3d.tetraTexcBuffer);
		e3d.drawTetra();
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

