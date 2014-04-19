import "js/web.jsx";

import "../../util/EventCartridge.jsx";
import "../../util/Sound.jsx";
import "../core/Page.jsx";
import "../core/PartsButton.jsx";
import "../core/PartsScroll.jsx";
import "../core/PartsCharacter.jsx";
import "../core/SECload.jsx";
import "../core/SECpopupMenu.jsx";
import "../core/SECpopupPicker.jsx";
import "../core/SECpopupCharacterPicker.jsx";
import "../core/SECpopupTextarea.jsx";

import "CharaPage.jsx";

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

class SECcharaTabTeam extends EventCartridge{
	// HTMLタグ
	static const _htmlTag = """
		<div class="scrollContainerContainer">
			<div class="scrollContainer">
				<div class="scroll">
					<div style="width:230px;margin:20px;margin-top:52px;font-size:12px;">
						•編成について<br>
						マイページで表示するリーダーの設定と、
						ステージで使用する3人までのチームを設定することができる。
						<br><br>
						•補給について<br>
						補給タブではSP回復アイテムを消費することによってSPを回復することができる。
						SPはステージで行動すると消費する値であり、消費量はキャラクターやステージによって異なる。
						SP回復アイテムは時間経過で入手することができ、いわゆるスタミナの役割を果たす。
						SP回復アイテムはショップでも購入できる。
					</div>
				</div>
				<div class="core-ybar"></div>
			</div>
		</div>
	""";

	var _page : CharaPage;
	var _btnList : Map.<PartsButton>;
	var _scroller : PartsScroll;
	var charaList : PartsCharaListItem[];
	var sortPicker : SECpopupPicker;
	var prevscrolly = 0;

