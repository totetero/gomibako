import "js/web.jsx";

import "../../util/Ctrl.jsx";
import "../../util/Sound.jsx";
import "../../util/Drawer.jsx";
import "../../util/Loader.jsx";
import "../../util/Loading.jsx";
import "../../util/EventCartridge.jsx";
import "../../util/PartsLabel.jsx";
import "../../util/PartsButton.jsx";
import "../../util/PartsScroll.jsx";
import "../core/Page.jsx";

import "../../bb3d/Bb3dDrawEffect.jsx";
import "PageDice.jsx";
import "Bb3dDiceCharacter.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECdiceFaceBeam implements SerialEventCartridge{
	var _page : PageDice;
	var _charge : number;
	var _chara : Bb3dDiceCharacter;
	var _charas = new Bb3dDiceCharacter[];
	var _values = new int[];
	var _mode : int = 0;
	var _action : int = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageDice, response : variant){
		this._page = page;
		log response;
		this._charge = response["charge"] as number;
		this._chara = this._page.bcvs.member[response["id"] as string];
		var target = response["target"] as variant[];
		for(var i = 0; i < target.length; i++){
			this._charas[i] = this._page.bcvs.member[target[i]["id"] as string];
			this._values[i] = target[i]["value"] as int;
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		// キャンバス設定
		this._page.bcvs.isMapMode = false;
		this._page.bcvs.cameraLock = false;
		this._page.bcvs.cameraScale = 4;
		this._page.bcvs.cameraCenter = [this._chara];
		this._page.bcvs.isTapChara = false;
		this._page.bcvs.isTapHex = false;
		// クロス設定
		this._page.bust.set(null);
		this._setGauge(0);
		this._page.message.set("", "", 0);
		this._page.ctrler.setLctrl(false);
		this._page.ctrler.setRctrl("", "", "", "スキップ");
		// トリガーリセット
		Ctrl.trigger_s = false;

		// キャラクターが向き合う
		if(this._charas.length > 0){
			var r = Math.atan2(this._charas[0].y - this._chara.y, this._charas[0].x - this._chara.x);
			this._chara.r = r;
			for(var i = 0; i < this._charas.length; i++){
				this._charas[i].r = r + Math.PI;
			}
		}
	}

	// ----------------------------------------------------------------
	// ゲージ設定
	function _setGauge(frame : int) : void{
		var chara0 = this._chara;
		if(this._charas.length > 0){
			var chara1 = this._charas[0];
			if(chara1.side == "player" && chara0.side != "player"){
				this._page.gauge.setLeft(chara1, frame);
				this._page.gauge.setRight(chara0, frame);
			}else{
				this._page.gauge.setLeft(chara0, frame);
				this._page.gauge.setRight(chara1, frame);
			}
		}else{
			this._page.gauge.setLeft(chara0, frame);
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		var bcvs = this._page.bcvs;

		// スキップチェック
		if((this._mode == 0 || this._mode == 1) && Ctrl.trigger_s){
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
				bcvs.pushEffect(new Bb3dDrawEffectBeam(x, y, 10, charge * 3));
				bcvs.setMaskColor("rgba(0, 0, 0, " + (charge * 0.4) + ")");
				if(charge >= this._charge){
					this._mode = 1;
					this._action = 0;
				}
				break;
			case 1:
				// アクションビーム
				if(this._action == 0){
					this._chara.motion = "beam";
					if(this._charas.length > 0){bcvs.cameraCenter = this._charas;}
				}
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
					var rotateRatio = 1 - Math.abs(bcvs.sinh * Math.sin(this._chara.r + bcvs.rotv));
					var num = Math.ceil(rotateRatio * length / (size * 3));
					var r = (length - margin) / num;
					var c = Math.cos(this._chara.r);
					var s = Math.sin(this._chara.r);
					for(var i = 0; i < num; i++){
						var x = this._chara.x + (margin + i * r) * c;
						var y = this._chara.y + (margin + i * r) * s;
						bcvs.pushEffect(new Bb3dDrawEffectBeam(x, y, 10, size));
					}
					// エフェクト
					bcvs.setMaskColor("rgba(0, 0, 0, " + (0.5 + 0.03 * size) + ")");
					for(var i = 0; i < this._charas.length; i++){
						if(size > 0.4 && this._action % 10 == 0){
							bcvs.pushEffect(new Bb3dDrawEffectHopImage(this._charas[i].x, this._charas[i].y));
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
					bcvs.setMaskColor("");
					this._chara.motion = "stand";
					if(this._charas.length > 0){bcvs.cameraCenter = this._charas;}
					// テスト
					for(var i = 0; i < this._charas.length; i++){
						this._charas[i].hp -= this._values[i];
						bcvs.pushEffect(new Bb3dDrawEffectHopNumber(this._values[i] as string, this._charas[i].x, this._charas[i].y));
					}
					this._setGauge(-1);
					// コントローラーを隠す
					this._page.ctrler.setRctrl("", "", "", "");
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
					this._mode = 4;
				}
				break;
			case 4:
				return false;
		}
		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function draw() : void{
		this._page.drawBeforeCross();
		this._page.drawAfterCross();
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

