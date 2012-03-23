// 簡易3dエンジン
//
// このソースコードは
// 最速チュパカブラ研究会 2009年2月11日の日記(http://d.hatena.ne.jp/gyuque/20090211)
// をパ…参考に作られました。
// 多分MITライセンスです
// Copyright (c) 2011 totetero

// グローバル変数構造体
var engineStruct = new Object();
engineStruct.projectionMatrix = new Object();
// サイズ
engineStruct.w0 = 0;
engineStruct.h0 = 0;
engineStruct.w1 = 240;
engineStruct.h1 = 320;
// 頂点配列 面情報配列 テクスチャ配列
engineStruct.vertexArray_index = 0;
engineStruct.vertexArray = new Array();
engineStruct.surfaceArray = new Array();
engineStruct.textureArray = new Array();
engineStruct.surfacePool = new Array();
// 一時データ
engineStruct.tmpMat1 = new Object();
engineStruct.tmpMat2 = new Object();
engineStruct.tmpVec1 = new Object();
engineStruct.tmpVec2 = new Object();
engineStruct.tmpVec3 = new Object();
engineStruct.tmpVec4 = new Object();
engineStruct.shadow1 = new Vertex( -1.0, 0, -1.0,  0,  0);
engineStruct.shadow2 = new Vertex( -1.0, 0,  1.0,  0, 32);
engineStruct.shadow3 = new Vertex(  1.0, 0,  1.0, 32, 32);
engineStruct.shadow4 = new Vertex(  1.0, 0, -1.0, 32,  0);


// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 頂点クラス
function Vertex(x0, y0, z0, u0, v0){
	this.x = x0 || 0;
	this.y = y0 || 0;
	this.z = z0 || 0;
	this.u = u0 || 0;
	this.v = v0 || 0;
}

// テクスチャをはった三角形の登録
function pushTexTriangle(img, modelviewMatrix, vertex1, vertex2, vertex3){
	mulMat44(engineStruct.tmpMat1, engineStruct.projectionMatrix, modelviewMatrix);
	transVec3(engineStruct.tmpVec1, engineStruct.tmpMat1, vertex1);
	transVec3(engineStruct.tmpVec2, engineStruct.tmpMat1, vertex2);
	transVec3(engineStruct.tmpVec3, engineStruct.tmpMat1, vertex3);
	var x1 = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
	var x2 = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w;
	var x3 = engineStruct.tmpVec3.x / engineStruct.tmpVec3.w;
	var y1 = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
	var y2 = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w;
	var y3 = engineStruct.tmpVec3.y / engineStruct.tmpVec3.w;
	var z1 = engineStruct.tmpVec1.z / engineStruct.tmpVec1.w;
	var z2 = engineStruct.tmpVec2.z / engineStruct.tmpVec2.w;
	var z3 = engineStruct.tmpVec3.z / engineStruct.tmpVec3.w;
	var w0 = engineStruct.w0;
	var h0 = engineStruct.h0;
	var w1 = engineStruct.w1;
	var h1 = engineStruct.h1;
	if((x1 < w0 && x2 < w0 && x3 < w0) || (w1 < x1 && w1 < x2 && w1 < x3)){return;}
	if((y1 < h0 && y2 < h0 && y3 < h0) || (h1 < y1 && h1 < y2 && h1 < y3)){return;}
	if(z1 <= -1 || z2 <= -1 || z3 <= -1 || 1 <= z1 || 1 <= z2 || 1 <= z3){return;}
	if((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1) <= 0){return;}
	
	var surface = get3dSurface();
	surface.type = 1;
	surface.index = engineStruct.vertexArray_index;
	surface.img = img;
	surface.z = (z1 + z2 + z3) / 3;
	engineStruct.vertexArray[surface.index + 0] = x1;
	engineStruct.vertexArray[surface.index + 1] = y1;
	engineStruct.vertexArray[surface.index + 2] = x2;
	engineStruct.vertexArray[surface.index + 3] = y2;
	engineStruct.vertexArray[surface.index + 4] = x3;
	engineStruct.vertexArray[surface.index + 5] = y3;
	engineStruct.textureArray[surface.index + 0] = vertex1.u;
	engineStruct.textureArray[surface.index + 1] = vertex1.v;
	engineStruct.textureArray[surface.index + 2] = vertex2.u;
	engineStruct.textureArray[surface.index + 3] = vertex2.v;
	engineStruct.textureArray[surface.index + 4] = vertex3.u;
	engineStruct.textureArray[surface.index + 5] = vertex3.v;
	engineStruct.vertexArray_index += 6;
}

