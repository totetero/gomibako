exports.init = function(app){
	// トップページ
	app.get("/", function(req, res){
		res.render("top.ejs");
	});
}

