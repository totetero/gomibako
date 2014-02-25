// サーバ側のソースコードです
// 短ッ！！

// ----------------------------------------------------------------
//http server
var http = require('http');
var io = require('socket.io');
var server = http.createServer(function(req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end("Hello World");
});
server.listen(10080);

// ----------------------------------------------------------------
// マップ配列を作る
var hsize = 16;
var vsize = 8;
var map = new Array();
for(var k = 0; k < vsize; k++){
	map[k] = new Array();
	var ground = 2;
	var chip = k < ground ? 2 : 0;
	for(var j = 0; j < hsize; j++){
		map[k][j] = new Array();
		for(var i = 0; i < hsize; i++){
			map[k][j][i] = chip;
		}
	}
}

// キャラクタ配列を作る
var id_list = new Array();

// ----------------------------------------------------------------
//ソケット
var io = io.listen(server);
io.sockets.on('connection', function(client){
	// -------- 接続時
	// 開いているid番号を獲得する
	var id = id_list.length;
	for(var i = 0; i < id_list.length; i++){if(!id_list[i]){id = i; break;}}
	// 	map全体を送信する
	client.emit('smp',map);
	// キャラクタ情報を送信する
	for(var i = 0; i < id_list.length; i++){if(id_list[i]){client.emit('npl', i);}}
	client.broadcast.emit('npl', id);
	// idを登録する
	id_list[id] = true;
	
	// -------- プレイヤーキャラの位置変更
	client.on('mpl', function(x, y, z, r, a){
		client.broadcast.emit('mpl', id, x, y, z, r, a);
	});
	
	// -------- マップチップの置き換え
	client.on('smc', function(x, y, z, chip){
		// 引数のエラーチェックはしっかりしとかないと凄腕ハカーさんに狙われて大変です
		// javascriptの場合はクライアント側の改変も容易だしね
		x = Math.floor(parseInt(x));
		y = Math.floor(parseInt(y));
		z = Math.floor(parseInt(z));
		if(isNaN(x) || x < 0 || hsize <= x){return -1;}
		if(isNaN(y) || y < 0 || hsize <= y){return -1;}
		if(isNaN(z) || z < 0 || vsize <= z){return -1;}
		if(isNaN(chip)){return -1;}
		if(0 < z && z < vsize - 1){
			map[z][y][x] = chip;
			client.emit('smc', x, y, z, chip);
			client.broadcast.emit('smc', x, y, z, chip);
		}
	});
	
	// -------- 切断された時
	client.on('disconnect', function(){
		id_list[id] = false;
		client.broadcast.emit('dpl', id);
	})
});

