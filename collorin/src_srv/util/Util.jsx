// 雑多ユーティリティクラス

native class Util{
	static function download(srcurl : string, dstpath : string, callback : function(err:variant):void) : void;
} = '''{
	download: function(srcurl, dstpath, callback){
		var callee = arguments.callee;
		var opts = require('url').parse(srcurl);
		var req = (opts.protocol.match(/https/) ? require('https') : require('http')).request({
			host: opts.hostname,
			port: opts.port,
			path: opts.pathname + (opts.search || ''),
			method: 'GET',
		});
		req.on("response", function(res){
			if(res.statusCode == 301 ||res.statusCode == 302){
				callee(res.headers.location, dstpath, callback);
			}else if(res.statusCode == 200){
				var writableStream = require('fs').createWriteStream(dstpath);
				writableStream.on("error", callback);
				writableStream.on("close", callback);
				res.on("data", function(chunk){writableStream.write(chunk, "binary");});
				res.on("end", function(){writableStream.end();});
			}else{
				callback(new Error("statusCode is " + res.statusCode));
			}
		});
		req.on("error", callback);
		req.end();
	},
}''';

