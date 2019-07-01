// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー (テクスチャ アルファテスト)
// 汎用

// 頂点シェーダー
var vshader01_src =
	"precision lowp float;                                           \n" +
	"attribute vec3 vs_attr_pos;                                     \n" +
	"attribute vec2 vs_attr_uvc;                                     \n" +
	"uniform mat4 vs_unif_mat;                                       \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    texCoord    = vs_attr_uvc;                                  \n" +
	"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
	"}                                                               \n" +
"";

// フラグメントシェーダー
var fshader01_src =
	"precision lowp float;                                           \n" +
	"uniform sampler2D texture;                                      \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    vec4 fragColor = texture2D(texture, texCoord);              \n" +
	"    if(fragColor.a > 0.8){                                      \n" +
	"        gl_FragColor = fragColor;                               \n" +
	"    }else{                                                      \n" +
	"        discard;                                                \n" +
	"    }                                                           \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー (テクスチャ)
// アルファ合成用

// 頂点シェーダー
var vshader02_src =
	"precision lowp float;                                           \n" +
	"attribute vec3 vs_attr_pos;                                     \n" +
	"attribute vec2 vs_attr_uvc;                                     \n" +
	"uniform mat4 vs_unif_mat;                                       \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    texCoord    = vs_attr_uvc;                                  \n" +
	"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
	"}                                                               \n" +
"";

// フラグメントシェーダー
var fshader02_src =
	"precision lowp float;                                           \n" +
	"uniform sampler2D texture;                                      \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    vec4 fragColor = texture2D(texture, texCoord);              \n" +
	"    gl_FragColor = fragColor;                                   \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー (テクスチャ カラーrgb アルファテスト)
// ハコニワ地形用

// 頂点シェーダー
var vshader03_src =
	"precision lowp float;                                           \n" +
	"attribute vec3 vs_attr_pos;                                     \n" +
	"attribute vec3 vs_attr_col;                                     \n" +
	"attribute vec2 vs_attr_uvc;                                     \n" +
	"uniform mat4 vs_unif_mat;                                       \n" +
	"varying vec4 color;                                             \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    color       = vec4(vs_attr_col, 1.0);                       \n" +
	"    texCoord    = vs_attr_uvc;                                  \n" +
	"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
	"}                                                               \n" +
"";

// フラグメントシェーダー
var fshader03_src =
	"precision lowp float;                                           \n" +
	"uniform sampler2D texture;                                      \n" +
	"varying vec4 color;                                             \n" +
	"varying vec2 texCoord;                                          \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    vec4 fragColor = texture2D(texture, texCoord) * color;      \n" +
	"    if(fragColor.a > 0.8){                                      \n" +
	"        gl_FragColor = fragColor;                               \n" +
	"    }else{                                                      \n" +
	"        discard;                                                \n" +
	"    }                                                           \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー (カラーrgba)
// スフィア地形用

// 頂点シェーダー
var vshader04_src =
	"precision lowp float;                                           \n" +
	"attribute vec3 vs_attr_pos;                                     \n" +
	"attribute vec4 vs_attr_col;                                     \n" +
	"uniform mat4 vs_unif_mat;                                       \n" +
	"varying vec4 color;                                             \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    color       = vs_attr_col;                                  \n" +
	"    gl_Position = vs_unif_mat * vec4(vs_attr_pos, 1.0);         \n" +
	"}                                                               \n" +
"";

// フラグメントシェーダー
var fshader04_src =
	"precision lowp float;                                           \n" +
	"varying vec4 color;                                             \n" +
	"                                                                \n" +
	"void main() {                                                   \n" +
	"    gl_FragColor = color;                                       \n" +
	"}                                                               \n" +
"";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------


