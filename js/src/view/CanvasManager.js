CanvasManager = Class.create({});


CanvasManager.SCREENS = { TITLE : 0, PAUSE : 1, GAMEOVER : 2, CREDITS : 3, HOWTO : 4 };

CanvasManager.Screen = function(screen,_canvasBufferContext){
	console.info('in canvas manager');
	switch (screen) {
		case CanvasManager.SCREENS.PAUSE:
			var pausedImg = AssetLoader.getResource('paused'),
			xPos = (_canvasBufferContext.canvas.width / 2) - (pausedImg.width / 2),
			yPos = (_canvasBufferContext.canvas.height / 2) - (pausedImg.height / 2);
			_canvasBufferContext.drawImage(pausedImg,xPos,yPos);
		break;
		case CanvasManager.SCREENS.GAMEOVER:
			console.info('over!');
			var gameoverScreen = AssetLoader.getResource('gameover');
			_canvasBufferContext.drawImage(gameoverScreen,0,0);
			window._game.Draw();
		break;
		case CanvasManager.SCREENS.TITLE:
		break;
	}
}

CanvasManager.DrawCanvasBackground = function(_canvasBufferContext){
		var my_gradient = _canvasBufferContext.createLinearGradient(0,0,0,_canvasBufferContext.canvas.height-50);
		my_gradient.addColorStop(0,'rgb(68,134,146)');
		my_gradient.addColorStop(.75,'rgb(34,128,69)');
		my_gradient.addColorStop(1,'rgb(92,100,38)');
		
		_canvasBufferContext.fillStyle = my_gradient;//this.backgroundColor;
		_canvasBufferContext.fillRect(0,0,_canvasBufferContext.canvas.width,_canvasBufferContext.canvas.height-50);
}