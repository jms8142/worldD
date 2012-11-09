require(["jquery",
		 "lib/prototype",
		 "util/AssetLoader",
		 "drawableElements/DrawableElement",
		 "drawableElements/GameTile",
		 "drawableElements/ScoreTracker",
		 "control/Behavior",
		 "control/Animation",
		 "control/Location",
		 "view/CanvasManager",
		 "control/Game",
		 "debug/Debugger",
		 "test/testBoards"], function($) {
    var opts = {
		startingPiece : 0, //[0=1,1=5,2=10,3=25]
		startingPiecePosition : { x : 4,y : 0 },
		constantPiece : null,
		debugWindow : true,
		debugShow : Game.debugTransition | Game.debugBehavior,
		showTransition : false,
		showTestGrid : false
	}
	
	_game = new Game(opts);
});