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

import "../core/data/chara/DataChara.jsx";
import "../core/data/chara/PartsButtonDataChara.jsx";
import "../core/data/chara/SECpopupDataChara.jsx";
import "../core/data/chara/SECpopupDataCharaPicker.jsx";
import "../core/load/SECload.jsx";
import "../core/popup/SECpopupPicker.jsx";
import "../core/popup/SECpopupTextarea.jsx";
import "PageChara.jsx";
import "SECcharaTab.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクター編成タブカートリッジ
class SECcharaTabTeam extends SECcharaTab{
	var _scroller : PartsScroll;
	var charaList : PartsButtonDataChara[];
	var sortPicker : SECpopupPicker;

	var maxCharaNum : int;
	// パートナーデータ
	var _partner : PartsButtonDataChara;
	// チームデータ
	var _teams : SECcharaTabTeam._Team[];

	var charaPickerScrolly = 0;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : PageChara, response : variant){
		super(page, "team");

		// スクローラ作成
		this._scroller = new PartsScroll(SECcharaTab.tabWidth, 50, 0, 0, 0, 0);
		// ラベル設定
		this._scroller.labList["partner"] = new PartsLabel("パートナー", 40, 10, 150, 20);
		this._scroller.labList["partner"].setAlign("left");

		// ピッカー作成
		this.sortPicker = new SECpopupPicker(this.page, null, "並べ替え", [
			new SECpopupPickerItem("level", "レベル順"),
			new SECpopupPickerItem("team", "チーム順"),
			new SECpopupPickerItem("favorite", "ファボ順"),
			new SECpopupPickerItem("type", "種類順"),
			new SECpopupPickerItem("new", "新着順"),
		]);
		this.sortPicker.setSelectedItem("level");

		// データ形成
		this.parse(response);
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		if(list != null){
			this.charaList = new PartsButtonDataChara[];
			for(var i = 0; i < list.length; i++){
				this.charaList.push(new PartsButtonDataChara(0, 0, list[i]));
			}
		}
		this.maxCharaNum = response["max"] as int;

		// キャラクターリストの一部設定リセット
		for(var i = 0; i < this.charaList.length; i++){
			var chara = this.charaList[i];
			chara.partner = false;
			chara.sortTeam = 65535;
			chara.inactive = false;
		}

		// パートナーデータ読み取り
		var partnerId = response["partner"] as string;
		for(var i = 0; i < this.charaList.length; i++){
			if(this.charaList[i].data.id == partnerId){
				this._partner = new PartsButtonDataChara(this.charaList[i]);
				this._partner.basey = 40;
				this._partner.partner = false;
				this._partner.sortTeam = 0;
				// キャラクターリストのパートナーアイコン設定
				this.charaList[i].partner = true;
				break;
			}
		}

		// チームデータ読み取り
		var teams = response["teams"] as variant[];
		this._teams = new SECcharaTabTeam._Team[];
		for(var i = 0; i < teams.length; i++){
			var team = new SECcharaTabTeam._Team();
			team.id = teams[i]["id"] as string;
			team.lock = teams[i]["lock"] as boolean;
			var name = teams[i]["name"] as string;
			var command = "type=teamName&teamId=" + team.id;
			team.name = new SECcharaTabTeamPopupName(this.page, this, command, name);
			var memberIds = teams[i]["members"] as string[];
			for(var j = 0; j < memberIds.length; j++){
				var member : PartsButtonDataChara = null;
				for(var k = 0; k < this.charaList.length; k++){
					var chara = this.charaList[k];
					if(chara.data.id == memberIds[j]){
						member = new PartsButtonDataChara(chara);
						member.partner = (this._partner.data == member.data);
						member.sortTeam = 65535;
						var sortTeam = (i + 1) * 128 + j;
						// パートナーの設定
						if(member.partner){this._partner.sortTeam = sortTeam;}
						// キャラクターリストの設定
						chara.sortTeam = sortTeam;
						if(team.lock){chara.inactive = true;}
						break;
					}
				}
				if(member == null){member = new PartsButtonDataChara(0, 0);}
				member.inactive = team.lock;
				team.members[j] = member;
			}
			this._teams.push(team);
		}

		// スクローラボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		this._scroller.btnList["pbox"] = this._partner;
		this._scroller.btnList["face0"] = this._partner.faceBtn;
		for(var i = 0; i < this._teams.length; i++){
			var nameBtn = this._teams[i].name.createButton(40, 0, 160, 24);
			nameBtn.inactive = this._teams[i].lock;
			this._scroller.btnList["t" + i + "name"] = nameBtn;
			for(var j = 0; j < this._teams[i].members.length; j++){
				var member = this._teams[i].members[j];
				this._scroller.btnList["t" + i + "m" + j + "box"] = member;
				if(member.data != null){this._scroller.btnList["t" + i + "m" + j + "face"] = member.faceBtn;}
			}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		super.init();
		// トリガーリセット
		for(var name in this._scroller.btnList){this._scroller.btnList[name].trigger = false;}
	}

	// ----------------------------------------------------------------
	// 計算
	override function tabCalc() : boolean{
		this._scroller.calc(true);

		// パートナー選択ポップアップボタン処理
		if(this._partner.trigger){
			Sound.playSE("ok");
			var id = this._partner.data.id;
			var command = "type=partner";
			this.page.serialPush(new SECcharaTabTeamPopupDataCharaPicker(this.page, this, "パートナー選択", command, id));
			return false;
		}

		// パートナー情報ポップアップボタン処理
		if(this._partner.faceBtn.trigger){
			Sound.playSE("ok");
			this.page.serialPush(new SECpopupDataChara(this.page, this, this._partner.data));
			return false;
		}

		// チームボタン処理
		for(var i = 0; i < this._teams.length; i++){
			// チーム名ボタン
			var btn = this._scroller.btnList["t" + i + "name"];
			if(btn.trigger){
				Sound.playSE("ok");
				this.page.serialPush(this._teams[i].name);
				return false;
			}

			for(var j = 0; j < this._teams[i].members.length; j++){
				var member = this._teams[i].members[j];

				// メンバー択ポップアップボタン処理
				if(member.trigger){
					Sound.playSE("ok");
					var id = member.data != null ? member.data.id : "";
					var command = "type=teamMember&teamId=" + this._teams[i].id + "&index=" + j;
					this.page.serialPush(new SECcharaTabTeamPopupDataCharaPicker(this.page, this, "メンバー選択", command, id));
					return false;
				}

				// メンバー情報ポップアップ
				if(member.data != null && member.faceBtn.trigger){
					Sound.playSE("ok");
					this.page.serialPush(new SECpopupDataChara(this.page, this, member.data));
					return false;
				}
			}
		}

		return true;
	}

	// ----------------------------------------------------------------
	// 描画
	override function tabDraw() : void{
		// ウインドウサイズに対する位置調整
		this._scroller.cw = Ctrl.screen.w - this._scroller.x;
		this._scroller.ch = Ctrl.screen.h - this._scroller.y;
		var itemw = this._partner.w;
		var rowNum = Math.floor((this._scroller.cw - 10) / (itemw + 10));
		var colNum = 4 - rowNum;
		var teamHeight = 2 + 44 + 70 * colNum;
		this._scroller.sh = 110 + teamHeight * this._teams.length;
		// パートナー位置調整
		var cx = this._partner.basex = (this._scroller.cw - ((itemw + 10) * rowNum - 10)) * 0.5;
		for(var i = 0; i < this._teams.length; i++){
			// チーム名位置調整
			this._scroller.btnList["t" + i + "name"].basey = 110 + 2 + 10 + teamHeight * i;
			for(var j = 0; j < this._teams[i].members.length; j++){
				// チームメンバー位置調整
				var member = this._teams[i].members[j];
				member.basex = cx + (itemw + 10) * (j % rowNum);
				member.basey = 110 + 2 + 44 + 70 * Math.floor(j / rowNum) + teamHeight * i;
			}
		}

		// スクローラー描画
		this._scroller.draw(function() : void{
			// パートナーマーク
			var img = Loader.imgs["img_system_character_partner"];
			if(this._scroller.isDrawClip(10, 10, 20, 20)){Ctrl.sctx.drawImage(img, 10, 10, 20, 20);}

			Ctrl.sctx.fillStyle = "black";
			for(var i = 0; i < this._teams.length; i++){
				// 区切り線
				var y = 110 + teamHeight * i;
				var w = this._scroller.cw - 20;
				if(this._scroller.isDrawClip(10, y, w, 2)){Ctrl.sctx.fillRect(10, y, w, 2);}
				// チームマーク
				var y = 110 + 2 + 10 + 2 + teamHeight * i;
				var img = Loader.imgs["img_system_character_team" + (i + 1)];
				if(img != null && this._scroller.isDrawClip(10, y, 20, 20)){Ctrl.sctx.drawImage(img, 10, y, 20, 20);}
			}
		}, SECcharaTab.tabWidth, 0, Ctrl.screen.w - SECcharaTab.tabWidth, Ctrl.screen.h);
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}

	// ----------------------------------------------------------------
	// チームデータクラス
	class _Team{
		var id : string;
		var lock : boolean;
		var name : SECcharaTabTeamPopupName;
		var members = new PartsButtonDataChara[];
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクタ選択のピッカーポップアップ
class SECcharaTabTeamPopupDataCharaPicker extends SECpopupDataCharaPicker{
	var _cartridgeTabTeam : SECcharaTabTeam;
	var _command : string;
	var _prevId : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SECcharaTabTeam, title : string, command : string, id : string){
		super(page, cartridge, title, cartridge.charaList, cartridge.sortPicker, cartridge.maxCharaNum, (command.indexOf("partner") < 0 && id != ""), cartridge.charaPickerScrolly);
		this._cartridgeTabTeam = cartridge;
		this._command = command;
		this._prevId = id;

		// キャラクターリスト選択状態
		var cList = this._cartridgeTabTeam.charaList;
		for(var i = 0; i < cList.length; i++){cList[i].select = (cList[i].data.id == id);}
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(id : string) : void{
		if(this._prevId != id){
			var url = "/chara/team?" + this._command + "&charaId=" + id;
			this.page.serialPush(new SECload(this, url, null, function(response : variant) : void{
				this._cartridgeTabTeam.parse(response);
			}));
		}
	}

	// ----------------------------------------------------------------
	// 閉じるときの動作 継承用
	override function onClose(scrolly : int) : void{
		this._cartridgeTabTeam.charaPickerScrolly = scrolly;
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// チーム名変更のテキストエリア
class SECcharaTabTeamPopupName extends SECpopupTextarea{
	var _cartridgeTabTeam : SECcharaTabTeam;
	var _command : string;
	var _prevName : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : Page, cartridge : SECcharaTabTeam, command : string, name : string){
		super(page, cartridge, "チーム名", 16);
		this.setValue(name);
		this._cartridgeTabTeam = cartridge;
		this._command = command;
		this._prevName = name;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		if(this._prevName != value){
			var url = "/chara/team?" + this._command + "&name=" + value;
			this.page.serialPush(new SECload(this, url, null, function(response : variant) : void{
				this._cartridgeTabTeam.parse(response);
			}));
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

