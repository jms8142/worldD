require(["lib/prototype",
		 "control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function() {
		 	
    	var opts = {
			startingPiece : 0, //[0=1,1=5,2=10,3=25]
			startingPiecePosition : { x : 4,y : 0 },
			constantPiece : null,
			debugWindow : true,
			debugShow : Game.debugTransition | Game.debugBehavior,
			showTransition : false,
			showTestGrid : false
		}
	
		window._game = new window.Game(opts);
		
});