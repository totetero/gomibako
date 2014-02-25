// 簡易3dエンジン

// グローバル変数構造体
var engineStruct = new Object();
engineStruct.projectionMatrix = new Object();
// 頂点配列 面情報配列 テクスチャ配列
engineStruct.vertexArray_index = 0;
engineStruct.surfaceArray_index = 0;
engineStruct.surfaceArray_length = 0;
engineStruct.vertexArray = new Array();
engineStruct.surfaceArray = new Array();
engineStruct.textureArray = new Array();
// 一時データ
engineStruct.tmpMat1 = new Object();
engineStruct.tmpMat2 = new Object();
engineStruct.tmpVec1 = new Object();
engineStruct.tmpVec2 = new Object();
engineStruct.tmpVec3 = new Object();

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 描画テスト用の関数
function test3dStart(context, w0, h0, w1, h1){
	var testObj = new Object();
	
	testObj.vect00 = new Vertex(-4,  4,  4, 0  , 0  );// 上
	testObj.vect01 = new Vertex( 4,  4,  4, 0.5, 0  );
	testObj.vect02 = new Vertex( 4,  4, -4, 0.5, 0.5);
	testObj.vect03 = new Vertex(-4,  4, -4, 0  , 0.5);
	
	testObj.vect10 = new Vertex(-4,  4, -4, 0  , 0.5);// 横1
	testObj.vect11 = new Vertex( 4,  4, -4, 0.5, 0.5);
	testObj.vect12 = new Vertex( 4, -4, -4, 0.5, 1  );
	testObj.vect13 = new Vertex(-4, -4, -4, 0  , 1  );
	
	testObj.vect20 = new Vertex(-4,  4,  4, 0.5, 0  );// 横2
	testObj.vect21 = new Vertex(-4,  4, -4, 1  , 0  );
	testObj.vect22 = new Vertex(-4, -4, -4, 1  , 0.5);
	testObj.vect23 = new Vertex(-4, -4,  4, 0.5, 0.5);
	
	testObj.vect30 = new Vertex( 4,  4, -4, 0.5, 0  );// 横3
	testObj.vect31 = new Vertex( 4,  4,  4, 1  , 0  );
	testObj.vect32 = new Vertex( 4, -4,  4, 1  , 0.5);
	testObj.vect33 = new Vertex( 4, -4, -4, 0.5, 0.5);
	
	testObj.vect40 = new Vertex( 4,  4,  4, 0  , 0.5);// 横4
	testObj.vect41 = new Vertex(-4,  4,  4, 0.5, 0.5);
	testObj.vect42 = new Vertex(-4, -4,  4, 0.5, 1  );
	testObj.vect43 = new Vertex( 4, -4,  4, 0  , 1  );
	
	testObj.rotation = 0;
	testObj.x = w0;
	testObj.y = h0;
	testObj.w = w1 - w0;
	testObj.h = h1 - h0;
	testObj.context = context;
	
	testObj.tmpMat1 = new Object();
	testObj.tmpMat2 = new Object();
	testObj.tmpMat3 = new Object();
	
	var aspect = testObj.w / testObj.h;
	Mat44perspective(testObj.tmpMat1, aspect, 1, 1, 100);
	Mat44viewport(testObj.tmpMat2, w0, h0, w1, h1);
	Mat44mul(engineStruct.projectionMatrix, testObj.tmpMat2, testObj.tmpMat1);
	
	testObj.renderScene = function(){
		Mat44rotY(testObj.tmpMat2, testObj.rotation);
		Mat44rotX(testObj.tmpMat3, -0.7);
		Mat44mul(testObj.tmpMat1, testObj.tmpMat3, testObj.tmpMat2);
		Mat44translate(testObj.tmpMat2, 0, 0, 20);
		Mat44mul(testObj.tmpMat3, testObj.tmpMat2, testObj.tmpMat1);
		
		testObj.rotation += 0.1;
		
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect00, testObj.vect01, testObj.vect03);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect01, testObj.vect02, testObj.vect03);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect10, testObj.vect11, testObj.vect13);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect11, testObj.vect12, testObj.vect13);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect20, testObj.vect21, testObj.vect23);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect21, testObj.vect22, testObj.vect23);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect30, testObj.vect31, testObj.vect33);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect31, testObj.vect32, testObj.vect33);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect40, testObj.vect41, testObj.vect43);
		pushTriangle(testObj.textureImage, testObj.tmpMat3, testObj.vect41, testObj.vect42, testObj.vect43);
		
		testObj.context.beginPath();
		testObj.context.rect(testObj.x, testObj.y, testObj.w, testObj.h);
		testObj.context.clip();
		testObj.context.fillStyle = "rgb(255, 255, 255)";
		testObj.context.rect(testObj.x, testObj.y, testObj.w, testObj.h);
		testObj.context.fill();
		draw3d(testObj.context);
		
		setTimeout(testObj.renderScene, 40);
	}
	
	testObj.textureImage = new Image();
	testObj.textureImage.onload = function(){
		testObj.renderScene();
	}
	testObj.textureImage.src = "test.png";
}

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
function pushTriangle(img, modelviewMatrix, vertex1, vertex2, vertex3){
	Mat44mul(engineStruct.tmpMat1, engineStruct.projectionMatrix, modelviewMatrix);
	transVec3(engineStruct.tmpVec1, vertex1, engineStruct.tmpMat1);
	transVec3(engineStruct.tmpVec2, vertex2, engineStruct.tmpMat1);
	transVec3(engineStruct.tmpVec3, vertex3, engineStruct.tmpMat1);
	var z = (engineStruct.tmpVec1.z + engineStruct.tmpVec2.z + engineStruct.tmpVec3.z) / 3;
	if(z > 0){
		var surface = get3dSurface();
		surface.type = 1;
		surface.index = engineStruct.vertexArray_index;
		surface.img = img;
		surface.z = z;
		engineStruct.vertexArray[surface.index + 0] = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
		engineStruct.vertexArray[surface.index + 1] = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
		engineStruct.vertexArray[surface.index + 2] = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w;
		engineStruct.vertexArray[surface.index + 3] = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w;
		engineStruct.vertexArray[surface.index + 4] = engineStruct.tmpVec3.x / engineStruct.tmpVec3.w;
		engineStruct.vertexArray[surface.index + 5] = engineStruct.tmpVec3.y / engineStruct.tmpVec3.w;
		engineStruct.textureArray[surface.index + 0] = vertex1.u;
		engineStruct.textureArray[surface.index + 1] = vertex1.v;
		engineStruct.textureArray[surface.index + 2] = vertex2.u;
		engineStruct.textureArray[surface.index + 3] = vertex2.v;
		engineStruct.textureArray[surface.index + 4] = vertex3.u;
		engineStruct.textureArray[surface.index + 5] = vertex3.v;
		engineStruct.vertexArray_index += 6;
	}
}

