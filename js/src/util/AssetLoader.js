var AssetLoader = Class.create({});

AssetLoader.assets = [{ name : 'coins', src : 'assets/coins.png' },
					  { name : 'dollar', src : 'assets/dollar.png' },
					  { name : 'paused', src : 'assets/paused.png' },
					  { name : 'gameover', src : 'assets/gameover.png' }];
AssetLoader.resources = []; //better as hashmap

AssetLoader.loadAssets = function(){
	AssetLoader.assets.each(function(asset){
		var img = new Image();
		img.src = asset.src;
		img.onload = function(e){
			AssetLoader.resources.push({ assetName : asset.name, img : img });
			AssetLoader.checkProgress();
		}
	});
}


AssetLoader.checkProgress = function(){
	if(AssetLoader.resources.length === AssetLoader.assets.length){
		Event.fire(window,'assetLoader:done');
	}
}

AssetLoader.getResource = function(resourceName){
	var assetImg;

	AssetLoader.resources.each(function(resource){
		if(resource.assetName===resourceName) {
			assetImg = resource.img;
			//needs to break here
		}
	});

	return assetImg;
}