	// パートナーデータ
	var _partner : PartsCharaListItem;
	// チームデータ
	var _teamId : string[];
	var _teamName : string[];
	var _teamLock : boolean[];
	var _teamMembers : PartsCharaListItem[][];

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, response : variant){
		this._page = page;
		this.parse(response);

		// 並べ替え要素作成
		this.sortPicker = new SECpopupPicker("並べ替え", [
			new SECpopupPickerItem("level", "レベル順"),
			new SECpopupPickerItem("type", "種類順"),
			new SECpopupPickerItem("new", "新着順"),
		]);
		this.sortPicker.getItem("level").selected = true;
	}

	// ----------------------------------------------------------------
	// ロード完了時 データの形成
	function parse(response : variant) : void{
		// キャラクターリスト作成
		var list = response["list"] as variant[];
		if(list != null){
			this.charaList = new PartsCharaListItem[];
			for(var i = 0; i < list.length; i++){
				this.charaList.push(new PartsCharaListItem(list[i]));
			}
		}

		// パートナーデータ読み取り
		var id = response["partner"] as variant;
		for(var i = 0; i < this.charaList.length; i++){
			if(this.charaList[i].id == id){
				this._partner = this.charaList[i];
				break;
			}
		}

		// チームデータ読み取り
		this._teamId = new string[];
		this._teamName = new string[];
		this._teamLock = new boolean[];
		this._teamMembers = new PartsCharaListItem[][];
		var teams = response["teams"] as variant[];
		for(var i = 0; i < teams.length; i++){
			this._teamId[i] = teams[i]["id"] as string;
			this._teamName[i] = teams[i]["name"] as string;
			this._teamLock[i] = teams[i]["lock"] as boolean;
			this._teamMembers[i] = new PartsCharaListItem[];
			var members = teams[i]["members"] as string[];
			for(var j = 0; j < members.length; j++){
				var id = members[j];
				for(var k = 0; k < this.charaList.length; k++){
					if(this.charaList[k].id == id){
						this._teamMembers[i][j] = this.charaList[k];
						break;
					}
				}
			}
		}

		// チームアイコンとロックアイコンリセット
		for(var i = 0; i < this.charaList.length; i++){
			(this.charaList[i].bodyDiv.getElementsByClassName("core-chara-teamIcon").item(0) as HTMLDivElement).className = "core-chara-teamIcon";
			(this.charaList[i].bodyDiv.getElementsByClassName("core-chara-lockIcon").item(0) as HTMLDivElement).className = "core-chara-lockIcon" + ((this.charaList[i].favorite) ? " cssimg_core_chara_favorite" : "");
		}
		// ロックアイコン設定
		(this._partner.bodyDiv.getElementsByClassName("core-chara-lockIcon").item(0) as HTMLDivElement).className = "core-chara-lockIcon cssimg_core_chara_partner";
		// チームアイコン設定
		for(var i = 0; i < this._teamMembers.length; i++){
			for(var j = 0; j < this._teamMembers[i].length; j++){
				if(this._teamMembers[i][j] != null){
					(this._teamMembers[i][j].bodyDiv.getElementsByClassName("core-chara-teamIcon").item(0) as HTMLDivElement).className = "core-chara-teamIcon cssimg_core_chara_team" + (i + 1);
				}
			}
		}
	}

	// ----------------------------------------------------------------
	// 初期化
	override function init() : void{
		if(this._page.bodyDiv.innerHTML == ""){
			// タブ変更時にDOM生成
			this._page.bodyDiv.className = "body team";
			this._page.bodyDiv.innerHTML = SECcharaTabTeam._htmlTag;

			this._scroller = null;
		}
		var scrollDiv = this._page.bodyDiv.getElementsByClassName("scroll").item(0) as HTMLDivElement;

		// パートナー要素作成
		scrollDiv.innerHTML = "";
		var partnerDiv = dom.document.createElement("div") as HTMLDivElement;
		partnerDiv.className = "team";
		partnerDiv.innerHTML = """<div class="teamIcon cssimg_core_chara_partner"></div><div class="label">パートナー</div>""";
		partnerDiv.innerHTML += this._partner.bodyDiv.outerHTML; // キャラクター要素複製 複製でないと複数表示できず、キャラクターピッカーを開いたときなどに消える
		(partnerDiv.getElementsByClassName("core-chara-lockIcon").item(0) as HTMLDivElement).className = "core-chara-lockIcon" + ((this._partner.favorite) ? " cssimg_core_chara_favorite" : ""); // ロックアイコンリセット
		scrollDiv.appendChild(partnerDiv);
		// チーム要素作成
		for(var i = 0; i < this._teamId.length; i++){
			var teamDiv = dom.document.createElement("div") as HTMLDivElement;
			teamDiv.className = "team" + (this._teamLock[i] ? " inactive" : "");
			teamDiv.innerHTML = """<div class="teamIcon"></div><div class="label"></div>""";
			(teamDiv.getElementsByClassName("teamIcon").item(0) as HTMLDivElement).className = "teamIcon cssimg_core_chara_team" + (i + 1);
			(teamDiv.getElementsByClassName("label").item(0) as HTMLDivElement).innerHTML = this._teamName[i];
			for(var j = 0; j < 3; j++){
				var member = this._teamMembers[i][j];
				if(member != null){
					teamDiv.innerHTML += member.bodyDiv.outerHTML; // キャラクター要素複製
					var teamIconDiv = teamDiv.getElementsByClassName("core-chara-item").item(j).getElementsByClassName("core-chara-teamIcon").item(0) as HTMLDivElement;
					if(teamIconDiv != null){teamIconDiv.className = "core-chara-teamIcon";} // チームアイコンリセット
				}else{
					teamDiv.innerHTML += """<div class="core-chara-item"></div>""";
				}
			}
			scrollDiv.appendChild(teamDiv);
		}

		// ボタン作成
		this._btnList = {} : Map.<PartsButton>;
		// ヘッダーボタン
		this._btnList["back"] = new PartsButton(Page.backDiv, true);
		this._btnList["menu"] = new PartsButton(Page.menuDiv, true);
		// タブボタン
		this._btnList["team"] = new PartsButton(this._page.tabTeamDiv, true);
		this._btnList["supp"] = new PartsButton(this._page.tabSuppDiv, true);
		this._btnList["rest"] = new PartsButton(this._page.tabRestDiv, true);
		this._btnList["pwup"] = new PartsButton(this._page.tabPwupDiv, true);
		this._btnList["sell"] = new PartsButton(this._page.tabSellDiv, true);

		// スクロール作成
		if(this._scroller == null){
			this._scroller = new PartsScroll(
				this._page.bodyDiv.getElementsByClassName("scrollContainer").item(0) as HTMLDivElement,
				scrollDiv,
				null,
				this._page.bodyDiv.getElementsByClassName("core-ybar").item(0) as HTMLDivElement
			);
		}
		// スクロールボタン作成
		this._scroller.btnList = {} : Map.<PartsButton>;
		var labelDivs = scrollDiv.getElementsByClassName("label");
		var itemDivs = scrollDiv.getElementsByClassName("core-chara-item");
		// パートナーボタン
		var itemDiv = itemDivs.item(0) as HTMLDivElement;
		var itemBtn = new PartsButton(itemDiv, true);
		var iconBtn = new PartsButton(itemDiv.getElementsByClassName("core-chara-icon").item(0) as HTMLDivElement, true);
		this._scroller.btnList["partnerItem"] = itemBtn;
		this._scroller.btnList["partnerIcon"] = iconBtn;
		itemBtn.children = [iconBtn.div];
		// チームボタン
		for(var i = 0; i < this._teamId.length; i++){
			this._scroller.btnList["teamName" + i] = new PartsButton(labelDivs.item(1 + i) as HTMLDivElement, true);
			for(var j = 0; j < 3; j++){
				var member = this._teamMembers[i][j];
				var itemDiv = itemDivs.item(1 + i * 3 + j) as HTMLDivElement;
				if(member != null){
					var itemBtn = new PartsButton(itemDiv, true);
					var iconBtn = new PartsButton(itemDiv.getElementsByClassName("core-chara-icon").item(0) as HTMLDivElement, true);
					this._scroller.btnList["memberItem" + i + "_" + j] = itemBtn;
					this._scroller.btnList["memberIcon" + i + "_" + j] = iconBtn;
					itemBtn.children = [iconBtn.div];
				}else{
					var itemBtn = new PartsButton(itemDiv, true);
					this._scroller.btnList["memberItem" + i + "_" + j] = itemBtn;
				}
			}

			// ボタンロック
			if(this._teamLock[i]){
				this._scroller.btnList["teamName" + i].inactive = true;
				for(var j = 0; j < 3; j++){this._scroller.btnList["memberItem" + i + "_" + j].inactive = true;}
			}
		}
	}

	// ----------------------------------------------------------------
	// 計算
	override function calc() : boolean{
		this._scroller.calc(true);
		for(var name in this._btnList){this._btnList[name].calc(!this._scroller.active);}

		// パートナー選択ボタン
		if(this._scroller.btnList["partnerItem"].trigger){
			Sound.playSE("ok");
			// キャラクターロックしない パートナーはいつでもかえられる
			for(var i = 0; i < this.charaList.length; i++){this.charaList[i].select = false;}
			// パートナー選択ポップアップ
			var command = "type=partner";
			this._page.serialPush(new SECcharaTabTeamPopupCharacterPicker(this._page, this, "パートナー選択", command, this._partner.id, this.prevscrolly));
			return false;
		}

		// パートナー情報ボタン
		if(this._scroller.btnList["partnerIcon"].trigger){
			Sound.playSE("ok");
			this._page.serialPush(new SECpopupInfoChara(this._page, this, this._partner));
			return false;
		}

		// チームボタン
		for(var i = 0; i < this._teamId.length; i++){
			// チーム名称ボタン
			if(this._scroller.btnList["teamName" + i].trigger){
				Sound.playSE("ok");
				var command = "type=teamName&teamId=" + this._teamId[i];
				this._page.serialPush(new SECcharaTabTeamPopupTextarea(this._page, this, command, this._teamName[i]));
				return false;
			}

			for(var j = 0; j < 3; j++){
				var member = this._teamMembers[i][j];
				var id = (member != null) ? member.id : "";

				// メンバー選択ボタン
				if(this._scroller.btnList["memberItem" + i + "_" + j].trigger){
					Sound.playSE("ok");
					// キャラクターロック設定
					for(var k = 0; k < this.charaList.length; k++){this.charaList[k].select = false;}
					for(var k = 0; k < this._teamId.length; k++){
						if(this._teamLock[k]){
							for(var l = 0; l < this._teamMembers[k].length; l++){
								if(this._teamMembers[k][l] != null){this._teamMembers[k][l].select = true;}
							}
						}
					}
					// メンバー選択ポップアップ
					var command = "type=teamMember&teamId=" + this._teamId[i] + "&index=" + j;
					this._page.serialPush(new SECcharaTabTeamPopupCharacterPicker(this._page, this, "メンバー選択", command, id, this.prevscrolly));
					return false;
				}

				if(member != null){
					// メンバー情報ボタン
					if(this._scroller.btnList["memberIcon" + i + "_" + j].trigger){
						Sound.playSE("ok");
						this._page.serialPush(new SECpopupInfoChara(this._page, this, member));
						return false;
					}
				}
			}
		}

		// タブボタン
		if(this._btnList["supp"].trigger){Sound.playSE("ok"); this._page.toggleTab("supp"); return false;}
		if(this._btnList["rest"].trigger){Sound.playSE("ok"); this._page.toggleTab("rest"); return false;}
		if(this._btnList["pwup"].trigger){Sound.playSE("ok"); this._page.toggleTab("pwup"); return false;}
		if(this._btnList["sell"].trigger){Sound.playSE("ok"); this._page.toggleTab("sell"); return false;}

		// ヘッダーボタン
		if(this._btnList["menu"].trigger){Sound.playSE("ok"); this._page.serialPush(new SECpopupMenu(this._page, this)); return false;}
		if(this._btnList["back"].trigger){Sound.playSE("ng"); Page.transitionsPage("mypage");}

		return true;
	}

	// ----------------------------------------------------------------
	// 破棄
	override function dispose() : void{
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

// キャラクターピッカー
class SECcharaTabTeamPopupCharacterPicker extends SECpopupCharacterPicker{
	var _cPage : CharaPage;
	var _parent : SECcharaTabTeam;
	var _command : string;
	var _id : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, cartridge : SECcharaTabTeam, title : string, command : string, id : string, scrolly : int){
		super(page, cartridge, title, (command.indexOf("partner") < 0 && id != ""), cartridge.charaList, cartridge.sortPicker, scrolly);
		this._cPage = page;
		this._parent = cartridge;
		this._command = command;
		this._id = id;
	}

	// ----------------------------------------------------------------
	// 選択時の動作
	override function onSelect(chara : PartsCharaListItem) : void{
		var id = (chara != null) ? chara.id : "";
		if(this._id != id){
			// 通信
			var url = "/chara/team?" + this._command + "&charaId=" + id;
			this._cPage.serialPush(new SECload(url, null, function(response : variant) : void{this._parent.parse(response);}));
		}
	}

	// ----------------------------------------------------------------
	// 閉じるときの動作
	override function onClose(scrolly : int) : void{
		this._parent.prevscrolly = scrolly;
	}
}

// テキストエリア
class SECcharaTabTeamPopupTextarea extends SECpopupTextarea{
	var _cPage : CharaPage;
	var _parent : SECcharaTabTeam;
	var _command : string;
	var _name : string;

	// ----------------------------------------------------------------
	// コンストラクタ
	function constructor(page : CharaPage, cartridge : SECcharaTabTeam, command : string, name : string){
		super(page, cartridge, name, 8);
		this._cPage = page;
		this._parent = cartridge;
		this._command = command;
		this._name = name;
	}

	// ----------------------------------------------------------------
	// 入力確定時の動作
	override function onEnter(value : string) : void{
		if(this._name != value){
			// 通信
			var url = "/chara/team?" + this._command + "&name=" + value;
			this._cPage.serialPush(new SECload(url, null, function(response : variant) : void{this._parent.parse(response);}));
		}
	}
}

// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

