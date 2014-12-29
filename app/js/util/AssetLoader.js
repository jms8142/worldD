define(function(){


		var WDAssetLoader = {

			ImageAssets : [{ name : 'objects', src : 'assets/objects.png', type : 'image/png' },
							  { name : 'text', src : 'assets/text.png', type : 'image/png' },
							  { name : 'background', src : 'assets/background.png', type : 'image/png' }],

			//audio loading is a little different from Image() so for now we'll seperate them and load after the images
			AudioAssets :  [{ name : 'dollarSound', src : 'assets/dollar.oggvorbis.ogg', type : 'audio/ogg'},
										{ name : 'matchSound', src : 'assets/match.oggvorbis.ogg', type : 'audio/ogg'}],

			resources : [], //better as hashmap


			loadAssets : function(){
			//console.info('loadAssets');
			
			//for(var i = 0; i < WDAssetLoader.ImageAssets.length; i++){
			//for(var asset in WDAssetLoader.ImageAssets) {

			//	if (WDAssetLoader.ImageAssets.hasOwnProperty(asset)) {
				
				 WDAssetLoader.ImageAssets.forEach(function(_asset){


					var img = new Image();
					//_asset = WDAssetLoader.ImageAssets[asset];
					//console.info(_asset);
					img.src = _asset.src;
					
					img.onload = function(e){
						//console.info(e);
						//console.info({ assetName : _asset.name, res : img });
						WDAssetLoader.resources.push({ assetName : _asset.name, res : img });
						WDAssetLoader.checkProgress();
					}	
				});
				//}
			//}
			},

			loadAudioAssets : function(){

				for(var i = 0; i < WDAssetLoader.AudioAssets.length; i++){
					var audio = new Audio(),
					asset = WDAssetLoader.AudioAssets[i];

						if(!!audio.canPlayType(asset.type)) {
							audio.setAttribute('src',asset.src);
							audio.load();
							WDAssetLoader.resources.push({ assetName : asset.name, res : audio });
						}

				}

				$(document).trigger('assetLoader_DONE');
			},


			checkProgress : function(){
				if(WDAssetLoader.resources.length === WDAssetLoader.ImageAssets.length){
					//chain to load audio assets
					//debugger;
					WDAssetLoader.loadAudioAssets();
				}
			},

			getResource : function(resourceName){
				var assetImg;
				//debugger;
				for(var i = 0; i < WDAssetLoader.resources.length; i++){
					var resource = WDAssetLoader.resources[i];
					if(resource.assetName===resourceName) {
						assetImg = resource.res;
						//needs to break here
					}

				}
				

				return assetImg;
			}
		}

		
		return WDAssetLoader;

});