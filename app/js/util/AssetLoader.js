define(['prototype'],function(){


		var WDAssetLoader = Class.create({});

		WDAssetLoader.ImageAssets = [{ name : 'objects', src : 'assets/objects.png', type : 'image/png' },
							  { name : 'text', src : 'assets/text.png', type : 'image/png' },
							  { name : 'background', src : 'assets/background.png', type : 'image/png' }];

		//audio loading is a little different from Image() so for now we'll seperate them and load after the images
		WDAssetLoader.AudioAssets =  [{ name : 'dollarSound', src : 'assets/dollar.oggvorbis.ogg', type : 'audio/ogg'},
										{ name : 'matchSound', src : 'assets/match.oggvorbis.ogg', type : 'audio/ogg'}];



		WDAssetLoader.resources = []; //better as hashmap

		WDAssetLoader.loadAssets = function(){
			WDAssetLoader.ImageAssets.each(function(asset){
					var img = new Image();
					img.src = asset.src;
					img.onload = function(e){
						WDAssetLoader.resources.push({ assetName : asset.name, res : img });
						WDAssetLoader.checkProgress();
					}		
			});
		}

		WDAssetLoader.loadAudioAssets = function(){
			WDAssetLoader.AudioAssets.each(function(asset){	
					var audio = new Audio();
					if(!!audio.canPlayType(asset.type)) {
						audio.setAttribute('src',asset.src);
						audio.load();
						WDAssetLoader.resources.push({ assetName : asset.name, res : audio });
					}
				
			});
			Event.fire(document,'assetLoader:done');
		}


		WDAssetLoader.checkProgress = function(){
			if(WDAssetLoader.resources.length === WDAssetLoader.ImageAssets.length){
				//chain to load audio assets
				WDAssetLoader.loadAudioAssets();
			}
		}

		WDAssetLoader.getResource = function(resourceName){
			var assetImg;

			WDAssetLoader.resources.each(function(resource){
				if(resource.assetName===resourceName) {
					assetImg = resource.res;
					//needs to break here
				}
			});

			return assetImg;
		}


		return WDAssetLoader;

});