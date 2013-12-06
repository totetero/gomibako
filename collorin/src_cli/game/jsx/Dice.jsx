import 'js/web.jsx';

import 'Main.jsx';
import 'Ctrl.jsx';
import 'Status.jsx';
import 'EventCartridge.jsx';

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ管理クラス
class ECdice extends EventCartridge{
	static var self : ECdice;
	var _zfunc : function(:int):void;
	var _xfunc : function():void;

	var _dice : DrawDice;
	var _rotq1 : number[];
	var _rotq2 : number[];
	var _mode : int = 0;
	var _action : int = 0;
	var _pip : int = 0;

	// コンストラクタ
	function constructor(zfunc : function(:int):void, xfunc : function():void){
		this._zfunc = zfunc;
		this._xfunc = xfunc;
	}

	// 初期化
	override function init() : void{
		ECdice.self = this;
		// さいころ初期化
		this._dice = new DrawDice(40);
		this._dice.x = 80;
		this._dice.y = 80;
		this._dice.h = 0;
		this._dice.setRandomQuat();
		// さいころ回転のクオータニオン
		this._rotq1 = new number[];
		this._rotq2 = new number[];
		this._dice.setQuat(this._rotq1, 1, 0, 0, -0.4);
		this._dice.setQuat(this._rotq2, 1, 0, 0, 0.4 * 20);
		// ボタンの設定
		Status.setBtn(-1, "投げる", "戻る", "", "");
		Cbtn.trigger_z = false;
		Cbtn.trigger_x = false;
	}

	// 破棄
	function _dispose() : boolean{
		ECdice.self = null;
		return false;
	}

	// さいころ目の回転設定
	function _setPipRot() : void{
		switch(this._pip){
			case 1: this._dice.setQuat(this._dice.rotq, 1, 0, 0, Math.PI *  0.5); break;
			case 2: this._dice.setQuat(this._dice.rotq, 1, 0, 0, Math.PI *  1  ); break;
			case 3: this._dice.setQuat(this._dice.rotq, 0, 0, 1, Math.PI * -0.5); break;
			case 4: this._dice.setQuat(this._dice.rotq, 0, 0, 1, Math.PI *  0.5); break;
			case 5: this._dice.setQuat(this._dice.rotq, 1, 0, 0, Math.PI *  0  ); break;
			case 6: this._dice.setQuat(this._dice.rotq, 1, 0, 0, Math.PI * -0.5); break;
		}
		var q1 = new number[];
		this._dice.setQuat(q1, 0, 1, 0, Math.random() * Math.PI * 2);
		this._dice.multiQuat(this._dice.rotq, q1, this._dice.rotq);
	}

