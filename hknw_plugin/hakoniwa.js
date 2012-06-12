// ハコニワプラグイン (基本バージョン)
// ハコニワマップを管理する キャラクタのあたり判定は立方体
//
// 本ソースコードはMITライセンスとバンザイライセンスのデュアルライセンスです
// ソースコードの一部もしくは全部使用したものを再配布する際には
// 上記のライセンスのうち片方を選択してください。
// バンザイライセンスを選択した人は使用前に「ばんじゃーい」と3回叫んでください。
// 作者は、ソフトウェアに関してなんら責任を負いません。
//
// Copyright (c) 2012 totetero

if(enchant.gl){
	enchant.gl.hakoniwa = {};
	
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// マップクラス 三次元配列からマップ画像を作り描画する
	enchant.gl.hakoniwa.Map3D = enchant.Class.create(enchant.gl.Sprite3D, {
		// ----------------------------------------------------------------
		// マップチップの範囲外チェック
		getMapChip: function(x, y, z){
			x = Math.floor(parseInt(x));
			y = Math.floor(parseInt(y));
			z = Math.floor(parseInt(z));
			if(isNaN(x) || x < 0 || this.xsize <= x){return -1;}
			if(isNaN(y) || y < 0 || this.ysize <= y){return -1;}
			if(isNaN(z) || z < 0 || this.zsize <= z){return -1;}
			return this.map[z][y][x];
		},
		
		// ----------------------------------------------------------------
		// マップチップの可視チェック
		isMapChipVisible: function(x, y, z){
			var chip = this.getMapChip(x, y, z);
			return chip > 0;
		},
		
		// ----------------------------------------------------------------
		// マップチップの透過チェック
		isMapChipSkeleton: function(x, y, z){
			var chip = this.getMapChip(x, y, z);
			return chip != -1 && chip != 0 && chip != 1 && !(57 <= chip && chip <= 64);
		},
		
		// ----------------------------------------------------------------
		// マップチップの衝突チェック
		isMapChipHit: function(x, y, z){
			var chip = this.getMapChip(x, y, z);
			return chip != 0;
		},
		
		// ----------------------------------------------------------------
		// 初期化
		initialize: function(map){
			enchant.gl.Sprite3D.call(this);
			// 地形情報
			this.map = map;
			this.xsize = this.map[0][0].length;
			this.ysize = this.map[0].length;
			this.zsize = this.map.length;
			
			// 光源なんて複雑で使いたくないから無視するからな！！
			this.mesh = new Mesh();
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
			
			this.updateBuffer();
			
			// マップチップ選択に関する情報の初期化
			this.selectedx = -1;
			this.selectedy = -1;
			this.selectedz = -1;
			this.selectType = 0;
		},
		
		// ----------------------------------------------------------------
		// バッファ作成
		updateBuffer: function(){
			vert = new Array();
			norm = new Array();
			clor = new Array();
			texc = new Array();
			face = new Array();
			
			// 内部関数 影の確認
			var setTopColor = function(me, x1, y1, z1, x2, y2, z2, x3, y3, z3){
				var color = 1;
				if(me.isMapChipSkeleton(x1, y1, z1)){color -= 0.2;}
				if(me.isMapChipSkeleton(x2, y2, z2)){color -= 0.2;}
				if(me.isMapChipSkeleton(x3, y3, z3)){color -= 0.2;}
				clor.push(color, color,color, 1);
			}
			
			// 内部関数 面の頂点配列作成
			var pushSurfaces = function(me, x0, y0, z0, s){
				var chip = me.map[z0][y0][x0] - 1;
				var x1 = x0 + 1;
				var y1 = y0 + 1;
				var z1 = z0 + 1;
				var xm = x0 - 1;
				var ym = y0 - 1;
				var zm = z0 - 1;
				var u0 = (chip % 4) * 0.2500;
				switch(s){
					case 1:
						vert.push(x0, z1, y0); setTopColor(me, x0, ym, z1, xm, y0, z1, xm, ym, z1);
						vert.push(x0, z1, y1); setTopColor(me, x0, y1, z1, xm, y0, z1, xm, y1, z1);
						vert.push(x1, z1, y1); setTopColor(me, x0, y1, z1, x1, y0, z1, x1, y1, z1);
						vert.push(x1, z1, y0); setTopColor(me, x0, ym, z1, x1, y0, z1, x1, ym, z1);
						norm.push(0, 1, 0); norm.push(0, 1, 0); norm.push(0, 1, 0); norm.push(0, 1, 0);
						break;
					case 2:
						u0 = u0 + 0.1875;
						vert.push(x0, z0, y1); setTopColor(me, x0, y1, zm, xm, y0, zm, xm, y1, zm);
						vert.push(x0, z0, y0); setTopColor(me, x0, ym, zm, xm, y0, zm, xm, ym, zm);
						vert.push(x1, z0, y0); setTopColor(me, x0, ym, zm, x1, y0, zm, x1, ym, zm);
						vert.push(x1, z0, y1); setTopColor(me, x0, y1, zm, x1, y0, zm, x1, y1, zm);
						norm.push(0, -1, 0); norm.push(0, -1, 0); norm.push(0, -1, 0); norm.push(0, -1, 0);
						break;
					case 3:
						u0 = u0 + 0.0625;
						vert.push(x0, z1, y1); setTopColor(me, x0, y1, z1, xm, y1, z0, xm, y1, z1);
						vert.push(x0, z0, y1); setTopColor(me, x0, y1, zm, xm, y1, z0, xm, y1, zm);
						vert.push(x1, z0, y1); setTopColor(me, x0, y1, zm, x1, y1, z0, x1, y1, zm);
						vert.push(x1, z1, y1); setTopColor(me, x0, y1, z1, x1, y1, z0, x1, y1, z1);
						norm.push(0, 0, 1); norm.push(0, 0, 1); norm.push(0, 0, 1); norm.push(0, 0, 1);
						break;
					case 4:
						u0 = u0 + 0.0625;
						vert.push(x1, z1, y0); setTopColor(me, x0, ym, z1, x1, ym, z0, x1, ym, z1);
						vert.push(x1, z0, y0); setTopColor(me, x0, ym, zm, x1, ym, z0, x1, ym, zm);
						vert.push(x0, z0, y0); setTopColor(me, x0, ym, zm, xm, ym, z0, xm, ym, zm);
						vert.push(x0, z1, y0); setTopColor(me, x0, ym, z1, xm, ym, z0, xm, ym, z1);
						norm.push(0, 0, -1); norm.push(0, 0, -1); norm.push(0, 0, -1); norm.push(0, 0, -1);
						break;
					case 5:
						u0 = u0 + 0.1250;
						vert.push(x1, z1, y1); setTopColor(me, x1, y0, z1, x1, y1, z0, x1, y1, z1);
						vert.push(x1, z0, y1); setTopColor(me, x1, y0, zm, x1, y1, z0, x1, y1, zm);
						vert.push(x1, z0, y0); setTopColor(me, x1, y0, zm, x1, ym, z0, x1, ym, zm);
						vert.push(x1, z1, y0); setTopColor(me, x1, y0, z1, x1, ym, z0, x1, ym, z1);
						norm.push(1, 0, 0); norm.push(1, 0, 0); norm.push(1, 0, 0); norm.push(1, 0, 0);
						break;
					case 6:
						u0 = u0 + 0.1250;
						vert.push(x0, z1, y0); setTopColor(me, xm, y0, z1, xm, ym, z0, xm, ym, z1);
						vert.push(x0, z0, y0); setTopColor(me, xm, y0, zm, xm, ym, z0, xm, ym, zm);
						vert.push(x0, z0, y1); setTopColor(me, xm, y0, zm, xm, y1, z0, xm, y1, zm);
						vert.push(x0, z1, y1); setTopColor(me, xm, y0, z1, xm, y1, z0, xm, y1, z1);
						norm.push(-1, 0, 0); norm.push(-1, 0, 0); norm.push(-1, 0, 0); norm.push(-1, 0, 0);
						break;
				}
				var u1 = u0 + 0.0625;
				var v0 = Math.floor(chip / 4) *0.0625;
				var v1 = v0 + 0.0625;
				// テクスチャのy座標、左上原点かと思ったけど上下反転してるのかー
				texc.push(u0, 1 - v0); texc.push(u0, 1 - v1); texc.push(u1, 1 - v1); texc.push(u1, 1 - v0);
			}
			
			// 頂点情報を生成
			for(var i = 0; i < this.xsize; i++){
				for(var j = 0; j < this.ysize; j++){
					for(var k = 0; k < this.zsize; k++){
						if(this.isMapChipVisible(i, j, k)){
							if(!this.isMapChipSkeleton(i, j, k + 1)){pushSurfaces(this, i, j, k, 1);}
							if(!this.isMapChipSkeleton(i, j, k - 1)){pushSurfaces(this, i, j, k, 2);}
							if(!this.isMapChipSkeleton(i, j + 1, k)){pushSurfaces(this, i, j, k, 3);}
							if(!this.isMapChipSkeleton(i, j - 1, k)){pushSurfaces(this, i, j, k, 4);}
							if(!this.isMapChipSkeleton(i + 1, j, k)){pushSurfaces(this, i, j, k, 5);}
							if(!this.isMapChipSkeleton(i - 1, j, k)){pushSurfaces(this, i, j, k, 6);}
						}
					}
				}
			}
			
			// インデックス情報を生成
			var num = vert.length / 12;
			for(var i = 0; i < num; i++){
				face.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
				face.push(i * 4 + 0, i * 4 + 2, i * 4 + 3);
			}
			
			// 最後に情報を登録する
			// このタイミングでgl.enchant.jsがwebglの形式に変換してくれるとさ
			this.mesh.vertices = vert;
			this.mesh.normals = norm;
			this.mesh.colors = clor;
			this.mesh.texCoords = texc;
			this.mesh.indices = face;
		},
		
		// ----------------------------------------------------------------
		// 逆行列を計算して座標からマップチップ選択
		select: function(touchx, touchy){
			var mx = 2 * touchx / game.width - 1;
			var my = 1 - 2 * touchy / game.height;
			var invMat = mat4.create();
			mat4.multiply(game.currentScene3D.projMat, game.currentScene3D.cameraMat, invMat);
			mat4.inverse(invMat);
			var xyw1 = invMat[0] * mx + invMat[4] * my + invMat[12];
			var xyw2 = invMat[1] * mx + invMat[5] * my + invMat[13];
			var xyw3 = invMat[2] * mx + invMat[6] * my + invMat[14];
			var xyw4 = invMat[3] * mx + invMat[7] * my + invMat[15];
			var tempDepth = 1;
			var tempx1 = -1, tempx2 = -1;
			var tempy1 = -1, tempy2 = -1;
			var tempz1 = -1, tempz2 = -1;
			
			// マウス座標とx軸平面の交点
			for(var x = 0; x <= this.xsize; x++){
				var depth = -(xyw1 - xyw4 * x) / (invMat[8] - invMat[11] * x);
				var w = xyw4 + invMat[11] * depth;
				var y = Math.floor((xyw2 + invMat[9] * depth) / w);
				var z = Math.floor((xyw3 + invMat[10] * depth) / w);
				if(depth < tempDepth && (this.isMapChipVisible(x, z, y) ^ this.isMapChipVisible(x - 1, z, y))){
					tempx1 = x; tempx2 = x - 1;
					tempy1 = y; tempy2 = y;
					tempz1 = z; tempz2 = z;
					tempDepth = depth;
				}
			}
			
			// マウス座標とy軸平面の交点
			for(var y = 0; y <= this.zsize; y++){
				var depth = -(xyw2 - xyw4 * y) / (invMat[9] - invMat[11] * y);
				var w = xyw4 + invMat[11] * depth;
				var x = Math.floor((xyw1 + invMat[8] * depth) / w);
				var z = Math.floor((xyw3 + invMat[10] * depth) / w);
				if(depth < tempDepth && (this.isMapChipVisible(x, z, y) ^ this.isMapChipVisible(x, z, y - 1))){
					tempx1 = x; tempx2 = x;
					tempy1 = y; tempy2 = y - 1;
					tempz1 = z; tempz2 = z;
					tempDepth = depth;
				}
			}
			
			// マウス座標とz軸平面の交点
			for(var z = 0; z <= this.ysize; z++){
				var depth = -(xyw3 - xyw4 * z) / (invMat[10] - invMat[11] * z);
				var w = xyw4 + invMat[11] * depth;
				var x = Math.floor((xyw1 + invMat[8] * depth) / w);
				var y = Math.floor((xyw2 + invMat[9] * depth) / w);
				if(depth < tempDepth && (this.isMapChipVisible(x, z, y) ^ this.isMapChipVisible(x, z - 1, y))){
					tempx1 = x; tempx2 = x;
					tempy1 = y; tempy2 = y;
					tempz1 = z; tempz2 = z - 1;
					tempDepth = depth;
				}
			}
			
			// this.selectTypeによって選択するマップチップが変わる 0は置き換え用 1は設置用
			if(this.isMapChipVisible(tempx1, tempz1, tempy1) ^ this.selectType != 0){
				this.selectedx = tempx1;
				this.selectedy = tempz1;
				this.selectedz = tempy1;
			}else{
				this.selectedx = tempx2;
				this.selectedy = tempz2;
				this.selectedz = tempy2;
			}
			
			if(this.getMapChip(this.selectedx, this.selectedy, this.selectedz) < 0){
				this.selectedx = -1;
				this.selectedy = -1;
				this.selectedz = -1;
			}
		},
		
		// ----------------------------------------------------------------
		// あたり判定
		
		// mapとキャラクタ情報の衝突判定
		isHit: function(px, py, pz, vx, vy, vz, hsize, vsize){
			var h_length = 2 + Math.floor(hsize);
			var v_length = 2 + Math.floor(vsize);
			
			// x軸を等分割してmap上の点を得る
			var dx = new Array(h_length);
			var temp0 = px + vx + hsize / 2;
			var temp1 = px + vx - hsize / 2;
			for(var i = 0; i < h_length; i++){
				dx[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
			}
			// y軸を等分割してmap上の点を得る
			var dy = new Array(h_length);
			var temp0 = py + vy + hsize / 2;
			var temp1 = py + vy - hsize / 2;
			for(var i = 0; i < h_length; i++){
				dy[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
			}
			// z軸を等分割してmap上の点を得る
			var dz = new Array(v_length);
			var temp0 = pz + vz + vsize;
			var temp1 = pz + vz;
			for(var i = 0; i < v_length; i++){
				dz[i] = Math.floor(temp0 + (temp1 - temp0) * i / (v_length - 1));
			}
			
			// 各軸進行方向の点を得る
			var x0 = vx > 0 ? dx[0] : vx < 0 ? dx[dx.length - 1] : Math.floor(px + vx);
			var y0 = vy > 0 ? dy[0] : vy < 0 ? dy[dy.length - 1] : Math.floor(py + vy);
			var z0 = vz > 0 ? dz[0] : dz[dz.length - 1];
			
			// x軸進行方向の面
			for(var i = 0; i < dy.length; i++){
				for(var j = 0; j < dz.length; j++){
					if(this.isMapChipHit(x0, dy[i], dz[j])){
						return true;
					}
				}
			}
			
			// y軸進行方向の面
			for(var i = 0; i < dz.length; i++){
				for(var j = 0; j < dx.length; j++){
					if(this.isMapChipHit(dx[j], y0, dz[i])){
						return true;
					}
				}
			}
			
			// z軸進行方向の面
			for(var i = 0; i < dx.length; i++){
				for(var j = 0; j < dy.length; j++){
					if(this.isMapChipHit(dx[i], dy[j], z0)){
						return true;
					}
				}
			}
			
			return false;
		},
		
		// 地面までの距離
		getHeight: function(character){
			var h_length = 2 + Math.floor(character.hsize);
			
			// x軸を等分割してmap上の点を得る
			var dx = new Array(h_length);
			var temp0 = character.px + character.vx + character.hsize / 2;
			var temp1 = character.px + character.vx - character.hsize / 2;
			for(var i = 0; i < h_length; i++){
				dx[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
			}
			// y軸を等分割してmap上の点を得る
			var dy = new Array(h_length);
			var temp0 = character.py + character.vy + character.hsize / 2;
			var temp1 = character.py + character.vy - character.hsize / 2;
			for(var i = 0; i < h_length; i++){
				dy[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
			}
			
			// キャラクタ下方向で最も近い地面の高さを調べる
			var k0 = Math.floor(character.pz + character.vz);
			var ground = -9999;
			for(var i = 0; i < dx.length; i++){
				for(var j = 0; j < dy.length; j++){
					for(var k = k0; k > 0; k--){
						if(this.isMapChipHit(dx[i], dy[j], k - 1) && ground < k){
							ground = k;
						}
					}
				}
			}
			
			// 地面までの距離を返す
			return character.pz + character.vz - ground - 0.01;
		},
		
		// mapとの衝突処理 衝突していた場合はキャラクタの位置と速度が変更される
		// 引数であるcharacterに必要なフィールド
		//  x, y, z 位置
		//  vx, vy, vz 速度
		//  hsize あたり判定の水平軸長さ
		//  vsize あたり判定の垂直軸長さ(高さ)
		collision: function(character){
			var v0x, v0y, v0z;
			var v1x, v1y, v1z;
			var vx, vy;
			
			// x軸方向で最初に衝突するマップチップ境界
			if(character.vx > 0){
				vx = Math.abs(Math.floor(character.px + character.hsize / 2 + 1) - (character.px + character.hsize / 2));
				if(vx == 1){vx = 0;}
			}else{
				vx = Math.abs(Math.floor(character.px - character.hsize / 2 + 0.001) - (character.px - character.hsize / 2));
			}
			
			// y軸方向で最初に衝突するマップチップ境界
			if(character.vy > 0){
				vy = Math.abs(Math.floor(character.py + character.hsize / 2 + 1) - (character.py + character.hsize / 2));
				if(vy == 1){vy = 0;}
			}else{
				vy = Math.abs(Math.floor(character.py - character.hsize / 2 + 0.001) - (character.py - character.hsize / 2));
			}
			
			// z軸上方向にシフトしたときに最初に現れるマップチップ境界
			var pz = Math.floor(character.pz + 1) - character.pz;
			if(pz == 1){pz = 0;}
			// z軸上方向への最大乗り越えシフト量 高さの30%までなら乗り越えることができる
			var pzmax = character.vsize * 0.3;
			
			// xy軸方向衝突判定
			var vxmax = Math.abs(character.vx);
			var vymax = Math.abs(character.vy);
			var hitFlagx = false;
			var hitFlagy = false;
			v0x = v0y = v1z = 0;
			while(vx < vxmax || vy < vymax){	
				if(!hitFlagx && vx / vxmax < vy / vymax){
					// x軸方向の衝突判定準備
					var axis = 0;
					var scale = vx / vxmax;
					vx += 1;
				}else if(!hitFlagy){
					// y軸方向の衝突判定準備
					var axis = 1;
					var scale = vy / vymax;
					vy += 1;
				}else{
					break;
				}
				
				if(!hitFlagx){v1x = v0x = character.vx * scale;}
				if(!hitFlagy){v1y = v0y = character.vy * scale;}
				
				// 衝突判定 判定する軸方向に0.5だけ進んだ状態で衝突するかを調べる
				if(axis == 0){
					v1x = v0x + (character.vx > 0 ? 0.5 : -0.5);
				}else{
					v1y = v0y + (character.vy > 0 ? 0.5 : -0.5);
				}
				if(this.isHit(character.px, character.py, character.pz, v1x, v1y, v1z, character.hsize, character.vsize)){
					// 乗り越え判定
					while(pz < pzmax){
						var pz1 = character.pz + pz;
						if(character.vz >= 0 && !this.isHit(character.px, character.py, pz1, v1x, v1y, v1z, character.hsize, character.vsize)){
							character.pz = pz1;
							break;
						}else{
							pz += 1;
						}
					}
					// 乗り越えしていなかったら衝突処理
					if(pz >= pzmax){
						if(axis == 0){
							character.vx = v1x = v0x - (character.vx > 0 ? 0.01 : -0.01);
							hitFlagx = true;
						}else{
							character.vy = v1y = v0y - (character.vy > 0 ? 0.01 : -0.01);
							hitFlagy = true;
						}
					}
				}
			}
			
			// z軸方向で最初に衝突するマップチップ境界
			if(character.vz > 0){
				v1z = Math.floor(character.pz + character.vsize + 1) - (character.pz + character.vsize) - 0.01;
			}else{
				v1z = Math.floor(character.pz) - (character.pz);
			}
			
			// z軸方向衝突判定
			while(Math.abs(v1z) < Math.abs(character.vz)){
				v0z = v1z;
				v1z += character.vz > 0 ? 1 : -1;
				if(this.isHit(character.px, character.py, character.pz, character.vx, character.vy, v1z, character.hsize, character.vsize)){
					character.vz = v0z;
					break;
				}
			}
			
			// 最後に地面までの距離を返す
			character.altitude = this.getHeight(character);
			return character.altitude
		},
		// ----------------------------------------------------------------
	});
	
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// キャラクタークラス
	enchant.gl.hakoniwa.Character = enchant.Class.create(enchant.gl.Sprite3D, {
		// ----------------------------------------------------------------
		// 初期化
		initialize: function(px, py, pz){
			enchant.gl.Sprite3D.call(this);
			// 位置
			this.px = px;
			this.py = py;
			this.pz = pz; // 高さ方向
			// 速度
			this.vx = 0;
			this.vy = 0; 
			this.vz = 0;
			// あたり判定用キャラクタサイズ
			this.hsize = 0.6;
			this.vsize = 0.8;
			// 地面との距離
			this.altitude = 0;
			// アクションパラメータ 0で静止状態、1以降インクリメントで歩行状態
			this.action = 0;
			// キャラクタの向き
			this.rotate = Math.PI / 180 *  90;
			this.camera_rotate = 0;
			
			// 3D設定
			this.mesh = new Mesh();
			this.mesh.vertices = [
				 0.5, 1.0, 0.0,
				-0.5, 1.0, 0.0,
				-0.5, 0.0, 0.0,
				 0.5, 0.0, 0.0,
			];
			this.mesh.normals = [
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
			];
			this.mesh.indices = [
				0, 1, 2,
				0, 2, 3,
			];
			this.mesh.colors = [
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
			];
			// テクスチャフレームの設定
			this.frame = 0;
			this.auto_update = true;
			
			// あいかわらず光源無視
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
			
			// 影
			this.shadow = new Shadow();
			this.shadow.scaleX = this.hsize * 0.8;
			this.shadow.scaleZ = this.hsize * 0.8;
			this.addChild(this.shadow);
			
			// ----------------------------------------------------------------
			// 描画の前に呼び出されるイベントリスナーを登録
			this.addEventListener('render', function() {
				if(game.currentScene3D._camera){
					var camera = game.currentScene3D._camera;
					// カメラの回転角度を調べる 登場キャラクタが増えるとここが無駄な計算になるのだがまあいいか
					this.camera_rotate = Math.PI + Math.atan2(camera.centerX - camera.x, camera.centerZ - camera.z);
					// 常にカメラの方向を向くように回転
					this.rotation = game.currentScene3D.cameraMatInverseY;
				}
				
				// テクスチャのフレームを設定する
				if(this.auto_update){
					var index = 0;
					// テクスチャu座標を画像横軸から選び、歩行画像を選択する
					if(this.action > 0){
						switch(Math.floor(this.action / 10) % 4){
							case 0: index = 4; break;
							case 2: index = 12; break;
							default: index = 8; break;
						}
					}
					// テクスチャv座標を画像縦軸から選び、方向画像を選択する
					var rotate = (this.rotate + this.camera_rotate) / Math.PI * 180;
					while(rotate > 360 - 45){rotate -= 360;}
					while(rotate <=  0 - 45){rotate += 360;}
					if(rotate < 45){index += 3;}
					else if(rotate <= 135){index += 0;}
					else if(rotate < 225){index += 1;}
					else{index += 2;}
					// 選んだテクスチャ座標を装着
					this.frame = index;
				}
				
				this.x = this.px;
				this.y = this.pz; // キャラクタの座標はz軸を高さ方向にしているが、
				this.z = this.py; // glの表示上はy軸が高さ方向なので入れ替え 非常にややこしいです
				this.shadow.y = -this.altitude;
			});
		},
		
		// ----------------------------------------------------------------
		// テクスチャ画像フレームの選択 this.auto_updateをfalseにすれば自分でsetすることができる
		frame: {
			get: function(){return this._frame;},
			set: function(frame){
				this._frame = frame;
				var u0 = 0.25 * Math.floor(frame / 4);
				var v0 = 0.25 * (frame % 4);
				var u1 = u0 + 0.25;
				var v1 = v0 + 0.25;
				this.mesh.texCoords = [
					u1, 1 - v0,
					u0, 1 - v0,
					u0, 1 - v1,
					u1, 1 - v1,
				];
			},
		},
		
		// ----------------------------------------------------------------
		// 描画設定 後方互換性のために定義だけは残しておく
		predraw: function(){},
		
		// ----------------------------------------------------------------
	});
	
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// 影クラス
	enchant.gl.hakoniwa.Shadow = enchant.Class.create(enchant.gl.Sprite3D, {
		// ----------------------------------------------------------------
		// 初期化
		initialize: function(){
			enchant.gl.Sprite3D.call(this);
			this.mesh = new Mesh()
			this.mesh.vertices = [
				 0.5, 0.05, -0.5,
				-0.5, 0.05, -0.5,
				-0.5, 0.05,  0.5,
				 0.5, 0.05,  0.5,
			];
			this.mesh.normals = [
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
			];
			this.mesh.texCoords = [
				1.0, 0.0,
				0.0, 0.0,
				0.0, 1.0,
				1.0, 1.0,
			];
			this.mesh.indices = [
				0, 1, 2,
				0, 2, 3,
			];
			this.mesh.colors = [
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
			];
			// それでも光源無視
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
			
			// 影のテクスチャ作成
			var surface = new Surface(32, 32);
			surface.context.beginPath();
			surface.context.arc(16, 16, 16, 0, Math.PI * 2.0, true);
			surface.context.fill();
			this.mesh.texture.src = surface;
		}
		// ----------------------------------------------------------------
	});
	
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
}
