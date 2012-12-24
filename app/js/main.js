require(["control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function() {
		 	
    	var opts = {
			startingPiece : null, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 2 },
			constantPiece : null,
			debugWindow : true,
			debugShow : WD.Game.debugBehavior | WD.Game.debugMovement | WD.Game.debugTransition | WD.Game.debugDrawing,
			//debugShow : WD.Game.debugDrawing,
			showTransition : false,
			showTestGrid : true,
			gameBoard : sandbox
		}
	
		window._game = new WD.Game(opts);
		
});