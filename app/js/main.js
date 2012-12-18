require(["control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function() {
		 	
    	var opts = {
			startingPiece : 1, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 0 },
			constantPiece : null,
			debugWindow : true,
			debugShow : WD.Game.debugTransition | WD.Game.debugBehavior,
			showTransition : false,
			showTestGrid : false/*,
			gameBoard : sandbox*/
		}
	
		window._game = new WD.Game(opts);
		
});