// 色付き四角形の登録
function pushColorSquare(color, modelviewMatrix, vertex1, vertex2, vertex3, vertex4){
	mulMat44(engineStruct.tmpMat1, engineStruct.projectionMatrix, modelviewMatrix);
	transVec3(engineStruct.tmpVec1, engineStruct.tmpMat1, vertex1);
	transVec3(engineStruct.tmpVec2, engineStruct.tmpMat1, vertex2);
	transVec3(engineStruct.tmpVec3, engineStruct.tmpMat1, vertex3);
	transVec3(engineStruct.tmpVec4, engineStruct.tmpMat1, vertex4);
	var x1 = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
	var x2 = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w;
	var x3 = engineStruct.tmpVec3.x / engineStruct.tmpVec3.w;
	var x4 = engineStruct.tmpVec4.x / engineStruct.tmpVec4.w;
	var y1 = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
	var y2 = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w;
	var y3 = engineStruct.tmpVec3.y / engineStruct.tmpVec3.w;
	var y4 = engineStruct.tmpVec4.y / engineStruct.tmpVec4.w;
	var z1 = engineStruct.tmpVec1.z / engineStruct.tmpVec1.w;
	var z2 = engineStruct.tmpVec2.z / engineStruct.tmpVec2.w;
	var z3 = engineStruct.tmpVec3.z / engineStruct.tmpVec3.w;
	var z4 = engineStruct.tmpVec4.z / engineStruct.tmpVec4.w;
	var w0 = engineStruct.w0;
	var h0 = engineStruct.h0;
	var w1 = engineStruct.w1;
	var h1 = engineStruct.h1;
	if((x1 < w0 && x2 < w0 && x3 < w0 && x4 < w0) || (w1 < x1 && w1 < x2 && w1 < x3 && w1 < x4)){return;}
	if((y1 < h0 && y2 < h0 && y3 < h0 && y4 < h0) || (h1 < y1 && h1 < y2 && h1 < y3 && h1 < y4)){return;}
	if(z1 <= -1 || z2 <= -1 || z3 <= -1 || z4 <= -1 || 1 <= z1 || 1 <= z2 || 1 <= z3 || 1 <= z4){return;}
	if((x3 - x2) * (y2 - y1) - (y3 - y2) * (x2 - x1) <= 0){return;}
	
	var surface = get3dSurface();
	surface.type = 2;
	surface.index = engineStruct.vertexArray_index;
	surface.img = color;
	surface.z = (z1 + z2 + z3 + z4) / 4;
	engineStruct.vertexArray[surface.index + 0] = x1;
	engineStruct.vertexArray[surface.index + 1] = x2;
	engineStruct.vertexArray[surface.index + 2] = x3;
	engineStruct.vertexArray[surface.index + 3] = x4;
	engineStruct.textureArray[surface.index + 0] = y1;
	engineStruct.textureArray[surface.index + 1] = y2;
	engineStruct.textureArray[surface.index + 2] = y3;
	engineStruct.textureArray[surface.index + 3] = y4;
	engineStruct.vertexArray_index += 4;
}

