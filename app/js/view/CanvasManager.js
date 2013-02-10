
/**
* Screen Management Class
* Dependencies: 
* 
*/
WD.namespace('WD.view.CanvasManager');

WD.view.CanvasManager = (function(wdapp){
	
	var scoretracker = wdapp.drawableElements.ScoreTracker
	,assetLoader = wdapp.util.AssetLoader
	,linkWidth
	,linkHeight;

	//console.info(wdapp);
	return {
		Screen : function(screen,canvasData,draw){

			switch (screen) {
				case this.SCREENS.PAUSE:
					var pausedImg = WD.AssetLoader.getResource('text'),
					xPos = (canvasData._canvasBufferContext.canvas.width / 2) - (pausedImg.width / 2),
					yPos = (canvasData._canvasBufferContext.canvas.height / 2) - (pausedImg.height / 2);
					canvasData._canvasBufferContext.drawImage(pausedImg,0,0,320,37,xPos,yPos,320,37);
				break;
				case this.SCREENS.TITLE:
					//console.info(window._canvasData);
					var titleImg = assetLoader.getResource('background'),
					textImg = assetLoader.getResource('text'),
					xPos = (canvasData._canvasBufferContext.canvas.width / 2) - (titleImg.width / 2),
					yPos = (canvasData._canvasBufferContext.canvas.height / 2) - (titleImg.height / 2),
					linkText = "START";

					canvasData._canvasBufferContext.drawImage(titleImg,xPos,yPos);
					var xTitle = (canvasData._canvasBufferContext.canvas.width / 2) - 160;
					canvasData._canvasBufferContext.drawImage(textImg,0,40,320,30,xTitle,200,320,30);

					//draw link text
					canvasData._canvasBufferContext.font='24px verdana, arial, sans-serif';
					canvasData._canvasBufferContext.fillStyle='#0c753b';

					linkWidth=canvasData._canvasBufferContext.measureText(linkText).width;
					linkHeight = parseInt(canvasData._canvasBufferContext.font);
					canvasData._canvasBufferContext.fillText(linkText,(canvasData._canvasBufferContext.canvas.width / 2) - (linkWidth / 2),canvasData._canvasBufferContext.canvas.height / 2 + (linkHeight / 2));

					draw();
				break;
			case this.SCREENS.GAMEOVER:
					var titleImg = WD.AssetLoader.getResource('background'),
					textImg = WD.AssetLoader.getResource('text'),
					xPos = (canvasData._canvasBufferContext.canvas.width / 2) - (titleImg.width / 2),
					yPos = (canvasData._canvasBufferContext.canvas.height / 2) - (titleImg.height / 2);

					canvasData._canvasBufferContext.drawImage(titleImg,0,0);
					var xTitle = (canvasData._canvasBufferContext.canvas.width / 2) - 160;
					canvasData._canvasBufferContext.drawImage(textImg,0,70,320,40,xTitle,200,320,40);


					linkText = "PLAY AGAIN?";
					canvasData._canvasBufferContext.font='24px verdana, arial, sans-serif';
					canvasData._canvasBufferContext.fillStyle='#0c753b';

					linkWidth=canvasData._canvasBufferContext.measureText(linkText).width;
					linkHeight = parseInt(canvasData._canvasBufferContext.font);
					canvasData._canvasBufferContext.fillText(linkText,(canvasData._canvasBufferContext.canvas.width / 2) - (linkWidth / 2),canvasData._canvasBufferContext.canvas.height / 2 + (linkHeight / 2));


					draw();
				break;
			}

			return screen;
		}
		,SCREENS : { TITLE : 0, PAUSE : 1, GAMEOVER : 2, CREDITS : 3, HOWTO : 4 }
		,MouseReact : function(x,y,screen,canvasData){
			if(screen === this.SCREENS.TITLE || screen === this.SCREENS.GAMEOVER) {			
					var linkX = (canvasData._canvasBufferContext.canvas.width / 2) - (linkWidth / 2);
					var linkY = (canvasData._canvasBufferContext.canvas.height / 2) + (linkHeight / 2)
				  	return (x>=linkX && x <= (linkX + linkWidth) && y<=linkY && y<= linkY && y > (linkY - linkHeight));
			}
		}
		,DrawCanvasBackground : function(_canvasBufferContext){
			var my_gradient = _canvasBufferContext.createLinearGradient(0,0,0,_canvasBufferContext.canvas.height-scoretracker.HEIGHT);
			my_gradient.addColorStop(0,'rgb(68,134,146)');
			my_gradient.addColorStop(.75,'rgb(34,128,69)');
			my_gradient.addColorStop(1,'rgb(92,100,38)');
			
			_canvasBufferContext.fillStyle = my_gradient;//this.backgroundColor;
			_canvasBufferContext.fillRect(0,0,_canvasBufferContext.canvas.width,_canvasBufferContext.canvas.height-scoretracker.HEIGHT);
}

	}

}(WD));