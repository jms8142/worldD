requirejs.config({
    baseUrl: 'js',
    paths: {
        prototype: 'lib/prototype'
    }
});

require(["control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function(WDGame) {
		 	
    	var opts = {
			startingPiece : null, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 0 },
			constantPiece : null,
			debugWindow : true,
			debugShow : WDGame.debugDrawing,
			showTransition : false,
			showTestGrid : false/*,
			gameBoard : sandbox*/
		}
	
		window._game = new WDGame(opts);
		
});