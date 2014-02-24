import "js/web.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// glMatrix.0.9.6.jsのインターフェイス

native class vec3{
	static function create() : Float32Array;
	static function create(vec : number[]) : Float32Array;
	static function create(vec : Float32Array) : Float32Array;
	static function set(vec : number[], dest : Float32Array) : Float32Array;
	static function set(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function add(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function add(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function subtract(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function subtract(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function negate(vec : Float32Array) : Float32Array;
	static function negate(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function scale(vec : Float32Array, val : number) : Float32Array;
	static function scale(vec : Float32Array, val : number, dest : Float32Array) : Float32Array;
	static function normalize(vec : Float32Array) : Float32Array;
	static function normalize(vec : Float32Array, dest : Float32Array) : Float32Array;
	static function cross(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function cross(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function length(vec : Float32Array) : number;
	static function dot(vec : Float32Array, vec2 : Float32Array) : number;
	static function direction(vec : Float32Array, vec2 : Float32Array) : Float32Array;
	static function direction(vec : Float32Array, vec2 : Float32Array, dest : Float32Array) : Float32Array;
	static function lerp(vec : Float32Array, vec2 : Float32Array, lerp : number) : Float32Array;
	static function lerp(vec : Float32Array, vec2 : Float32Array, lerp : number, dest : Float32Array) : Float32Array;
	static function str(vec : Float32Array) : string;
}

native class mat3{
	static function create() : Float32Array;
	static function create(mat : number[]) : Float32Array;
	static function create(mat : Float32Array) : Float32Array;
	static function set(mat : number[], dest : Float32Array) : Float32Array;
	static function set(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function identity(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat4(mat : Float32Array) : Float32Array;
	static function toMat4(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function str(mat : Float32Array) : string;
}

native class mat4{
	static function create() : Float32Array;
	static function create(mat : number[]) : Float32Array;
	static function create(mat : Float32Array) : Float32Array;
	static function set(mat : number[], dest : Float32Array) : Float32Array;
	static function set(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function identity(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array) : Float32Array;
	static function transpose(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function determinant(mat : Float32Array) : number;
	static function inverse(mat : Float32Array) : Float32Array;
	static function inverse(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toRotationMat(mat : Float32Array) : Float32Array;
	static function toRotationMat(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat3(mat : Float32Array) : Float32Array;
	static function toMat3(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function toInverseMat3(mat : Float32Array) : Float32Array;
	static function toInverseMat3(mat : Float32Array, dest : Float32Array) : Float32Array;
	static function multiply(mat : Float32Array, mat2 : Float32Array) : Float32Array;
	static function multiply(mat : Float32Array, mat2 : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec3(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec3(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec4(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec4(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : number[]) : Float32Array;
	static function translate(mat : Float32Array, vec : number[], dest : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function translate(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : number[]) : Float32Array;
	static function scale(mat : Float32Array, vec : number[], dest : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : Float32Array) : Float32Array;
	static function scale(mat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : number[]) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : number[], dest : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : Float32Array) : Float32Array;
	static function rotate(mat : Float32Array, angle : number, axis : Float32Array, dest : Float32Array) : Float32Array;
	static function rotateX(mat : Float32Array, angle : number) : Float32Array;
	static function rotateX(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function rotateY(mat : Float32Array, angle : number) : Float32Array;
	static function rotateY(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function rotateZ(mat : Float32Array, angle : number) : Float32Array;
	static function rotateZ(mat : Float32Array, angle : number, dest : Float32Array) : Float32Array;
	static function frustum(left : number, right : number, bottom : number, top : number, near : number, far : number) : Float32Array;
	static function frustum(left : number, right : number, bottom : number, top : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function perspective(fovy : number, aspect : number, near : number, far : number) : Float32Array;
	static function perspective(fovy : number, aspect : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function ortho(left : number, right : number, bottom : number, top : number, near : number, far : number) : Float32Array;
	static function ortho(left : number, right : number, bottom : number, top : number, near : number, far : number, dest : Float32Array) : Float32Array;
	static function lookAt(eye : number[], center : number[], up : number[]) : Float32Array;
	static function lookAt(eye : number[], center : number[], up : number[], dest : Float32Array) : Float32Array;
	static function lookAt(eye : Float32Array, center : Float32Array, up : Float32Array) : Float32Array;
	static function lookAt(eye : Float32Array, center : Float32Array, up : Float32Array, dest : Float32Array) : Float32Array;
	static function str(mat : Float32Array) : string;
}

native class quat4{
	static function create() : Float32Array;
	static function create(quat : number[]) : Float32Array;
	static function create(quat : Float32Array) : Float32Array;
	static function set(quat : number[], dest : Float32Array) : Float32Array;
	static function set(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function calculateW(quat : Float32Array) : Float32Array;
	static function calculateW(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function inverse(quat : Float32Array) : Float32Array;
	static function inverse(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function length(quat : Float32Array) : number;
	static function normalize(quat : Float32Array) : Float32Array;
	static function normalize(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function multiply(quat : Float32Array, quat2 : Float32Array) : Float32Array;
	static function multiply(quat : Float32Array, quat2 : Float32Array, dest : Float32Array) : Float32Array;
	static function multiplyVec3(quat : Float32Array, vec : Float32Array) : Float32Array;
	static function multiplyVec3(quat : Float32Array, vec : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat3(quat : Float32Array) : Float32Array;
	static function toMat3(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function toMat4(quat : Float32Array) : Float32Array;
	static function toMat4(quat : Float32Array, dest : Float32Array) : Float32Array;
	static function slerp(quat : Float32Array, quat2 : Float32Array, sleap : number) : Float32Array;
	static function slerp(quat : Float32Array, quat2 : Float32Array, sleap : number, dest : Float32Array) : Float32Array;
	static function str(quat : Float32Array) : string;
	// glMatrix拡張 回転の四元数作成
	static function rotate(quat : Float32Array, angle : number, axis : number[], dest : Float32Array) : Float32Array{
		if(dest == null) {dest = quat;}
		var qax : number = quat[0];
		var qay : number = quat[1];
		var qaz : number = quat[2];
		var qaw : number = quat[3];
		var x : number = axis[0];
		var y : number = axis[1];
		var z : number = axis[2];
		var s : number = Math.sin(angle / 2) / Math.sqrt(x * x + y * y + z * z);
		var qbw : number = Math.cos(angle / 2);
		var qbx : number = s * x;
		var qby : number = s * y;
		var qbz : number = s * z;
		dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
		return dest;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー01 (テクスチャ アルファテスト)
// 汎用

class ShaderSrc01{
	// 頂点シェーダー
	static var vert : string =
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
	static var frag : string =
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
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー02 (テクスチャ)
// アルファ合成用

class ShaderSrc02{
	// 頂点シェーダー
	static var vert : string =
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
	static var frag : string =
		"precision lowp float;                                           \n" +
		"uniform sampler2D texture;                                      \n" +
		"varying vec2 texCoord;                                          \n" +
		"                                                                \n" +
		"void main() {                                                   \n" +
		"    vec4 fragColor = texture2D(texture, texCoord);              \n" +
		"    gl_FragColor = fragColor;                                   \n" +
		"}                                                               \n" +
	"";
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー03 (テクスチャ カラーrgb アルファテスト)
// ハコニワ地形用

class ShaderSrc03{
	// 頂点シェーダー
	static var vert : string =
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
	static var frag : string =
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
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// シェーダー04 (カラーrgba)
// スフィア地形用

class ShaderSrc04{
	// 頂点シェーダー
	static var vert : string =
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
	static var frag : string =
		"precision lowp float;                                           \n" +
		"varying vec4 color;                                             \n" +
		"                                                                \n" +
		"void main() {                                                   \n" +
		"    gl_FragColor = color;                                       \n" +
		"}                                                               \n" +
	"";
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// Tool of GL もしくは Totetero GL
// 3D Engineクラス

class ToglShader{
	var program : WebGLProgram;
	var s_pos  : int;
	var s_col  : int;
	var s_uvc  : int;
	var s_mat  : WebGLUniformLocation;
}

class Togl{
	static var gl : WebGLRenderingContext;
	static var shader : ToglShader;
	static var shader01 : ToglShader;
	static var shader02 : ToglShader;
	static var shader03 : ToglShader;
	static var shader04 : ToglShader;
	
	// -------------------------------- GL初期化 --------------------------------
	static function init(canvas : HTMLCanvasElement) : int{
		// コンテキストの取得
		var gl : WebGLRenderingContext = null;
		try{
			gl = canvas.getContext("experimental-webgl", {stencil: true}) as WebGLRenderingContext;
		}catch(e : Object){gl = null;}
		if(gl == null){return -1;}
		
		// シェーダープログラムの作成
		var ToglCreateShader = function(vssrc : string, fssrc : string) : ToglShader{
			var shader : ToglShader = new ToglShader();
			// 頂点シェーダーの作成
			var vshader : WebGLShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vshader, vssrc);
			gl.compileShader(vshader);
			// フラグメントシェーダーの作成
			var fshader : WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fshader,  fssrc);
			gl.compileShader(fshader);
			// プログラムオブジェクトを作成
			shader.program = gl.createProgram();
			gl.attachShader(shader.program, vshader);
			gl.attachShader(shader.program, fshader);
			// 頂点シェーダーとフラグメントシェーダーをリンクする
			gl.linkProgram(shader.program);
			// シェーダーパラメータ取得
			shader.s_pos = gl.getAttribLocation(shader.program, "vs_attr_pos");
			shader.s_col = gl.getAttribLocation(shader.program, "vs_attr_col");
			shader.s_uvc = gl.getAttribLocation(shader.program, "vs_attr_uvc");
			shader.s_mat = gl.getUniformLocation(shader.program, "vs_unif_mat");
			return shader;
		};
		Togl.shader01 = ToglCreateShader(ShaderSrc01.vert, ShaderSrc01.frag);
		Togl.shader02 = ToglCreateShader(ShaderSrc02.vert, ShaderSrc02.frag);
		Togl.shader03 = ToglCreateShader(ShaderSrc03.vert, ShaderSrc03.frag);
		Togl.shader04 = ToglCreateShader(ShaderSrc04.vert, ShaderSrc04.frag);
		
		// opengl描画設定
		gl.clearColor(1, 1, 1, 1);
		gl.clearDepth(1);
		gl.enable(gl.TEXTURE_2D);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		
		Togl.gl = gl;
		return 0;
	}
	
	// ----------------------------------------------------------------
	// モデル作成
	
	// VBO作成
	static function createVBO(vertices : number[]) : WebGLBuffer{
		var gl = Togl.gl;
		var vertexBuffer : WebGLBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		return vertexBuffer;
	}
	
	// IBO作成
	static function createIBO(indexes : int[]) : WebGLBuffer{
		var gl = Togl.gl;
		var indexBuffer : WebGLBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexes), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		return indexBuffer;
	}
	
	// テクスチャ作成
	static function createTexture(image : HTMLImageElement) : WebGLTexture{
		var gl = Togl.gl;
		var texture : WebGLTexture= gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}
	
	// テクスチャ作成 引数以外は上と同じ
	static function createTexture(image : HTMLCanvasElement) : WebGLTexture{
		var gl = Togl.gl;
		var texture : WebGLTexture= gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}
	
	// ----------------------------------------------------------------
	// 描画処理
	
	// 描画のクリア
	static function clear() : void{
		var gl = Togl.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	
	// 描画モード設定
	static function setMode(mode : int) : void{
		var gl = Togl.gl;
		switch(mode){
			case 0:
				// 汎用モード (VertBuf TexcBuf)
				Togl.shader = Togl.shader01;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 1:
				// 2D描画モード (VertBuf TexcBuf)
				Togl.shader = Togl.shader01;
				gl.depthMask(false);
				gl.disable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 2:
				// アルファ合成モード (VertBuf TexcBuf)
				Togl.shader = Togl.shader02;
				gl.depthMask(false);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // 加算合成
				break;
			case 3:
				// ハコニワ地形モード (VertBuf Clor3Buf TexcBuf)
				Togl.shader = Togl.shader03;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.disable(gl.BLEND);
				break;
			case 4:
				// スフィア地形モード (VertBuf Clor4Buf)
				Togl.shader = Togl.shader04;
				gl.depthMask(true);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // 半透明アルファ合成
				break;
		}
		gl.useProgram(Togl.shader.program);
	}
	
	// 行列の設定
	static function setMatrix(matrix : Float32Array) : void{
		var gl = Togl.gl;
		gl.uniformMatrix4fv(Togl.shader.s_mat, false, matrix);
	}
	
	// テクスチャを指定
	static function bindTex(texture : WebGLTexture, type : int) : void{
		var gl = Togl.gl;
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
	static function bindVertBuf(vertVBO : WebGLBuffer) : void{
		var gl = Togl.gl;
		gl.enableVertexAttribArray(Togl.shader.s_pos);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertVBO);
		gl.vertexAttribPointer(Togl.shader.s_pos, 3, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 カラーrgb
	static function bindClor3Buf(clorVBO : WebGLBuffer) : void{
		var gl = Togl.gl;
		gl.enableVertexAttribArray(Togl.shader.s_col);
		gl.bindBuffer(gl.ARRAY_BUFFER, clorVBO);
		gl.vertexAttribPointer(Togl.shader.s_col, 3, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 カラーrgba
	static function bindClor4Buf(clorVBO : WebGLBuffer) : void{
		var gl = Togl.gl;
		gl.enableVertexAttribArray(Togl.shader.s_col);
		gl.bindBuffer(gl.ARRAY_BUFFER, clorVBO);
		gl.vertexAttribPointer(Togl.shader.s_col, 4, gl.FLOAT, false, 0, 0);
	}
	
	// VBO登録 テクスチャ座標
	static function bindTexcBuf(texcVBO : WebGLBuffer) : void{
		var gl = Togl.gl;
		gl.enableVertexAttribArray(Togl.shader.s_uvc);
		gl.bindBuffer(gl.ARRAY_BUFFER, texcVBO);
		gl.vertexAttribPointer(Togl.shader.s_uvc, 2, gl.FLOAT, false, 0, 0);
	}
	
	// IBO登録 頂点インデックス
	static function bindFaceBuf(faceIBO : WebGLBuffer) : void{
		var gl = Togl.gl;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceIBO);
	}
	
	// 描画
	static function draw(offset : int, count : int) : void{
		var gl = Togl.gl;
		gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT);
	}
	
	// 四角形の描画
	static function drawTetra() : void{
		var gl = Togl.gl;
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	}
	
	// 描画の反映
	static function flush() : void{
		var gl = Togl.gl;
		gl.flush();
	}
}

// ----------------------------------------------------------------
// 良く使う部品をテンプレートとして用意する
class ToglUtil{
	static var worldmat : Float32Array;
	static var tmpmat1 : Float32Array;
	static var tmpmat2 : Float32Array;
	static var tetraVertBuffer : WebGLBuffer;
	static var tetraTexcBuffer : WebGLBuffer;
	
	// テンプレート初期化
	static function init() : void{
		ToglUtil.worldmat = mat4.create();
		ToglUtil.tmpmat1 = mat4.create();
		ToglUtil.tmpmat2 = mat4.create();
		
		var vert : number[] = new number[];
		vert.push( 0.5,  0.5, 0.0);
		vert.push(-0.5,  0.5, 0.0);
		vert.push(-0.5, -0.5, 0.0);
		vert.push( 0.5, -0.5, 0.0);
		ToglUtil.tetraVertBuffer = Togl.createVBO(vert);
		
		var texc : number[] = new number[];
		texc.push(1.0, 0.0);
		texc.push(0.0, 0.0);
		texc.push(0.0, 1.0);
		texc.push(1.0, 1.0);
		ToglUtil.tetraTexcBuffer = Togl.createVBO(texc);
	}
}

