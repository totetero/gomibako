// 簡易行列演算ライブラリ
// 
// openGLと同じ右手座標系のつもり
//[ x ][ _11, _12, _13, _14 ]
//[ y ][ _21, _22, _23, _24 ]
//[ z ][ _31, _32, _33, _34 ]
//[ w ][ _41, _42, _43, _44 ]
// 
// このソースコードはMITライセンスです
// Copyright (c) 2011 totetero
// 

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// 行列クラス
function Matrix(){
	// ----------------------------------------------------------------
	// 初期化
	
	// 単位行列
	this.identity = function(){
		this._12 = this._13 = this._14 = 0;
		this._21 = this._23 = this._24 = 0;
		this._31 = this._32 = this._34 = 0;
		this._41 = this._42 = this._43 = 0;
		this._11 = this._22 = this._33 = this._44 = 1;
	}
	
	this.identity();
	
	// ----------------------------------------------------------------
	// 行列の掛け合わせ
	
	// 行列の掛け合わせ m0 * m1
	this.mul = function(m0, m1){
		this._11 = m0._11 * m1._11 + m0._12 * m1._21 + m0._13 * m1._31 + m0._14 * m1._41;
		this._12 = m0._11 * m1._12 + m0._12 * m1._22 + m0._13 * m1._32 + m0._14 * m1._42;
		this._13 = m0._11 * m1._13 + m0._12 * m1._23 + m0._13 * m1._33 + m0._14 * m1._43;
		this._14 = m0._11 * m1._14 + m0._12 * m1._24 + m0._13 * m1._34 + m0._14 * m1._44;
		this._21 = m0._21 * m1._11 + m0._22 * m1._21 + m0._23 * m1._31 + m0._24 * m1._41;
		this._22 = m0._21 * m1._12 + m0._22 * m1._22 + m0._23 * m1._32 + m0._24 * m1._42;
		this._23 = m0._21 * m1._13 + m0._22 * m1._23 + m0._23 * m1._33 + m0._24 * m1._43;
		this._24 = m0._21 * m1._14 + m0._22 * m1._24 + m0._23 * m1._34 + m0._24 * m1._44;
		this._31 = m0._31 * m1._11 + m0._32 * m1._21 + m0._33 * m1._31 + m0._34 * m1._41;
		this._32 = m0._31 * m1._12 + m0._32 * m1._22 + m0._33 * m1._32 + m0._34 * m1._42;
		this._33 = m0._31 * m1._13 + m0._32 * m1._23 + m0._33 * m1._33 + m0._34 * m1._43;
		this._34 = m0._31 * m1._14 + m0._32 * m1._24 + m0._33 * m1._34 + m0._34 * m1._44;
		this._41 = m0._41 * m1._11 + m0._42 * m1._21 + m0._43 * m1._31 + m0._44 * m1._41;
		this._42 = m0._41 * m1._12 + m0._42 * m1._22 + m0._43 * m1._32 + m0._44 * m1._42;
		this._43 = m0._41 * m1._13 + m0._42 * m1._23 + m0._43 * m1._33 + m0._44 * m1._43;
		this._44 = m0._41 * m1._14 + m0._42 * m1._24 + m0._43 * m1._34 + m0._44 * m1._44;
	}
	
	// 平行移動行列の掛け合わせ
	//[  1,  0,  0,  0 ][ _11, _12, _13, _14 ]
	//[  0,  1,  0,  0 ][ _21, _22, _23, _24 ]
	//[  0,  0,  1,  0 ][ _31, _32, _33, _34 ]
	//[  x,  y,  z,  1 ][ _41, _42, _43, _44 ]
	this.mulTranslate = function(x, y, z){
		var temp41 = this._11 * x + this._21 * y + this._31 * z + this._41;
		var temp42 = this._12 * x + this._22 * y + this._32 * z + this._42;
		var temp43 = this._13 * x + this._23 * y + this._33 * z + this._43;
		var temp44 = this._14 * x + this._24 * y + this._34 * z + this._44;
		this._41 = temp41;
		this._42 = temp42;
		this._43 = temp43;
		this._44 = temp44;
	}
	
	// 拡大縮小行列の掛け合わせ
	//[  x,  0,  0,  0 ][ _11, _12, _13, _14 ]
	//[  0,  y,  0,  0 ][ _21, _22, _23, _24 ]
	//[  0,  0,  z,  0 ][ _31, _32, _33, _34 ]
	//[  0,  0,  0,  1 ][ _41, _42, _43, _44 ]
	this.mulScale = function(x, y, z){
		this._11 *= x;
		this._12 *= x;
		this._13 *= x;
		this._14 *= x;
		this._21 *= y;
		this._22 *= y;
		this._23 *= y;
		this._24 *= y;
		this._31 *= z;
		this._32 *= z;
		this._33 *= z;
		this._34 *= z;
	}
	
	// x軸中心回転行列の掛け合わせ
	//[  1,  0,  0,  0 ][ _11, _12, _13, _14 ]
	//[  0,  c,  s,  0 ][ _21, _22, _23, _24 ]
	//[  0, -s,  c,  0 ][ _31, _32, _33, _34 ]
	//[  0,  0,  0,  1 ][ _41, _42, _43, _44 ]
	this.mulRotX = function(r){
		var mr22 = Math.cos(r)
		var mr23 = Math.sin(r)
		var mr32 = -mr23;
		var mr33 = mr22;
		var temp21 = mr22 * this._21 + mr23 * this._31
		var temp22 = mr22 * this._22 + mr23 * this._32
		var temp23 = mr22 * this._23 + mr23 * this._33
		var temp24 = mr22 * this._24 + mr23 * this._34
		var temp31 = mr32 * this._21 + mr33 * this._31
		var temp32 = mr32 * this._22 + mr33 * this._32
		var temp33 = mr32 * this._23 + mr33 * this._33
		var temp34 = mr32 * this._24 + mr33 * this._34
		this._21 = temp21;
		this._22 = temp22;
		this._23 = temp23;
		this._24 = temp24;
		this._31 = temp31;
		this._32 = temp32;
		this._33 = temp33;
		this._34 = temp34;
	}
	
	// y軸中心回転行列の掛け合わせ
	//[  c,  0, -s,  0 ][ _11, _12, _13, _14 ]
	//[  0,  1,  0,  0 ][ _21, _22, _23, _24 ]
	//[  s,  0,  c,  0 ][ _31, _32, _33, _34 ]
	//[  0,  0,  0,  1 ][ _41, _42, _43, _44 ]
	this.mulRotY = function(r){
		var mr33 = Math.cos(r)
		var mr31 = Math.sin(r)
		var mr13 = -mr31;
		var mr11 = mr33;
		var temp11 = mr11 * this._11 + mr13 * this._31;
		var temp12 = mr11 * this._12 + mr13 * this._32;
		var temp13 = mr11 * this._13 + mr13 * this._33;
		var temp14 = mr11 * this._14 + mr13 * this._34;
		var temp31 = mr31 * this._11 + mr33 * this._31;
		var temp32 = mr31 * this._12 + mr33 * this._32;
		var temp33 = mr31 * this._13 + mr33 * this._33;
		var temp34 = mr31 * this._14 + mr33 * this._34;
		this._11 = temp11;
		this._12 = temp12;
		this._13 = temp13;
		this._14 = temp14;
		this._31 = temp31;
		this._32 = temp32;
		this._33 = temp33;
		this._34 = temp34;
	}
	
	// z軸中心回転行列の掛け合わせ
	//[  c,  s,  0,  0 ][ _11, _12, _13, _14 ]
	//[ -s,  c,  0,  0 ][ _21, _22, _23, _24 ]
	//[  0,  0,  1,  0 ][ _31, _32, _33, _34 ]
	//[  0,  0,  0,  1 ][ _41, _42, _43, _44 ]
	this.mulRotZ = function(r){
		var mr11 = Math.cos(r)
		var mr12 = Math.sin(r)
		var mr21 = -mr12;
		var mr22 = mr11;
		var temp11 = mr11 * this._11 + mr12 * this._21;
		var temp12 = mr11 * this._12 + mr12 * this._22;
		var temp13 = mr11 * this._13 + mr12 * this._23;
		var temp14 = mr11 * this._14 + mr12 * this._24;
		var temp21 = mr21 * this._11 + mr22 * this._21;
		var temp22 = mr21 * this._12 + mr22 * this._22;
		var temp23 = mr21 * this._13 + mr22 * this._23;
		var temp24 = mr21 * this._14 + mr22 * this._24;
		this._11 = temp11;
		this._12 = temp12;
		this._13 = temp13;
		this._14 = temp14;
		this._21 = temp21;
		this._22 = temp22;
		this._23 = temp23;
		this._24 = temp24;
	}
	
	// ----------------------------------------------------------------
	// 行列の作成
	
	// 射影行列作成
	this.frustum = function(w, h, z_near, z_far){
		this._12 = this._13 = this._14 = 0;
		this._21 = this._23 = this._24 = 0;
		this._31 = this._32 = 0;
		this._41 = this._42 = 0;
		this._11 = 2 * z_near / w;
		this._22 = 2 * z_near / h;
		this._33 = -(z_far + z_near) / (z_far - z_near);
		this._34 = -1;
		this._43 = -2 * z_near * z_far / (z_far - z_near);
		this._44 = 0;
	}
	
	// 4*4行列の逆行列作成
	function inverse(m){
		this._11 =  m._22 * (m._33 * m._44 - m._34 * m._43) + m._23 * (m._34 * m._42 - m._32 * m._44) + m._24 * (m._32 * m._43 - m._33 * m._42);
		this._12 = -m._32 * (m._43 * m._14 - m._44 * m._13) - m._33 * (m._44 * m._12 - m._42 * m._14) - m._34 * (m._42 * m._13 - m._43 * m._12);
		this._13 =  m._42 * (m._13 * m._24 - m._14 * m._23) + m._43 * (m._14 * m._22 - m._12 * m._24) + m._44 * (m._12 * m._23 - m._13 * m._22);
		this._14 = -m._12 * (m._23 * m._34 - m._24 * m._33) - m._13 * (m._24 * m._32 - m._22 * m._34) - m._14 * (m._22 * m._33 - m._23 * m._32);
		this._21 = -m._23 * (m._34 * m._41 - m._31 * m._44) - m._24 * (m._31 * m._43 - m._33 * m._41) - m._21 * (m._33 * m._44 - m._34 * m._43);
		this._22 =  m._33 * (m._44 * m._11 - m._41 * m._14) + m._34 * (m._41 * m._13 - m._43 * m._11) + m._31 * (m._43 * m._14 - m._44 * m._13);
		this._23 = -m._43 * (m._14 * m._21 - m._11 * m._24) - m._44 * (m._11 * m._23 - m._13 * m._21) - m._41 * (m._13 * m._24 - m._14 * m._23);
		this._24 =  m._13 * (m._24 * m._31 - m._21 * m._34) + m._14 * (m._21 * m._33 - m._23 * m._31) + m._11 * (m._23 * m._34 - m._24 * m._33);
		this._31 =  m._24 * (m._31 * m._42 - m._32 * m._41) + m._21 * (m._32 * m._44 - m._34 * m._42) + m._22 * (m._34 * m._41 - m._31 * m._44);
		this._32 = -m._34 * (m._41 * m._12 - m._42 * m._11) - m._31 * (m._42 * m._14 - m._44 * m._12) - m._32 * (m._44 * m._11 - m._41 * m._14);
		this._33 =  m._44 * (m._11 * m._22 - m._12 * m._21) + m._41 * (m._12 * m._24 - m._14 * m._22) + m._42 * (m._14 * m._21 - m._11 * m._24);
		this._34 = -m._14 * (m._21 * m._32 - m._22 * m._31) - m._11 * (m._22 * m._34 - m._24 * m._32) - m._12 * (m._24 * m._31 - m._21 * m._34);
		this._41 = -m._21 * (m._32 * m._43 - m._33 * m._42) - m._22 * (m._33 * m._41 - m._31 * m._43) - m._23 * (m._31 * m._42 - m._32 * m._41);
		this._42 =  m._31 * (m._42 * m._13 - m._43 * m._12) + m._32 * (m._43 * m._11 - m._41 * m._13) + m._33 * (m._41 * m._12 - m._42 * m._11);
		this._43 = -m._41 * (m._12 * m._23 - m._13 * m._22) - m._42 * (m._13 * m._21 - m._11 * m._23) - m._43 * (m._11 * m._22 - m._12 * m._21);
		this._44 =  m._11 * (m._22 * m._33 - m._23 * m._32) + m._12 * (m._23 * m._31 - m._21 * m._33) + m._13 * (m._21 * m._32 - m._22 * m._31);
		var det =  m._11 * this._11 + m._21 * this._12 + m._31 * this._13 + m._41 * this._14;
		if(det == 0){return -1;}
		var idet = 1 / det;
		this._11 *= idet; this._12 *= idet; this._13 *= idet; this._14 *= idet;
		this._21 *= idet; this._22 *= idet; this._23 *= idet; this._24 *= idet;
		this._31 *= idet; this._32 *= idet; this._33 *= idet; this._34 *= idet;
		this._41 *= idet; this._42 *= idet; this._43 *= idet; this._44 *= idet;
		return 0;
	}
	
	// ----------------------------------------------------------------
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

