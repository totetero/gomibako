// ハコニワプラグイン ビルボードキャラクタ (ハコニワラビリンスバージョン)
// ビルボードの組み合わせによってキャラクタを表現する
// ハコニワラビリンスは不思議なので6方向の重力に対応
// アイルーのクリア時ダンスかわいいです
//
// 本ソースコードはMITライセンスとバンザイライセンスのデュアルライセンスです
// ソースコードの一部もしくは全部使用したものを再配布する際には
// 上記のライセンスのうち片方を選択してください。
// バンザイライセンスを選択した人は使用前に「ばんじゃーい」と3回叫んでください。
// 作者は、ソフトウェアに関してなんら責任を負いません。
//
// Copyright (c) 2012 totetero

if(enchant.gl.hakoniwa){
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// キャラクタークラス
	enchant.gl.hakoniwa.BillboardCharacter = enchant.Class.create(enchant.gl.Sprite3D, {
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
			this.speed = 0;
			// あたり判定用キャラクタサイズ
			this.radius = 0.4;
			// 地面との距離
			this.altitude = 0;
			// アクションパラメータ1 歩行状態
			this.action1 = 0;
			// アクションパラメータ2 ダンス状態 1以上の場合、静止状態でダンスする
			this.action2 = 0;
			// キャラクタの向き
			this.rotate = Math.PI / 180 *  0;
			// 十字キーを使った瞬間にこのフラグが立つ
			this.useArrowKey = false;
			
			// 3D設定
			var srcMesh = new Mesh();
			srcMesh.vertices = [
				 0.5,  0.5, 0.0,
				-0.5,  0.5, 0.0,
				-0.5, -0.5, 0.0,
				 0.5, -0.5, 0.0,
			];
			srcMesh.normals = [
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
				0.0, 0.0, 1.0,
			];
			srcMesh.indices = [
				0, 1, 2,
				0, 2, 3,
			];
			srcMesh.colors = [
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
			];
			srcMesh.texture.src = "img/player.png";
			srcMesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
			srcMesh.texture.diffuse = [0.0, 0.0, 0.0, 1.0];
			srcMesh.texture.specular = [0.0, 0.0, 0.0, 1.0];
			srcMesh.texture.emission = [0.0, 0.0, 0.0, 1.0];
			srcMesh.texture.shininess = 1;
			
			// 子Sprite3D
			this.sprites = new Array();
			for(var i = 0; i < 7; i++){
				this.sprites[i] = new Sprite3D();
				this.sprites[i].mesh.indices = new Array(srcMesh.indices.length); // 嫌な書き方だけど仕様だからしかたがない 面の数を記録するフィールド用意してくれないかなー
				this.sprites[i].mesh.verticesBuffer = srcMesh.verticesBuffer;
				this.sprites[i].mesh.normalsBuffer = srcMesh.normalsBuffer;
				this.sprites[i].mesh.colorsBuffer = srcMesh.colorsBuffer;
				this.sprites[i].mesh.indicesBuffer = srcMesh.indicesBuffer;
				this.sprites[i].mesh.texture = srcMesh.texture;
				this.addChild(this.sprites[i]);
			}
			var setScale = function(sprite, scale){sprite.scaleX = sprite.scaleY = sprite.scaleZ = scale;}
			setScale(this.sprites[0], 0.50);
			setScale(this.sprites[1], 0.45);
			setScale(this.sprites[2], 0.25);
			setScale(this.sprites[3], 0.25);
			setScale(this.sprites[4], 0.25);
			setScale(this.sprites[5], 0.25);
			setScale(this.sprites[6], 0.50);
			
			// テクスチャリスト
			var createTextureList = function(u0, v0, uv){
				var texBuffers = new Array();
				for(var i = 0; i < 12; i++){
					var u1 = u0 + uv * (i % 4);
					var v1 = v0 + uv * Math.floor(i / 4);
					var u2 = u1 + uv;
					var v2 = v1 + uv;
					var texCoords = [
						u2, 1 - v1,
						u1, 1 - v1,
						u1, 1 - v2,
						u2, 1 - v2,
					];
					texBuffers[i] = gl.createBuffer();
					gl.bindBuffer(gl.ARRAY_BUFFER, texBuffers[i]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
				}
				return texBuffers;
			}
			this.textureLists = new Array();
			this.textureLists[0] = createTextureList(0.00, 0.000, 0.1250); // 頭
			this.textureLists[1] = createTextureList(0.00, 0.375, 0.1250); // 体
			this.textureLists[2] = createTextureList(0.00, 0.750, 0.0625); // 足1
			this.textureLists[3] = createTextureList(0.25, 0.750, 0.0625); // 足2
			this.textureLists[4] = createTextureList(0.50, 0.750, 0.0625); // 手
			this.textureLists[5] = createTextureList(0.50, 0.000, 0.1250); // ポニーテール
			// テクスチャ登録
			this.sprites[0].texBuffers = this.textureLists[0];
			this.sprites[1].texBuffers = this.textureLists[1];
			this.sprites[2].texBuffers = this.textureLists[2];
			this.sprites[3].texBuffers = this.textureLists[2];
			this.sprites[4].texBuffers = this.textureLists[4];
			this.sprites[5].texBuffers = this.textureLists[4];
			this.sprites[6].texBuffers = this.textureLists[5];
			
			// 影
			this.shadow = new Shadow();
			this.shadow.scaleX = this.radius * 2 / 2;
			this.shadow.scaleZ = this.radius * 2 / 2;
			this.addChild(this.shadow);
		},
		
		// ----------------------------------------------------------------
		// 描画設定
		predraw: function(map, isQuat){
			// y軸方向単位ベクトルと回転行列を掛け合わせた結果から各軸中心回転角を求める
			var side, xside, yside, zside;
			var tmpmat = mat4.create(this.parentNode.rotation);
			if(isQuat){
				var rx = Math.atan2(tmpmat[9], tmpmat[5]) / Math.PI * 180;
				var ry = Math.atan2(tmpmat[1], tmpmat[9]) / Math.PI * 180;
				var rz = Math.atan2(tmpmat[5], tmpmat[1]) / Math.PI * 180;
				if(rx < -135){rx += 360;}
				if(ry < -135){ry += 360;}
				if(rz < -135){rz += 360;}
				// 求めた回転角から面番号を計算する
				if(rx < -45){xside = 1;}else if(rx < 45){xside = 2;}else if(rx < 135){xside = 0;}else{xside = 3;}
				if(ry < -45){yside = 5;}else if(ry < 45){yside = 0;}else if(ry < 135){yside = 4;}else{yside = 1;}
				if(rz < -45){zside = 3;}else if(rz < 45){zside = 4;}else if(rz < 135){zside = 2;}else{zside = 5;}
				if(xside == yside){side = xside;}else{side = zside;}
			}else{
				side = 2;
			}
			// キャラクターの水平軸を面番号に合わせて設定する
			mat4.identity(this.rotation);
			switch(side){
				case 0: mat4.rotateX(this.rotation, Math.PI * 0.5); break;
				case 1: mat4.rotateX(this.rotation, -Math.PI * 0.5); break;
				case 2: break;
				case 3: mat4.rotateX(this.rotation, Math.PI); break;
				case 4: mat4.rotateZ(this.rotation, -Math.PI * 0.5); break;
				case 5: mat4.rotateZ(this.rotation, Math.PI * 0.5); break;
			}
			// 面番号が変わったらキャラクタの向きを調整する
			if(side != this.prevSide){
				switch(this.prevSide){
					case 0: switch(side){
							case 4: this.rotate += Math.PI * 0.5; break;
							case 5: this.rotate += Math.PI * 1.5; break;
						}break;
					case 1: switch(side){
							case 4: this.rotate += Math.PI * 1.5; break;
							case 5: this.rotate += Math.PI * 0.5; break;
						}break;
					case 3: switch(side){
							case 4: this.rotate += Math.PI; break;
							case 5: this.rotate += Math.PI; break;
						}break;
					case 4: switch(side){
							case 0: this.rotate += Math.PI * 1.5; break;
							case 1: this.rotate += Math.PI * 0.5; break;
							case 3: this.rotate += Math.PI; break;
						}break;
					case 5: switch(side){
							case 0: this.rotate += Math.PI * 0.5; break;
							case 1: this.rotate += Math.PI * 1.5; break;
							case 3: this.rotate += Math.PI; break;
						}break;
				}
			}
			this.prevSide = side;
			
			// キャラクターの水平軸と垂直軸の回転角を求める
			mat4.multiply(tmpmat, this.rotation);
			var phi = Math.atan2(tmpmat[2], tmpmat[10]);
			var theta = -Math.asin(tmpmat[6]);
			
			this.action1++;
			// 移動方向の計算
			this.speed += 0.01;
			if(game.input.up){
				if(game.input.right){
					this.rotate = Math.PI * 0.25 + phi;
				}else if(game.input.left){
					this.rotate = Math.PI * 0.75 + phi;
				}else{
					this.rotate = Math.PI * 0.50 + phi;
				}
			}else if(game.input.down){
				if(game.input.right){
					this.rotate = Math.PI * 1.75 + phi;
				}else if(game.input.left){
					this.rotate = Math.PI * 1.25 + phi;
				}else{
					this.rotate = Math.PI * 1.50 + phi;
				}
			}else if(game.input.right){
				this.rotate = Math.PI * 0.00 + phi;
			}else if(game.input.left){
				this.rotate = Math.PI * 1.00 + phi;
			}else{
				this.speed = 0;
			}
			// 十字キー使用の確認
			if(this.speed > 0){this.useArrowKey = true;}
			// 踊りの制御
			if(this.action2 > 0){
				this.action2++;
				if(this.altitude > 0.1 || this.speed > 0){this.action2 = 1;}
			}
			
			// 移動速度と重力を設定する
			if(this.speed > 0.04){this.speed = 0.04;}
			var gravity = 0.01;
			switch(side){
				case 0: this.vx =  this.speed * Math.cos(this.rotate); this.vz =  this.speed * Math.sin(this.rotate); this.vy -= gravity; break;
				case 1: this.vx =  this.speed * Math.cos(this.rotate); this.vz = -this.speed * Math.sin(this.rotate); this.vy += gravity; break;
				case 2: this.vx =  this.speed * Math.cos(this.rotate); this.vy = -this.speed * Math.sin(this.rotate); this.vz -= gravity; break;
				case 3: this.vx =  this.speed * Math.cos(this.rotate); this.vy =  this.speed * Math.sin(this.rotate); this.vz += gravity; break;
				case 4: this.vz = -this.speed * Math.cos(this.rotate); this.vy = -this.speed * Math.sin(this.rotate); this.vx -= gravity; break;
				case 5: this.vz =  this.speed * Math.cos(this.rotate); this.vy = -this.speed * Math.sin(this.rotate); this.vx += gravity; break;
			}
			
			// キャラクタの方向
			mat4.rotateY(this.rotation, this.rotate);
			
			// キャラクタのポーズ
			var setPosition = function(sprite, x, y, z){sprite.x = x; sprite.z = y; sprite.y = z;}
			if(this.altitude > 0.1){
				// 落下
				setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius);
				setPosition(this.sprites[1], -0.02,  0.00, 0.27 - this.radius);
				setPosition(this.sprites[2], -0.10, -0.08, 0.20 - this.radius); this.sprites[2].texBuffers = this.textureLists[3];
				setPosition(this.sprites[3], -0.03,  0.08, 0.10 - this.radius); this.sprites[3].texBuffers = this.textureLists[3];
				setPosition(this.sprites[4],  0.02, -0.18, 0.40 - this.radius);
				setPosition(this.sprites[5], -0.02,  0.18, 0.40 - this.radius);
				setPosition(this.sprites[6], -0.16,  0.00, 0.65 - this.radius);
			}else if(this.action2 > 60){
				// 猫ダンス
				switch(Math.floor(this.action2 / 6) % 20){
					case 3: case 7: case 8: case 9:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius);
						setPosition(this.sprites[1], -0.02, -0.02, 0.27 - this.radius);
						setPosition(this.sprites[2], -0.02, -0.03, 0.10 - this.radius); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.12,  0.12, 0.20 - this.radius); this.sprites[3].texBuffers = this.textureLists[3];
						setPosition(this.sprites[4],  0.02, -0.20, 0.35 - this.radius);
						setPosition(this.sprites[5], -0.02,  0.20, 0.35 - this.radius);
						setPosition(this.sprites[6], -0.16,  0.00, 0.60 - this.radius); break;
					case 0: case 4:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.1);
						setPosition(this.sprites[1], -0.02, -0.02, 0.27 - this.radius + 0.1);
						setPosition(this.sprites[2], -0.02, -0.03, 0.10 - this.radius + 0.1); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.12,  0.12, 0.20 - this.radius + 0.1); this.sprites[3].texBuffers = this.textureLists[3];
						setPosition(this.sprites[4],  0.02, -0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[5], -0.02,  0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[6], -0.16, -0.02, 0.60 - this.radius + 0.1); break;
					case 1: case 5:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.15);
						setPosition(this.sprites[1], -0.02, -0.02, 0.27 - this.radius + 0.15);
						setPosition(this.sprites[2], -0.02, -0.03, 0.10 - this.radius + 0.15); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.12,  0.12, 0.20 - this.radius + 0.15); this.sprites[3].texBuffers = this.textureLists[3];
						setPosition(this.sprites[4],  0.02, -0.20, 0.35 - this.radius + 0.15);
						setPosition(this.sprites[5], -0.02,  0.20, 0.35 - this.radius + 0.15);
						setPosition(this.sprites[6], -0.16,  0.00, 0.60 - this.radius + 0.15); break;
					case 2: case 6:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.1);
						setPosition(this.sprites[1], -0.02, -0.02, 0.27 - this.radius + 0.1);
						setPosition(this.sprites[2], -0.02, -0.03, 0.10 - this.radius + 0.1); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.12,  0.12, 0.20 - this.radius + 0.1); this.sprites[3].texBuffers = this.textureLists[3];
						setPosition(this.sprites[4],  0.02, -0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[5], -0.02,  0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[6], -0.16,  0.02, 0.60 - this.radius + 0.1); break;
					case 13: case 17: case 18: case 19:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius);
						setPosition(this.sprites[1], -0.02,  0.02, 0.27 - this.radius);
						setPosition(this.sprites[2], -0.12, -0.12, 0.20 - this.radius); this.sprites[2].texBuffers = this.textureLists[3];
						setPosition(this.sprites[3], -0.02,  0.03, 0.10 - this.radius); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.02, -0.20, 0.35 - this.radius);
						setPosition(this.sprites[5], -0.02,  0.20, 0.35 - this.radius);
						setPosition(this.sprites[6], -0.16,  0.00, 0.60 - this.radius); break;
					case 10: case 14:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.1);
						setPosition(this.sprites[1], -0.02,  0.02, 0.27 - this.radius + 0.1);
						setPosition(this.sprites[2], -0.12, -0.12, 0.20 - this.radius + 0.1); this.sprites[2].texBuffers = this.textureLists[3];
						setPosition(this.sprites[3], -0.02,  0.03, 0.10 - this.radius + 0.1); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.02, -0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[5], -0.02,  0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[6], -0.16, -0.02, 0.60 - this.radius + 0.1); break;
					case 11: case 15:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.15);
						setPosition(this.sprites[1], -0.02,  0.02, 0.27 - this.radius + 0.15);
						setPosition(this.sprites[2], -0.12, -0.12, 0.20 - this.radius + 0.15); this.sprites[2].texBuffers = this.textureLists[3];
						setPosition(this.sprites[3], -0.02,  0.03, 0.10 - this.radius + 0.15); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.02, -0.20, 0.35 - this.radius + 0.15);
						setPosition(this.sprites[5], -0.02,  0.20, 0.35 - this.radius + 0.15);
						setPosition(this.sprites[6], -0.16,  0.00, 0.60 - this.radius + 0.15); break;
					case 12: case 16:
						setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius + 0.1);
						setPosition(this.sprites[1], -0.02,  0.02, 0.27 - this.radius + 0.1);
						setPosition(this.sprites[2], -0.12, -0.12, 0.20 - this.radius + 0.1); this.sprites[2].texBuffers = this.textureLists[3];
						setPosition(this.sprites[3], -0.02,  0.03, 0.10 - this.radius + 0.1); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.02, -0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[5], -0.02,  0.18, 0.45 - this.radius + 0.1);
						setPosition(this.sprites[6], -0.16,  0.02, 0.60 - this.radius + 0.1); break;
				}
			}else if(this.speed > 0){
				// 走る
				switch(Math.floor(this.action1 / 10) % 4){
					case 0: 
						setPosition(this.sprites[0],  0.12,  0.00, 0.45 - this.radius);
						setPosition(this.sprites[1],  0.00,  0.00, 0.23 - this.radius);
						setPosition(this.sprites[2], -0.20, -0.07, 0.20 - this.radius); this.sprites[2].texBuffers = this.textureLists[3];
						setPosition(this.sprites[3],  0.10,  0.07, 0.10 - this.radius); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.10, -0.15, 0.25 - this.radius);
						setPosition(this.sprites[5], -0.10,  0.15, 0.25 - this.radius);
						setPosition(this.sprites[6], -0.04, -0.02, 0.53 - this.radius); break;
					case 1: 
						setPosition(this.sprites[0],  0.12,  0.00, 0.47 - this.radius);
						setPosition(this.sprites[1],  0.00,  0.00, 0.26 - this.radius);
						setPosition(this.sprites[2], -0.00, -0.07, 0.15 - this.radius); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3],  0.00,  0.07, 0.10 - this.radius); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4],  0.05, -0.18, 0.25 - this.radius);
						setPosition(this.sprites[5], -0.05,  0.18, 0.25 - this.radius);
						setPosition(this.sprites[6], -0.04,  0.00, 0.55 - this.radius); break;
					case 2: 
						setPosition(this.sprites[0],  0.12,  0.00, 0.45 - this.radius);
						setPosition(this.sprites[1],  0.00,  0.00, 0.23 - this.radius);
						setPosition(this.sprites[2],  0.10, -0.07, 0.10 - this.radius); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.20,  0.07, 0.20 - this.radius); this.sprites[3].texBuffers = this.textureLists[3];
						setPosition(this.sprites[4], -0.10, -0.15, 0.25 - this.radius);
						setPosition(this.sprites[5],  0.10,  0.15, 0.25 - this.radius);
						setPosition(this.sprites[6], -0.04,  0.02, 0.53 - this.radius); break;
					case 3: 
						setPosition(this.sprites[0],  0.12,  0.00, 0.47 - this.radius);
						setPosition(this.sprites[1],  0.00,  0.00, 0.26 - this.radius);
						setPosition(this.sprites[2],  0.00, -0.07, 0.10 - this.radius); this.sprites[2].texBuffers = this.textureLists[2];
						setPosition(this.sprites[3], -0.00,  0.07, 0.15 - this.radius); this.sprites[3].texBuffers = this.textureLists[2];
						setPosition(this.sprites[4], -0.05, -0.18, 0.25 - this.radius);
						setPosition(this.sprites[5],  0.05,  0.18, 0.25 - this.radius);
						setPosition(this.sprites[6], -0.04,  0.00, 0.55 - this.radius); break;
				}
			}else{
				// 静止
				setPosition(this.sprites[0],  0.00,  0.00, 0.52 - this.radius);
				setPosition(this.sprites[1], -0.02,  0.00, 0.27 - this.radius);
				setPosition(this.sprites[2], -0.02, -0.10, 0.10 - this.radius); this.sprites[2].texBuffers = this.textureLists[2];
				setPosition(this.sprites[3],  0.02,  0.10, 0.10 - this.radius); this.sprites[3].texBuffers = this.textureLists[2];
				setPosition(this.sprites[4],  0.02, -0.20, 0.25 - this.radius);
				setPosition(this.sprites[5], -0.02,  0.20, 0.25 - this.radius);
				setPosition(this.sprites[6], -0.16,  0.00, 0.60 - this.radius);
			}
			
			// 回転を打ち消す行列を作る
			mat4.identity(tmpmat);
			mat4.rotateY(tmpmat, (phi - this.rotate));
			mat4.rotateX(tmpmat, theta);
			// 回転方向のテクスチャを選択するインデクスを求める
			var index = 0;
			var anglev = 180 + 180 / Math.PI * (phi - this.rotate);
			var angleh = -180 / Math.PI * theta;
			while(anglev >  360 - 45){anglev -= 360;}
			while(anglev <=   0 - 45){anglev += 360;}
			if(anglev < 45){index = 3;}else if(anglev <= 135){index = 2;}else if(anglev < 225){index = 1;}else{index = 0;}
			if(angleh < -30){index += 8;}else if(angleh <  30){index += 4;}else{index += 0;}
			// 各パーツに適用する
			for(var i = 0; i < this.sprites.length; i++){
				mat4.set(tmpmat, this.sprites[i].rotation);
				this.sprites[i].mesh.texCoordsBuffer = this.sprites[i].texBuffers[index];
			}
			
			// 速度の処理
			this.altitude = map.collision(this, side);
			this.px += this.vx;
			this.py += this.vy;
			this.pz += this.vz;
			this.x = this.px;
			this.y = this.pz;
			this.z = this.py;
			this.shadow.y = -this.altitude - this.radius;
		},
		
		// ----------------------------------------------------------------
	});
	
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
	// ----------------------------------------------------------------
}
