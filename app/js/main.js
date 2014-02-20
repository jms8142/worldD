requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: '/lib/jquery/jquery.min'
    }
});

require(["control/Game_new"], function(WDGame) {
		 	
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

		
	
		WDGame.start(opts);
		
});