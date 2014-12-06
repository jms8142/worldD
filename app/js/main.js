requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: '/vendor/jquery/dist/jquery.min'
    }
});

require(["control/Game"], function(Game) {
		 	
    	var opts = {
			startingPiece : null, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 0 },
			constantPiece : null,
			debugWindow : true,
			/*debugShow : WDGame.debugDrawing,*/
			showTransition : false,
			showTestGrid : false/*,
			gameBoard : sandbox*/
		}

		
	
		window._wd = Game;
		_wd.start(opts);
});