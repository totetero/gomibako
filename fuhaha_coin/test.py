#!/usr/bin/env python
# -*- coding: utf-8 -*-

# ブロックチェーンを作ることで学ぶ 〜ブロックチェーンがどのように動いているのか学ぶ最速の方法は作ってみることだ〜
# https://qiita.com/hidehiro98/items/841ece65d896aeaa8a2a

import sys
import json
import time
import uuid
import hashlib
import urllib2
import urlparse
import traceback
import BaseHTTPServer

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# ブロックチェインクラス定義
class Blockchain(object):
	# コンストラクタ
	def __init__(self):
		self._transactions = []
		self._chain = []
		self._nodes = set()
		# ジェネシスブロックを作る
		self.new_block(100, "first_hash")

	# トランザクションの有無を確認する
	def has_transactions(self):
		return len(self._transactions) > 0

	# チェインを取得する
	def get_chain(self):
		return self._chain

	# ノードリストを取得する
	def get_nodes(self):
		return list(self._nodes)

	# 新しいトランザクションをリストに加える
	def new_transaction(self, sender, recipient, amount):
		transaction = {}
		transaction["sender"] = sender
		transaction["recipient"] = recipient
		transaction["amount"] = amount
		# トランザクションに追加
		self._transactions.append(transaction)
		# このトランザクションを含むブロックのアドレスを返す
		return len(self._chain) + 1

	# 貯めていたトランザクションを用いて新しいブロックを作り、チェインに加える
	def new_block(self, proof, previous_hash):
		# トランザクションリストを保持してリセット
		transactions = self._transactions
		self._transactions = []
		# ブロックを作成
		block = {}
		block["index"] = len(self._chain) + 1
		block["timestamp"] = time.time()
		block["transactions"] = transactions
		block["proof"] = proof or self._proof_of_work()
		block["previous_hash"] = previous_hash or self._create_hash(self._chain[-1])
		# チェインに追加
		self._chain.append(block)
		# 追加したブロックを返す
		return block

	# ノードリストに新しいノードを加える
	def register_node(self, address):
		parsed_url = urlparse.urlparse(address)
		self._nodes.add(parsed_url.netloc)

	# コンセンサスアルゴリズム
	def resolve_conflicts(self):
		neighbours = self._nodes
		new_chain = None
		max_length = len(self._chain)
		for node in neighbours:
			responseStat = 0
			responseJson = {}
			try:
				requestMain = urllib2.Request("http://{}/chain".format(node))
				requestMain.add_header("Content-Type", "application/json")
				responseMain = urllib2.urlopen(requestMain, None)
				responseStat = 200
				responseData = responseMain.read().decode("UTF-8")
				responseJson = json.loads(responseData)
			except: print traceback.format_exc()
			if responseStat != 200: continue
			length = responseJson["length"]
			chain = responseJson["chain"]
			if length <= max_length: continue
			if not self._valid_chain(chain): continue
			max_length = length
			new_chain = chain
		if new_chain:
			self._chain = new_chain
			return True
		return False

	# ブロックをハッシュ化する
	def _create_hash(self, block):
		block_string = json.dumps(block, sort_keys=True).encode()
		return hashlib.sha256(block_string).hexdigest()

	# プルーフオブワーク
	def _proof_of_work(self):
		proof = 0
		last_block = self._chain[-1]
		last_proof = last_block["proof"]
		last_hash = self._create_hash(last_block)
		while not self._valid_proof(last_proof, proof, last_hash): proof += 1
		return proof

	# プルーフが正しいかを確認する
	def _valid_proof(self, last_proof, proof, last_hash):
		guess = "{}{}{}".format(last_proof, proof, last_hash).encode()
		guess_hash = hashlib.sha256(guess).hexdigest()
		#return guess_hash[:2] == "00"
		return guess_hash[:3] == "000"
		#return guess_hash[:4] == "0000"
		#return guess_hash[:5] == "00000"

	# ブロックチェインが正しいかを確認する
	def _valid_chain(self, chain):
		last_block = chain[0]
		current_index = 1
		while current_index < len(chain):
			block = chain[current_index]
			# ブロックのハッシュが正しいかを確認
			if block['previous_hash'] != self._create_hash(last_block): return False
			# プルーフ・オブ・ワークが正しいかを確認
			if not self._valid_proof(last_block['proof'], block['proof'], block['previous_hash']): return False
			last_block = block
			current_index += 1
		return True

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

