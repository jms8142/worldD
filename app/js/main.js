require(["control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function() {


		 	/* Default Starting Options */
		 	
		 	var opts = {
				startingPiece : 1, //[1=1,2=5,3=10,4=25]
				startingPiecePosition : { x : 4,y : 2 },
				constantPiece : null,
				debugWindow : true,
				debugShow : WD.Game.debugBehavior | WD.Game.debugTransition,// | WD.Game.debugDrawing,
				//debugShow : WD.Game.debugDrawing,
				showTransition : false,
				showTestGrid : false
			}
			

			/* test Starting Options */
			/*
    		var opts = {
				startingPiece : 3, //[1=1,2=5,3=10,4=25]
				startingPiecePosition : { x : 8,y : 3 },
				constantPiece : null,
				debugWindow : true,
				debugShow : WD.Game.debugBehavior | WD.Game.debugTransition,// | WD.Game.debugDrawing,
				//debugShow : WD.Game.debugDrawing,
				showTransition : false,
				showTestGrid : true,
				gameBoard : sandbox
			}
			*/

	
		

		if(window.location.pathname.indexOf("test")>-1){
			opts.testing = true;
			window._game = new WD.Game(opts);
			startTest();
		} else{
			window._game = new WD.Game(opts);
		}
		
});