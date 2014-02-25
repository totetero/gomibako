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
		// マップチップの透過チェック
		isMapChipVisible: function(x, y, z){
			var chip = this.getMapChip(x, y, z);
			return chip != 0 && chip != 1 && !(57 <= chip && chip <= 64);
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
			
			vert = new Array();
			norm = new Array();
			clor = new Array();
			texc = new Array();
			face = new Array();
			
			// 内部関数 影の確認
			// でもテクスチャを貼ると色情報が無視されるみたいで意味ないのだが
			var setTopColor = function(me, x1, y1, z1, x2, y2, z2, x3, y3, z3){
				var color = 1;
				if(me.isMapChipVisible(x1, y1, z1)){color -= 0.2;}
				if(me.isMapChipVisible(x2, y2, z2)){color -= 0.2;}
				if(me.isMapChipVisible(x3, y3, z3)){color -= 0.2;}
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
						if(this.map[k][j][i] > 0){
							if(!this.isMapChipVisible(i, j, k + 1)){pushSurfaces(this, i, j, k, 1);}
							if(!this.isMapChipVisible(i, j, k - 1)){pushSurfaces(this, i, j, k, 2);}
							if(!this.isMapChipVisible(i, j + 1, k)){pushSurfaces(this, i, j, k, 3);}
							if(!this.isMapChipVisible(i, j - 1, k)){pushSurfaces(this, i, j, k, 4);}
							if(!this.isMapChipVisible(i + 1, j, k)){pushSurfaces(this, i, j, k, 5);}
							if(!this.isMapChipVisible(i - 1, j, k)){pushSurfaces(this, i, j, k, 6);}
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
			this.mesh = new Mesh();
			this.mesh.vertices = vert;
			this.mesh.normals = norm;
			this.mesh.colors = clor;
			this.mesh.texCoords = texc;
			this.mesh.indices = face;
			
			// 光源なんて複雑で使いたくないから無視するからな！！
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
		},
		
		// ----------------------------------------------------------------
		// あたり判定
		
		collisionMapChip: function(sphere, mx, my, mz){
			if(!this.isMapChipHit(mx, my, mz)){return false;}
			var x0 = sphere.px + sphere.vx;
			var y0 = sphere.py + sphere.vy;
			var z0 = sphere.pz + sphere.vz;
			var x1 = x0;
			var y1 = y0;
			var z1 = z0;
			// マップチップと球中心点の最近接点を求める
			if(x1 < mx){x1 = mx;}
			if(y1 < my){y1 = my;}
			if(z1 < mz){z1 = mz;}
			if(x1 > mx + 1){x1 = mx + 1;}
			if(y1 > my + 1){y1 = my + 1;}
			if(z1 > mz + 1){z1 = mz + 1;}
			// 最近接点までの距離と球半径を比較して衝突確認する
			var vx = x1 - x0;
			var vy = y1 - y0;
			var vz = z1 - z0;
			var rr = vx * vx + vy * vy + vz * vz;
			if(rr > sphere.radius * sphere.radius){return false;}
			// 衝突する直前まで速度を戻す
			rr = sphere.radius / Math.sqrt(rr) - 1;
			sphere.vx -= vx * rr;
			sphere.vy -= vy * rr;
			sphere.vz -= vz * rr;
			return true;
		},
		
		// mapとの衝突処理 衝突していた場合はキャラクタの位置と速度が変更される
		// 引数であるcharacterに必要なフィールド
		//  px, py, pz 位置
		//  vx, vy, vz 速度
		//  radius あたり判定球の半径 たぶん1未満でないといけない
		collision: function(character){
			var r = character.radius * 0.9;
			if(character.vx > r){character.vx = r;}else if(character.vx < -r){character.vx = -r;}
			if(character.vy > r){character.vy = r;}else if(character.vy < -r){character.vy = -r;}
			if(character.vz > r){character.vz = r;}else if(character.vz < -r){character.vz = -r;}
			var mx = Math.floor(character.px);
			var my = Math.floor(character.py);
			var mz = Math.floor(character.pz);
			for(var i = 0; i < 3; i++){
				for(var j = 0; j < 3; j++){
					for(var k = 0; k < 3; k++){
						this.collisionMapChip(character, mx + i - 1, my + j - 1, mz + k - 1);
					}
				}
			}
			
			// キャラクタ下方向で最も近い地面の高さを調べる
			var i0 = Math.floor(character.pz + character.vz);
			var ground = character.pz + character.vz - character.radius - 0.01;
			for(var i = i0; i > 0; i--){
				if(this.isMapChipHit(mx, my, i - 1)){return ground - i;}
			}
			return ground;
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
			this.radius = 0.4;
			// 地面との距離
			this.altitude = 0;
			// アクションパラメータ 0で静止状態、1移行インクリメントで歩行状態
			this.action = 0;
			// キャラクタの向き
			this.rotate = Math.PI / 180 *  90;
			
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
			//this.setBaseColor('rgb(255, 255, 255');
			this.mesh.colors = [
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
			];
			
			// 	テクスチャ座標を避難しておく
			this.texBuffers = new Array();
			for(var i = 0; i < 16; i++){
				var u0 = 0.25 * Math.floor(i / 4);
				var v0 = 0.25 * (i % 4);
				var u1 = u0 + 0.25;
				var v1 = v0 + 0.25;
				this.mesh.texCoordsBuffer = gl.createBuffer();
				this.mesh.texCoords = [
					u1, 1 - v0,
					u0, 1 - v0,
					u0, 1 - v1,
					u1, 1 - v1,
				];
				this.texBuffers[i] = this.mesh.texCoordsBuffer;
			}
			
			// あいかわらず光源無視
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
			
			// 影
			this.shadow = new Shadow();
			this.shadow.scaleX = this.radius * 2;
			this.shadow.scaleZ = this.radius * 2;
			this.addChild(this.shadow);
		},
		
		// ----------------------------------------------------------------
		// 描画設定
		predraw: function(camera_rotate){
			// テクスチャu座標を画像横軸から選び、歩行画像を選択する
			var index = 0;
			if(this.action > 0){
				switch(Math.floor(this.action / 10) % 4){
					case 0: index = 4; break;
					case 2: index = 12; break;
					default: index = 8; break;
				}
			}
			// テクスチャv座標を画像縦軸から選び、方向画像を選択する
			var rotate = (this.rotate + camera_rotate) / Math.PI * 180;
			while(rotate > 360 - 45){rotate -= 360;}
			while(rotate <=  0 - 45){rotate += 360;}
			if(rotate < 45){index += 3;}
			else if(rotate <= 135){index += 0;}
			else if(rotate < 225){index += 1;}
			else{index += 2;}
			// 選んだテクスチャ座標を装着
			this.mesh.texCoordsBuffer = this.texBuffers[index];
			
			// 常にカメラの方向を向くように回転
			this.rotationSet(new Quat(0, -1, 0, camera_rotate));
			this.x = this.px;
			this.y = this.pz - this.radius; // キャラクタの座標はz軸を高さ方向にしているが、
			this.z = this.py; // glの表示上はy軸が高さ方向なので入れ替え 非常にややこしいです
			this.shadow.y = -this.altitude;
		},
		
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
			this.mesh = new Mesh();
			this.mesh.vertices = [
				 0.5, 0.0, -0.5,
				-0.5, 0.0, -0.5,
				-0.5, 0.0,  0.5,
				 0.5, 0.0,  0.5,
				 0.5, 0.0,  0.5,
				-0.5, 0.0,  0.5,
				-0.5, 0.0, -0.5,
				 0.5, 0.0, -0.5,
			];
			this.mesh.normals = [
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
				0.0, 1.0, 0.0,
			];
			this.mesh.texCoords = [
				1.0, 0.0,
				0.0, 0.0,
				0.0, 1.0,
				1.0, 1.0,
				1.0, 0.0,
				0.0, 0.0,
				0.0, 1.0,
				1.0, 1.0,
			];
			this.mesh.indices = [
				0, 1, 2,
				0, 2, 3,
				4, 5, 6,
				4, 6, 7,
			];
			this.mesh.colors = [
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
				1.0, 1.0, 1.0, 1.0, 
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
