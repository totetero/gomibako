// 惑星クラス
// 
// このソースコードはMITライセンスです
// Copyright (c) 2011-2012 totetero
// 

function Sphia(){
	this.vertBuffer_gnd;
	this.vertBuffer_sea;
	this.clorBuffer_gnd;
	this.clorBuffer_sea;
	this.texcBuffer;
	this.faceBuffer;
	this.texture_gnd;
	this.texture_sea;
	this.faceNum;
	
	this.map;
	this.map_size;
	
	// ----------------------------------------------------------------
	// バイキュービック補間フィルタリングを用いた立方体ノイズ
	// 参考: http://imagingsolution.net/imaging/interpolation/
	var noiseFilter = function(map, map_size, noise_size, scale){
		var noise = new Array();
		
		// 正規化sinc関数のテイラー展開 バイキュービック補間で使うらしい
		var sinc = function(x){
			x = Math.abs(x);
			if(x <= 1.0) return x * x * x - 2.0 * x * x + 1.0;
			if(x <= 2.0) return -x * x * x + 5.0 * x * x - 8.0 * x + 4.0;
			return 0;
		}
		
		var getIndex = function(size, side, x, y){
			return (side * size + y) * size + x;
		}
		
		// 境界条件を満たす配列上の位置	
		var boundary = function(size, side, x, y){
			var s = size;
			if(x < 0){x = x + size;}
			if(x > s){x = x - size;}
			if(y < 0){y = y + size;}
			if(y > s){y = y - size;}
			return getIndex(s + 1, side, x, y);
		}
		
		// ノイズ作成
		var s = noise_size;
		var noise_length = (s + 1) * (s + 1) * 6;
		for(var i = 0; i < noise_length; i++){noise[i] = (0.5 - Math.random()) * scale;}
		// ノイズの境界を揃える
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 5, s, i)] = noise[getIndex(s + 1, 0, 0, i)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 4, 0, i)] = noise[getIndex(s + 1, 0, s, i)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 4, s, i)] = noise[getIndex(s + 1, 1, 0, i)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 5, 0, i)] = noise[getIndex(s + 1, 1, s, i)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 3, i, 0)] = noise[getIndex(s + 1, 0, s - i, 0)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 2, i, 0)] = noise[getIndex(s + 1, 0, i, s)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 3, i, s)] = noise[getIndex(s + 1, 1, i, 0)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 2, i, s)] = noise[getIndex(s + 1, 1, s - i, s)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 2, 0, i)] = noise[getIndex(s + 1, 5, s - i, s)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 2, s, i)] = noise[getIndex(s + 1, 4, i, s)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 3, 0, i)] = noise[getIndex(s + 1, 4, i, 0)];}
		for(var i = 0; i < s + 1; i++){noise[getIndex(s + 1, 3, s, i)] = noise[getIndex(s + 1, 5, s - i, 0)];}
		
		// バイキュービック補間
		for(var k = 0; k < 6; k++){
			for(var j = 0; j <= map_size; j++){
				for(var i = 0; i <= map_size; i++){
					var interval = map_size / noise_size;
					var x1 = sinc(1 + (i % interval) / interval);
					var x2 = sinc(0 + (i % interval) / interval);
					var x3 = sinc(1 - (i % interval) / interval);
					var x4 = sinc(2 - (i % interval) / interval);
					var y1 = sinc(1 + (j % interval) / interval);
					var y2 = sinc(0 + (j % interval) / interval);
					var y3 = sinc(1 - (j % interval) / interval);
					var y4 = sinc(2 - (j % interval) / interval);
					
					var i1 =  - 1;
					var i2 = Math.floor(i / interval) - 0;
					var i3 = Math.floor(i / interval) + 1;
					var i4 = Math.floor(i / interval) + 2;
					var j1 = Math.floor(j / interval) - 1;
					var j2 = Math.floor(j / interval) - 0;
					var j3 = Math.floor(j / interval) + 1;
					var j4 = Math.floor(j / interval) + 2;
					
					var ii = Math.floor(i / interval) - 1;
					var jj = Math.floor(j / interval) - 1;
					var m11 = noise[boundary(noise_size, k, ii + 0, jj + 0)];
					var m12 = noise[boundary(noise_size, k, ii + 1, jj + 0)];
					var m13 = noise[boundary(noise_size, k, ii + 2, jj + 0)];
					var m14 = noise[boundary(noise_size, k, ii + 3, jj + 0)];
					var m21 = noise[boundary(noise_size, k, ii + 0, jj + 1)];
					var m22 = noise[boundary(noise_size, k, ii + 1, jj + 1)];
					var m23 = noise[boundary(noise_size, k, ii + 2, jj + 1)];
					var m24 = noise[boundary(noise_size, k, ii + 3, jj + 1)];
					var m31 = noise[boundary(noise_size, k, ii + 0, jj + 2)];
					var m32 = noise[boundary(noise_size, k, ii + 1, jj + 2)];
					var m33 = noise[boundary(noise_size, k, ii + 2, jj + 2)];
					var m34 = noise[boundary(noise_size, k, ii + 3, jj + 2)];
					var m41 = noise[boundary(noise_size, k, ii + 0, jj + 3)];
					var m42 = noise[boundary(noise_size, k, ii + 1, jj + 3)];
					var m43 = noise[boundary(noise_size, k, ii + 2, jj + 3)];
					var m44 = noise[boundary(noise_size, k, ii + 3, jj + 3)];
				
					y1 *= m11 * x1 + m12 * x2 + m13 * x3 + m14 * x4;
					y2 *= m21 * x1 + m22 * x2 + m23 * x3 + m24 * x4;
					y3 *= m31 * x1 + m32 * x2 + m33 * x3 + m34 * x4;
					y4 *= m41 * x1 + m42 * x2 + m43 * x3 + m44 * x4;
					map[(k * (map_size + 1) + j) * (map_size + 1) + i] += y1 + y2 + y3 + y4;
				}
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		var vertg = new Array();
		var verts = new Array();
		var clorg = new Array();
		var clors = new Array();
		var texc = new Array();
		var face = new Array();
		
		this.map_size = 64;
		this.map = new Array();
		var map_length = (this.map_size + 1) * (this.map_size + 1) * 6;
		// 立方体パーリンノイズ
		for(var i = 0; i < map_length; i++){this.map[i] = 1;}
		noiseFilter(this.map, this.map_size,   4, 0.500000 * 0.4);
		noiseFilter(this.map, this.map_size,   8, 0.250000 * 0.4);
		noiseFilter(this.map, this.map_size,  16, 0.125000 * 0.4);
		noiseFilter(this.map, this.map_size,  32, 0.062500 * 0.4);
		noiseFilter(this.map, this.map_size,  64, 0.031250 * 0.4);
		noiseFilter(this.map, this.map_size, 128, 0.015625 * 0.4);
		
		for(var k = 0; k < 6; k++){
			// 頂点データ作成
			for(var j = 0; j <= this.map_size; j++){
				for(var i = 0; i <= this.map_size; i++){
					var x, y, z;
					var n = this.map[(k * (this.map_size + 1) + j) * (this.map_size + 1) + i];
					var t1 = Math.PI / 2 * (i / this.map_size - 0.5);
					var t2 = Math.PI / 2 * (j / this.map_size - 0.5);
					// 頂点作成
					switch(k){
						case 0: z =  1; x =  z * Math.tan( t1); y =  z * Math.tan( t2); break;
						case 1: z = -1; x = -z * Math.tan(-t1); y = -z * Math.tan( t2); break;
						case 2: y =  1; z =  y * Math.tan(-t2); x =  y * Math.tan( t1); break;
						case 3: y = -1; z =  y * Math.tan( t2); x =  y * Math.tan( t1); break;
						case 4: x =  1; y =  x * Math.tan( t2); z =  x * Math.tan(-t1); break;
						case 5: x = -1; y = -x * Math.tan( t2); z = -x * Math.tan( t1); break;
					}
					
					// 地面の色付け
					var c = (n - 0.90);
					if(n > 1.15){clorg.push(c * 4, c * 4, c * 4);}
					else if(n > 1.10){clorg.push(c * 2, c * 2.5, c * 2);}
					else if(n > 0.98){clorg.push(c * 2, c * 3, c * 2);}
					else{clorg.push(c * 5, c * 5, c * 5);}
					// 海面の色
					if(n > 0.98){clors.push(0.5, 0.5, 1);}
					else{clors.push(0, 0, 1);}
					
					// 頂点登録
					var rs = Math.sqrt(x * x + y * y + z * z);
					var rg = rs / n;
					vertg.push(x / rg, y / rg, z / rg);
					verts.push(x / rs, y / rs, z / rs);
					texc.push(0, 0);
				}
			}
			// インデックスデータを生成
			for(var j = 0; j < this.map_size; j++){
				for(var i = 0; i < this.map_size; i++){
					var top = k * (this.map_size + 1) * (this.map_size + 1) + j * (this.map_size + 1) + i;
					face.push(top, top + 1, top + this.map_size + 2);
					face.push(top, top + this.map_size + 2, top + this.map_size + 1);
				}
			}
		}
		
		// VBOとIBOを作成し、データを転送
		this.faceNum = face.length;
		this.vertBuffer_gnd = e3d.createVBO(vertg);
		this.vertBuffer_sea = e3d.createVBO(verts);
		this.clorBuffer_gnd = e3d.createVBO(clorg);
		this.clorBuffer_sea = e3d.createVBO(clors);
		this.texcBuffer = e3d.createVBO(texc);
		this.faceBuffer = e3d.createIBO(face);
		
		// テクスチャ作成(白)
		var canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		var g = canvas.getContext("2d");
		g.fillStyle = "rgba(255, 255, 255, 0.8)";
		g.fillRect(0, 0, 1, 1);
		this.texture_sea = e3d.createTexture(canvas);
		g.fillStyle = "rgba(255, 255, 255, 1)";
		g.fillRect(0, 0, 1, 1);
		this.texture_gnd = e3d.createTexture(canvas);
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat){
		e3d.setMatrix(mat);
		e3d.setAlphaMode(0);
		e3d.bindTex(sphia.texture_gnd);
		e3d.bindBuf(this.vertBuffer_gnd, this.clorBuffer_gnd, this.texcBuffer, this.faceBuffer);
		e3d.draw(0, this.faceNum);
		e3d.setAlphaMode(1);
		e3d.bindTex(sphia.texture_sea);
		e3d.bindBuf(this.vertBuffer_sea, this.clorBuffer_sea, this.texcBuffer, this.faceBuffer);
		e3d.draw(0, this.faceNum);
		e3d.setAlphaMode(0);
	}
	
	// ----------------------------------------------------------------
	// 回転行列から高さを得る
	this.getHeight = function(mat){
		var side, xside, yside, zside, x, y;
		// y軸方向単位ベクトルと回転行列を掛け合わせた結果から各軸中心回転角を求める
		var rx = Math.atan2(mat._32, mat._22) / Math.PI * 180;
		var ry = Math.atan2(mat._12, mat._32) / Math.PI * 180;
		var rz = Math.atan2(mat._22, mat._12) / Math.PI * 180;
		if(rx < -135){rx += 360;}
		if(ry < -135){ry += 360;}
		if(rz < -135){rz += 360;}
		// 求めた回転角から面番号を計算する
		if(rx < -45){xside = 1;}else if(rx < 45){xside = 2;}else if(rx < 135){xside = 0;}else{xside = 3;}
		if(ry < -45){yside = 5;}else if(ry < 45){yside = 0;}else if(ry < 135){yside = 4;}else{yside = 1;}
		if(rz < -45){zside = 3;}else if(rz < 45){zside = 4;}else if(rz < 135){zside = 2;}else{zside = 5;}
		if(xside == yside){side = xside;}else{side = zside;}
		// 面番号と対応するxy座標を計算する
		switch(side){
			case 0:
				x = this.map_size * (ry + 45) / 90;
				y = this.map_size * (1 - (rx - 45) / 90);
				break;
			case 1:
				x = this.map_size * (ry - 135) / 90;
				y = this.map_size * (rx + 135) / 90;
				break;
			case 2:
				x = this.map_size * (1 - (rz - 45) / 90);
				y = this.map_size * (1 - (rx + 45) / 90);
				break;
			case 3:
				x = this.map_size * (1 - (rz + 135) / 90);
				y = this.map_size * (rx - 135) / 90;
				break;
			case 4:
				x = this.map_size * (ry - 45) / 90;
				y = this.map_size * (rz + 45) / 90;
				break;
			case 5:
				x = this.map_size * (ry + 135) / 90;
				y = this.map_size * (1 - (rz - 135) / 90);
				break;
		}
		
		// 面番号とxy座標から高さを求める
		var x0 = x - Math.floor(x);
		var y0 = y - Math.floor(y);
		var top = (side * (this.map_size + 1) + Math.floor(y)) * (this.map_size + 1) + Math.floor(x);
		var h0 = this.map[top];
		var h2 = this.map[top + this.map_size + 2];
		if(x0 > y0){
			var h1 = this.map[top + 1];
			return h1 + (h0 - h1) * (1 - x0) + (h2 - h1) * y0;
		}else{
			var h3 = this.map[top + this.map_size + 1];
			return h3 + (h0 - h3) * (1 - y0) + (h2 - h3) * x0;
		}
	}
	
	// ----------------------------------------------------------------
}
