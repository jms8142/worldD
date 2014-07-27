define(['util/AssetLoader'],function(AssetLoader){


	var WDCanvasManager = {};


	WDCanvasManager.SCREENS = { TITLE : 0, PAUSE : 1, GAMEOVER : 2, CREDITS : 3, HOWTO : 4 };

	WDCanvasManager.Screen = function(screen,game,draw){
		switch (screen) {
			case WDCanvasManager.SCREENS.PAUSE:
				var pausedImg = AssetLoader.getResource('text'),
				xPos = (game._canvasBufferContext.canvas.width / 2) - (pausedImg.width / 2),
				yPos = (game._canvasBufferContext.canvas.height / 2) - (pausedImg.height / 2);
				game._canvasBufferContext.drawImage(pausedImg,0,0,320,37,xPos,yPos,320,37);
			break;
			case WDCanvasManager.SCREENS.TITLE:
				var titleImg = AssetLoader.getResource('background'),
				textImg = AssetLoader.getResource('text'),
				xPos = (game._canvasBufferContext.canvas.width / 2) - (titleImg.width / 2),
				yPos = (game._canvasBufferContext.canvas.height / 2) - (titleImg.height / 2),
				linkText = "START";

				game._canvasBufferContext.drawImage(titleImg,xPos,yPos);
				var xTitle = (game._canvasBufferContext.canvas.width / 2) - 160;
				//debugger;
				game._canvasBufferContext.drawImage(textImg,0,40,320,30,xTitle,200,320,30);

				//draw link text
				game._canvasBufferContext.font='24px verdana, arial, sans-serif';
				game._canvasBufferContext.fillStyle='#0c753b';

				WDCanvasManager.linkWidth=game._canvasBufferContext.measureText(linkText).width;
				WDCanvasManager.linkHeight = parseInt(game._canvasBufferContext.font);
				game._canvasBufferContext.fillText(linkText,(game._canvasBufferContext.canvas.width / 2) - (WDCanvasManager.linkWidth / 2),game._canvasBufferContext.canvas.height / 2 + (WDCanvasManager.linkHeight / 2));

				draw();
				break;
			case WDCanvasManager.SCREENS.GAMEOVER:
				var titleImg = AssetLoader.getResource('background'),
				textImg = AssetLoader.getResource('text'),
				xPos = (game._canvasBufferContext.canvas.width / 2) - (titleImg.width / 2),
				yPos = (game._canvasBufferContext.canvas.height / 2) - (titleImg.height / 2);

				game._canvasBufferContext.drawImage(titleImg,0,0);
				var xTitle = (game._canvasBufferContext.canvas.width / 2) - 160;
				game._canvasBufferContext.drawImage(textImg,0,70,320,40,xTitle,200,320,40);


				linkText = "PLAY AGAIN?";
				game._canvasBufferContext.font='24px verdana, arial, sans-serif';
				game._canvasBufferContext.fillStyle='#0c753b';

				WDCanvasManager.linkWidth=game._canvasBufferContext.measureText(linkText).width;
				WDCanvasManager.linkHeight = parseInt(game._canvasBufferContext.font);
				game._canvasBufferContext.fillText(linkText,(game._canvasBufferContext.canvas.width / 2) - (WDCanvasManager.linkWidth / 2),game._canvasBufferContext.canvas.height / 2 + (WDCanvasManager.linkHeight / 2));


				draw();
			break;
			case WDCanvasManager.SCREENS.TITLE:
			break;


		}

		return screen;
	}

	WDCanvasManager.DrawCanvasBackground = function(_canvasBufferContext){
			if(!_game.settings.showTestGrid){
				var my_gradient = _canvasBufferContext.createLinearGradient(0,0,0,_canvasBufferContext.canvas.height-50);
				my_gradient.addColorStop(0,'rgb(68,134,146)');
				my_gradient.addColorStop(.75,'rgb(34,128,69)');
				my_gradient.addColorStop(1,'rgb(92,100,38)');
				
				_canvasBufferContext.fillStyle = my_gradient;//this.backgroundColor;
				_canvasBufferContext.fillRect(0,0,_canvasBufferContext.canvas.width,_canvasBufferContext.canvas.height-50);
			}
	}

	WDCanvasManager.MouseReact = function(x,y,screen,game){
		if (WDCanvasManager.SCREENS.TITLE || WDCanvasManager.SCREENS.GAMEOVER) {			
				var linkX = (game._canvasBufferContext.canvas.width / 2) - (WDCanvasManager.linkWidth / 2);
				var linkY = (game._canvasBufferContext.canvas.height / 2) + (WDCanvasManager.linkHeight / 2)
			  	return (x>=linkX && x <= (linkX + WDCanvasManager.linkWidth) && y<=linkY && y<= linkY && y > (linkY - WDCanvasManager.linkHeight));
		}
	}

	return WDCanvasManager;

});