	// 計算
	override function calc() : boolean{
		if(this._pip > 0 && Cbtn.trigger_x && this._mode != 5){
			// 通信完了後のスキップ
			this._mode = 5;
			this._action = 0;
			this._setPipRot();
			this._dice.x = 80 - 2.7 * 60;
			this._dice.y = 80 - 2.7 * 60;
			this._dice.h = 0;
			this._dice.action = 0;
			Status.setBtn(-1, "", "", "", "");
		}

		switch(this._mode){
			case 0:
				// 投げる待ち
				this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);
				// ボタン確認
				if(Cbtn.trigger_z){
					// 投げるボタン
					this._mode = 1;
					this._action = 0;
					Status.setBtn(-1, "", "", "", "");
					// 通信を行う
					Main.loadxhr("/dice", "", function(resp : string) : void{
						this._pip = JSON.parse(resp)["pip"] as int;
						// スキップの設定
						Status.setBtn(-1, "", "スキップ", "", "");
						Cbtn.trigger_x = false;
					}, function() : void{
						this._pip = -1;
					});
				}else if(Cbtn.trigger_x){
					// キャンセルボタン
					this._xfunc();
					return this._dispose();
				}
				break;
			case 1:
				// 1回めジャンプ
				if(this._action++ < 20){
					this._dice.x -= 2.7;
					this._dice.y -= 2.7;
					this._dice.h = 200 * Math.sin(this._action / 20 * Math.PI);
					this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);
				}else{
					this._mode = 2;
					this._action = 0;
					this._dice.setRandomQuat();
				}
				break;
			case 2:
				// 2回めジャンプ
				if(this._action++ < 20){
					this._dice.x -= 2.7;
					this._dice.y -= 2.7;
					this._dice.h = 100 * Math.sin(this._action / 20 * Math.PI);
					this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);
				}else{
					this._mode = 3;
					this._action = 0;
					this._dice.setRandomQuat();
				}
				break;
			case 3:
				// 通信待機ジャンプ
				if(this._action == 0 && this._pip > 0){
					// 通信成功時
					this._mode = 4;
					this._action = 0;
					this._setPipRot();
					this._dice.multiQuat(this._dice.rotq, this._rotq2, this._dice.rotq);
				}else if(this._pip < 0){
					// 通信失敗時
					this._xfunc();
					return this._dispose();
				}else if(this._action++ < 20){
					this._dice.h = 100 * Math.sin(this._action / 20 * Math.PI);
					this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);
				}else{
					this._mode = 3;
					this._action = 0;
					this._dice.setRandomQuat();
				}
				break;
			case 4:
				// 最後のジャンプ
				if(this._action++ < 20){
					this._dice.x -= 2.7;
					this._dice.y -= 2.7;
					this._dice.h = 50 * Math.sin(this._action / 20 * Math.PI);
					this._dice.multiQuat(this._dice.rotq, this._rotq1, this._dice.rotq);
				}else{
					this._mode = 5;
					this._action = 0;
					Status.setBtn(-1, "", "", "", "");
				}
				break;
			case 5:
				// 目を見せる
				if(++this._action >= 20){
					this._zfunc(this._pip);
					return this._dispose();
				}
				break;
		}
		return true;
	}

	// 描画
	static function drawDice() : void{
		if(ECdice.self != null){
			// 描画の中心位置をキャンバス中心に設定
			Ccvs.context.save();
			Ccvs.context.translate(Ccvs.canvas.width * 0.5, Ccvs.canvas.height * 0.5);
			// 描画
			ECdice.self._dice.draw();
			// 描画の中心位置を戻す
			Ccvs.context.restore();
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// さいころ描画クラス
class DrawDice{
	var _pos0 : number[][];
	var _pos1 : number[][];
	var _size : number;

	var _canvas : HTMLCanvasElement;
	var _context : CanvasRenderingContext2D;

	var x : number = 0;
	var y : number = 0;
	var h : number = 0;
	var rotq = [1, 0, 0, 0];
	var action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(size : number){
		// オフスクリーンcanvasの準備
		this._canvas = dom.document.createElement("canvas") as HTMLCanvasElement;
		this._context = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		this._canvas.width = size * 2;
		this._canvas.height = size * 2;

		// サイコロ頂点を作成
		var s = 0.2;
		this._pos0 = [
			[0, 0, 1 + s], [0, 1, 1 + s], [1, 1, 1 + s], [1, 0, 1 + s],
			[0, 0, 0 - s], [1, 0, 0 - s], [1, 1, 0 - s], [0, 1, 0 - s],
			[0, 1 + s, 0], [1, 1 + s, 0], [1, 1 + s, 1], [0, 1 + s, 1],
			[0, 0 - s, 0], [0, 0 - s, 1], [1, 0 - s, 1], [1, 0 - s, 0],
			[1 + s, 0, 0], [1 + s, 0, 1], [1 + s, 1, 1], [1 + s, 1, 0],
			[0 - s, 0, 0], [0 - s, 1, 0], [0 - s, 1, 1], [0 - s, 0, 1]
		];
		// サイコロ頂点を原点中心の最大座標0.5に正規化する
		for(var i = 0; i < this._pos0.length; i++){
			for(var j = 0; j < this._pos0[i].length; j++){
				this._pos0[i][j] = (this._pos0[i][j] - 0.5) / (1 + s);
			}
		}
		// 座標変換後用の配列を作成
		this._pos1 = new number[][];
		for(var i = 0; i < this._pos0.length; i++){this._pos1[i] = new number[];}
		// サイコロの大きさ
		this._size = size;
	}

	// ----------------------------------------------------------------
	// クオータニオン作成関数 回転軸と回転角度から回転のクオータニオンを生成する
	function setQuat(quat : number[], x : number, y : number, z : number, rot : number) : void{
		var r = x * x + y * y + z * z;
		if(r == 0){x = r = 1; y = z = 0;}
		var s = Math.sin(rot * 0.5) / Math.sqrt(r);
		quat[0] = x * s;
		quat[1] = y * s;
		quat[2] = z * s;
		quat[3] = Math.cos(rot * 0.5);
	}

	// ----------------------------------------------------------------
	// クオータニオン掛け合わせ関数
	function multiQuat(q0 : number[], q1 : number[], q2 : number[]) : void{
		var qax = q1[0]; var qay = q1[1]; var qaz = q1[2]; var qaw = q1[3];
		var qbx = q2[0]; var qby = q2[1]; var qbz = q2[2]; var qbw = q2[3];
		q0[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		q0[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		q0[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		q0[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
	}

	// ----------------------------------------------------------------
	// クオータニオン設定関数 ランダムな回転のクオータニオンを設定する
	function setRandomQuat() : void{
		this.setQuat(this.rotq, Math.random(), Math.random(), Math.random(), Math.random() * Math.PI * 2);
	}

	// ----------------------------------------------------------------
	// 描画
	function draw() : void{
		// 影描画
		Ccvs.context.save();
		Ccvs.context.fillStyle = "rgba(0, 0, 0, 0.5)";
		Ccvs.context.translate(this.x, this.y);
		Ccvs.context.scale(1, Ccvs.sinh);
		Ccvs.context.beginPath();
		Ccvs.context.arc(0, 0, this._size * 0.75, 0, Math.PI*2, false);
		Ccvs.context.fill();
		Ccvs.context.restore();

		// さいころ描画
		if((this.action++ % 3) == 0){
			// 回転クォータニオンに視角をかける
			var rq = new number[];
			this.setQuat(rq, 1, 0, 0, Ccvs.roth);
			this.multiQuat(rq, rq, this.rotq);

			// 各頂点座標にクォータニオン回転の適用
			var pos = this._pos1;
			for(var i = 0; i < this._pos0.length; i++){
				var x = this._pos0[i][0];
				var y = this._pos0[i][1];
				var z = this._pos0[i][2];
				var ix =  rq[3] * x + rq[1] * z - rq[2] * y;
				var iy =  rq[3] * y + rq[2] * x - rq[0] * z;
				var iz =  rq[3] * z + rq[0] * y - rq[1] * x;
				var iw = -rq[0] * x - rq[1] * y - rq[2] * z;
				pos[i][0] = ix * rq[3] - iw * rq[0] - iy * rq[2] + iz * rq[1];
				pos[i][1] = iy * rq[3] - iw * rq[1] - iz * rq[0] + ix * rq[2];
				pos[i][2] = iz * rq[3] - iw * rq[2] - ix * rq[1] + iy * rq[0];
			}

			this._context.save();
			this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
			this._context.translate(this._canvas.width * 0.5, this._canvas.height * 0.5);
			this._context.scale(this._size, this._size);
			for(var i = 0; i < 2; i++){
				var lineFlag = (i == 0);
				var type = lineFlag ? -1 : 0;
				// 面描画
				this.drawPolygon(lineFlag ? -1 : 1, pos[ 0], pos[ 1], pos[ 2], pos[ 3]);
				this.drawPolygon(lineFlag ? -1 : 6, pos[ 4], pos[ 5], pos[ 6], pos[ 7]);
				this.drawPolygon(lineFlag ? -1 : 2, pos[ 8], pos[ 9], pos[10], pos[11]);
				this.drawPolygon(lineFlag ? -1 : 5, pos[12], pos[13], pos[14], pos[15]);
				this.drawPolygon(lineFlag ? -1 : 3, pos[16], pos[17], pos[18], pos[19]);
				this.drawPolygon(lineFlag ? -1 : 4, pos[20], pos[21], pos[22], pos[23]);
				// 頂点の三角形
				this.drawPolygon(type, pos[ 0], pos[13], pos[23], null);
				this.drawPolygon(type, pos[ 1], pos[22], pos[11], null);
				this.drawPolygon(type, pos[ 2], pos[10], pos[18], null);
				this.drawPolygon(type, pos[ 3], pos[17], pos[14], null);
				this.drawPolygon(type, pos[ 4], pos[20], pos[12], null);
				this.drawPolygon(type, pos[ 5], pos[15], pos[16], null);
				this.drawPolygon(type, pos[ 6], pos[19], pos[ 9], null);
				this.drawPolygon(type, pos[ 7], pos[ 8], pos[21], null);
				// 側面の四角形
				this.drawPolygon(type, pos[ 1], pos[ 0], pos[23], pos[22]);
				this.drawPolygon(type, pos[ 2], pos[ 1], pos[11], pos[10]);
				this.drawPolygon(type, pos[ 3], pos[ 2], pos[18], pos[17]);
				this.drawPolygon(type, pos[ 0], pos[ 3], pos[14], pos[13]);
				this.drawPolygon(type, pos[ 5], pos[ 4], pos[12], pos[15]);
				this.drawPolygon(type, pos[ 6], pos[ 5], pos[16], pos[19]);
				this.drawPolygon(type, pos[ 7], pos[ 6], pos[ 9], pos[ 8]);
				this.drawPolygon(type, pos[ 4], pos[ 7], pos[21], pos[20]);
				this.drawPolygon(type, pos[10], pos[ 9], pos[19], pos[18]);
				this.drawPolygon(type, pos[ 8], pos[11], pos[22], pos[21]);
				this.drawPolygon(type, pos[13], pos[12], pos[20], pos[23]);
				this.drawPolygon(type, pos[15], pos[14], pos[17], pos[16]);
			}
			this._context.restore();
		}
		var x = this.x - this._canvas.width * 0.5;
		var y = this.y - this._canvas.height * 0.5 - (this.h + this._size * 0.5) * Ccvs.cosh;
		Ccvs.context.drawImage(this._canvas, x, y);
	}

	// 面を描画する関数
	function drawPolygon(type : int, top0 : number[], top1 : number[], top2 : number[], top3 : number[]) : void{
		// カリング(隠面消去)
		var x1 = top1[0] - top0[0];
		var y1 = top1[1] - top0[1];
		var x2 = top2[0] - top0[0];
		var y2 = top2[1] - top0[1];
		var cz = x1 * y2 - y1 * x2;
		if(cz < 0){return;}

		if(type < 0){
			// 描画順により枠線になる面の描画
			var scale = 1.05;
			this._context.fillStyle = "#000";
			this._context.beginPath();
			this._context.moveTo(top0[0] * scale, top0[1] * scale);
			this._context.lineTo(top1[0] * scale, top1[1] * scale);
			this._context.lineTo(top2[0] * scale, top2[1] * scale);
			if(top3 != null){this._context.lineTo(top3[0] * scale, top3[1] * scale);}
			this._context.closePath();
			this._context.fill();
		}else{
			// 環境光と反射光
			var z1 = top1[2] - top0[2];
			var z2 = top2[2] - top0[2];
			var cx = y1 * z2 - z1 * y2;
			var cy = z1 * x2 - x1 * z2;
			var cr = Math.sqrt(cx * cx + cy * cy + cz * cz);
			var dot = (cx * 0 + cy * 0.5 + cz * 0.87) / cr;
			var light = Math.min(255, 150 + 200 * dot) as int;
			var color = "rgb(" + light + "," + light + "," + light + ")";
			this._context.fillStyle = color;

			if(type > 0){
				// 面の描画
				// 参考 最速チュパカブラ研究会 2009年2月11日の日記(http://d.hatena.ne.jp/gyuque/20090211)
				var u0 = ((type - 1) % 3) * 32;
				var v0 = (((type - 1) / 3) as int) * 32;
				var u1 = u0 + 0;
				var v1 = v0 + 0;
				var u2 = u0 + 0;
				var v2 = v0 + 32;
				var u3 = u0 + 32;
				var v3 = v0 + 32;
				var uv11 = u2 - u1;
				var uv12 = v2 - v1;
				var uv21 = u3 - u1;
				var uv22 = v3 - v1;
				var det = uv11 * uv22 - uv12 * uv21;
				if (-0.0001 < det && det < 0.0001){return;}
				var	uv11d = uv22 / det;
				var uv22d = uv11 / det;
				var uv12d = -uv12 / det;
				var uv21d = -uv21 / det;
				var t11 = uv11d * x1 + uv12d * x2;
				var t21 = uv11d * y1 + uv12d * y2;
				var t12 = uv21d * x1 + uv22d * x2;
				var t22 = uv21d * y1 + uv22d * y2;
				var t13 = top0[0] - (t11 * u1 + t12 * v1);
				var t23 = top0[1] - (t21 * u1 + t22 * v1);
				var uw0 = u1 < u2 ? u1 : u2; uw0 = uw0 < u3 ? uw0 : u3;
				var uw1 = u1 > u2 ? u1 : u2; uw1 = uw1 > u3 ? uw1 : u3;
				var vh0 = v1 < v2 ? v1 : v2; vh0 = vh0 < v3 ? vh0 : v3;
				var vh1 = v1 > v2 ? v1 : v2; vh1 = vh1 > v3 ? vh1 : v3;
				uw1 = uw1 - uw0;
				vh1 = vh1 - vh0;
				this._context.save();
				this._context.beginPath();
				this._context.moveTo(top0[0], top0[1]);
				this._context.lineTo(top1[0], top1[1]);
				this._context.lineTo(top2[0], top2[1]);
				this._context.lineTo(top3[0], top3[1]);
				this._context.closePath();
				this._context.clip();
				this._context.transform(t11, t21, t12, t22, t13, t23);
				this._context.fill();
				this._context.drawImage(Main.imgs["dice"], uw0, vh0, uw1, vh1, uw0, vh0, uw1, vh1);
				this._context.restore();
			}else{
				// 辺と頂点の描画
				this._context.beginPath();
				this._context.moveTo(top0[0], top0[1]);
				this._context.lineTo(top1[0], top1[1]);
				this._context.lineTo(top2[0], top2[1]);
				if(top3 != null){this._context.lineTo(top3[0], top3[1]);}
				this._context.closePath();
				this._context.fill();
			}
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

