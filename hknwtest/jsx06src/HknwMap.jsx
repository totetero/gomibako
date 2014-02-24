import "js/web.jsx";
import "Togl.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ハコニワマップクラス

class HknwMap{
	// 地形情報
	var xsize : int;
	var ysize : int;
	var zsize : int;
	var mapchip : int[][][];
	// 描画情報
	var vertBuffer : WebGLBuffer;
	var clorBuffer : WebGLBuffer;
	var texcBuffer : WebGLBuffer;
	var faceBuffer : WebGLBuffer;
	var faceNum : int;
	
	// ----------------------------------------------------------------
	// マップチップの範囲外チェック
	function getMapChip(x : int, y : int, z : int) : int{
		if(Number.isNaN(x) || x < 0 || this.xsize <= x){return -1;}
		if(Number.isNaN(y) || y < 0 || this.ysize <= y){return -1;}
		if(Number.isNaN(z) || z < 0 || this.zsize <= z){return -1;}
		return this.mapchip[z][y][x];
	}
	
	// ----------------------------------------------------------------
	// マップチップの可視チェック
	function isMapChipVisible(x : int, y : int, z : int) : boolean{
		var chip : int = this.getMapChip(x, y, z);
		return chip > 0;
	}
	
	// ----------------------------------------------------------------
	// マップチップの透過チェック
	function isMapChipSkeleton(x : int, y : int, z : int) : boolean{
		var chip : int = this.getMapChip(x, y, z);
		return chip != -1 && chip != 0 && chip != 1 && !(57 <= chip && chip <= 64);
	}
	
	// ----------------------------------------------------------------
	// マップチップの衝突チェック
	function isMapChipHit(x : int, y : int, z : int) : boolean{
		var chip : int = this.getMapChip(x, y, z);
		return chip != 0;
	}
	
	// ----------------------------------------------------------------
	// 初期化
	function init(mapchip : int[][][]) : void{
		var vert : number[] = new number[];
		var clor : number[] = new number[];
		var texc : number[] = new number[];
		var face : int[] = new int[];
		
		this.mapchip = mapchip;
		this.xsize = this.mapchip[0][0].length;
		this.ysize = this.mapchip[0].length;
		this.zsize = this.mapchip.length;
		
		// 頂点データを生成
		for(var i = 0; i < this.xsize; i++){
			for(var j = 0; j < this.ysize; j++){
				for(var k = 0; k < this.zsize; k++){
					if(this.isMapChipVisible(i, j, k)){
						if(!this.isMapChipSkeleton(i, j, k + 1)){this.pushSurfaces(vert, clor, texc, i, j, k, 1);}
						if(!this.isMapChipSkeleton(i, j, k - 1)){this.pushSurfaces(vert, clor, texc, i, j, k, 2);}
						if(!this.isMapChipSkeleton(i, j + 1, k)){this.pushSurfaces(vert, clor, texc, i, j, k, 3);}
						if(!this.isMapChipSkeleton(i, j - 1, k)){this.pushSurfaces(vert, clor, texc, i, j, k, 4);}
						if(!this.isMapChipSkeleton(i + 1, j, k)){this.pushSurfaces(vert, clor, texc, i, j, k, 5);}
						if(!this.isMapChipSkeleton(i - 1, j, k)){this.pushSurfaces(vert, clor, texc, i, j, k, 6);}
					}
				}
			}
		}
		
		// インデックスデータを生成
		var num : int = vert.length / 12;
		for(var i = 0; i < num; i++){
			face.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
			face.push(i * 4 + 0, i * 4 + 2, i * 4 + 3);
		}
		this.faceNum = face.length;
		
		// VBOとIBOを作成し、データを転送
		this.vertBuffer = Togl.createVBO(vert);
		this.clorBuffer = Togl.createVBO(clor);
		this.texcBuffer = Togl.createVBO(texc);
		this.faceBuffer = Togl.createIBO(face);
	}
	
