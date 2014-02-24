// エフェクト管理クラス
function EffectManager(){
	var effList = new Array();
	var texcBufferList;
	
	// ----------------------------------------------------------------
	// 初期化
	this.init = function(e3d){
		// テクスチャバッファリスト
		texcBufferList = new Array();
		for(var i = 0; i < 16; i++){
			for(var j = 0; j < 16; j++){
				var texc = new Array();
				var u0 = 0.0625 * j;
				var v0 = 0.0625 * i;
				var u1 = u0 + 0.0625;
				var v1 = v0 + 0.0625;
				texc.push(u1, v0);
				texc.push(u0, v0);
				texc.push(u0, v1);
				texc.push(u1, v1);
				// VBOを作成し、データを転送
				texcBufferList[i * 16 + j] = e3d.createVBO(texc);
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 計算
	this.calc = function(){
		for(var i = 0; i < effList.length; i++){
			// エフェクトを実行する
			effList[i].calc();
			// エフェクトが終了したらリストから取り除く
			if(!effList[i].exist){
				effList.splice(i,1);
			}
		}
	}
	
	// ----------------------------------------------------------------
	// 描画
	this.draw = function(e3d, mat, ctrl){
		for(var i = 0; i < effList.length; i++){
			effList[i].draw(e3d, mat, ctrl);
		}
	}
	
	// 行列作成
	var setBillBoardMatrix = function(e3d, mat, ctrl, x, y, z, size){
		mat4.set(mat, e3d.tmpmat1);
		mat4.translate(e3d.tmpmat1, [x, z, y]);
		mat4.rotateY(e3d.tmpmat1, -ctrl.rotv);
		mat4.rotateX(e3d.tmpmat1, -ctrl.roth);
		mat4.scale(e3d.tmpmat1, [size, size, size]);
		e3d.setMatrix(e3d.tmpmat1);
	}
	
	// ----------------------------------------------------------------
	// エフェクト追加 テスト
	this.add_test = function(){
		var eff = new Object();
		eff.exist = true;
		eff.calc = function(){
			eff.exist = false;
		}
		eff.draw = function(e3d, mat){
		}
		effList.push(eff);
	}
	
	// ----------------------------------------------------------------
	// エフェクト追加 砂ぼこり
	this.add_dust = function(x, y, z){
		var action = 0;
		var eff = new Object();
		eff.exist = true;
		eff.calc = function(){
			// 計算
			if(action++ > 12){
				eff.exist = false;
			}
		}
		eff.draw = function(e3d, mat, ctrl){
			// 描画
			setBillBoardMatrix(e3d, mat, ctrl, x, y, z, 0.5);
			e3d.bindVertBuf(e3d.tetraVertBuffer);
			e3d.bindTexcBuf(texcBufferList[Math.floor(action / 3)]);
			e3d.drawTetra();
		}
		effList.push(eff);
	}
	
	// ----------------------------------------------------------------
	// エフェクト追加 ダメージスター
	this.add_star = function(x, y, z, flag){
		var action = 0;
		var vel = 0.1 * Math.random();
		var rot = Math.random() * 2 * Math.PI;
		var vx = vel * Math.cos(rot);
		var vy = vel * Math.sin(rot);
		var vz = 0.2 * Math.random();
		var eff = new Object();
		eff.exist = true;
		eff.calc = function(){
			// 計算
			action++;
			x += vx;
			y += vy;
			z += vz;
			vz -= 0.03;
			if(z < 0){
				eff.exist = false;
			}
		}
		eff.draw = function(e3d, mat, ctrl){
			// 描画
			setBillBoardMatrix(e3d, mat, ctrl, x, y, z, 0.8);
			e3d.bindVertBuf(e3d.tetraVertBuffer);
			e3d.bindTexcBuf(texcBufferList[(flag ? 18 : 16) + Math.floor(action / 3) % 2]);
			e3d.drawTetra();
		}
		effList.push(eff);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

