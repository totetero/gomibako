// 簡易コントローラー
// 
// このソースコードはMITライセンスです
// Copyright (c) 2011-2012 totetero
// 

function Controller(){
	// 画面サイズ
	this.w;
	this.h;
	// ボタン状態
	this.kup = false;
	this.kdn = false;
	this.krt = false;
	this.klt = false;
	this.k_z = false;
	this.k_x = false;
	this.k_s = false;
	// マウス座標
	this.mousex = 0;
	this.mousey = 0;
	// 画面回転拡大
	this.rotv = 0;
	this.roth = 0;
	this.roth_max = Math.PI / 180 *  60;
	this.roth_min = Math.PI / 180 * -60;
	this.distance = 10;
	
	// ----------------------------------------------------------------
	// コントローラーの初期化 イベント登録
	var that = this;
	var vertBuffer;
	var texcBuffer;
	var faceBuffer;
	// タッチ操作か確認
	var isTouch = ('ontouchstart' in window);
	
	// バッファに画像の情報を登録
	var pushBuffer = function(vert, texc, face, w, h, tx, ty, vx, vy){
		var vx0 = vx;
		var vy0 = vy;
		var vx1 = vx + w;
		var vy1 = vy + h;
		var tx0 = tx / 256;
		var ty0 = ty / 128;
		var tx1 = (tx + w) / 256;
		var ty1 = (ty + h) / 128;
		var index = vert.length / 3;
		vert.push(vx1, vy1, 0.0);
		vert.push(vx0, vy1, 0.0);
		vert.push(vx0, vy0, 0.0);
		vert.push(vx1, vy0, 0.0);
		texc.push(tx1, ty0);
		texc.push(tx0, ty0);
		texc.push(tx0, ty1);
		texc.push(tx1, ty1);
		face.push(index + 0, index + 1, index + 2);
		face.push(index + 0, index + 2, index + 3);
	}
	
	// 初期化
	this.init = function(e3d, canvas){
		this.w = canvas.width;
		this.h = canvas.height;
		
		var vert = new Array();
		var texc = new Array();
		var face = new Array();
		// 矢印キー
		pushBuffer(vert, texc, face, 40, 48,   0,  0, 10 + 36, 10 + 64);
		pushBuffer(vert, texc, face, 40, 48,  88,  0, 10 + 36, 10 + 64);
		pushBuffer(vert, texc, face, 40, 48,  48, 40, 10 + 36, 10 +  0);
		pushBuffer(vert, texc, face, 40, 48, 136, 40, 10 + 36, 10 +  0);
		pushBuffer(vert, texc, face, 48, 40,  40,  0, 10 + 64, 10 + 36);
		pushBuffer(vert, texc, face, 48, 40, 128,  0, 10 + 64, 10 + 36);
		pushBuffer(vert, texc, face, 48, 40,   0, 48, 10 +  0, 10 + 36);
		pushBuffer(vert, texc, face, 48, 40,  88, 48, 10 +  0, 10 + 36);
		// ZXボタン
		pushBuffer(vert, texc, face, 64, 64, 176,  0, this.w - 138, 20 +  0);
		pushBuffer(vert, texc, face, 64, 64, 176, 64, this.w - 138, 20 +  0);
		pushBuffer(vert, texc, face, 64, 64, 176,  0, this.w -  74, 20 + 32);
		pushBuffer(vert, texc, face, 64, 64, 176, 64, this.w -  74, 20 + 32);
		pushBuffer(vert, texc, face, 24, 24, 128, 88, this.w - 118, 40 +  0);
		pushBuffer(vert, texc, face, 24, 24, 152, 88, this.w -  54, 40 + 32);
		// スペースボタン
		pushBuffer(vert, texc, face, 128, 16, 0,  88, this.w / 2 - 64, 0);
		pushBuffer(vert, texc, face, 128, 16, 0, 104, this.w / 2 - 64, 0);
		// VBOとIBOを作成し、データを転送
		vertBuffer = e3d.createVBO(vert);
		texcBuffer = e3d.createVBO(texc);
		faceBuffer = e3d.createIBO(face);
		
		if(isTouch){
			canvas.addEventListener("touchstart", mdnEvent, true);
			canvas.addEventListener("touchmove", mmvEvent, true);
			canvas.addEventListener("touchend", mupEvent, true);
		}else{
			canvas.addEventListener("mousedown", mdnEvent, true);
			canvas.addEventListener("mousemove", mmvEvent, true);
			canvas.addEventListener("mouseup", mupEvent, true);
			canvas.addEventListener("mouseout", mupEvent, true);
		}
		document.addEventListener("keydown", kdnEvent, true);
		document.addEventListener("keyup", kupEvent, true);
	}
	
	// ----------------------------------------------------------------
	// コントローラーの描画
	this.draw = function(e3d, mat){
		e3d.setMatrix(mat);
		e3d.bindVertBuf(vertBuffer);
		e3d.bindTexcBuf(texcBuffer);
		e3d.bindFaceBuf(faceBuffer);
		if(!this.kup){e3d.draw( 0, 6);}else{e3d.draw( 6, 6);}
		if(!this.kdn){e3d.draw(12, 6);}else{e3d.draw(18, 6);}
		if(!this.krt){e3d.draw(24, 6);}else{e3d.draw(30, 6);}
		if(!this.klt){e3d.draw(36, 6);}else{e3d.draw(42, 6);}
		if(!this.k_z){e3d.draw(48, 6);}else{e3d.draw(54, 6);} e3d.draw(72, 6);
		if(!this.k_x){e3d.draw(60, 6);}else{e3d.draw(66, 6);} e3d.draw(78, 6);
		if(!this.k_s){e3d.draw(84, 6);}else{e3d.draw(90, 6);}
	}
	
	// ----------------------------------------------------------------
	// マウスイベント
	var mouseMode = 0;
	var touchx;
	var touchy;
	// 回転
	var touchrv;
	var touchrh;
	
	// コントローラーをクリック時の動作
	var btnEvent = function(){
		// 矢印キー
		var x = that.mousex - (10 + 56);
		var y = that.mousey - (that.h - 10 - 56);
		that.kup = that.kdn = that.krt = that.klt = 0;
		if(x * x + y * y < 56 * 56){
			if (y < 0 && x < y * y * 0.1 && x > y * y * -0.1){that.kup = true; mouseMode = 1;}
			if (y > 0 && x < y * y * 0.1 && x > y * y * -0.1){that.kdn = true; mouseMode = 1;}
			if (x > 0 && y < x * x * 0.1 && y > x * x * -0.1){that.krt = true; mouseMode = 1;}
			if (x < 0 && y < x * x * 0.1 && y > x * x * -0.1){that.klt = true; mouseMode = 1;}
		}
		
		// ZXボタン
		x = that.mousex - (that.w - 10 - 64);
		y = that.mousey - (that.h - 10 - 58);
		if(-8 < x && x < 8 && -8 < y && y < 8){that.k_z =that.k_x = 1; mouseMode = 1;} // 同時押し
		else if(-64 < x && x <  0 && -16 < y && y < 48){that.k_z = 1; that.k_x = 0; mouseMode = 1;} // z押し
		else if(  0 < x && x < 64 && -48 < y && y < 16){that.k_x = 1; that.k_z = 0; mouseMode = 1;} // x押し
		else{that.k_z = that.k_x = 0;}
		
		// スペースボタン
		x = that.mousex - (that.w / 2);
		y = that.mousey - (that.h - 8);
		if(-64 < x && x < 64 && -8 < y && y < 8){that.k_s = 1; mouseMode = 1;}
		else{that.k_s = 0;}
	}
	
	// 回転開始
	var rotEvent0 = function(){
		touchx = that.mousex;
		touchy = that.mousey;
		touchrv = that.rotv;
		touchrh = that.roth;
		mouseMode = 2;
	}
	
	// 回転中
	var rotEvent1 = function(){
		that.rotv = touchrv + (that.mousex - touchx) * 0.03;
		that.roth = touchrh + (that.mousey - touchy) * 0.03;
		if(that.roth > that.roth_max){that.roth = that.roth_max;}
		if(that.roth < that.roth_min){that.roth = that.roth_min;}
	}
	
	// ----------------------------------------------------------------
	
	// マウスを押す
	var mdnEvent = function(e){
		// 座標を獲得する
		var rect = e.target.getBoundingClientRect();
		that.mousex = (isTouch ? e.changedTouches[0].clientX : e.clientX) - rect.left;
		that.mousey = (isTouch ? e.changedTouches[0].clientY : e.clientY) - rect.top;
		// コントローラークリックの確認
		btnEvent();
		if(mouseMode != 1){rotEvent0();}
		// マウスイベント終了
		e.preventDefault();
	}
	
	// マウス移動
	var mmvEvent = function(e){
		// 座標を獲得する
		var rect = e.target.getBoundingClientRect();
		that.mousex = (isTouch ? e.changedTouches[0].clientX : e.clientX) - rect.left;
		that.mousey = (isTouch ? e.changedTouches[0].clientY : e.clientY) - rect.top;
		// マウス移動イベント
		if(mouseMode == 1){btnEvent();}
		else if(mouseMode == 2){rotEvent1();}
		// マウスイベント終了
		e.preventDefault();
	}
	
	// マウスボタンを離す
	var mupEvent = function(e){
		mouseMode = 0;
		that.kup = that.kdn = that.krt = that.klt = that.k_z = that.k_x = that.k_s = false;
		// マウスイベント終了
		e.preventDefault();
	}
	
	// ----------------------------------------------------------------
	// キーイベント
	
	// キーを押す
	var kdnEvent = function(e){
		var getkey = true;
		switch (e.keyCode){
			case 37: that.klt = true; break;
			case 38: that.kup = true; break;
			case 39: that.krt = true; break;
			case 40: that.kdn = true; break;
			case 88: that.k_x = true; break;
			case 90: that.k_z = true; break;
			case 32: that.k_s = true; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){
			e.preventDefault();
		}
	}
	
	// キーを離す
	var kupEvent = function(e){
		var getkey = true;
		switch (e.keyCode){
			case 37: that.klt = false; break;
			case 38: that.kup = false; break;
			case 39: that.krt = false; break;
			case 40: that.kdn = false; break;
			case 88: that.k_x = false; break;
			case 90: that.k_z = false; break;
			case 32: that.k_s = false; break;
			default: getkey = false;
		}
		// キーイベント終了
		if(getkey){
			e.preventDefault();
		}
	}
	
	// ----------------------------------------------------------------
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