// 簡易3Dエンジンクラス
function Engine3d(){
	this.gl;
	this.shader;
	this.shader01;
	this.shader02;
	this.shader03;
	this.shader04;
	
	// ----------------------------------------------------------------
	// 初期化
	
	// エンジン初期化
	this.init = function(canvas){
		// コンテキストの獲得
		try{var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");}catch(e){}
		if(!gl){
			alert("WebGL がサポートされていません。");
			return -1;
		}
		
		// シェーダープログラム作成
		var e3dCreateProgram = function(vssrc, fssrc){
			// シェーダーの作成
			var e3dCreateShader = function(src, type){
				var shader = gl.createShader(type);
				gl.shaderSource(shader, src);
				gl.compileShader(shader);
				if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
					alert(gl.getShaderInfoLog(shader));
					return -1;
				}
				return shader;
			}
			// 頂点シェーダーとフラグメントシェーダーの作成
			var vshader = e3dCreateShader(vssrc, gl.VERTEX_SHADER);
			var fshader = e3dCreateShader(fssrc, gl.FRAGMENT_SHADER);
			if(vshader < 0 || fshader < 0){return -1;}
			
			// プログラムオブジェクトを作成
			var shader = gl.createProgram();
			gl.attachShader(shader, vshader);
			gl.attachShader(shader, fshader);
			
			// 頂点シェーダーとフラグメントシェーダーをリンクする
			gl.linkProgram(shader);
			if(!gl.getProgramParameter(shader, gl.LINK_STATUS)){
				alert(gl.getProgramInfoLog(shader));
				return -1;
			}
			
			// シェーダーパラメータ取得
			shader.s_pos = gl.getAttribLocation(shader, "vs_attr_pos");
			shader.s_col = gl.getAttribLocation(shader, "vs_attr_col");
			shader.s_uvc = gl.getAttribLocation(shader, "vs_attr_uvc");
			shader.s_mat = gl.getUniformLocation(shader, "vs_unif_mat");
			
			return shader;
		}
		this.shader01 = e3dCreateProgram(vshader01_src, fshader01_src);
		this.shader02 = e3dCreateProgram(vshader02_src, fshader02_src);
		this.shader03 = e3dCreateProgram(vshader03_src, fshader03_src);
		this.shader04 = e3dCreateProgram(vshader04_src, fshader04_src);
		if(this.shader01 < 0 || this.shader02 < 0 || this.shader03 < 0 || this.shader04 < 0){return -1;}
		
		// opengl描画設定
		gl.clearColor(1, 1, 1, 1);
		gl.clearDepth(1);
		gl.enable(gl.TEXTURE_2D);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		this.gl = gl;
		return 0;
	}
	
	// ----------------------------------------------------------------
	// モデル作成
	
	// VBO作成
	this.createVBO = function(vertices){
		var gl = this.gl;
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return vertexBuffer;
	}
	
	// IBO作成
	this.createIBO = function(indexes){
		var gl = this.gl;
		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexes), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		return indexBuffer;
	}
	
	// バッファ除去
	this.deleteBuffer = function(buffer){
		var gl = this.gl;
		gl.deleteBuffer(buffer);
	}
	
	// キャンバスからテクスチャ作成
	this.createTexture = function(canvas, texture){
		var gl = this.gl;
		// テクスチャーオブジェクトを作成
		if(typeof texture == "undefined"){var texture = gl.createTexture();}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}
	
	// 画像からテクスチャ読込み
	this.loadTexture = function(url){
		var that = this;
		var texture = this.gl.createTexture();
		var image = new Image();
		// 画像の読み込み 完了時テクスチャ作成
		image.onload = function(){that.createTexture(image, texture);}
		image.src = url;
		return texture;
	}
	
	// ----------------------------------------------------------------
	// 描画処理
	
	// 描画のクリア
	this.clear = function(){
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	}
	
	// 描画モード設定
	this.setMode = function(mode){
		var gl = this.gl;
		switch(mode){
			case 0:
				// 汎用モード (VertBuf TexcBuf)
				this.shader = this.shader01;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 1:
				// 2D描画モード (VertBuf TexcBuf)
				this.shader = this.shader01;
				gl.depthMask(false);
				gl.disable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 2:
				// アルファ合成モード (VertBuf TexcBuf)
				this.shader = this.shader02;
				gl.depthMask(false);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE); break; // 加算合成
				break;
			case 3:
				// ハコニワ地形モード (VertBuf Clor3Buf TexcBuf)
				this.shader = this.shader03;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 4:
				// スフィア地形モード (VertBuf Clor4Buf)
				this.shader = this.shader04;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); break; // 半透明アルファ合成
				break;
		}
		gl.useProgram(this.shader);
	}
	
	// 行列の設定
	this.setMatrix = function(matrix){
		this.gl.uniformMatrix4fv(this.shader.s_mat, false, matrix);
	}
	
	// テクスチャを指定
	this.bindTex = function(texture, type){
		var gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		if(type == 1){
			// 最近傍法 ドット絵地形用
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}else{
			// 線形補完 汎用
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
	
	// VBO登録 頂点座標
	this.bindVertBuf = function(vertVBO){
		var gl = this.gl;
		gl.enableVertexAttribArray(this.shader.s_pos);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertVBO);
		gl.vertexAttribPointer(this.shader.s_pos, 3, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 カラーrgb
	this.bindClor3Buf = function(clorVBO){
		var gl = this.gl;
		gl.enableVertexAttribArray(this.shader.s_col);
		gl.bindBuffer(gl.ARRAY_BUFFER, clorVBO);
		gl.vertexAttribPointer(this.shader.s_col, 3, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 カラーrgba
	this.bindClor4Buf = function(clorVBO){
		var gl = this.gl;
		gl.enableVertexAttribArray(this.shader.s_col);
		gl.bindBuffer(gl.ARRAY_BUFFER, clorVBO);
		gl.vertexAttribPointer(this.shader.s_col, 4, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 テクスチャ座標
	this.bindTexcBuf = function(texcVBO){
		var gl = this.gl;
		gl.enableVertexAttribArray(this.shader.s_uvc);
		gl.bindBuffer(gl.ARRAY_BUFFER, texcVBO);
		gl.vertexAttribPointer(this.shader.s_uvc, 2, gl.FLOAT, false, 0, 0);
	}
	
	// IBO登録 頂点インデックス
	this.bindFaceBuf = function(faceIBO){
		var gl = this.gl;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceIBO);
	}
	
	// 描画
	this.draw = function(offset, count){
		var gl = this.gl;
		gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT);
	}
	
	// 四角形の描画
	this.drawTetra = function(){
		var gl = this.gl;
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
	
	// 描画の反映
	this.flush = function(){
		this.gl.flush();
	}
	
	// ----------------------------------------------------------------
	// 良く使う部品をテンプレートとして用意する
	
	// テンプレート初期化
	this.initTemplate = function(){
		this.worldmat = mat4.create();
		this.tmpmat1 = mat4.create();
		this.tmpmat2 = mat4.create();
		
		var vert = new Array();
		vert.push( 0.5,  0.5, 0.0);
		vert.push(-0.5,  0.5, 0.0);
		vert.push(-0.5, -0.5, 0.0);
		vert.push( 0.5, -0.5, 0.0);
		this.tetraVertBuffer = e3d.createVBO(vert);
		
		var texc = new Array();
		texc.push(1.0, 0.0);
		texc.push(0.0, 0.0);
		texc.push(0.0, 1.0);
		texc.push(1.0, 1.0);
		this.tetraTexcBuffer = e3d.createVBO(texc);
	}
	
	// ----------------------------------------------------------------
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// glMatrix拡張 回転の四元数作成
quat4.rotate = function(quat, angle, axis, dest){
	if(!dest) { dest = quat; }
	var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3];
	var x = axis[0];
	var y = axis[1];
	var z = axis[2];
	var s = Math.sin(angle / 2) / Math.sqrt(x * x + y * y + z * z);
	var qbw = Math.cos(angle / 2);
	var qbx = s * x;
	var qby = s * y;
	var qbz = s * z;
	dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
	dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
	dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
	dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
	return dest;
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------


