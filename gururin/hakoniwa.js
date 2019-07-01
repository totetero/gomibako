// ハコニワプラグイン (ハコニワラビリンスバージョン)
// ハコニワマップを管理する キャラクタのあたり判定は球型
// 三次元迷路をクラスタリングによって作成する
// ハコニワラビリンスは広いのでバッファを分割して管理する
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
		// マップデータ作成
		createMapData: function(){
			// 地形情報
			if(!game.hardMode){
				// ノーマルモード
				this.roomNum = 3;
				this.roomSize = 4;
			}else{
				// ハードモード マップが広い 意味もなく部屋が狭い
				this.roomNum = 5;
				this.roomSize = 3;
			}
			this.xsize = this.ysize = this.zsize = (this.roomSize + 2) * this.roomNum;
			
			// 配列を作る
			this.map = new Array();
			for(var k = 0; k < this.zsize; k++){
				this.map[k] = new Array();
				for(var j = 0; j < this.ysize; j++){
					this.map[k][j] = new Array();
					for(var i = 0; i < this.xsize; i++){
						var chip = 2;
						if(k < (this.roomSize + 2) * (this.roomNum - 1)){chip =  9}
						if(k < (this.roomSize + 2) * (this.roomNum - 2)){chip = 10}
						if(k < (this.roomSize + 2) * (this.roomNum - 3)){chip = 11}
						if(k < (this.roomSize + 2) * (this.roomNum - 4)){chip = 32}
						this.map[k][j][i] = chip;
					}
				}
			}
			
			// スタート地点
			this.map[this.zsize - 1][2][2] = 61;
			// ゴール地点
			this.map[0][this.ysize - 3][this.xsize - 3] = 0;
			this.map[0][this.ysize - 2][this.xsize - 2] = 22;
			this.map[0][this.ysize - 2][this.xsize - 3] = 22;
			this.map[0][this.ysize - 2][this.xsize - 4] = 22;
			this.map[0][this.ysize - 3][this.xsize - 2] = 22;
			this.map[0][this.ysize - 3][this.xsize - 4] = 22;
			this.map[0][this.ysize - 4][this.xsize - 2] = 22;
			this.map[0][this.ysize - 4][this.xsize - 3] = 22;
			this.map[0][this.ysize - 4][this.xsize - 4] = 22;
			
			// 部屋を作る
			for(var k = 0; k < this.roomNum; k++){for(var j = 0; j < this.roomNum; j++){for(var i = 0; i < this.roomNum; i++){
				for(var n = 0; n < this.roomSize; n++){for(var m = 0; m < this.roomSize; m++){for(var l = 0; l < this.roomSize; l++){
					var x = i * (this.roomSize + 2) + l + 1;
					var y = j * (this.roomSize + 2) + m + 1;
					var z = k * (this.roomSize + 2) + n + 1;
					this.map[z][y][x] = 0;
				}}}
			}}}
			
			// ここからクラスタリングによる迷路作成アルゴリズムで壁に穴をあける
			// 各軸方向の部屋ペアリストを作る これから部屋ペアに挟まれた壁を壊すか否か検証してゆく
			// 参考 http://apollon.issp.u-tokyo.ac.jp/~watanabe/tips/maze.html
			var pair = new Array();
			var pair_num = 0;
			// x軸方向の部屋ペア
			for(var k = 0; k < this.roomNum; k++){for(var j = 0; j < this.roomNum; j++){for(var i = 0; i < this.roomNum - 1; i++){
				pair[pair_num] = new Object();
				pair[pair_num].room1 = (k * this.roomNum + j) * this.roomNum + (i + 0);
				pair[pair_num].room2 = (k * this.roomNum + j) * this.roomNum + (i + 1);
				pair[pair_num].flag = false;
				pair_num++;
			}}}
			// y軸方向の部屋ペア
			for(var k = 0; k < this.roomNum; k++){for(var j = 0; j < this.roomNum - 1; j++){for(var i = 0; i < this.roomNum; i++){
				pair[pair_num] = new Object();
				pair[pair_num].room1 = (k * this.roomNum + (j + 0)) * this.roomNum + i;
				pair[pair_num].room2 = (k * this.roomNum + (j + 1)) * this.roomNum + i;
				pair[pair_num].flag = false;
				pair_num++;
			}}}
			// z軸方向の部屋ペア
			for(var k = 0; k < this.roomNum - 1; k++){for(var j = 0; j < this.roomNum; j++){for(var i = 0; i < this.roomNum; i++){
				pair[pair_num] = new Object();
				pair[pair_num].room1 = ((k + 0) * this.roomNum + j) * this.roomNum + i;
				pair[pair_num].room2 = ((k + 1) * this.roomNum + j) * this.roomNum + i;
				pair[pair_num].flag = false;
				pair_num++;
			}}}
			
			// クラスタリスト初期化
			var cluster = new Array();
			var cluster_num = this.roomNum * this.roomNum * this.roomNum;
			for(var i = 0; i < cluster_num; i++){cluster[i] = i;}
			// クラスタ番号確認関数
			var get_cluster_number = function(index){
				while(index != cluster[index]){index = cluster[index];}
				return index;
			}
			// すべてが同じクラスタに所属し、死に領域がなくなるまで繰り返す
			for(var j = 0; j < 9999; j++){
				// 違うクラスタに所属する部屋同士の壁をランダムに壊す
				var temp = pair[Math.floor(Math.random() * pair_num)];
				if(get_cluster_number(temp.room1) != get_cluster_number(temp.room2)){temp.flag = true;}else{continue;}
				// クラスタリングを行う
				for(var i = 0; i < pair_num; i++){
					if(pair[i].flag){
						var i1 = get_cluster_number(pair[i].room1);
						var i2 = get_cluster_number(pair[i].room2);
						if(i1 < i2){
							cluster[i2] = i1;
						}else{
							cluster[i1] = i2;
						}
					}
				}
				// すべてが同じクラスタに所属するか確認する
				var flag = true;
				for(var i = 0; i < cluster_num; i++){if(cluster[get_cluster_number(i)] != 0){flag = false; break;}}
				if(flag){break;}
			}
			
			// 穴を作る
			var pair_num = 0;
			// x軸方向の部屋ペア間壁
			for(var k = 0; k < this.roomNum; k++){for(var j = 0; j < this.roomNum; j++){for(var i = 0; i < this.roomNum - 1; i++){
					if(pair[pair_num++].flag){
						var x = (this.roomSize + 2) * (i + 1) - 1;
						var y = (this.roomSize + 2) * j + Math.floor(Math.random() * this.roomSize) + 1;
						var z = (this.roomSize + 2) * k + Math.floor(Math.random() * this.roomSize) + 1;
						this.map[z][y][x + 0] = 0;
						this.map[z][y][x + 1] = 0;
					}
			}}}
			// y軸方向の部屋ペア間壁
			for(var k = 0; k < this.roomNum; k++){for(var j = 0; j < this.roomNum - 1; j++){for(var i = 0; i < this.roomNum; i++){
					if(pair[pair_num++].flag){
						var y = (this.roomSize + 2) * (j + 1) - 1;
						var z = (this.roomSize + 2) * k + Math.floor(Math.random() * this.roomSize) + 1;
						var x = (this.roomSize + 2) * i + Math.floor(Math.random() * this.roomSize) + 1;
						this.map[z][y + 0][x] = 0;
						this.map[z][y + 1][x] = 0;
					}
			}}}
			// z軸方向の部屋ペア間壁
			for(var k = 0; k < this.roomNum - 1; k++){for(var j = 0; j < this.roomNum; j++){for(var i = 0; i < this.roomNum; i++){
					if(pair[pair_num++].flag){
						var z = (this.roomSize + 2) * (k + 1) - 1;
						var x = (this.roomSize + 2) * i + Math.floor(Math.random() * this.roomSize) + 1;
						var y = (this.roomSize + 2) * j + Math.floor(Math.random() * this.roomSize) + 1;
						this.map[z + 0][y][x] = 0;
						this.map[z + 1][y][x] = 0;
					}
			}}}
		},
		
		// ----------------------------------------------------------------
		// マップバッファ作成
		createMapBuffer: function(sprite, xmin, xmax, ymin, ymax, zmin, zmax){
			vert = new Array();
			norm = new Array();
			clor = new Array();
			texc = new Array();
			face = new Array();
			
			// 内部関数 影の確認
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
				var v0 = Math.floor(chip / 4) * 0.0625;
				var v1 = v0 + 0.0625;
				// テクスチャのy座標、左上原点かと思ったけど上下反転してるのかー
				texc.push(u0, 1 - v0); texc.push(u0, 1 - v1); texc.push(u1, 1 - v1); texc.push(u1, 1 - v0);
			}
			
			// 頂点情報を生成
			for(var i = xmin; i < xmax; i++){
				for(var j = ymin; j < ymax; j++){
					for(var k = zmin; k < zmax; k++){
						if(this.map[k][j][i] > 1){
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
			sprite.xmin = xmin; sprite.ymin = ymin; sprite.zmin = zmin;
			sprite.xmax = xmax; sprite.ymax = ymax; sprite.zmax = zmax;
			
			// インデックス情報を生成
			var num = vert.length / 12;
			for(var i = 0; i < num; i++){
				face.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
				face.push(i * 4 + 0, i * 4 + 2, i * 4 + 3);
			}
			
			// 最後に情報を登録する
			// このタイミングでgl.enchant.jsがwebglの形式に変換してくれるとさ
			sprite.mesh.vertices = vert;
			sprite.mesh.normals = norm;
			sprite.mesh.colors = clor;
			sprite.mesh.texCoords = texc;
			sprite.mesh.indices = face;
		},
		
		// ----------------------------------------------------------------
		// 初期化
		initialize: function(map){
			enchant.gl.Sprite3D.call(this);
			// テクスチャ作成 光源なんて複雑で使いたくないから無視するからな！！
			this.mesh.texture.src = "img/mapchip.png";
			this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			this.mesh.texture.shininess = 1;
			
			if(map != undefined){
				// 引数のマップからバッファ作成
				this.map = map;
				this.xsize = this.map[0][0].length;
				this.ysize = this.map[0].length;
				this.zsize = this.map.length;
				this.createMapBuffer(this, 0, this.xsize, 0, this.ysize, 0, this.zsize);
			}else if(false){
				// test 常にすべて表示されるダンジョン
				this.createMapData();
				this.createMapBuffer(this, 0, this.xsize, 0, this.ysize, 0, this.zsize);
				return;
			}else{
				// ダンジョンマップ作成
				this.createMapData();
				// マップを部屋毎に分けてスプライト配列を作りバッファ作成
				this.map_child = new Array();
				this.map_visible = new Array();
				for(var k = 0; k < this.roomNum; k++){
					this.map_child[k] = new Array();
					this.map_visible[k] = new Array();
					for(var j = 0; j < this.roomNum; j++){
						this.map_child[k][j] = new Array();
						this.map_visible[k][j] = new Array();
						for(var i = 0; i < this.roomNum; i++){
							var sprite = new Sprite3D();
							var xmin = (this.roomSize + 2) * i;
							var ymin = (this.roomSize + 2) * j;
							var zmin = (this.roomSize + 2) * k;
							var xmax = (this.roomSize + 2) * (i + 1);
							var ymax = (this.roomSize + 2) * (j + 1);
							var zmax = (this.roomSize + 2) * (k + 1);
							this.createMapBuffer(sprite, xmin, xmax, ymin, ymax, zmin, zmax);
							sprite.mesh.texture = this.mesh.texture;
							this.map_child[k][j][i] = sprite
							this.map_visible[k][j][i] = false;
						}
					}
				}
			}
		},
		
		// ----------------------------------------------------------------
		// バッファ削除 効果のほどは不明だが一応用意しておく
		deleteBuffer: function(){
			if(this.map_child != undefined){
				for(var k = 0; k < this.roomNum; k++){
					for(var j = 0; j < this.roomNum; j++){
						for(var i = 0; i < this.roomNum; i++){
							this.removeChild(this.map_child[k][j][i]);
							gl.deleteBuffer(this.map_child[k][j][i].mesh.verticesBuffer);
							gl.deleteBuffer(this.map_child[k][j][i].mesh.normalsBuffer);
							gl.deleteBuffer(this.map_child[k][j][i].mesh.colorsBuffer);
							gl.deleteBuffer(this.map_child[k][j][i].mesh.indicesBuffer);
							gl.deleteBuffer(this.map_child[k][j][i].mesh.texCoordsBuffer);
							this.map_child[k][j][i].mesh.indices = [];
						}
					}
				}
			}else{
				gl.deleteBuffer(this.mesh.verticesBuffer);
				gl.deleteBuffer(this.mesh.normalsBuffer);
				gl.deleteBuffer(this.mesh.colorsBuffer);
				gl.deleteBuffer(this.mesh.indicesBuffer);
				gl.deleteBuffer(this.mesh.texCoordsBuffer);
				this.mesh.indices = [];
			}
		},
		
		// ----------------------------------------------------------------
		// ミニマップスプライト作成
		createMiniMapSprite: function(character){
			if(this.roomNum != undefined){
				var num = this.roomNum;
				var size = this.roomSize + 2;
				var spriteSize = 16 * num;
				var sprite = new Sprite(spriteSize, spriteSize);
				var surface = new Surface(spriteSize, spriteSize);
				sprite.x = 320 - spriteSize - 10;
				sprite.y = 320 - spriteSize - 10;
				sprite.image = surface;
				sprite.addEventListener('enterframe', function(e){
					surface.clear();
					var x = Math.floor(character.px / size);
					var y = Math.floor(character.py / size);
					for(var i = 0; i < num; i++){for(var j = 0; j < num; j++){
						if(x == i && y == j){
							surface.draw(game.assets['img/ctrl.png'], 144, 112, 16, 16, 16 * i, 16 * j, 16, 16);
						}else{
							surface.draw(game.assets['img/ctrl.png'], 128, 112, 16, 16, 16 * i, 16 * j, 16, 16);
						}
					
					}}
				});
				return sprite;
			}else{return new Sprite();}
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
			if(rr == 0){return true;}
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
		collision: function(character, side){
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
			
			// ダンジョンマップの場合、部屋に入っているか否かで表示非表示を切り替える
			if(this.map_child != undefined){
				var x = character.px + character.vx;
				var y = character.py + character.vy;
				var z = character.pz + character.vz;
				for(var k = 0; k < this.roomNum; k++){
					for(var j = 0; j < this.roomNum; j++){
						for(var i = 0; i < this.roomNum; i++){
							var s = this.map_child[k][j][i];
							var xflag = s.xmin - 1 < x && x < s.xmax + 1;
							var yflag = s.ymin - 1 < y && y < s.ymax + 1;
							var zflag = s.zmin - 1 < z && z < s.zmax + 1;
							if(xflag && yflag && zflag){
								if(this.map_visible[k][j][i] == false){
									this.map_visible[k][j][i] = true;
									this.addChild(this.map_child[k][j][i]);
								}
							}else{
								if(this.map_visible[k][j][i] == true){
									this.map_visible[k][j][i] = false;
									this.removeChild(this.map_child[k][j][i]);
								}
							}
						}
					}
				}
			}
			
			// キャラクタ下方向で最も近い地面の高さを調べる
			switch(side){
				case 0:
					var i0 = Math.floor(character.py + character.vy);
					var ground = character.py + character.vy - character.radius - 0.01;
					for(var i = i0; i > 0; i--){if(this.isMapChipHit(mx, i - 1, mz)){return ground - i;}}
					break;
				case 1:
					var i0 = Math.floor(character.py + character.vy + 1);
					var ground = character.py + character.vy + character.radius + 1.01;
					for(var i = i0; i < this.ysize ; i++){if(this.isMapChipHit(mx, i, mz)){return i - ground + 1;}}
					break;
				case 3:
					var i0 = Math.floor(character.pz + character.vz + 1);
					var ground = character.pz + character.vz + character.radius + 1.01;
					for(var i = i0; i < this.zsize ; i++){if(this.isMapChipHit(mx, my, i)){return i - ground + 1;}}
					break;
				case 4:
					var i0 = Math.floor(character.px + character.vx);
					var ground = character.px + character.vx - character.radius - 0.01;
					for(var i = i0; i > 0; i--){if(this.isMapChipHit(i - 1, my, mz)){return ground - i;}}
					break;
				case 5:
					var i0 = Math.floor(character.px + character.vx + 1);
					var ground = character.px + character.vx + character.radius + 1.01;
					for(var i = i0; i < this.xsize ; i++){if(this.isMapChipHit(i, my, mz)){return i - ground + 1;}}
					break;
				case 2: default:
					var i0 = Math.floor(character.pz + character.vz);
					var ground = character.pz + character.vz - character.radius - 0.01;
					for(var i = i0; i > 0; i--){if(this.isMapChipHit(mx, my, i - 1)){return ground - i;}}
					break;
			}
			// 地面が存在しない場合は無限遠的な値
			return 999;
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