	// 面の頂点配列作成
	function pushSurfaces(vert : number[], clor : number[], texc : number[], x0 : int, y0 : int, z0 : int, s : int) : void{
		var chip : int = this.mapchip[z0][y0][x0] - 1;
		var x1 : int = x0 + 1;
		var y1 : int = y0 + 1;
		var z1 : int = z0 + 1;
		var xm : int = x0 - 1;
		var ym : int = y0 - 1;
		var zm : int = z0 - 1;
		var u0 : number = (chip % 4) * 0.2500;
		switch(s){
			case 1:
				vert.push(x0, z1, y0); this.setTopColor(clor, x0, ym, z1, xm, y0, z1, xm, ym, z1);
				vert.push(x0, z1, y1); this.setTopColor(clor, x0, y1, z1, xm, y0, z1, xm, y1, z1);
				vert.push(x1, z1, y1); this.setTopColor(clor, x0, y1, z1, x1, y0, z1, x1, y1, z1);
				vert.push(x1, z1, y0); this.setTopColor(clor, x0, ym, z1, x1, y0, z1, x1, ym, z1);
				break;
			case 2:
				u0 = u0 + 0.1875;
				vert.push(x0, z0, y1); this.setTopColor(clor, x0, y1, zm, xm, y0, zm, xm, y1, zm);
				vert.push(x0, z0, y0); this.setTopColor(clor, x0, ym, zm, xm, y0, zm, xm, ym, zm);
				vert.push(x1, z0, y0); this.setTopColor(clor, x0, ym, zm, x1, y0, zm, x1, ym, zm);
				vert.push(x1, z0, y1); this.setTopColor(clor, x0, y1, zm, x1, y0, zm, x1, y1, zm);
				break;
			case 3:
				u0 = u0 + 0.0625;
				vert.push(x0, z1, y1); this.setTopColor(clor, x0, y1, z1, xm, y1, z0, xm, y1, z1);
				vert.push(x0, z0, y1); this.setTopColor(clor, x0, y1, zm, xm, y1, z0, xm, y1, zm);
				vert.push(x1, z0, y1); this.setTopColor(clor, x0, y1, zm, x1, y1, z0, x1, y1, zm);
				vert.push(x1, z1, y1); this.setTopColor(clor, x0, y1, z1, x1, y1, z0, x1, y1, z1);
				break;
			case 4:
				u0 = u0 + 0.0625;
				vert.push(x1, z1, y0); this.setTopColor(clor, x0, ym, z1, x1, ym, z0, x1, ym, z1);
				vert.push(x1, z0, y0); this.setTopColor(clor, x0, ym, zm, x1, ym, z0, x1, ym, zm);
				vert.push(x0, z0, y0); this.setTopColor(clor, x0, ym, zm, xm, ym, z0, xm, ym, zm);
				vert.push(x0, z1, y0); this.setTopColor(clor, x0, ym, z1, xm, ym, z0, xm, ym, z1);
				break;
			case 5:
				u0 = u0 + 0.1250;
				vert.push(x1, z1, y1); this.setTopColor(clor, x1, y0, z1, x1, y1, z0, x1, y1, z1);
				vert.push(x1, z0, y1); this.setTopColor(clor, x1, y0, zm, x1, y1, z0, x1, y1, zm);
				vert.push(x1, z0, y0); this.setTopColor(clor, x1, y0, zm, x1, ym, z0, x1, ym, zm);
				vert.push(x1, z1, y0); this.setTopColor(clor, x1, y0, z1, x1, ym, z0, x1, ym, z1);
				break;
			case 6:
				u0 = u0 + 0.1250;
				vert.push(x0, z1, y0); this.setTopColor(clor, xm, y0, z1, xm, ym, z0, xm, ym, z1);
				vert.push(x0, z0, y0); this.setTopColor(clor, xm, y0, zm, xm, ym, z0, xm, ym, zm);
				vert.push(x0, z0, y1); this.setTopColor(clor, xm, y0, zm, xm, y1, z0, xm, y1, zm);
				vert.push(x0, z1, y1); this.setTopColor(clor, xm, y0, z1, xm, y1, z0, xm, y1, z1);
				break;
		}
		var u1 : number = u0 + 0.0625;
		var v0 : number = Math.floor(chip / 4) *0.0625;
		var v1 : number = v0 + 0.0625;
		texc.push(u0, v0);
		texc.push(u0, v1);
		texc.push(u1, v1);
		texc.push(u1, v0);
	}
	
	// 影の確認
	function setTopColor(clor : number[], x1 : int, y1 : int, z1 : int, x2 : int, y2 : int, z2 : int, x3 : int, y3 : int, z3 : int) : void{
		var color : number = 1;
		if(this.isMapChipSkeleton(x1, y1, z1)){color -= 0.2;}
		if(this.isMapChipSkeleton(x2, y2, z2)){color -= 0.2;}
		if(this.isMapChipSkeleton(x3, y3, z3)){color -= 0.2;}
		clor.push(color, color, color);
	}
	
	// ----------------------------------------------------------------
	// 描画
	function draw(mat : Float32Array) : void{
		// 行列作成
		Togl.setMatrix(mat);
		// 描画
		Togl.bindVertBuf(this.vertBuffer);
		Togl.bindClor3Buf(this.clorBuffer);
		Togl.bindTexcBuf(this.texcBuffer);
		Togl.bindFaceBuf(this.faceBuffer);
		Togl.draw(0, this.faceNum);
	}
	
	// ----------------------------------------------------------------
	// あたり判定
	
