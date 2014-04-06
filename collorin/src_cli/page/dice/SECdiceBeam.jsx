import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Ctrl.jsx";
import "../../bb3d/DrawEffect.jsx";
import "../core/Transition.jsx";

import "DicePage.jsx";
import "DiceCharacter.jsx";
import "PECdiceGauge.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceBeam extends EventCartridge{
	var _page : DicePage;
	var _charge : number;
	var _chara : DiceCharacter;
	var _charas : DiceCharacter[];
	var _values : int[];
	var _mode : int = 0;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : DicePage, response : variant){
		this._page = page;
		this._charge = 0.1;
		this._chara = this._page.ccvs.member[response["id0"] as string];
		this._charas = [this._page.ccvs.member[response["id1"] as string]];
		this._values = [response["value"] as int];
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : boolean{
		// 中心キャラクター設定
		this._page.ccvs.center = [this._chara];
		// トリガーリセット
		Ctrl.trigger_xb = false;
		// コントローラーを表示
		this._page.parallelPush(new PECopenLctrl(false));
		this._page.parallelPush(new PECopenRctrl("", "スキップ", "", ""));
		this._page.parallelPush(new PECopenCharacter("", ""));
		this._setGauge(-1);
		return false;
	}

	// ----------------------------------------------------------------
	// ゲージ設定
	function _setGauge(time : int) : void{
		this._page.parallelPush(new PECdicePlayerGauge(this._page, this._chara, time));
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var ccvs = this._page.ccvs;
		var exist = true;

		// キャンバス計算
		ccvs.calc(true, (this._mode == 0) ? 2 : 0, null, null);

		// スキップチェック
		if((this._mode == 0 || this._mode == 1) && Ctrl.trigger_xb){
			this._mode = 2;
			this._action = 0;
		}

		switch(this._mode){
			case 0:
				// アクションチャージ
				this._chara.motion = "charge";
				var x = this._chara.x + 10 * Math.cos(this._chara.r - Math.PI * 0.4);
				var y = this._chara.y + 10 * Math.sin(this._chara.r - Math.PI * 0.4);
				var charge = ++this._action / 90;
				this._page.ccvs.pushEffect(new DrawEffectBeam(x, y, 10, charge * 3));
				ccvs.setMaskColor("rgba(0, 0, 0, " + (charge * 0.4) + ")");
				if(charge >= this._charge){
					this._mode = 1;
					this._action = 0;
				}
				break;
			case 1:
				// アクションビーム
				this._chara.motion = "beam";
				// ビームの太さ
				var size = 0;
				if(this._charge < 0.2){size = Math.min(3, Math.max(0.3, this._action - 0)) + Math.min(0, 40 - this._action);}
				else if(this._charge < 0.8){size = Math.min(6, Math.max(0.3, this._action - 5)) + Math.min(0, 50 - this._action);}
				else{size = Math.min(10, Math.max(0.3, this._action - 10)) + Math.min(0, 60 - this._action);}
				this._action++;
				if(size > 0){
					// ビーム
					var length = 400;
					var margin = 15 + size;
					var rotateRatio = 1 - Math.abs(ccvs.sinh * Math.sin(this._chara.r + ccvs.rotv));
					var num = Math.ceil(rotateRatio * length / (size * 3));
					var r = (length - margin) / num;
					var c = Math.cos(this._chara.r);
					var s = Math.sin(this._chara.r);
					for(var i = 0; i < num; i++){
						var x = this._chara.x + (margin + i * r) * c;
						var y = this._chara.y + (margin + i * r) * s;
						this._page.ccvs.pushEffect(new DrawEffectBeam(x, y, 10, size));
					}
					// エフェクト
					ccvs.setMaskColor("rgba(0, 0, 0, " + (0.5 + 0.03 * size) + ")");
					for(var i = 0; i < this._charas.length; i++){
						if(size > 0.4 && this._action % 10 == 0){
							this._page.ccvs.pushEffect(new DrawEffectHopImage(this._charas[i].x, this._charas[i].y));
						}
					}
				}else{
					this._mode = 2;
					this._action = 0;
				}
				break;
			case 2:
				// アクションダメージ
				if(this._action == 0){
					ccvs.setMaskColor("");
					this._chara.motion = "stand";
					this._page.ccvs.center = this._charas;
					for(var i = 0; i < this._charas.length; i++){
						this._page.ccvs.pushEffect(new DrawEffectHopNumber(this._values[i] as string, this._charas[i].x, this._charas[i].y));
					}
					// コントローラーを隠す
					this._page.parallelPush(new PECopenRctrl("", "", "", ""));
				}
				for(var i = 0; i < this._charas.length; i++){
					this._charas[i].motion = "damage";
					this._charas[i].action = this._action;
				}
				if(++this._action >= 10){
					this._mode = 3;
					this._action = 0;
				}
				break;
			case 3:
				// アクション完了後
				if(this._action == 0){
					for(var i = 0; i < this._charas.length; i++){
						this._charas[i].motion = "stand";
					}
				}
				if(++this._action >= 10){
					exist = false;
				}
				break;

		}

		// キャンバス描画
		this._page.ccvs.draw();
		return exist;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
		this._setGauge(90);
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

