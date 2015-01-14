/**
* Main game controller class
* Dependencies:
* jQuery ($.extend(),$.bind()), BaseExtensions
*
*/
define(['jquery',
		'control/Location',
		'control/Behavior',
		'view/CanvasManager',
		'drawableElements/GameTile',
		'drawableElements/ScoreTracker',
		'debug/Debugger',
		'util/AssetLoader',
		'util/Helpers'],function($,WDLocation,WDBehavior, canvasmanager,GameTile,ScoreTracker,Debugger,AssetLoader,Helpers) {

			//console.info('gamenew')
			//debugger;

		var settings = {
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
		,actionTile = null // the tile in play
		,keysLocked
		,paused
		,timerID
		/* START MAIN */
		,main = (function(){
			var _cx;

			//debugger;

			//private methods
			var loadTitleScreen = function(){
				if(settings.skipTitle) {
					startGame();
				} else {
					//debugger;
					currentScreen = _cx.CanvasManager.Screen(_cx.CanvasManager.SCREENS.TITLE, canvasData,Draw);
				}
			},
			setContext = function(context){
				_cx = context;
			}
			,Draw = function(){
				_canvasContext.drawImage(_canvasBuffer, 0, 0);
			}
			,ClearCanvas = function(){
				_canvasContext.clearRect(0,0,_canvas.width,_canvas.height-_cx.ScoreTracker.getHeight()); //minus scoreboard
				_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height-_cx.ScoreTracker.getHeight());
			}
			,
			CreateTileMap = function(){
				gameBoard = Helpers.matrix(settings.columns,settings.gameRows,{ val : 0, active : GameTile.STATE.INACTIVE });
			},
			DrawGameTiles = function(){
//debugger;
				//if(settings.debugFlags & _wd.DEBUG.DRAWING)
						console.info('[DRAWING] Drawing Game Tiles');
						Debugger.PrintGameBoardtoDebugWindow(gameBoard);
				var coordX = 0;
				var coordY = 0;

				for(var col = 0; col < settings.columns;col++){
					for(var row = 0; row < settings.gameRows;row++){
						if(gameBoard[col][row].hasOwnProperty('currencyValue')){
							console.info('creating game tile at ' + col + ' ' + row);

							
							var _gameTile = gameBoard[col][row];
							_gameTile.toString();
							debugger;
							/*
							_gameTile.setHeight(settings.tileHeight);
							_gameTile.setWidth(settings.tileWidth);
							_gameTile.setValue(gameBoard[col][row].val);
							*/
							/*
							if(gameBoard[col][row].active === GameTile.STATE.ACTIVE) {
								_gameTile.setStroke(settings.actionTileStroke);
								_gameTile.setFill(settings.actionTileFill);
							}
							*/
						//	debugger;
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
				clearInterval(timerID);
				WD.CanvasManager.Screen(WD.CanvasManager.SCREENS.GAMEOVER, this);
			}
			,mouseMoveHandler = function(ev){
				 var x, y;
				  // Get the mouse position relative to the canvas element.
		    		x = ev.clientX;
		    		y = ev.clientY;

		  		  x-=_canvas.offsetLeft;
		  		  y-=_canvas.offsetTop;

		  		  if(_cx.CanvasManager.MouseReact(x,y,currentScreen,canvasData)){
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
				//console.info('startGame!');

				if(settings.gameBoard){
					gameBoard = settings.gameBoard;
				} else {
					CreateTileMap();
				}


				if(settings.showTestGrid){
					GenerateTestGrid();
				} else {
					_cx.CanvasManager.DrawCanvasBackground(_canvasBufferContext);
				}

				//starting piece
				createActionPiece(settings.startingPiecePosition.x,settings.startingPiecePosition.y,settings.startingPiece);
				console.info('called from startGame');
				DrawGameTiles();

				_cx.ScoreTracker.drawScoreBoard(_canvasBufferContext);

				Draw();

				//debugger;

				if(settings.debugWindow)
					Debugger.PrintGameBoardtoDebugWindow(gameBoard);


				$(document).bind("keydown",KeyGrab);

				timerID = setInterval(AutoMove.bind(this),250);

			}
			,createActionPiece = function(x,y,val) {


				if(settings.constantPiece)
					val = settings.constantPiece;


					actionTile = new GameTile({ xMap : x, yMap : y},settings)

				if(val === null)
					var singlePieceVal = (Math.floor(Math.random()*(actionTile.currencyValues.length-1))) + 1;
				else
					var singlePieceVal = val;


				actionTile.setValue(singlePieceVal);
				gameBoard[x][y] = actionTile;//{ val : actionTile.getValue(), active : GameTile.STATE.ACTIVE };

				//console.info('create action piece');
			 	scanForSpaces();

				//UpdateView();
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

							tileAbove = WDLocation.TransformLocation({ x : col, y : row },WDLocation.MoveDirection.UP,settings)

							if(gameBoard[tileAbove.x][tileAbove.y].val>0){ //this is a floating block
								//console.info('x: ' + tileAbove.x + ' y: ' + tileAbove.y);
								//console.info(this.gameBoard[tileAbove.x][tileAbove.y].active);
								if(gameBoard[tileAbove.x][tileAbove.y].active===GameTile.STATE.INACTIVE){
									gameBoard[tileAbove.x][tileAbove.y].active = GameTile.STATE.ANGEL;
								} else if (gameBoard[tileAbove.x][tileAbove.y].active===GameTile.STATE.ANGEL) { //move down one and check reaction
									//console.info(this.gameBoard[col][row].toString());
									gameBoard[col][row] = gameBoard[tileAbove.x][tileAbove.y];
									gameBoard[col][row].active = GameTile.STATE.INACTIVE;
									gameBoard[tileAbove.x][tileAbove.y] = { val : 0, active : GameTile.STATE.INACTIVE }
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
			,UpdateView = function(){

				if(!settings.testing) {
					if(settings.debugFlags & _wd.DEBUG.DRAWING)
							console.info('[DRAWING] Updating Canvas');

					ClearCanvas();

					canvasmanager.DrawCanvasBackground(_canvasBufferContext);

					if(settings.showTestGrid)
						GenerateTestGrid();

						//console.info('called from UpdateView');
					DrawGameTiles();
				//	debugger;
					Draw();


					if(settings.debugWindow)
						Debugger.PrintGameBoardtoDebugWindow(gameBoard);

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
			,KeyGrab = function(event){
				//console.info(actionTile);
				if(!keysLocked && [32,83,40,65,37,68,39].indexOf(event.keyCode) != -1 && !paused){

					clearInterval(timerID);
					var keyID = event.keyCode;


					switch (keyID) {
						case 32 : //Space
							actionTile.move(WDLocation.MoveDirection.EXPRESS);
						break;
						case 83 : //S
							actionTile.move(WDLocation.MoveDirection.DOWN);
						break;
						case 40: //down arrow
							actionTile.move(WDLocation.MoveDirection.DOWN);
						break;
						case 65: //A
							actionTile.move(WDLocation.MoveDirection.LEFT);
						break;
						case 37: //left arrow
							actionTile.move(WDLocation.MoveDirection.LEFT);
						break;
						case 68: //D
							actionTile.move(WDLocation.MoveDirection.RIGHT);
						break;
						case 39: //right arrow
							actionTile.move(WDLocation.MoveDirection.RIGHT);
						break;
					}

					//start moving again
					timerID = setInterval(AutoMove,1000);
				} else if(event.keyCode === 80) {
					(paused) ? timerID = setInterval(AutoMove,1000) : clearInterval(timerID);
					paused = !paused;

					if(paused){
						WD.CanvasManager.Screen(WD.CanvasManager.SCREENS.PAUSE,this);
						Draw();
					} else {
						UpdateView();
					}

				}

				//console.info(event);
			}
			,AutoMove = function(){
				if(typeof(actionTile)==='object'){
					actionTile.move(WDLocation.MoveDirection.DOWN);
				}
			}
			/* Searches surrounding tiles and returns true if a transition needs to happen
			* @param object GameTile The action tile in question
			* @return bool
			*/
			,Reactive = function(_gameTile){

				var searchVectors = Array(WDLocation.MoveDirection.LEFT,WDLocation.MoveDirection.DOWN,WDLocation.MoveDirection.RIGHT);

				this.actionBehavior = new WDBehavior(_gameTile);

				for(var i = 0; i < searchVectors.length; i++){

					//Skip looking LEFT if tile is on left most column
					if((_gameTile.getMapLocation().x == 0) &&
						searchVectors[i] == WDLocation.MoveDirection.LEFT)
						i++;

					//Skip looking DOWN if tile is on bottom row
					if((settings.gameRows-1 == _gameTile.getMapLocation().y) &&
						searchVectors[i] == WDLocation.MoveDirection.DOWN)
						i++;

					//Skip looking RIGHT if tile is on right most column
					if((_gameTile.getMapLocation().x == settings.columns - 1) &&
						searchVectors[i] == WDLocation.MoveDirection.RIGHT)
						break;

					//if(this.debugFlags & WD.Game.debugBehavior)
						//console.info('[BEHAVIOR] Checking:' + WDLocation.MoveDescription[searchVectors[i]]);

					var nextLocation = WDLocation.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
					var nextLocationVal = gameBoard[nextLocation.x][nextLocation.y].val;
					var nextLocationPosition = WDLocation.FindPhysicalLocation(nextLocation);
					var nextTileParams = { xPos : nextLocationPosition.x,
											yPos : nextLocationPosition.y,
											xMap : nextLocation.x,
											yMap : nextLocation.y,
											val : nextLocationVal
										};

					//start a lookahead for reactive tiles
					while(WDLocation.LegalRealm(nextLocation) &&  //next tile is in legal space
							nextLocationVal > 0 &&  //next tile isn't air
							this.actionBehavior.hasReaction(new GameTile(nextTileParams)) && //next tile has reaction
							this.actionBehavior.getAnimationStart() != true) //that next tile didn't start an instant reaction
						{

						nextLocation = WDLocation.TransformLocation(nextLocation,searchVectors[i]);

						if(WDLocation.LegalRealm(nextLocation)) {
							nextLocationVal = gameBoard[nextLocation.x][nextLocation.y].val;
							nextLocationCurrencyVal = WD.GameTile.currencyValues[nextLocationVal];
							nextLocationPosition = WDLocation.FindPhysicalLocation(nextLocation);

							nextTileParams = { x : nextLocationPosition.x,
											y : nextLocationPosition.y,
											xMap : nextLocation.x,
											yMap : nextLocation.y,
											curVal : nextLocationCurrencyVal
										};
						}

					}
				}

				if(_gameTile.getQuad()){ //check if this is in a box configuration (e.g. 4 quarters)
					this.actionBehavior.runBoxCheck(_gameTile);
				}

				return this.actionBehavior.getAnimationStart();
			}

			/*
				wdapp.DEBUG = {
					BEHAVIOR : 0x1,
					MOVEMENT : 0x2,
					SCORE : 0x4,
					TRANSITION : 0x8,
					DRAWING : 0x10
				}
			*/

			//public functions
			return {
				endGame : endGame,
				loadTitleScreen : loadTitleScreen,
				mouseMoveHandler : mouseMoveHandler,
				mouseClickHandler : mouseClickHandler,
				setContext : setContext,
				UpdateView : UpdateView,
				Reactive : Reactive,
				createActionPiece: createActionPiece
			}

		}());
/* END MAIN */

//console.dir(main);



//console.dir(AssetLoader);
//
        return {
            start : function (opts){
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
					//debugger;

					main.setContext({ ScoreTracker : ScoreTracker,
										 CanvasManager: canvasmanager,
										})
					$(document).on("assetLoader_DONE",main.loadTitleScreen);
					//debugger;
					AssetLoader.loadAssets();

					//additional game events
					//Event.observe(document,'WD:gameover',this.endGame.bind(this));
					//debugger;
					$(document).bind("gameover",main.endGame);
					$(_canvas).on('mousemove',main.mouseMoveHandler);
					$(_canvas).on('click',main.mouseClickHandler);

				}
			},
			getSettings : function(){
				return settings;
			},
			defaultSettings : {
						columns : 9,
						tileWidth : 50,
						tileHeight : 50,
						populatedRows : 2,
						gameRows: 10,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)'
					},
			getGameBoard : function() {
				return gameBoard;
			},
			UpdateView : function(){
				return main.UpdateView();
			},
			Reactive : function(_gameTile){
				return main.Reactive(_gameTile);
			},
			createActionPiece : function(x,y,val){
				x = (x === undefined) ? settings.startingPiecePosition.x : x;
				y = (y === undefined) ? settings.startingPiecePosition.y : y;

				return main.createActionPiece(x,y,val);
			},
			currencyValues :  [-1,1,5,10,25],
			DEBUG : {
				BEHAVIOR : 0x1,
				MOVEMENT : 0x2,
				SCORE : 0x4,
				TRANSITION : 0x8,
				DRAWING : 0x10
			}
        }
    }
);