// 正方形ビルボードの登録
function pushBillBoard(img, modelviewMatrix, size, ux, vy, uw, vh, turn){
	var surface = get3dSurface();
	Mat44billboard(engineStruct.tmpMat2, modelviewMatrix);
	Mat44mul(engineStruct.tmpMat1, engineStruct.projectionMatrix, engineStruct.tmpMat2);
	size /= 2;
	transCoord(engineStruct.tmpVec1, -size,  size, 0, engineStruct.tmpMat1);
	transCoord(engineStruct.tmpVec2,  size, -size, 0, engineStruct.tmpMat1);
	surface.type = 2;
	surface.turn = turn;
	surface.index = engineStruct.vertexArray_index;
	surface.img = img;
	surface.z = engineStruct.tmpVec1.z;
	engineStruct.vertexArray[surface.index + 0] = engineStruct.tmpVec1.x / engineStruct.tmpVec1.w;
	engineStruct.vertexArray[surface.index + 1] = engineStruct.tmpVec1.y / engineStruct.tmpVec1.w;
	engineStruct.vertexArray[surface.index + 2] = engineStruct.tmpVec2.x / engineStruct.tmpVec2.w - engineStruct.vertexArray[surface.index + 0];
	engineStruct.vertexArray[surface.index + 3] = engineStruct.tmpVec2.y / engineStruct.tmpVec2.w - engineStruct.vertexArray[surface.index + 1];
	engineStruct.textureArray[surface.index + 0] = ux;
	engineStruct.textureArray[surface.index + 1] = vy;
	engineStruct.textureArray[surface.index + 2] = uw;
	engineStruct.textureArray[surface.index + 3] = vh;
	engineStruct.vertexArray_index += 4;
}