// 	影の登録
function pushShadowSquare(modelviewMatrix, size, x, y, z){
	mulMat44Translate(engineStruct.tmpMat1, modelviewMatrix, x, y, z);
	mulMat44Scale(engineStruct.tmpMat2, engineStruct.tmpMat1, size, size, size);
	mulMat44(engineStruct.tmpMat1, engineStruct.projectionMatrix, engineStruct.tmpMat2);
	transVec3(engineStruct.tmpVec1, engineStruct.tmpMat1, engineStruct.shadow1);
	transVec3(engineStruct.tmpVec2, engineStruct.tmpMat1, engineStruct.shadow2);
	transVec3(engineStruct.tmpVec3, engineStruct.tmpMat1, engineStruct.shadow3);
	transVec3(engineStruct.tmpVec4, engineStruct.tmpMat1, engineStruct.shadow4);
	var x1 = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
	var x2 = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w;
	var x3 = engineStruct.tmpVec3.x / engineStruct.tmpVec3.w;
	var x4 = engineStruct.tmpVec4.x / engineStruct.tmpVec4.w;
	var y1 = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
	var y2 = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w;
	var y3 = engineStruct.tmpVec3.y / engineStruct.tmpVec3.w;
	var y4 = engineStruct.tmpVec4.y / engineStruct.tmpVec4.w;
	var z1 = engineStruct.tmpVec1.z / engineStruct.tmpVec1.w;
	var z2 = engineStruct.tmpVec2.z / engineStruct.tmpVec2.w;
	var z3 = engineStruct.tmpVec3.z / engineStruct.tmpVec3.w;
	var z4 = engineStruct.tmpVec4.z / engineStruct.tmpVec4.w;
	var w0 = engineStruct.w0;
	var h0 = engineStruct.h0;
	var w1 = engineStruct.w1;
	var h1 = engineStruct.h1;
	if((x1 < w0 && x2 < w0 && x3 < w0 && x4 < w0) || (w1 < x1 && w1 < x2 && w1 < x3 && w1 < x4)){return;}
	if((y1 < h0 && y2 < h0 && y3 < h0 && y4 < h0) || (h1 < y1 && h1 < y2 && h1 < y3 && h1 < y4)){return;}
	if(z1 <= -1 || z2 <= -1 || z3 <= -1 || z4 <= -1 || 1 <= z1 || 1 <= z2 || 1 <= z3 || 1 <= z4){return;}
	if((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1) <= 0){return;}
	
	var surface = get3dSurface();
	surface.type = 3;
	surface.index = engineStruct.vertexArray_index;
	surface.z = (z1 + z2 + z3 + z4) / 4;
	engineStruct.vertexArray[surface.index + 0] = x1;
	engineStruct.vertexArray[surface.index + 1] = x2;
	engineStruct.vertexArray[surface.index + 2] = x3;
	engineStruct.vertexArray[surface.index + 3] = x4;
	engineStruct.textureArray[surface.index + 0] = y1;
	engineStruct.textureArray[surface.index + 1] = y2;
	engineStruct.textureArray[surface.index + 2] = y3;
	engineStruct.textureArray[surface.index + 3] = y4;
	engineStruct.vertexArray_index += 4;
}

// 正方形ビルボードの登録
function pushBillBoard(img, modelviewMatrix, size, ux, vy, uw, vh, turn){
	mat44Billboard(engineStruct.tmpMat2, modelviewMatrix);
	mulMat44(engineStruct.tmpMat1, engineStruct.projectionMatrix, engineStruct.tmpMat2);
	size /= 2;
	transCoord(engineStruct.tmpVec1, engineStruct.tmpMat1, -size,  size, 0);
	transCoord(engineStruct.tmpVec2, engineStruct.tmpMat1,  size, -size, 0);
	var x1 = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
	var x2 = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w;
	var y1 = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
	var y2 = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w;
	var z = engineStruct.tmpVec1.z / engineStruct.tmpVec1.w;
	if(x2 < engineStruct.w0 || engineStruct.w1 < x1){return;}
	if(y2 < engineStruct.h0 || engineStruct.h1 < y1){return;}
	if(z <= -1 || 1 <= z){return;}
	if(x1 > x2 || y1 > y2){return;}
	if(ux < 0 || img.width < ux + uw || vy < 0 || img.height < vy + vh){return;}
	
	var surface = get3dSurface();
	surface.type = 4;
	surface.turn = turn;
	surface.index = engineStruct.vertexArray_index;
	surface.img = img;
	surface.z = z;
	engineStruct.vertexArray[surface.index + 0] = x1;
	engineStruct.vertexArray[surface.index + 1] = y1;
	engineStruct.vertexArray[surface.index + 2] = x2 - x1;
	engineStruct.vertexArray[surface.index + 3] = y2 - y1;
	engineStruct.textureArray[surface.index + 0] = ux;
	engineStruct.textureArray[surface.index + 1] = vy;
	engineStruct.textureArray[surface.index + 2] = uw;
	engineStruct.textureArray[surface.index + 3] = vh;
	engineStruct.vertexArray_index += 4;
}

