CanvasManager = Class.create({});


CanvasManager.SCREENS = { TITLE : 0, PAUSE : 1, GAMEOVER : 2, CREDITS : 3, HOWTO : 4 };

CanvasManager.Screen = function(screen,game){
	switch (screen) {
		case CanvasManager.SCREENS.PAUSE:
			var pausedImg = AssetLoader.getResource('paused'),
			xPos = (game._canvasBufferContext.canvas.width / 2) - (pausedImg.width / 2),
			yPos = (game._canvasBufferContext.canvas.height / 2) - (pausedImg.height / 2);
			game._canvasBufferContext.drawImage(pausedImg,xPos,yPos);
		break;
		case CanvasManager.SCREENS.TITLE:
			var titleImg = AssetLoader.getResource('title'),
			xPos = (game._canvasBufferContext.canvas.width / 2) - (titleImg.width / 2),
			yPos = (game._canvasBufferContext.canvas.height / 2) - (titleImg.height / 2),
			linkText = "START";

			game._canvasBufferContext.drawImage(titleImg,xPos,yPos);

			//draw link text
			game._canvasBufferContext.font='24px verdana, arial, sans-serif';
			game._canvasBufferContext.fillStyle='#0c753b';

			CanvasManager.linkWidth=game._canvasBufferContext.measureText(linkText).width;
			CanvasManager.linkHeight = parseInt(game._canvasBufferContext.font);
			game._canvasBufferContext.fillText(linkText,(game._canvasBufferContext.canvas.width / 2) - (CanvasManager.linkWidth / 2),game._canvasBufferContext.canvas.height / 2 + (CanvasManager.linkHeight / 2));




			game.Draw();
			break;
		case CanvasManager.SCREENS.GAMEOVER:
			var gameoverScreen = AssetLoader.getResource('gameover');
			game._canvasBufferContext.drawImage(gameoverScreen,0,0);
			game.Draw();
		break;
		case CanvasManager.SCREENS.TITLE:
		break;


	}

	return screen;
}

CanvasManager.DrawCanvasBackground = function(_canvasBufferContext){
		var my_gradient = _canvasBufferContext.createLinearGradient(0,0,0,_canvasBufferContext.canvas.height-50);
		my_gradient.addColorStop(0,'rgb(68,134,146)');
		my_gradient.addColorStop(.75,'rgb(34,128,69)');
		my_gradient.addColorStop(1,'rgb(92,100,38)');
		
		_canvasBufferContext.fillStyle = my_gradient;//this.backgroundColor;
		_canvasBufferContext.fillRect(0,0,_canvasBufferContext.canvas.width,_canvasBufferContext.canvas.height-50);
}

CanvasManager.MouseReact = function(x,y,screen,game){
	switch (screen) {
		case CanvasManager.SCREENS.TITLE:
			
			var linkX = (game._canvasBufferContext.canvas.width / 2) - (CanvasManager.linkWidth / 2);
			var linkY = (game._canvasBufferContext.canvas.height / 2) + (CanvasManager.linkHeight / 2)
		  	return (x>=linkX && x <= (linkX + CanvasManager.linkWidth) && y<=linkY && y<= linkY && y > (linkY - CanvasManager.linkHeight));
			
		break;
	}
}