	// mapとキャラクタ情報の衝突判定
	function isHit(px : number, py : number, pz : number, vx : number, vy : number, vz : number, hsize : number, vsize : number) : boolean{
		var h_length : int = 2 + Math.floor(hsize);
		var v_length : int = 2 + Math.floor(vsize);
		var temp0 : number;
		var temp1 : number;
		
		// x軸を等分割してmap上の点を得る
		var dx : int[] = new int[h_length];
		temp0 = px + vx + hsize / 2;
		temp1 = px + vx - hsize / 2;
		for(var i = 0; i < h_length; i++){
			dx[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		// y軸を等分割してmap上の点を得る
		var dy : int[] = new int[h_length];
		temp0 = py + vy + hsize / 2;
		temp1 = py + vy - hsize / 2;
		for(var i = 0; i < h_length; i++){
			dy[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		// z軸を等分割してmap上の点を得る
		var dz : int[] = new int[v_length];
		temp0 = pz + vz + vsize;
		temp1 = pz + vz;
		for(var i = 0; i < v_length; i++){
			dz[i] = Math.floor(temp0 + (temp1 - temp0) * i / (v_length - 1));
		}
		
		// 各軸進行方向の点を得る
		var x0 : int = vx > 0 ? dx[0] as int : (vx < 0 ? dx[dx.length - 1] as int : Math.floor(px + vx));
		var y0 : int = vy > 0 ? dy[0] as int : (vy < 0 ? dy[dy.length - 1] as int : Math.floor(py + vy));
		var z0 : int = vz > 0 ? dz[0] : dz[dz.length - 1];
		
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
	function collision(character : HknwCharacter) : void{
		// ---------------- 水平軸方向の衝突判定 ----------------
		// x軸方向で最初に衝突するマップチップ境界
		var vx : number = 0;
		if(character.vx > 0){
			vx = Math.abs(Math.floor(character.x + character.hsize / 2 + 1) - (character.x + character.hsize / 2));
			if(vx == 1){vx = 0;}
		}else{
			vx = Math.abs(Math.floor(character.x - character.hsize / 2 + 0.001) - (character.x - character.hsize / 2));
		}
		
		// y軸方向で最初に衝突するマップチップ境界
		var vy : number = 0;
		if(character.vy > 0){
			vy = Math.abs(Math.floor(character.y + character.hsize / 2 + 1) - (character.y + character.hsize / 2));
			if(vy == 1){vy = 0;}
		}else{
			vy = Math.abs(Math.floor(character.y - character.hsize / 2 + 0.001) - (character.y - character.hsize / 2));
		}
		
		// z軸上方向にシフトしたときに最初に現れるマップチップ境界
		var pz : number = Math.floor(character.z + 1) - character.z;
		if(pz == 1){pz = 0;}
		// z軸上方向への最大乗り越えシフト量 高さの30%までなら乗り越えることができる
		var pzmax : number = character.vsize * 0.3;
		
		// xy軸方向衝突判定
		var vxmax : number = Math.abs(character.vx);
		var vymax : number = Math.abs(character.vy);
		var hitFlagx : boolean = false;
		var hitFlagy : boolean = false;
		var v0x : number = 0, v0y : number = 0, v0z : number = 0;
		var v1x : number = 0, v1y : number = 0, v1z : number = 0;
		while(vx < vxmax || vy < vymax){	
			var axis : int = 0;
			var scale : number = 0;
			if(!hitFlagx && vx / vxmax < vy / vymax){
				// x軸方向の衝突判定準備
				axis = 0;
				scale = vx / vxmax;
				vx += 1;
			}else if(!hitFlagy){
				// y軸方向の衝突判定準備
				axis = 1;
				scale = vy / vymax;
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
					var pz1 : number = character.z + pz;
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
			if(this.isHit(character.x, character.y, character.z, character.vx, character.vy, v1z, character.hsize, character.vsize)){
				character.vz = v0z;
				break;
			}
		}
	}
	
	// 地面までの距離測定
	function getHeight(character : HknwCharacter) : number{
		var h_length = 2 + Math.floor(character.hsize);
		var temp0 : number;
		var temp1 : number;
		
		// x軸を等分割してmap上の点を得る
		var dx : int[] = new int[h_length];
		temp0 = character.x + character.vx + character.hsize / 2;
		temp1 = character.x + character.vx - character.hsize / 2;
		for(var i = 0; i < h_length; i++){
			dx[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		// y軸を等分割してmap上の点を得る
		var dy : int[] = new int[h_length];
		temp0 = character.y + character.vy + character.hsize / 2;
		temp1 = character.y + character.vy - character.hsize / 2;
		for(var i = 0; i < h_length; i++){
			dy[i] = Math.floor(temp0 + (temp1 - temp0) * i / (h_length - 1));
		}
		
		// キャラクタ下方向で最も近い地面の高さを調べる
		var ground : number = 0;
		var k0 : int = Math.floor(character.z + character.vz);
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
		return character.z + character.vz - ground - 0.01;
	}
}

class HknwCharacter{
	// あたり判定用キャラクタサイズ
	var hsize : number = 0.6;
	var vsize : number = 1.0;
	// 位置
	var x : number = 2.5;
	var y : number = 2.5; 
	var z : number = 1;
	// 速度
	var vx : number = 0;
	var vy : number = 0; 
	var vz : number = 0;
}

