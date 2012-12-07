require(["control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function() {
		 	
    	var opts = {
			startingPiece : 3, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 0 },
			constantPiece : 3,
			debugWindow : true,
			debugShow : WD.Game.debugTransition | WD.Game.debugBehavior,
			showTransition : false,
			showTestGrid : false
		}
	
		window._game = new WD.Game(opts);
		
});