htmlIndex = '''
	<html><head>
		<title>test</title>
		<style type="text/css">
			.border{
				border: solid 1px black;
				margin: 5px;
				padding: 5px;
			}
		</style>
	</dead><body>
		<div class="border">
			<div>mine: <input type="button" id="buttonMine" value="get" /></div>
		</div>
		<div class="border">
			<div>chain: <input type="button" id="buttonChain" value="get" /></div>
		</div>
		<div class="border">
			<div>recipient: <input type="text" id="fieldNewTransactionsRecipient" value="other" /></div>
			<div>amount: <input type="text" id="fieldNewTransactionsAmount" value="10" /></div>
			<div>new/transactions: <input type="button" id="buttonNewTransactions" value="post" /></div>
		</div>
		<div class="border">
			<div>recipient: <input type="text" id="fieldNodeRegister" value="<<DEFAULTNODE>>" /></div>
			<div>nodes/register: <input type="button" id="buttonNodeRegister" value="post" /></div>
		</div>
		<div class="border">
			<div>nodes/resolve: <input type="button" id="buttonNodeResolve" value="get" /></div>
		</div>
		<div class="border">
			<pre id="PreformattedResult"></pre>
		</div>
		<script type="text/javascript">

			const requestSend = (method, api, requestData) => new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open(method, api, true);
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.setRequestHeader("User-Code", "<<USERCODE>>");
				xhr.onreadystatechange = (e) => {
					if(xhr.readyState !== XMLHttpRequest.DONE){return;}
					let isError = false;
					if(xhr.status !== 200){isError = true;}
					if(xhr.getResponseHeader("Content-Type") !== "application/json"){isError = true;}
					if(isError){
						const errorJson = {status: xhr.status, response: xhr.response,};
						document.getElementById("PreformattedResult").innerHTML = `<font color="red">${JSON.stringify(errorJson, null , "\t")}</font>`;
						console.error(errorJson);
						reject(errorJson);
					}else{
						const responseJson = JSON.parse(xhr.response);
						document.getElementById("PreformattedResult").innerHTML = `<font color="black">${JSON.stringify(responseJson, null , "\t")}</font>`;
						console.log(responseJson);
						resolve(responseJson);
					}
				};
				if(method === "GET"){xhr.send();}
				if(method === "POST"){xhr.send(JSON.stringify(requestData));}
			});

			document.getElementById("buttonMine").addEventListener("click", () => requestSend("GET", "/mine"));
			document.getElementById("buttonChain").addEventListener("click", () => requestSend("GET", "/chain"));
			document.getElementById("buttonNodeResolve").addEventListener("click", () => requestSend("GET", "/nodes/resolve"));

			document.getElementById("buttonNewTransactions").addEventListener("click", () => {
				requestSend("POST", "/transactions/new", {
					recipient: document.getElementById("fieldNewTransactionsRecipient").value,
					amount: document.getElementById("fieldNewTransactionsAmount").value,
				});
			});

			document.getElementById("buttonNodeRegister").addEventListener("click", () => {
				requestSend("POST", "/nodes/register", {
					nodes: [document.getElementById("fieldNodeRegister").value,],
				});
			});
		</script>
	</body></html>
'''

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# ブロックチェインクラス作成
global_blockchain = Blockchain()
# ポート番号設定
global_port = 8080 if len(sys.argv) <= 1 else int(sys.argv[1])
global_node = "http://localhost:{}".format(global_port)

