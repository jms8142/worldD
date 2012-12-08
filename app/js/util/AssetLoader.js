define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.AssetLoader = Class.create({});

WD.AssetLoader.assets = [{ name : 'objects', src : 'assets/objects.png' },
					  { name : 'text', src : 'assets/text.png' },
					  { name : 'background', src : 'assets/background.png' }];
WD.AssetLoader.resources = []; //better as hashmap

WD.AssetLoader.loadAssets = function(){
	WD.AssetLoader.assets.each(function(asset){
		var img = new Image();
		img.src = asset.src;
		img.onload = function(e){
			WD.AssetLoader.resources.push({ assetName : asset.name, img : img });
			WD.AssetLoader.checkProgress();
		}
	});
}


WD.AssetLoader.checkProgress = function(){
	if(WD.AssetLoader.resources.length === WD.AssetLoader.assets.length){
		Event.fire(document,'assetLoader:done');
	}
}

WD.AssetLoader.getResource = function(resourceName){
	var assetImg;

	WD.AssetLoader.resources.each(function(resource){
		if(resource.assetName===resourceName) {
			assetImg = resource.img;
			//needs to break here
		}
	});

	return assetImg;
}

});

/*
finish this
window.WD || ( window.WD = {} ) //application namespace

WD.AssetLoader = (function(WD){
	var _self = {};
	_self.loadAssets = function(){
		_self.assets.each(function(asset){
			var img = new Image();
			img.src = asset.src;
			img.onload = function(e){
				WD.AssetLoader.resources.push({ assetName : asset.name, img : img });
				WD.AssetLoader.checkProgress();
			}
		});
	}

	return _self;

}(WD));

console.info(window.WD);
*/