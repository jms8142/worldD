/**
* Main game controller class
* Dependencies: 
* jQuery ($.extend(),$.bind())
* 
*/

WD.namespace('WD.control.main');


WD.control.main = (function(wdapp,opts){

	
	//dependencies
	var canvasmanager = wdapp.view.CanvasManager
	,main = wdapp.control.main
	,gametile = wdapp.drawableElements.GameTile
	,location = wdapp.control.Location
	,scoretracker = wdapp.drawableElements.ScoreTracker
	,debug = wdapp.debug.Debugger
	//private properties
	,settings = {
						columns : 9,						
						tileWidth : 50,
						tileHeight : 50,
						populatedRows : 2,
						gameRows: 10,
						gameBoard : null,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)',
						constantPiece : null,
						startingPiece : null,
						startingPiecePosition : { x : 4,y : 3 },
						showTestGrid : false,
						showTransition : false,
						debugWindow : false,
						debugFlags : 0x0
					}
	,construct //constructor
	,_canvas = null
	,_canvasContext = null
	,_canvasBuffer = null
	,_canvasBufferContext = null
	,currentScreen = null
	,canvasData = {}
	,inLink = false
	,keyslocked = false
	,actionTile = null /* the tile in play */

	//private methods
	,loadTitleScreen = function(){
		if(settings.skipTitle) {
			startGame();
		} else {
			currentScreen = canvasmanager.Screen(canvasmanager.SCREENS.TITLE, canvasData,Draw);
		}
	}
	,Draw = function(){
		_canvasContext.drawImage(_canvasBuffer, 0, 0);
	}
	,ClearCanvas = function(){
		_canvasContext.clearRect(0,0,_canvas.width,_canvas.height-scoretracker.HEIGHT); //minus scoreboard
		_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height-scoretracker.HEIGHT);
	}
	,
	CreateTileMap = function(){
			gameBoard = new Array(WD.Game.defaultSettings.columns);
			for(var i = 0; i < gameBoard.length; i++){
					gameBoard[i] = new Array(WD.Game.defaultSettings.gameRows);
					for (var j = 0; j < gameBoard[i].length; j++){
						gameBoard[i][j] = { val : 0, active : WD.GameTile.STATE.INACTIVE };
					}


			}
			//console.info(gameBoard.length)
	},
	DrawGameTiles = function(){
		
		if(settings.debugFlags & wdapp.DEBUG.DRAWING)
				console.info('[DRAWING] Drawing Game Tiles');
		
		var coordX = 0;
		var coordY = 0;

		for(var col = 0; col < settings.columns;col++){
			for(var row = 0; row < settings.gameRows;row++){
				if(gameBoard[col][row].val > 0){
					var _gameTile = new gametile({ xMap : col, yMap : row });
					_gameTile.setHeight(settings.tileHeight);
					_gameTile.setWidth(settings.tileWidth);
					_gameTile.setValue(gameBoard[col][row].val);

					if(gameBoard[col][row].active === _gameTile.STATE.ACTIVE) {
						_gameTile.setStroke(settings.actionTileStroke);
						_gameTile.setFill(settings.actionTileFill);
					}
					
					_gameTile.render(_canvasBufferContext,gameBoard[col][row].active);
				}

				coordY += settings.tileHeight;
			}

			coordY = 0;
			coordX += settings.tileWidth;
		}

		//update the canvas
		Draw();

	}
	,endGame = function(){
		clearInterval(this.timerID);
		WD.CanvasManager.Screen(WD.CanvasManager.SCREENS.GAMEOVER, this);
	}
	,mouseMoveHandler = function(ev){
		 var x, y;
		  // Get the mouse position relative to the canvas element.
    		x = ev.clientX;
    		y = ev.clientY;
  		  
  		  x-=_canvas.offsetLeft;
  		  y-=_canvas.offsetTop;

  		  if(canvasmanager.MouseReact(x,y,currentScreen,canvasData)){
      			document.body.style.cursor = "pointer";
      			inLink=true;
  			} else {
      			document.body.style.cursor = "";
      			inLink=false;
  			}
		//console.info('x: ' + x + ' y ' + y);
	}
	,mouseClickHandler = function(){
		if(inLink){
			startGame();
		}
	}
	,startGame = function(){
		

		if(settings.gameBoard){
			gameBoard = settings.gameBoard;
		} else {
			CreateTileMap();
		}


		if(settings.showTestGrid){
			GenerateTestGrid();
		} else {
			canvasmanager.DrawCanvasBackground(_canvasBufferContext);
		}

		//starting piece
		CreateActionPiece(settings.startingPiecePosition.x,settings.startingPiecePosition.y,settings.startingPiece);
		DrawGameTiles();
		console.info('starting game');
		console.info(this._scoreTracker);
		scoretracker.drawScoreBoard(_canvasBufferContext);
		/*

		this.Draw();
	*/
		
		


	}
	,CreateActionPiece = function(x,y,val) {
		
		if(settings.constantPiece)
			val = settings.constantPiece;

		actionTile = new gametile({ xMap : x, yMap : y})

		
		if(val === undefined) 
			var singlePieceVal = (Math.floor(Math.random()*(actionTile.getCurrencyValues().length-1))) + 1;
		else
			var singlePieceVal = val;

		actionTile.setValue(singlePieceVal);
		gameBoard[x][y] = { val : actionTile.getValue(), active : actionTile.STATE.ACTIVE };

		//console.info('create action piece');
		scanForSpaces();
		UpdateView();
	}
	,scanForSpaces = function(){
		//console.info('scan');
		var tileAbove = {};
		//start with bottom row and move up
		for(var row = settings.gameRows - 1; row > -1; row--){
			totalAcross = 0;
			for(var col = 0; col < settings.columns; col++){
				var _gameTile = gameBoard[col][row];
				totalAcross += _gameTile.val;

				if(_gameTile.val===0) { //lookup
					tileAbove = location.TransformLocation({ x : col, y : row },location.MoveDirection.UP,settings)
					
					if(gameBoard[tileAbove.x][tileAbove.y].val>0){ //this is a floating block
						//console.info('x: ' + tileAbove.x + ' y: ' + tileAbove.y);
						//console.info(this.gameBoard[tileAbove.x][tileAbove.y].active);
						if(gameBoard[tileAbove.x][tileAbove.y].active===gametile.STATE.INACTIVE){
							gameBoard[tileAbove.x][tileAbove.y].active = gametile.STATE.ANGEL;
						} else if (gameBoard[tileAbove.x][tileAbove.y].active===gametile.STATE.ANGEL) { //move down one and check reaction
							//console.info(this.gameBoard[col][row].toString());
							gameBoard[col][row] = gameBoard[tileAbove.x][tileAbove.y];
							gameBoard[col][row].active = gametile.STATE.INACTIVE;
							gameBoard[tileAbove.x][tileAbove.y] = { val : 0, active : gametile.STATE.INACTIVE }
						}
						
					}
				}
			}
			
			if(totalAcross===0)
				break;

			//console.info('row' + row + ' total :' + totalAcross);
		}
	}
	/**
	* @return void
	* @description - Completely refreshes and updates the canvas to the current state of the game.  To simply add to the canvas, use Draw()
	**/
	UpdateView = function(){
		
		if(!settings.testing) {
			if(settings.debugFlags & wdapp.DEBUG.DRAWING)
					console.info('[DRAWING] Updating Canvas');

			ClearCanvas();

			canvasmanager.DrawCanvasBackground(_canvasBufferContext);

			if(settings.showTestGrid)
				GenerateTestGrid();
			
			DrawGameTiles();
			Draw();	

			if(settings.debugWindow)
				debug.PrintGameBoard(settings,debug.printDebugWindow);
		}
	}
	// Debugging and Testing Functsions 
	,GenerateTestGrid = function(){
		var x = 0
		,y = 0
		,testGrid = 'rgb(234,234,234)'
		,testColor = 'rgb(128,128,128)';

		for(var i = 0; i < (settings.gameRows); i++){
			for(var j = 0;j < settings.columns; j++){
				_canvasContext.strokeStyle = testGrid;
				_canvasContext.lineWidth = 1;
				_canvasContext.strokeRect(x,y,settings.tileWidth,settings.tileHeight);

				//draw coords
				_canvasContext.fillStyle = testColor;
				_canvasContext.font = "bold 10px sans-serif";
				_canvasContext.textBaseline = 'top';
				_canvasContext.fillText(j + "," + i, x + 3,y + 3);

				x += settings.tileWidth;

			}
			y += settings.tileHeight
			x = 0;
		}
	}

	
	wdapp.DEBUG = {
		BEHAVIOR : 0x1,
		MOVEMENT : 0x2,
		SCORE : 0x4,
		TRANSITION : 0x8,
		DRAWING : 0x10
	}
	
	
	//init procedures
	//public API
	construct = function (opts){
		$.extend(settings,opts);

		_canvas = document.getElementById('wdCanvas');

		if (_canvas && _canvas.getContext) {
			_canvasContext = _canvas.getContext('2d');
			_canvasBuffer = document.createElement('canvas');
			_canvasBuffer.width = _canvas.width;
			_canvasBuffer.height = _canvas.height;
			_canvasBufferContext = _canvasBuffer.getContext('2d');

			canvasData = {
				_canvasContext : _canvasContext,
				_canvasBuffer : _canvasBuffer,
				_canvasBufferContext : _canvasBufferContext
			}


			$(document).bind("assetLoader_DONE",loadTitleScreen);
			WD.util.AssetLoader.loadAssets();

			//additional game events
			//Event.observe(document,'WD:gameover',this.endGame.bind(this));
			$(document).bind("gameover",endGame);
			$(_canvas).on('mousemove',mouseMoveHandler);
			$(_canvas).on('click',mouseClickHandler);

			this._scoreTracker = new scoretracker();
			console.info(this);
		}

	}

	construct.prototype = {
		constructor : WD.control.main,
		getSettings : function(){
			console.info(settings);
		}
		/**
		* @return void
		* @description - Updates the canvas.  Call this directly when doing additive updates to the canvas and don't need to clear anything, otherwise use UpdateView();
		**/
	}

	return construct;


}(WD));