// 登録した図形の描画
function draw3d(g){
	engineStruct.surfaceArray.sort(function(s0, s1){return s1.z - s0.z;});
	for(var i = 0; i < engineStruct.surfaceArray_index; i++){
		var s = engineStruct.surfaceArray[i];
		switch(s.type){
			case 1: drawTriangle(g, s); break;
			case 2: drawBillBoard(g, s); break;
		}
	}
	engineStruct.surfaceArray_index = 0;
	engineStruct.vertexArray_index = 0;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// メモリの確保
function get3dSurface(){
	if(engineStruct.surfaceArray_index == engineStruct.surfaceArray_length){
		var surface = new Object();
		surface.type = 0;
		surface.turn = 0;
		surface.index = 0;
		surface.img = null;
		surface.z = 0;
		engineStruct.surfaceArray.push(surface);
		engineStruct.surfaceArray_length++;
	}else if(engineStruct.surfaceArray_index > engineStruct.surfaceArray_length){
		return null;
	}
	return engineStruct.surfaceArray[engineStruct.surfaceArray_index++];
}

// 三角形の描画
function drawTriangle(g, s){
	var x1 = engineStruct.vertexArray[s.index + 2] - engineStruct.vertexArray[s.index + 0];
	var y1 = engineStruct.vertexArray[s.index + 3] - engineStruct.vertexArray[s.index + 1];
	var x3 = engineStruct.vertexArray[s.index + 4] - engineStruct.vertexArray[s.index + 2];
	var y3 = engineStruct.vertexArray[s.index + 5] - engineStruct.vertexArray[s.index + 3];
	if(x1 *y3 - y1 * x3 <= 0){return;}
	var x2 = engineStruct.vertexArray[s.index + 4] - engineStruct.vertexArray[s.index + 0];
	var y2 = engineStruct.vertexArray[s.index + 5] - engineStruct.vertexArray[s.index + 1];
	
	var u1 = engineStruct.textureArray[s.index + 0] * s.img.width
	var v1 = engineStruct.textureArray[s.index + 1] * s.img.height
	var u2 = engineStruct.textureArray[s.index + 2] * s.img.width
	var v2 = engineStruct.textureArray[s.index + 3] * s.img.height
	var u3 = engineStruct.textureArray[s.index + 4] * s.img.width
	var v3 = engineStruct.textureArray[s.index + 5] * s.img.height
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
	
	if(0 <= uw1 && uw1 <= s.img.width && 0 <= vh1 && vh1 <= s.img.height){
		g.save();
		g.beginPath();
		g.moveTo(engineStruct.vertexArray[s.index + 0], engineStruct.vertexArray[s.index + 1]);
		g.lineTo(engineStruct.vertexArray[s.index + 2], engineStruct.vertexArray[s.index + 3]);
		g.lineTo(engineStruct.vertexArray[s.index + 4], engineStruct.vertexArray[s.index + 5]);
		g.lineTo(engineStruct.vertexArray[s.index + 0], engineStruct.vertexArray[s.index + 1]);
		g.clip();
		g.transform(t11, t21, t12, t22, t13, t23);
		g.drawImage(s.img, uw0, vh0, uw1, vh1, uw0, vh0, uw1, vh1);
		g.restore();
	}
}

// ビルボードの描画
function drawBillBoard(g, s){
	var u0 = engineStruct.textureArray[s.index + 0];
	var v0 = engineStruct.textureArray[s.index + 1];
	var u1 = engineStruct.textureArray[s.index + 2];
	var v1 = engineStruct.textureArray[s.index + 3];
	var x0 = engineStruct.vertexArray[s.index + 0];
	var y0 = engineStruct.vertexArray[s.index + 1];
	var x1 = engineStruct.vertexArray[s.index + 2];
	var y1 = engineStruct.vertexArray[s.index + 3];
	var flag1 = (0 < u1 && u1 < s.img.width && 0 < v1 && v1 < s.img.height);
	//var flag2 = (0 < x1 && x1 < game.width && 0 < y1 && y1 < game.height);
	var flag2 = (0 < x1 && 0 < y1);
	if(flag1 && flag2){
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
function transVec3(vec, v0, m){
	vec.x = v0.x * m._11 + v0.y * m._12 + v0.z * m._13 + m._14;
	vec.y = v0.x * m._21 + v0.y * m._22 + v0.z * m._23 + m._24;
	vec.z = v0.x * m._31 + v0.y * m._32 + v0.z * m._33 + m._34;
	vec.w = v0.x * m._41 + v0.y * m._42 + v0.z * m._43 + m._44;
	return vec;
}

// 座標と行列を掛け合わせてアファイン変換を行う
function transCoord(vec, x, y, z, m){
	vec.x = x * m._11 + y * m._12 + z * m._13 + m._14;
	vec.y = x * m._21 + y * m._22 + z * m._23 + m._24;
	vec.z = x * m._31 + y * m._32 + z * m._33 + m._34;
	vec.w = x * m._41 + y * m._42 + z * m._43 + m._44;
	return vec;
}

/*
// 単位行列
function Mat44(mat){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._31 = mat._32 = mat._34 = 0;
	mat._41 = mat._42 = mat._43 = 0;
	mat._11 = mat._22 = mat._33 = mat._44 = 1;
	return mat;
}

// 行列の複製
function Mat44copy(mat, m){
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

// 行列の掛け合わせ
function Mat44mul(mat, m0, m1){
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

// 平行移動
function Mat44translate(mat, x, y, z){
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

// 拡大縮小
function Mat44scale(mat, x, y, z){
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

// x軸中心回転
function Mat44rotX(mat, r){
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

// y軸中心回転
function Mat44rotY(mat, r){
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

// z軸中心回転
function Mat44rotZ(mat, r){
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

// 回転拡大成分の打ち消し
function Mat44billboard(mat, m){
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

// 射影行列
function Mat44perspective(mat, vw, vh, z_near, z_far){
	mat._12 = mat._13 = mat._14 = 0;
	mat._21 = mat._23 = mat._24 = 0;
	mat._31 = mat._32 = 0;
	mat._41 = mat._42 = 0;
	mat._11 = 2.0*z_near/vw;
	mat._22 = 2*z_near/vh;
	mat._33 = z_far/(z_far-z_near);
	mat._43 = 1;
	mat._34 = z_near*z_far/(z_near-z_far);
	mat._44 = 0;
	return mat;
}

// 描画領域行列
function Mat44viewport(mat, w0, h0, w1, h1){
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

