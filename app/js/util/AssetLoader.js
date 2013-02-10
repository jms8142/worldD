/**
* Responsible for preloading assets
* Dependencies: 
* jQuery ($.trigger(),$.each())
* 
*/

WD.namespace('WD.util.AssetLoader');



WD.util.AssetLoader = (function(wdapp){

	var ImageAssets = [{ name : 'objects', src : 'assets/objects.png', type : 'image/png' },
					  { name : 'text', src : 'assets/text.png', type : 'image/png' },
					  { name : 'background', src : 'assets/background.png', type : 'image/png' }]

	//audio loading is a little different from Image() so for now we'll seperate them and load after the images
	,AudioAssets =  [{ name : 'dollarSound', src : 'assets/dollar.oggvorbis.ogg', type : 'audio/ogg'},
								{ name : 'matchSound', src : 'assets/match.oggvorbis.ogg', type : 'audio/ogg'}]

	,resources = []

	,checkProgress = function(){
		if(resources.length === ImageAssets.length){
			//chain to load audio assets
			loadAudioAssets();
		}
	}
	,loadAudioAssets = function(){
		$.each(AudioAssets,function(index,asset){	
			var audio = new Audio();
			if(!!audio.canPlayType(AudioAssets[index].type)) {
				audio.setAttribute('src',AudioAssets[index].src);
				audio.load();
				resources.push({ assetName : AudioAssets[index].name, res : audio });
			}
		
		});

		$(document).trigger("assetLoader_DONE");
	}

	return {
		loadAssets : function(){
			$.each(ImageAssets,function(index,asset){
				var img = new Image();
				img.src = ImageAssets[index].src;
				img.onload = function(e){
					resources.push({ assetName : ImageAssets[index].name, res : img });
					checkProgress();
				}		
			});
		},getResource : function(resourceName){
		var assetImg;
		
		$.each(resources,function(index,resource){
			if(resources[index].assetName===resourceName) {
				assetImg = resource.res;
				//needs to break here
			}
		});

		return assetImg;
		}
	}

})(WD);