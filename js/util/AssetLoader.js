var AssetLoader = Class.create({});

AssetLoader.assets = [{ name : 'coins', src : 'assets/coins.png' }];
AssetLoader.resources = [];

AssetLoader.loadAssets = function(){
	AssetLoader.assets.each(function(asset){
		var img = new Image();
		img.src = asset.src;
		img.onload = function(e){
			AssetLoader.resources.push(img);
			AssetLoader.checkProgress();
		}
	});
}


AssetLoader.checkProgress = function(){
	if(AssetLoader.resources.length === AssetLoader.assets.length){
		Event.fire(window,'assetLoader:done');
	}
}