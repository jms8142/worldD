define(['lib/prototype'],function(){

window.WD || ( window.WD = {} ) //application namespace

WD.AssetLoader = Class.create({});

WD.AssetLoader.ImageAssets = [{ name : 'objects', src : 'assets/objects.png', type : 'image/png' },
					  { name : 'text', src : 'assets/text.png', type : 'image/png' },
					  { name : 'background', src : 'assets/background.png', type : 'image/png' }];

//audio loading is a little different from Image() so for now we'll seperate them and load after the images
WD.AssetLoader.AudioAssets =  [{ name : 'dollarSound', src : 'assets/dollar.oggvorbis.ogg', type : 'audio/ogg'},
								{ name : 'matchSound', src : 'assets/match.oggvorbis.ogg', type : 'audio/ogg'}];



WD.AssetLoader.resources = []; //better as hashmap

WD.AssetLoader.loadAssets = function(){
	WD.AssetLoader.ImageAssets.each(function(asset){
			var img = new Image();
			img.src = asset.src;
			img.onload = function(e){
				WD.AssetLoader.resources.push({ assetName : asset.name, res : img });
				WD.AssetLoader.checkProgress();
			}		
	});
}

WD.AssetLoader.loadAudioAssets = function(){
	WD.AssetLoader.AudioAssets.each(function(asset){	
			var audio = new Audio();
			if(!!audio.canPlayType(asset.type)) {
				audio.setAttribute('src',asset.src);
				audio.load();
				WD.AssetLoader.resources.push({ assetName : asset.name, res : audio });
			}
		
	});
	Event.fire(document,'assetLoader:done');
}


WD.AssetLoader.checkProgress = function(){
	if(WD.AssetLoader.resources.length === WD.AssetLoader.ImageAssets.length){
		//chain to load audio assets
		WD.AssetLoader.loadAudioAssets();
	}
}

WD.AssetLoader.getResource = function(resourceName){
	var assetImg;

	WD.AssetLoader.resources.each(function(resource){
		if(resource.assetName===resourceName) {
			assetImg = resource.res;
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