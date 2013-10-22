var io = require('socket.io').listen(10080);

var world_id = 0;
var world_list = new Array();

io.sockets.on('connection', function(client){
	// -------- 接続時
	
	// 空いているワールドを得る
	var world = null;
	var uidx = -1;
	for(var i = 0; i < world_list.length; i++){
		if(!world_list[i].start){
			for(var j = 0; j < world_list[i].client.length; j++){
				if(world_list[i].client[j] == null){
					world = world_list[i];
					uidx = j;
					break;
				}
			}
		}
	}
	// 空いているワールドが存在しなかったら新しく作る
	if(world == null){
		world = new Object();
		world.id = world_id++;
		world.start = false;
		world.client = new Array();
		world.input = new Array();
		world.udata = new Array();
		for(var i = 0; i < 2; i++){
			world.client.push(null);
			world.input.push(-1);
			world.udata.push(null);
		}
		world_list.push(world);
		uidx = 0;
	}
	// ワールドにクライアントを登録する
	world.client[uidx] = client;
	world.client[uidx].emit('wait', world.id, uidx);

	// -------- ユーザー情報が送られてきた
	client.on('entry', function(udata){
		world.udata[uidx] = udata;
		var completeFlag = true;
		// すべてのユーザー情報を得ているか確認する
		for(var i = 0; i < world.client.length; i++){
			if(world.udata[i] == null){
				completeFlag = false;
			}
		}
		if(completeFlag){
			// ユーザー情報を送信してゲームを開始する
			for(var j = 0; j < world.client.length; j++){
				if(world.client[j] != null){
					world.client[j].emit('start', world.id, world.client.length, j, world.udata);
				}
			}
			world.start = true;
		}
	});

	// -------- キー入力時
	client.on('key', function(input){
		if(world.start){
			world.input[uidx] = input;
			var completeFlag = true;
			// すべての接続先のキー入力を得ているか確認する
			for(var i = 0; i < world.client.length; i++){
				if(world.client[i] != null && world.input[i] < 0){
					completeFlag = false;
				}
			}
			if(completeFlag){
				// すべての接続先のキー入力を送信する
				for(var i = 0; i < world.client.length; i++){
					if(world.client[i] != null){
						world.client[i].emit('key', world.input);
					}
				}
				// キー入力リセット
				for(var i = 0; i < world.client.length; i++){
					if(world.client[i] != null){
						world.input[i] = -1;
					}
				}
			}
		}
	});

	// -------- チャット時
	client.on('msg', function(str){
		for(var i = 0; i < world.client.length; i++){
			if(world.client[i] != null){
				world.client[i].emit('msg', uidx, str);
			}
		}
	});

	// -------- 切断された時
	client.on('disconnect', function(){
		world.udata[uidx] = null;
		world.client[uidx] = null;
		for(var i = 0; i < world.client.length; i++){
			if(world.client[i] != null){
				world.client[i].emit('kill', uidx);
			}
		}
	});
});

