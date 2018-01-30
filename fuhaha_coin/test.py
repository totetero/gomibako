#!/usr/bin/env python
# -*- coding: utf-8 -*-

# ブロックチェーンを作ることで学ぶ 〜ブロックチェーンがどのように動いているのか学ぶ最速の方法は作ってみることだ〜
# https://qiita.com/hidehiro98/items/841ece65d896aeaa8a2a

import json
import hashlib
import traceback
import BaseHTTPServer
from time import time
from uuid import uuid4

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# ブロックチェインクラス定義
class Blockchain(object):
	# コンストラクタ
	def __init__(self):
		self._current_transactions = []
		self._chain = []
		# ジェネシスブロックを作る
		self.new_block(100, 1)

	def getChain(self):
		return self._chain

	def getChainLength(self):
		return len(self._chain)

	def get_last_block(self):
		return self._chain[-1]

	# 新しいブロックを作り、チェーンに加える
	def new_block(self, proof, previous_hash):
		block = {}
		block["index"] = len(self._chain) + 1
		block["timestamp"] = time()
		block["transactions"] = self._current_transactions
		block["proof"] = proof
		block["previous_hash"] = previous_hash or self.hash(self._chain[-1])

		# 現在のトランザクションリストをリセット
		self._current_transactions = []

		self._chain.append(block)
		return block

	# 新しいトランザクションをリストに加える
	def new_transaction(self, sender, recipient, amount):
		transaction = {}
		transaction["sender"] = sender # 送信者のアドレス
		transaction["recipient"] = recipient # 受信者のアドレス
		transaction["amount"] = amount # 量
		self._current_transactions.append(transaction)
		# このトランザクションを含むブロックのアドレス
		return self._chain[-1]["index"] + 1

	# ブロックをハッシュ化する
	@staticmethod
	def hash(block):
		block_string = json.dumps(block, sort_keys=True).encode()
		return hashlib.sha256(block_string).hexdigest()

	# プルーフオブワーク
	def proof_of_work(self, last_proof):
		proof = 0
		while True:
			guess = "{}{}".format(last_proof, proof).encode()
			guess_hash = hashlib.sha256(guess).hexdigest()
			if guess_hash[:4] == "0000": break
			proof += 1
		return proof

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

htmlIndex = '''
	<html><head>
		<title>test</title>
		<style type="text/css">
			div{margin: 10px;}
		</style>
	</dead><body>
		<div><input type="button" id="buttonMine" value="mine" /></div>
		<div><input type="button" id="buttonChain" value="chain" /></div>
		<div>
			<div>recipient: <input type="text" id="fieldNewTransactionsRecipient" value="other" /></div>
			<div>amount: <input type="text" id="fieldNewTransactionsAmount" value="10" /></div>
			<input type="button" id="buttonNewTransactions" value="new_transactions" />
		</div>
		<pre id="PreformattedResult"></pre>
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
						reject({
							status: xhr.status,
							response: xhr.response,
						});
					}else{
						resolve(JSON.parse(xhr.response));
					}
				};
				if(method === "GET"){xhr.send();}
				if(method === "POST"){xhr.send(JSON.stringify(requestData));}
			});

			document.getElementById("buttonMine").addEventListener("click", () => {
				requestSend("GET", "/mine").then((responseJson) => {
					document.getElementById("PreformattedResult").innerHTML = JSON.stringify(responseJson, null , "\t");
					console.log(responseJson);
				}).catch((errors) => {
					console.error(errors);
				});
			});

			document.getElementById("buttonChain").addEventListener("click", () => {
				requestSend("GET", "/chain").then((responseJson) => {
					document.getElementById("PreformattedResult").innerHTML = JSON.stringify(responseJson, null , "\t");
					console.log(responseJson);
				}).catch((errors) => {
					console.error(errors);
				});
			});

			document.getElementById("buttonNewTransactions").addEventListener("click", () => {
				requestSend("POST", "/transactions/new", {
					recipient: document.getElementById("fieldNewTransactionsRecipient").value,
					amount: document.getElementById("fieldNewTransactionsAmount").value,
				}).then((responseJson) => {
					document.getElementById("PreformattedResult").innerHTML = JSON.stringify(responseJson, null , "\t");
					console.log(responseJson);
				}).catch((errors) => {
					console.error(errors);
				});
			});

		</script>
	</body></html>
'''

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

# ブロックチェインクラス作成
globalBlockchain = Blockchain()

# リクエスト処理クラス
class TestHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
	def do_GET(self):
		try:
			requestPath = self.path
			if requestPath == "/": self.write_response(200, "text/html", htmlIndex.replace("<<USERCODE>>", self._create_user_code()).encode("UTF-8"))
			elif requestPath == "/mine": self.write_response(200, "application/json", self._do_get_mine().encode("UTF-8"))
			elif requestPath == "/chain": self.write_response(200, "application/json", self._do_get_chain().encode("UTF-8"))
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
			else: self.write_response(404, "application/json", json.dumps({"error": {"message": "404",},}).encode("UTF-8"))
		except:
			print traceback.format_exc()
			self.write_response(500, "application/json", json.dumps({"error": {"message": "500",},}).encode("UTF-8"))
	# ユーザーコード作成
	def _create_user_code(self):
		return str(uuid4()).replace("-", "")
	# ヘッダからユーザーコードを読み取る
	def _get_header_user_code(self):
		return self.headers.get("user-code")
	# コインを採掘する
	def _do_get_mine(self):
		last_block = globalBlockchain.get_last_block()
		last_proof = last_block["proof"]
		proof = globalBlockchain.proof_of_work(last_proof)
		globalBlockchain.new_transaction("admin", self._get_header_user_code(), 1)
		block = globalBlockchain.new_block(proof, None)
		responseJson = {}
		responseJson["message"] = "新しいブロックを採掘しました"
		responseJson["index"] = block["index"]
		responseJson["transactions"] = block["transactions"]
		responseJson["proof"] = block["proof"]
		responseJson["previous_hash"] = block["previous_hash"]
		responseData = json.dumps(responseJson)
		return responseData
	# ブロックチェインを確認する
	def _do_get_chain(self):
		responseJson = {}
		responseJson["chain"] = globalBlockchain.getChain()
		responseJson["length"] = globalBlockchain.getChainLength()
		responseData = json.dumps(responseJson)
		return responseData
	# コインを移動する
	def _do_post_transactions_new(self, requestJson):
		sender = self._get_header_user_code()
		recipient = requestJson["recipient"]
		amount = requestJson["amount"]
		index = globalBlockchain.new_transaction(sender, recipient, amount)
		responseJson = {}
		responseJson["message"] = "トランザクションはブロック {} に追加されました".format(index)
		responseData = json.dumps(responseJson)
		return responseData
	# 送信情報作成関数
	def write_response(self, code, type, data):
		self.send_response(code)
		self.send_header("Content-type", type)
		self.end_headers()
		self.wfile.write(data)

if __name__ == "__main__":
	BaseHTTPServer.HTTPServer(("", 8080), TestHTTPRequestHandler).serve_forever()

# ----------------------------------------------------------------
# ----------------------------------------------------------------
# ----------------------------------------------------------------

