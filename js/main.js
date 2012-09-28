requirejs.config({
	baseUrl : 'js/lib',
	paths: {
        drawableElements: '../drawableElements',
        debug : '../debug',
        control : '../control'
    }

});

// Start the main app logic.
requirejs([	'prototype',
			'control/Animation', 
			'control/Behavior', 
			'control/_Game',
			'debug/Debugger',
			'drawableElements/DrawableElement',
			'drawableElements/GameTile',
			'drawableElements/ScoreTracker'],
			function   (prototype, _Game) {
				console.info(Game);

   				var opts = {
				//gameBoard : sandbox,
				startingPiece : 2, //[0=1,1=5,2=10,3=25]
				startingPiecePosition : { x : 4, y : 5 },
				constantPiece : null,
				debugWindow : true,
				debugShow : Game.debugMovement | Game.debugTransition | Game.debugBehavior,
				showTransition : false,
				showTestGrid : false
			}
	
			_game = new Game(opts);

			});