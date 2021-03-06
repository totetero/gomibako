// 地形クラス
function Map(){
	this.vertBuffer;
	this.clorBuffer;
	this.texcBuffer;
	this.faceBuffer;
	this.faceNum;
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d, map){
		var vert = new Array();
		var clor = new Array();
		var texc = new Array();
		var face = new Array();
		var mx = map[0][0].length;
		var my = map[0].length;
		var mz = map.length;
		
		// マップチップの範囲外チェック関数
		var getMapChip = function(x, y, z){
			x = Math.floor(parseInt(x));
			y = Math.floor(parseInt(y));
			z = Math.floor(parseInt(z));
			if(isNaN(x) || x < 0 || mx <= x){return -1;}
			if(isNaN(y) || y < 0 || my <= y){return -1;}
			if(isNaN(z) || z < 0 || mz <= z){return -1;}
			return map[z][y][x];
		}
		
		// マップチップの可視チェック関数
		var isMapChipVisible = function(x, y, z){
			var chip = getMapChip(x, y, z);
			return chip > 0;
		}
		
		// マップチップの透過チェック関数
		var isMapChipSkeleton = function(x, y, z){
			var chip = getMapChip(x, y, z);
			return chip != -1 && chip != 0 && chip != 1 && !(57 <= chip && chip <= 64);
		}
		
		// 影の確認関数
		var setTopColor = function(clor, x1, y1, z1, x2, y2, z2, x3, y3, z3){
			var color = 1;
			if(isMapChipSkeleton(x1, y1, z1)){color -= 0.2;}
			if(isMapChipSkeleton(x2, y2, z2)){color -= 0.2;}
			if(isMapChipSkeleton(x3, y3, z3)){color -= 0.2;}
			clor.push(color, color, color);
		}
		
		// 面の頂点配列作成関数
		pushSurfaces = function(vert, clor, texc, x0, y0, z0, s){
			var chip = map[z0][y0][x0] - 1;
			var x1 = x0 + 1;
			var y1 = y0 + 1;
			var z1 = z0 + 1;
			var xm = x0 - 1;
			var ym = y0 - 1;
			var zm = z0 - 1;
			var u0 = (chip % 4) * 0.2500;
			switch(s){
				case 1:
					vert.push(x0, z1, y0); setTopColor(clor, x0, ym, z1, xm, y0, z1, xm, ym, z1);
					vert.push(x0, z1, y1); setTopColor(clor, x0, y1, z1, xm, y0, z1, xm, y1, z1);
					vert.push(x1, z1, y1); setTopColor(clor, x0, y1, z1, x1, y0, z1, x1, y1, z1);
					vert.push(x1, z1, y0); setTopColor(clor, x0, ym, z1, x1, y0, z1, x1, ym, z1);
					break;
				case 2:
					u0 = u0 + 0.1875;
					vert.push(x0, z0, y1); setTopColor(clor, x0, y1, zm, xm, y0, zm, xm, y1, zm);
					vert.push(x0, z0, y0); setTopColor(clor, x0, ym, zm, xm, y0, zm, xm, ym, zm);
					vert.push(x1, z0, y0); setTopColor(clor, x0, ym, zm, x1, y0, zm, x1, ym, zm);
					vert.push(x1, z0, y1); setTopColor(clor, x0, y1, zm, x1, y0, zm, x1, y1, zm);
					break;
				case 3:
					u0 = u0 + 0.0625;
					vert.push(x0, z1, y1); setTopColor(clor, x0, y1, z1, xm, y1, z0, xm, y1, z1);
					vert.push(x0, z0, y1); setTopColor(clor, x0, y1, zm, xm, y1, z0, xm, y1, zm);
					vert.push(x1, z0, y1); setTopColor(clor, x0, y1, zm, x1, y1, z0, x1, y1, zm);
					vert.push(x1, z1, y1); setTopColor(clor, x0, y1, z1, x1, y1, z0, x1, y1, z1);
					break;
				case 4:
					u0 = u0 + 0.0625;
					vert.push(x1, z1, y0); setTopColor(clor, x0, ym, z1, x1, ym, z0, x1, ym, z1);
					vert.push(x1, z0, y0); setTopColor(clor, x0, ym, zm, x1, ym, z0, x1, ym, zm);
					vert.push(x0, z0, y0); setTopColor(clor, x0, ym, zm, xm, ym, z0, xm, ym, zm);
					vert.push(x0, z1, y0); setTopColor(clor, x0, ym, z1, xm, ym, z0, xm, ym, z1);
					break;
				case 5:
					u0 = u0 + 0.1250;
					vert.push(x1, z1, y1); setTopColor(clor, x1, y0, z1, x1, y1, z0, x1, y1, z1);
					vert.push(x1, z0, y1); setTopColor(clor, x1, y0, zm, x1, y1, z0, x1, y1, zm);
					vert.push(x1, z0, y0); setTopColor(clor, x1, y0, zm, x1, ym, z0, x1, ym, zm);
					vert.push(x1, z1, y0); setTopColor(clor, x1, y0, z1, x1, ym, z0, x1, ym, z1);
					break;
				case 6:
					u0 = u0 + 0.1250;
					vert.push(x0, z1, y0); setTopColor(clor, xm, y0, z1, xm, ym, z0, xm, ym, z1);
					vert.push(x0, z0, y0); setTopColor(clor, xm, y0, zm, xm, ym, z0, xm, ym, zm);
					vert.push(x0, z0, y1); setTopColor(clor, xm, y0, zm, xm, y1, z0, xm, y1, zm);
					vert.push(x0, z1, y1); setTopColor(clor, xm, y0, z1, xm, y1, z0, xm, y1, z1);
					break;
			}
			var u1 = u0 + 0.0625;
			var v0 = Math.floor(chip / 4) * 0.0625;
			var v1 = v0 + 0.0625;
			texc.push(u0, v0);
			texc.push(u0, v1);
			texc.push(u1, v1);
			texc.push(u1, v0);
		}
		
		// 頂点データを生成
		for(var i = 0; i < mx; i++){
			for(var j = 0; j < my; j++){
				for(var k = 0; k < mz; k++){
					if(isMapChipVisible(i, j, k)){
						if(!isMapChipSkeleton(i, j, k + 1)){pushSurfaces(vert, clor, texc, i, j, k, 1);}
						if(!isMapChipSkeleton(i, j, k - 1)){pushSurfaces(vert, clor, texc, i, j, k, 2);}
						if(!isMapChipSkeleton(i, j + 1, k)){pushSurfaces(vert, clor, texc, i, j, k, 3);}
						if(!isMapChipSkeleton(i, j - 1, k)){pushSurfaces(vert, clor, texc, i, j, k, 4);}
						if(!isMapChipSkeleton(i + 1, j, k)){pushSurfaces(vert, clor, texc, i, j, k, 5);}
						if(!isMapChipSkeleton(i - 1, j, k)){pushSurfaces(vert, clor, texc, i, j, k, 6);}
					}
				}
			}
		}
		
		// インデックスデータを生成
		var num = vert.length / 12;
		for(var i = 0; i < num; i++){
			face.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
			face.push(i * 4 + 0, i * 4 + 2, i * 4 + 3);
		}
		this.faceNum = face.length;
		
		// VBOとIBOを作成し、データを転送
		this.vertBuffer = e3d.createVBO(vert);
		this.clorBuffer = e3d.createVBO(clor);
		this.texcBuffer = e3d.createVBO(texc);
		this.faceBuffer = e3d.createIBO(face);
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat){
		// 行列作成
		e3d.setMatrix(mat);
		// 描画
		e3d.bindVertBuf(this.vertBuffer);
		e3d.bindClor3Buf(this.clorBuffer);
		e3d.bindTexcBuf(this.texcBuffer);
		e3d.bindFaceBuf(this.faceBuffer);
		e3d.draw(0, this.faceNum);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// スクロールマップクラス
function ScrollMap(){
	// 地形情報
	this.map = null;
	this.x = 0;
	this.y = 0;
	this.z = 0;
	var maps = new Array();
	var halfSize = 0;
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d, map, size){
		this.map = map;
		this.x = this.map[0][0].length;
		this.y = this.map[0].length;
		this.z = this.map.length;
		halfSize = Math.floor(size / 2);
		for(var m = 0; m < this.x; m++){
			// マップ分割
			var tmpmap = new Array();
			for(var i = 0; i < this.z; i++){
				tmpmap[i] = new Array();
				for(var j = 0; j < this.y; j++){
					tmpmap[i][j] = new Array();
					for(var k = 0; k < size; k++){
						var x = k + m - halfSize;
						while(x < 0){x += this.x} x %= this.x;
						tmpmap[i][j][k] = map[i][j][x];
					}
				}
			}
			// 分割マップ登録
			maps[m] = new Map();
			maps[m].init(e3d, tmpmap);
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat, centerx){
		// 行列作成
		var x = Math.floor(centerx);
		mat4.set(mat, e3d.tmpmat1);
		mat4.translate(e3d.tmpmat1, [x - halfSize, 0, 0]);
		// 描画
		while(x < 0){x += maps.length;} x %= maps.length;
		maps[x].draw(e3d, e3d.tmpmat1);
	}
	
	// ----------------------------------------------------------------
	// あたり判定
	
	// マップチップの衝突チェック
	this.isMapChipHit = function(x, y, z){
		x = Math.floor(parseInt(x));
		y = Math.floor(parseInt(y));
		z = Math.floor(parseInt(z));
		//if(isNaN(x) || x < 0 || this.x <= x){return -1;}
		if(isNaN(y) || y < 0 || this.y <= y){return -1;}
		if(isNaN(z) || z < 0 || this.z <= z){return -1;}
		while(x < 0){x += this.x;} x %= this.x;
		var chip = this.map[z][y][x];
		return chip != 0;
	}
	
	// mapとキャラクタ情報の衝突判定
	this.isHit = function(px, py, pz, vx, vy, vz, hsize, vsize){
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
	}
	
	// mapとの衝突処理 衝突していた場合はキャラクタの位置と速度が変更される
	// 引数であるcharacterに必要なフィールド
	//  x, y, z 位置
	//  vx, vy, vz 速度
	//  hsize あたり判定の半径
	//  vsize あたり判定の高さ
	this.collision = function(character){
		var v0x, v0y, v0z;
		var v1x, v1y, v1z;
		var vx, vy;
		
		// ---------------- 水平軸方向の衝突判定 ----------------
		// x軸方向で最初に衝突するマップチップ境界
		if(character.vx > 0){
			vx = Math.abs(Math.floor(character.x + character.hsize / 2 + 1) - (character.x + character.hsize / 2));
			if(vx == 1){vx = 0;}
		}else{
			vx = Math.abs(Math.floor(character.x - character.hsize / 2 + 0.001) - (character.x - character.hsize / 2));
		}
		
		// y軸方向で最初に衝突するマップチップ境界
		if(character.vy > 0){
			vy = Math.abs(Math.floor(character.y + character.hsize / 2 + 1) - (character.y + character.hsize / 2));
			if(vy == 1){vy = 0;}
		}else{
			vy = Math.abs(Math.floor(character.y - character.hsize / 2 + 0.001) - (character.y - character.hsize / 2));
		}
		
		// z軸上方向にシフトしたときに最初に現れるマップチップ境界
		var pz = Math.floor(character.z + 1) - character.z;
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
			if(this.isHit(character.x, character.y, character.z, v1x, v1y, v1z, character.hsize, character.vsize)){
				// 乗り越え判定
				while(pz < pzmax){
					var pz1 = character.z + pz;
					if(character.vz >= 0 && !this.isHit(character.x, character.y, pz1, v1x, v1y, v1z, character.hsize, character.vsize)){
						character.z = pz1;
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
		
		// ---------------- 垂直軸方向の衝突判定 ----------------
		// z軸方向で最初に衝突するマップチップ境界
		if(character.vz > 0){
			v1z = Math.floor(character.z + character.vsize + 1) - (character.z + character.vsize) - 0.01;
		}else{
			v1z = Math.floor(character.z) - (character.z);
		}
		
		// z軸方向衝突判定
		while(Math.abs(v1z) < Math.abs(character.vz)){
			v0z = v1z;
			v1z += character.vz > 0 ? 1 : -1;
			if(this.isHit(character.x, character.y, character.z,　character.vx, character.vy, v1z, character.hsize, character.vsize)){
				character.vz = v0z;
				break;
			}
		}
		
		// ---------------- 地面までの距離測定 ----------------
		var h_length = 2 + Math.floor(character.hsize);
		
		// x軸を等分割してmap上の点を得る
		var dx = new Array(h_length);
		var temp0 = character.x + character.vx + character.hsize / 2;
		var temp1 = character.x + character.vx - character.hsize / 2;
		for(var i = 0; i < h_length; i++){
			dx[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		// y軸を等分割してmap上の点を得る
		var dy = new Array(h_length);
		var temp0 = character.y + character.vy + character.hsize / 2;
		var temp1 = character.y + character.vy - character.hsize / 2;
		for(var i = 0; i < h_length; i++){
			dy[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		
		// キャラクタ下方向で最も近い地面の高さを調べる
		var ground = 0;
		var k0 = Math.floor(character.z + character.vz);
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
		return character.altitude = character.z + character.vz - ground - 0.01;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