# リクエスト処理クラス
class TestHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
	def do_GET(self):
		try:
			requestPath = self.path
			if requestPath == "/": self.write_response(200, "text/html", self._do_get_page_index().encode("UTF-8"))
			elif requestPath == "/mine": self.write_response(200, "application/json", self._do_get_mine().encode("UTF-8"))
			elif requestPath == "/chain": self.write_response(200, "application/json", self._do_get_chain().encode("UTF-8"))
			elif requestPath == "/nodes/resolve": self.write_response(200, "application/json", self._do_get_nodes_resolve().encode("UTF-8"))
			else: self.write_response(404, "application/json", json.dumps({"error": {"message": "404",},}).encode("UTF-8"))
		except:
			print traceback.format_exc()
			self.write_response(500, "application/json", json.dumps({"error": {"message": "500",},}).encode("UTF-8"))
	def do_POST(self):
		try:
			requestSize = int(self.headers.get("content-length"))
			requestBody = self.rfile.read(requestSize).decode("UTF-8")
			requestJson = json.loads(requestBody)
			requestPath = self.path
			if requestPath == "/transactions/new": self.write_response(200, "application/json", self._do_post_transactions_new(requestJson).encode("UTF-8"))
			elif requestPath == "/nodes/register": self.write_response(200, "application/json", self._do_post_nodes_register(requestJson).encode("UTF-8"))
			else: self.write_response(404, "application/json", json.dumps({"error": {"message": "404",},}).encode("UTF-8"))
		except:
			print traceback.format_exc()
			self.write_response(500, "application/json", json.dumps({"error": {"message": "500",},}).encode("UTF-8"))
	# ユーザーコード作成
	def _create_user_code(self):
		return str(uuid.uuid4()).replace("-", "")
	# ヘッダからユーザーコードを読み取る
	def _get_header_user_code(self):
		return self.headers.get("user-code")
	# indexページを表示
	def _do_get_page_index(self):
		responseData = htmlIndex;
		responseData = responseData.replace("<<USERCODE>>", self._create_user_code())
		responseData = responseData.replace("<<DEFAULTNODE>>", global_node)
		return responseData
	# コインを採掘する
	def _do_get_mine(self):
		responseJson = {}
		if global_blockchain.has_transactions():
			global_blockchain.new_transaction("admin", self._get_header_user_code(), 1)
			block = global_blockchain.new_block(None, None)
			responseJson["message"] = "新しいブロックを採掘しました"
			responseJson["index"] = block["index"]
			responseJson["transactions"] = block["transactions"]
			responseJson["proof"] = block["proof"]
			responseJson["previous_hash"] = block["previous_hash"]
		else:
			responseJson["message"] = "採掘しませんでした"
		responseData = json.dumps(responseJson)
		return responseData
	# ブロックチェインを確認する
	def _do_get_chain(self):
		responseJson = {}
		responseJson["chain"] = global_blockchain.get_chain()
		responseJson["length"] = len(responseJson["chain"])
		responseData = json.dumps(responseJson)
		return responseData
	# コインを移動する
	def _do_post_transactions_new(self, requestJson):
		sender = self._get_header_user_code()
		recipient = requestJson["recipient"]
		amount = requestJson["amount"]
		index = global_blockchain.new_transaction(sender, recipient, amount)
		responseJson = {}
		responseJson["message"] = "トランザクションはブロック {} に追加されました".format(index)
		responseData = json.dumps(responseJson)
		return responseData
	# ノードを追加する
	def _do_post_nodes_register(self, requestJson):
		nodes = requestJson["nodes"]
		for node in nodes:
			if node != global_node:
				global_blockchain.register_node(node)
		responseJson = {}
		responseJson["message"] = "新しいノードが追加されました"
		responseJson["total_nodes"] = global_blockchain.get_nodes()
		responseData = json.dumps(responseJson)
		return responseData
	# ノードを確認する
	def _do_get_nodes_resolve(self):
		is_keep = global_blockchain.resolve_conflicts()
		responseJson = {}
		responseJson["message"] = "チェーンが置き換えられました" if is_keep else "チェーンが確認されました"
		responseJson["chain"] = global_blockchain.get_chain()
		responseData = json.dumps(responseJson)
		return responseData
	# 送信情報作成関数
	def write_response(self, code, type, data):
		self.send_response(code)
		self.send_header("Content-type", type)
		self.end_headers()
		self.wfile.write(data)

if __name__ == "__main__":
	print("Starting server {} use <Ctrl-C> to stop").format(global_node)
	BaseHTTPServer.HTTPServer(("", global_port), TestHTTPRequestHandler).serve_forever()

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