// 登録した図形の描画
function draw3d(g){
	engineStruct.surfaceArray.sort(function(s0, s1){return s1.z - s0.z;});
	for(var i = 0; i < engineStruct.surfaceArray.length; i++){
		var s = engineStruct.surfaceArray[i];
		switch(s.type){
			case 1: drawTexTriangle(g, s); break;
			case 2: drawColorSquare(g, s); break;
			case 3: drawShadowSquare(g, s); break;
			case 4: drawBillBoard(g, s); break;
		}
	}
	engineStruct.surfaceArray.length = 0;
	engineStruct.vertexArray_index = 0;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メモリの確保
function get3dSurface(){
	var surface;
	if(engineStruct.surfaceArray.length == engineStruct.surfacePool.length){
		var surface = new Object();
		surface.type = 0;
		surface.turn = 0;
		surface.index = 0;
		surface.img = null;
		surface.z = 0;
		engineStruct.surfacePool.push(surface);
	}else if(engineStruct.surfaceArray.length > engineStruct.surfacePool.length){
		return null;
	}
	surface = engineStruct.surfacePool[engineStruct.surfaceArray.length];
	engineStruct.surfaceArray.push(surface);
	return surface;
}

// テクスチャをはった三角形の描画
function drawTexTriangle(g, s){
	var x1 = engineStruct.vertexArray[s.index + 2] - engineStruct.vertexArray[s.index + 0];
	var y1 = engineStruct.vertexArray[s.index + 3] - engineStruct.vertexArray[s.index + 1];
	var x2 = engineStruct.vertexArray[s.index + 4] - engineStruct.vertexArray[s.index + 0];
	var y2 = engineStruct.vertexArray[s.index + 5] - engineStruct.vertexArray[s.index + 1];
	
	var u1 = engineStruct.textureArray[s.index + 0];
	var v1 = engineStruct.textureArray[s.index + 1];
	var u2 = engineStruct.textureArray[s.index + 2];
	var v2 = engineStruct.textureArray[s.index + 3];
	var u3 = engineStruct.textureArray[s.index + 4];
	var v3 = engineStruct.textureArray[s.index + 5];
	var uv11 = u2 - u1;
	var uv12 = v2 - v1;
	var uv21 = u3 - u1;
	var uv22 = v3 - v1;
	var det = uv11 * uv22 - uv12 * uv21;
	if (-0.0001 < det && det < 0.0001){return;}
	var uv11d = uv22 / det;
	var uv22d = uv11 / det;
	var uv12d = -uv12 / det;
	var uv21d = -uv21 / det;
	
	var t11 = uv11d * x1 + uv12d * x2;
	var t21 = uv11d * y1 + uv12d * y2;
	var t12 = uv21d * x1 + uv22d * x2;
	var t22 = uv21d * y1 + uv22d * y2;
	var t13 = engineStruct.vertexArray[s.index + 0] - (t11 * u1 + t12 * v1);
	var t23 = engineStruct.vertexArray[s.index + 1] - (t21 * u1 + t22 * v1);
	
	var uw0 = u1 < u2 ? u1 : u2; uw0 = uw0 < u3 ? uw0 : u3;
	var uw1 = u1 > u2 ? u1 : u2; uw1 = uw1 > u3 ? uw1 : u3;
	var vh0 = v1 < v2 ? v1 : v2; vh0 = vh0 < v3 ? vh0 : v3;
	var vh1 = v1 > v2 ? v1 : v2; vh1 = vh1 > v3 ? vh1 : v3;
	uw1 = uw1 - uw0;
	vh1 = vh1 - vh0;
	
	g.save();
	g.beginPath();
	g.moveTo(engineStruct.vertexArray[s.index + 0], engineStruct.vertexArray[s.index + 1]);
	g.lineTo(engineStruct.vertexArray[s.index + 2], engineStruct.vertexArray[s.index + 3]);
	g.lineTo(engineStruct.vertexArray[s.index + 4], engineStruct.vertexArray[s.index + 5]);
	g.closePath();
	g.clip();
	g.transform(t11, t21, t12, t22, t13, t23);
	g.drawImage(s.img, uw0, vh0, uw1, vh1, uw0, vh0, uw1, vh1);
	g.restore();
}

// 色付き四角形の描画
function drawColorSquare(g, s){
	var x1 = engineStruct.vertexArray[s.index + 1] - engineStruct.vertexArray[s.index + 0];
	var x3 = engineStruct.vertexArray[s.index + 2] - engineStruct.vertexArray[s.index + 1];
	var y1 = engineStruct.textureArray[s.index + 1] - engineStruct.textureArray[s.index + 0];
	var y3 = engineStruct.textureArray[s.index + 2] - engineStruct.textureArray[s.index + 1];
	
	g.save();
	g.fillStyle = s.img;
	g.beginPath();
	g.moveTo(engineStruct.vertexArray[s.index + 0], engineStruct.textureArray[s.index + 0]);
	g.lineTo(engineStruct.vertexArray[s.index + 1], engineStruct.textureArray[s.index + 1]);
	g.lineTo(engineStruct.vertexArray[s.index + 2], engineStruct.textureArray[s.index + 2]);
	g.lineTo(engineStruct.vertexArray[s.index + 3], engineStruct.textureArray[s.index + 3]);
	g.closePath();
	g.fill();
	g.stroke();
	g.restore();
}

// 影の描画
function drawShadowSquare(g, s){
	var x1 = engineStruct.vertexArray[s.index + 1] - engineStruct.vertexArray[s.index + 0];
	var x2 = engineStruct.vertexArray[s.index + 2] - engineStruct.vertexArray[s.index + 0];
	var y1 = engineStruct.textureArray[s.index + 1] - engineStruct.textureArray[s.index + 0];
	var y2 = engineStruct.textureArray[s.index + 2] - engineStruct.textureArray[s.index + 0];
	var x3 = engineStruct.vertexArray[s.index + 3] - engineStruct.vertexArray[s.index + 0];
	var y3 = engineStruct.textureArray[s.index + 3] - engineStruct.textureArray[s.index + 0];
	var iw = 1 / 32;
	var ih = 1 / 32;
	g.fillStyle = "rgba(0, 0, 0, 0.5)";
	
	// 三角形 0-1-2
	var t11 = -iw * x1 + iw * x2;
	var t21 = -iw * y1 + iw * y2;
	var t12 =  ih * x1;
	var t22 =  ih * y1;
	var t13 = engineStruct.vertexArray[s.index];
	var t23 = engineStruct.textureArray[s.index];
	g.save();
	g.transform(t11, t21, t12, t22, t13, t23);
	g.beginPath();
	g.arc(16, 16, 16, 0.25 * Math.PI, 1.25 * Math.PI, false);
 	g.fill();
	g.restore();
	
	// 三角形 0-2-3
	var t11 = iw * x3;
	var t21 = iw * y3;
	var t12 = ih * x2 - ih * x3;
	var t22 = ih * y2 - ih * y3;
	var t13 = engineStruct.vertexArray[s.index];
	var t23 = engineStruct.textureArray[s.index];
	g.save();
	g.transform(t11, t21, t12, t22, t13, t23);
	g.beginPath();
	g.arc(16, 16, 16, 0.25 * Math.PI, 1.25 * Math.PI, true);
	g.fill();
	g.restore();
}

// 正方形ビルボードの描画
function drawBillBoard(g, s){
	var u0 = engineStruct.textureArray[s.index + 0];
	var v0 = engineStruct.textureArray[s.index + 1];
	var u1 = engineStruct.textureArray[s.index + 2];
	var v1 = engineStruct.textureArray[s.index + 3];
	var x0 = engineStruct.vertexArray[s.index + 0];
	var y0 = engineStruct.vertexArray[s.index + 1];
	var x1 = engineStruct.vertexArray[s.index + 2];
	var y1 = engineStruct.vertexArray[s.index + 3];
	if(s.turn){
		// 画像の上下反転
		var rx = x0 + x1 / 2;
		var ry = y0 + y1 / 2;
		g.save();
		g.translate(rx, ry);
		g.rotate(Math.PI);
		g.translate(-rx, -ry);
		g.drawImage(s.img, u0, v0, u1, v1, x0, y0, x1, y1);
		g.restore();
	}else{
		g.drawImage(s.img, u0, v0, u1, v1, x0, y0, x1, y1);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// openGLと同じ右手座標系のつもり
//[ _11, _12, _13, _14 ][ x ]
//[ _21, _22, _23, _24 ][ y ]
//[ _31, _32, _33, _34 ][ z ]
//[ _41, _42, _43, _44 ][ 1 ]

// ベクトルと行列を掛け合わせてアファイン変換を行う
function transVec3(vec, m, v0){
	vec.x = v0.x * m._11 + v0.y * m._12 + v0.z * m._13 + m._14;
	vec.y = v0.x * m._21 + v0.y * m._22 + v0.z * m._23 + m._24;
	vec.z = v0.x * m._31 + v0.y * m._32 + v0.z * m._33 + m._34;
	vec.w = v0.x * m._41 + v0.y * m._42 + v0.z * m._43 + m._44;
	return vec;
}

// 座標と行列を掛け合わせてアファイン変換を行う
function transCoord(vec, m, x, y, z){
	vec.x = x * m._11 + y * m._12 + z * m._13 + m._14;
	vec.y = x * m._21 + y * m._22 + z * m._23 + m._24;
	vec.z = x * m._31 + y * m._32 + z * m._33 + m._34;
	vec.w = x * m._41 + y * m._42 + z * m._43 + m._44;
	return vec;
}

// ----------------------------------------------------------------

/*
// 単位行列
function mat44(mat){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._31 = mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._11 = mat._22 = mat._33 = mat._44 = 1;
	return mat;
}

// 行列の複製
function mat44Copy(mat, m){
	mat._11 = m._11;
	mat._12 = m._12;
	mat._13 = m._13;
	mat._14 = m._14;
	mat._21 = m._21;
	mat._22 = m._22;
	mat._23 = m._23;
	mat._24 = m._24;
	mat._31 = m._31;
	mat._32 = m._32;
	mat._33 = m._33;
	mat._34 = m._34;
	mat._41 = m._41;
	mat._42 = m._42;
	mat._43 = m._43;
	mat._44 = m._44;
	return mat;
}
*/

// ----------------------------------------------------------------

// 行列の掛け合わせ
function mulMat44(mat, m0, m1){
	mat._11 = m0._11 * m1._11 + m0._12 * m1._21 + m0._13 * m1._31 + m0._14 * m1._41;
	mat._12 = m0._11 * m1._12 + m0._12 * m1._22 + m0._13 * m1._32 + m0._14 * m1._42;
	mat._13 = m0._11 * m1._13 + m0._12 * m1._23 + m0._13 * m1._33 + m0._14 * m1._43;
	mat._14 = m0._11 * m1._14 + m0._12 * m1._24 + m0._13 * m1._34 + m0._14 * m1._44;
	mat._21 = m0._21 * m1._11 + m0._22 * m1._21 + m0._23 * m1._31 + m0._24 * m1._41;
	mat._22 = m0._21 * m1._12 + m0._22 * m1._22 + m0._23 * m1._32 + m0._24 * m1._42;
	mat._23 = m0._21 * m1._13 + m0._22 * m1._23 + m0._23 * m1._33 + m0._24 * m1._43;
	mat._24 = m0._21 * m1._14 + m0._22 * m1._24 + m0._23 * m1._34 + m0._24 * m1._44;
	mat._31 = m0._31 * m1._11 + m0._32 * m1._21 + m0._33 * m1._31 + m0._34 * m1._41;
	mat._32 = m0._31 * m1._12 + m0._32 * m1._22 + m0._33 * m1._32 + m0._34 * m1._42;
	mat._33 = m0._31 * m1._13 + m0._32 * m1._23 + m0._33 * m1._33 + m0._34 * m1._43;
	mat._34 = m0._31 * m1._14 + m0._32 * m1._24 + m0._33 * m1._34 + m0._34 * m1._44;
	mat._41 = m0._41 * m1._11 + m0._42 * m1._21 + m0._43 * m1._31 + m0._44 * m1._41;
	mat._42 = m0._41 * m1._12 + m0._42 * m1._22 + m0._43 * m1._32 + m0._44 * m1._42;
	mat._43 = m0._41 * m1._13 + m0._42 * m1._23 + m0._43 * m1._33 + m0._44 * m1._43;
	mat._44 = m0._41 * m1._14 + m0._42 * m1._24 + m0._43 * m1._34 + m0._44 * m1._44;
	return mat;
}

// 平行移動行列の掛け合わせ
function mulMat44Translate(mat, m, x, y, z){
	mat._11 = m._11;
	mat._12 = m._12;
	mat._13 = m._13;
	mat._14 = m._14 + m._11 * x + m._12 * y + m._13 * z;
	mat._21 = m._21;
	mat._22 = m._22;
	mat._23 = m._23;
	mat._24 = m._24 + m._21 * x + m._22 * y + m._23 * z;
	mat._31 = m._31;
	mat._32 = m._32;
	mat._33 = m._33;
	mat._34 = m._34 + m._31 * x + m._32 * y + m._33 * z;
	mat._41 = 0;
	mat._42 = 0;
	mat._43 = 0;
	mat._44 = 1;
	return mat;
}

// 拡大縮小行列の掛け合わせ
function mulMat44Scale(mat, m, x, y, z){
	mat._11 = m._11 * x;
	mat._12 = m._12 * y;
	mat._13 = m._13 * z;
	mat._14 = m._14;
	mat._21 = m._21 * x;
	mat._22 = m._22 * y;
	mat._23 = m._23 * z;
	mat._24 = m._24;
	mat._31 = m._31 * x;
	mat._32 = m._32 * y;
	mat._33 = m._33 * z;
	mat._34 = m._34;
	mat._41 = 0;
	mat._42 = 0;
	mat._43 = 0;
	mat._44 = 1;
	return mat;
}

// x軸中心回転行列の掛け合わせ
function mulMat44RotX(mat, m, r){
	var mr22 = Math.cos(r)
	var mr32 = Math.sin(r)
	var mr23 = -mr32;
	var mr33 = mr22;
	mat._11 = m._11;
	mat._12 = m._12 * mr22 + m._13 * mr32;
	mat._13 = m._12 * mr23 + m._13 * mr33;
	mat._14 = m._14;
	mat._21 = m._21;
	mat._22 = m._22 * mr22 + m._23 * mr32;
	mat._23 = m._22 * mr23 + m._23 * mr33;
	mat._24 = m._24;
	mat._31 = m._31;
	mat._32 = m._32 * mr22 + m._33 * mr32;
	mat._33 = m._32 * mr23 + m._33 * mr33;
	mat._34 = m._34
	mat._41 = 0;
	mat._42 = 0;
	mat._43 = 0;
	mat._44 = 1;
	return mat;
}

// y軸中心回転行列の掛け合わせ
function mulMat44RotY(mat, m, r){
	var mr33 = Math.cos(r)
	var mr13 = Math.sin(r)
	var mr31 = -mr13;
	var mr11 = mr33;
	mat._11 = m._11 * mr11 + m._13 * mr31;
	mat._12 = m._12;
	mat._13 = m._11 * mr13 + m._13 * mr33;
	mat._14 = m._14;
	mat._21 = m._21 * mr11 + m._23 * mr31;
	mat._22 = m._22;
	mat._23 = m._21 * mr13 + m._23 * mr33;
	mat._24 = m._24;
	mat._31 = m._31 * mr11 + m._33 * mr31;
	mat._32 = m._32;
	mat._33 = m._31 * mr13 + m._33 * mr33;
	mat._34 = m._34
	mat._41 = 0;
	mat._42 = 0;
	mat._43 = 0;
	mat._44 = 1;
	return mat;
}

// z軸中心回転行列の掛け合わせ
function mulMat44RotZ(mat, m, r){
	var mr11 = Math.cos(r)
	var mr21 = Math.sin(r)
	var mr12 = -mr21;
	var mr22 = mr11;
	mat._11 = m._11 * mr11 + m._12 * mr21;
	mat._12 = m._11 * mr12 + m._12 * mr22;
	mat._13 = m._13;
	mat._14 = m._14;
	mat._21 = m._21 * mr11 + m._22 * mr21;
	mat._22 = m._21 * mr12 + m._22 * mr22;
	mat._23 = m._23;
	mat._24 = m._24;
	mat._31 = m._31 * mr11 + m._32 * mr21;
	mat._32 = m._31 * mr12 + m._32 * mr22;
	mat._33 = m._33;
	mat._34 = m._34
	mat._41 = 0;
	mat._42 = 0;
	mat._43 = 0;
	mat._44 = 1;
	return mat;
}

// ----------------------------------------------------------------

// 平行移動行列
function mat44Translate(mat, x, y, z){
	mat._12 = mat._13 = 0;
	mat._21 = mat._23 = 0;
	mat._31 = mat._32 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._11 = mat._22 = mat._33 = mat._44 = 1;
	mat._14 = x;
	mat._24 = y;
	mat._34 = z;
	return mat;
}

// 拡大縮小行列
function mat44Scale(mat, x, y, z){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._31 = mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._44 = 1;
	mat._11 = x;
	mat._22 = y;
	mat._33 = z;
	return mat;
}

// x軸中心回転行列
function mat44RotX(mat, r){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._24 = 0;
	mat._31 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._11 = mat._44 = 1;
	mat._22 = Math.cos(r);
	mat._32 = Math.sin(r);
	mat._33 = mat._22;
	mat._23 = -mat._32;
	return mat;
}

// y軸中心回転行列
function mat44RotY(mat, r){
	mat._12 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._22 = mat._44 = 1;
	mat._33 = Math.cos(r);
	mat._13 = Math.sin(r);
	mat._11 = mat._33;
	mat._31 = -mat._13;
	return mat;
}

// z軸中心回転行列
function mat44RotZ(mat, r){
	mat._13 = mat._14 = 0;
	mat._23 = mat._24 = 0;
	mat._31 = mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._33 = mat._44 = 1;
	mat._11 = Math.cos(r);
	mat._21 = Math.sin(r);
	mat._22 = mat._11;
	mat._12 = -mat._21;
	return mat;
}

// ----------------------------------------------------------------

// 回転拡大成分の打ち消し
function mat44Billboard(mat, m){
	mat._11 = mat._22 = mat._33 = 1;
	mat._12 = mat._13 = 0;
	mat._21 = mat._23 = 0;
	mat._31 = mat._32 = 0;
	mat._14 = m._14;
	mat._24 = m._24;
	mat._34 = m._34;
	mat._41 = m._41;
	mat._42 = m._42;
	mat._43 = m._43;
	mat._44 = m._44;
}

// ----------------------------------------------------------------

// 射影行列
function mat44Perspective(mat, w, h, z_near, z_far){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._31 = mat._32 = 0;
	mat._41 = mat._42 = 0;
	mat._11 = 2 * z_near / w;
	mat._22 = 2 * z_near / h;
	mat._33 = -(z_far + z_near) / (z_far - z_near);
	mat._43 = -1;
	mat._34 = -2 * z_near * z_far / (z_far - z_near);
	mat._44 = 0;
	return mat;
}

// 描画領域行列
function mat44Viewport(mat, w0, h0, w1, h1){
	engineStruct.w0 = w0;
	engineStruct.h0 = h0;
	engineStruct.w1 = w1;
	engineStruct.h1 = h1;
	mat._12 = mat._13 = 0;
	mat._21 = mat._23 = 0;
	mat._31 = mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._33 = mat._44 = 1;
	var w = (w1 - w0) / 2;
	var h = (h1 - h0) / 2;
	mat._11 = w;
	mat._22 = -h;
	mat._14 = w + w0;
	mat._24 = h + h0;
	return mat;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

