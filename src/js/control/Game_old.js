/*define(['lib/prototype',
		'util/AssetLoader',
		'drawableElements/GameTile',
		'drawableElements/ScoreTracker',
		'control/Behavior',
		'control/Animation',
		'control/Location',
		'view/CanvasManager',
		],function(){*/
define(['prototype',
		'util/AssetLoader',
		'view/CanvasManager'],function(_,WDAssetLoader,WDCanvasManager){

			console.dir(WDAssetLoader);

	var WDGame = Class.create({
	_canvas : null,
	_canvasContext : null,
	_canvasBuffer : null,
	_canvasBufferContext : null,	
	gameBoard : null,
	lastgameBoard : [],
	actionTile : null,
	actionBehavior : null,  //'starter' gametile which represents the newly placed tile with potential to begin a reaction
	chainMemberIndex : 0,
	keysLocked : false,
	constantPiece : null,
	debugWindow : false,
	debugFlags : 0x0,
	scoreboard : null, //ScoreTracker
	startingPiecePositionX : 0,
	startingPiecePositionY : 0,
	score : 0,
	currentScreen : null,
	inLink : false, //temp global
	settings : null,
	timerID : null,
	paused : false,
	initialize : function (opts){
		this.settings = opts;
		//
		console.info('this fart!');
		if(this.settings && this.settings.constantPiece)
			this.constantPiece = this.settings.constantPiece;

		if(this.settings && this.settings.debugShow)
			this.debugFlags = this.settings.debugShow;

		this._canvas = document.getElementById('wdCanvas');
		if (this._canvas && this._canvas.getContext) {
			this._canvasContext = this._canvas.getContext('2d');
			this._canvasBuffer = document.createElement('canvas');
			this._canvasBuffer.width = this._canvas.width;
			this._canvasBuffer.height = this._canvas.height;
			this._canvasBufferContext = this._canvasBuffer.getContext('2d');
		}

		Event.observe(document,'assetLoader:done',this.loadTitleScreen.bind(this));
		WDAssetLoader.loadAssets();

		//additional game events
		
		Event.observe(document,'WD:gameover',this.endGame.bind(this));
    	$(this._canvas).observe('mousemove',this.mouseMoveHandler.bind(this));
    	$(this._canvas).observe('click',this.mouseClickHandler.bind(this));
    	console.info('this far!');
	},
	mouseMoveHandler : function(ev){
		
		 var x, y;

		  // Get the mouse position relative to the canvas element.
		  if (ev.layerX || ev.layerX == 0) { //for firefox
    		x = ev.layerX;
    		y = ev.layerY;
  		  }
  		  x-=this._canvas.offsetLeft;
  		  y-=this._canvas.offsetTop;

  		  if(WDCanvasManager.MouseReact(x,y,this.currentScreen,this)){
      			document.body.style.cursor = "pointer";
      			this.inLink=true;
  			} else {
      			document.body.style.cursor = "";
      			this.inLink=false;
  			}
		//console.info('x: ' + x + ' y ' + y);
	},
	mouseClickHandler : function(){
		if(this.inLink){
			this.startGame();
		}
	},
	loadTitleScreen : function(){
		this.startGame();
		//this.currentScreen = WDCanvasManager.Screen(WDCanvasManager.SCREENS.TITLE, this);
		//this.currentScreen = WDCanvasManager.Screen(WDCanvasManager.SCREENS.GAMEOVER, this);
	},
	startGame : function() {
		
		if(this.settings && this.settings.gameBoard)
			this.gameBoard = this.settings.gameBoard;
		else
			this.CreateTileMap();

		
		//debug window
		if(this.settings && this.settings.debugWindow)
			this.debugWindow = true;

		//show transition - debugging
		this.showTransition = (this.settings.showTransition !== undefined) ? this.settings.showTransition : true;

		//show test grig
		this.showTestGrid = (this.settings.showTestGrid !== undefined) ? this.settings.showTestGrid : false;

		if(this.showTestGrid)
			this.GenerateTestGrid();

		WDCanvasManager.DrawCanvasBackground(this._canvasBufferContext);

		//starting piece
		var startingPiece = (this.settings && this.settings.startingPiece !== undefined) ? this.settings.startingPiece : 1;
	 	startingPiecePositionX = (this.settings && this.settings.startingPiecePosition) ? this.settings.startingPiecePosition.x : 4;
		startingPiecePositionY = (this.settings && this.settings.startingPiecePosition) ? this.settings.startingPiecePosition.y : 2;
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY,startingPiece);
		this.DrawGameTiles();

		this.scoretracker = new WD.ScoreTracker; //temp
		this.scoretracker.drawScoreBoard(this._canvasBufferContext);
		

		this.Draw();

		if(this.debugWindow) {
			var _this = this;
			WD.Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);
			window.debugger = new WD.Debugger();
		}
		//register events
		$(document).observe('keydown',this.KeyGrab.bind(this));

		
		this.timerID = setInterval(this.AutoMove.bind(this),1000);
		
	},
	endGame : function(){
		clearInterval(this.timerID);
		WDCanvasManager.Screen(WDCanvasManager.SCREENS.GAMEOVER, this);
	},
	AutoMove : function(){
		if(typeof(this.actionTile)==='object'){
			this.actionTile.move(WD.Location.MoveDirection.DOWN);
		}
	},
	/**
	* @return void
	* @description - Completely refreshes and updates the canvas to the current state of the game.  To simply add to the canvas, use Draw()
	**/
	Update : function(){
		if(this.debugFlags & WDGame.debugDrawing)
				console.info('[DRAWING] Updating Canvas');

		this.ClearCanvas();

		WDCanvasManager.DrawCanvasBackground(this._canvasBufferContext);

		if(this.showTestGrid)
			this.GenerateTestGrid();
		
		this.DrawGameTiles();
		this.Draw();	

		if(this.debugWindow)
			WD.Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);

	},
	/**
	* @return void
	* @description - Updates the canvas.  Call this directly when doing additive updates to the canvas and don't need to clear anything, otherwise use Update();
	**/
	Draw : function(){
		this._canvasContext.drawImage(this._canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		this._canvasContext.clearRect(0,0,this._canvas.width,this._canvas.height-WD.ScoreTracker.prototype.height); //minus scoreboard
		this._canvasBufferContext.clearRect(0,0,this._canvasBuffer.width,this._canvasBuffer.height-WD.ScoreTracker.prototype.height);
	},
	CreateTileMap : function(){

			this.gameBoard = new Array(WDGame.defaultSettings.columns);
			for(var i = 0; i < this.gameBoard.length; i++){
					this.gameBoard[i] = new Array(WDGame.defaultSettings.gameRows);
					for (var j = 0; j < this.gameBoard[i].length; j++){
						this.gameBoard[i][j] = { val : 0, active : false };
					}


			}
			//console.info(gameBoard.length)
	},
	DrawGameTiles : function(){
		if(this.debugFlags & WDGame.debugDrawing)
				console.info('[DRAWING] Drawing Game Tiles');
		
		var coordX = 0;
		var coordY = 0;

		for(var col = 0; col < WDGame.defaultSettings.columns;col++){
			for(var row = 0; row < WDGame.defaultSettings.gameRows;row++){
				if(this.gameBoard[col][row].val > 0){
					var _gameTile = new WDGameTile({ xMap : col, yMap : row });
					_gameTile.setHeight(WDGame.defaultSettings.tileHeight);
					_gameTile.setWidth(WDGame.defaultSettings.tileWidth);
					_gameTile.setValue(this.gameBoard[col][row].val);

					if(this.gameBoard[col][row].active) {
						_gameTile.setStroke(WDGame.defaultSettings.actionTileStroke);
						_gameTile.setFill(WDGame.defaultSettings.actionTileFill);
					}
					
					_gameTile.render(this._canvasBufferContext,this.gameBoard[col][row].active);
				}

				coordY += WDGame.defaultSettings.tileHeight;
			}

			coordY = 0;
			coordX += WDGame.defaultSettings.tileWidth;
		}

		//update the canvas
		this.Draw();

	},
	CreateActionPiece : function(x,y,val) {
		if(this.constantPiece)
			val = this.constantPiece;

		this.actionTile = new WDGameTile({ xMap : x, yMap : y})
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(WDGameTile.currencyValues.length-1));
		else
			var singlePieceVal = val;

		this.actionTile.setValue(singlePieceVal+1);

		this.gameBoard[x][y] = { val : this.actionTile.getValue(), active : true };
	},
	KeyGrab : function(event){
		
		if(!this.keysLocked && [32,83,40,65,37,68,39].indexOf(event.keyCode) != -1 && !this.paused){
			
			clearInterval(this.timerID);
			var keyID = event.keyCode;
			
			switch (keyID) {
				case 32 : //Space
					this.actionTile.move(WD.Location.MoveDirection.EXPRESS);
				break;
				case 83 : //S
					this.actionTile.move(WD.Location.MoveDirection.DOWN);
				break;
				case 40: //down arrow
					this.actionTile.move(WD.Location.MoveDirection.DOWN);
				break; 
				case 65: //A
					this.actionTile.move(WD.Location.MoveDirection.LEFT);
				break;
				case 37: //left arrow
					this.actionTile.move(WD.Location.MoveDirection.LEFT);
				break;
				case 68: //D
					this.actionTile.move(WD.Location.MoveDirection.RIGHT);
				break;
				case 39: //right arrow
					this.actionTile.move(WD.Location.MoveDirection.RIGHT);
				break;
			}

			//start moving again
			this.timerID = setInterval(this.AutoMove.bind(this),1000);
		} else if(event.keyCode === 80) {
			(this.paused) ? this.timerID = setInterval(this.AutoMove.bind(this),1000) : clearInterval(this.timerID);
			this.paused = !this.paused;

			if(this.paused){
				WDCanvasManager.Screen(WDCanvasManager.SCREENS.PAUSE,this);
				this.Draw();
			} else {
				this.Update();
			}
			
		}
		
		//console.info(event);
	},
	Reactive : function(_gameTile){
		
		var searchVectors = Array(WD.Location.MoveDirection.LEFT,WD.Location.MoveDirection.DOWN,WD.Location.MoveDirection.RIGHT);
		
		this.actionBehavior = new WD.Behavior(_gameTile);
		
		for(var i = 0; i < searchVectors.length; i++){

			//Skip looking LEFT if tile is on left most column
			if((_gameTile.getMapLocation().x == 0) && 
				searchVectors[i] == WD.Location.MoveDirection.LEFT)
				i++;

			//Skip looking DOWN if tile is on bottom row
			if((WDGame.defaultSettings.gameRows-1 == _gameTile.getMapLocation().y) && 
				searchVectors[i] == WD.Location.MoveDirection.DOWN)
				i++;
			
			//Skip looking RIGHT if tile is on right most column
			if((_gameTile.getMapLocation().x == WDGame.defaultSettings.columns - 1) && 
				searchVectors[i] == WD.Location.MoveDirection.RIGHT)
				break;

			if(this.debugFlags & WDGame.debugBehavior)
				console.info('[BEHAVIOR] Checking:' + WD.Location.MoveDescription[searchVectors[i]]);

			var nextLocation = WD.Location.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
			var nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
			var nextLocationPosition = WD.Location.FindPhysicalLocation(nextLocation);
			var nextTileParams = { xPos : nextLocationPosition.x,
									yPos : nextLocationPosition.y,
									xMap : nextLocation.x,
									yMap : nextLocation.y,
									val : nextLocationVal
								};
								
								
			while(WD.Location.LegalRealm(nextLocation) &&  //next tile is in legal space
					nextLocationVal > 0 &&  //next tile isn't air
					this.actionBehavior.hasReaction(new WDGameTile(nextTileParams)) && //next tile has reaction
					this.actionBehavior.getAnimationStart() != true) //that next tile didn't start an instant reaction
				{
				
				nextLocation = WD.Location.TransformLocation(nextLocation,searchVectors[i]);
				
				if(WD.Location.LegalRealm(nextLocation)) {
					nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
					nextLocationCurrencyVal = WDGameTile.currencyValues[nextLocationVal];
					nextLocationPosition = WD.Location.FindPhysicalLocation(nextLocation);

					nextTileParams = { x : nextLocationPosition.x,
									y : nextLocationPosition.y,
									xMap : nextLocation.x,
									yMap : nextLocation.y,
									curVal : nextLocationCurrencyVal
								};
				}
				
			}
		}

		//console.info(this.actionBehavior.getChain());

		if(_gameTile.getQuad()){ //check if this is in a box configuration (e.g. 4 quarters)
			this.actionBehavior.runBoxCheck(_gameTile);
		}

		return this.actionBehavior.getAnimationStart();
	},
	StartBoardTransition : function(){
		if(this.debugFlags & WDGame.debugTransition)
				console.info('[TRANSITION] Starting Transition');

		var tileGroup = this.actionBehavior.getChain();
		
		//lock keys
		this.keysLocked = true;

		if(this.debugFlags & WDGame.debugTransition) {
			for(var i = 0; i < tileGroup.length; i++){
				console.info('[TRANSITION] tile ' + i + ' : ' + tileGroup[i].toString());
			}
		}
		
		for(i = tileGroup.length - 1; i >= 0; i--){
			console.info('zeroing out tiles index: x ' + tileGroup[i].getMapLocation().x + ' y ' + tileGroup[i].getMapLocation().y);
			this.gameBoard[tileGroup[i].getMapLocation().x][tileGroup[i].getMapLocation().y] = { val : 0, active : false }; //for now just make them disappear - we'll add fancy animation later
		}

		WD.Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);


		/**
		Normally, the first tile in the group (index[0]) will get upgraded, as the remaining tiles in the chain animate into it, but
		for vertical matches, the last tile in the array should get upgraded, since the first tile will drop to the last tile position
		**/
		var tileUpgradeIndex = (tileGroup[1].getDirection() === WD.Animation.DIRECTION.UP) ? tileGroup.length - 1 : 0,
		upgradedValue = this.actionBehavior.getUpgradedValue();
		
		if(upgradedValue.length ===1 && upgradedValue[0] === 5){ //we just made a dollar - update score and exit the transition
			this.score += 1;
			this.scoretracker.updateScore(this.score,this._canvasBufferContext);
			this.Draw();
			this.animationFinished();
			return;
		} 



		for(x=0;x<upgradedValue.length;x++){ //more than one tile will be upgraded
				this.gameBoard[tileGroup[tileUpgradeIndex].getMapLocation().x][tileGroup[tileUpgradeIndex].getMapLocation().y] = { val : upgradedValue[x], active : false };
				//opts = { xMap : tileGroup[tileUpgradeIndex].getMapLocation().x, yMap : tileGroup[tileUpgradeIndex].getMapLocation().y }
				//opts = { xMap : tileGroup[tileUpgradeIndex].getMapLocation().x, yMap : tileGroup[tileUpgradeIndex].getMapLocation().y, val : 3 }
				var opts = { xPos :  tileGroup[tileUpgradeIndex].getPosition().x,
										yPos : tileGroup[tileUpgradeIndex].getPosition().y,
										xMap : tileGroup[tileUpgradeIndex].getMapLocation().x,
										yMap : tileGroup[tileUpgradeIndex].getMapLocation().y,
										val : 2
									};
				//console.info(opts);
				this.actionBehavior.addChild(new WDGameTile(opts));
				//console.info(this.actionBehavior.getChildren())
				tileUpgradeIndex--;
		}
	
		this.chainMemberIndex = tileGroup.length;
		
		document.observe('WD::tileFinished',this.RunChainAnimation.bind(this));
		document.observe('WD::animationFinished',this.animationFinished.bind(this));

		if(this.showTransition){
			this.RunChainAnimation();
		} else {
			this.animationFinished();
		}
			
				
	} ,
	RunChainAnimation : function(){	
		console.info('RUNNING CHAIN ANIMATION');
		var tileGroup = this.actionBehavior.getChain();
		
		//console.info(this.chainMemberIndeLocx);
		if(this.chainMemberIndex>1){
			var _options = { animationType : WD.Animation.TYPE.SLIDE, 
								direction : tileGroup[--this.chainMemberIndex].getDirection(), 
								pixelSpeed : 40,  
								endEvent : 'WD::tileFinished' 
							};

			var animObject = new WD.Animation(_options);
			animObject.animateBlock(tileGroup[this.chainMemberIndex]);
		} else { 
			if(tileGroup[0].getMapLocation().y < (WDGame.defaultSettings.gameRows - 1)){ //move this only if tile is in the air (gravity move)
					var _options = { animationType : WD.Animation.TYPE.MOVE, 
								endX : tileGroup[tileGroup.length-1].getCanvasLocation().x, 
								endY : tileGroup[tileGroup.length-1].getCanvasLocation().y, 
								speed : 100, 
								pixelSpeed : 100, 
								endEvent : 'WD::animationFinished'
							};

					//animate action block
					//var _options = { animationType : WD.Animation.TYPE.MOVE, startX : 0, startY : 0, endX : 0, endY : 0, speed : 100,  endEvent : 'WD::animationFinished' };
					var animObject = new WD.Animation(_options);

					animObject.animateBlock(tileGroup[0]);
			} else {
				//console.info('calling animation Finished');
				this.animationFinished();
			}
			
		}
	},
	animationFinished : function(){
		if(this.debugFlags & WDGame.debugDrawing)
				console.info('[DRAWING] animationFinished()');
	
		//if there's another reaction, return
		//var children = this.actionBehavior.getChildren();
		
		//for(x=0;x<children.length;x++){
		//	children[x].checkRestingPlace();
		//	console.info(children[x]);
		//}

		this.keysLocked = false;
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY);
		this.scanForSpaces();
		this.Update();
	},
	// Debugging and Testing Functions 
	GenerateTestGrid : function(){

		var x = 0;
		var y = 0;
		var testGrid = 'rgb(234,234,234)';
		var testColor = 'rgb(128,128,128)';
		for(var i = 0; i < (WDGame.defaultSettings.gameRows); i++){
			for(var j = 0;j < WDGame.defaultSettings.columns; j++){
				this._canvasContext.strokeStyle = testGrid;
				this._canvasContext.lineWidth = 1;
				this._canvasContext.strokeRect(x,y,WDGame.defaultSettings.tileWidth,WDGame.defaultSettings.tileHeight);

				//draw coords
				this._canvasContext.fillStyle = testColor;
				this._canvasContext.font = "bold 10px sans-serif";
				this._canvasContext.textBaseline = 'top';
				this._canvasContext.fillText(j + "," + i, x + 3,y + 3);


				x += WDGame.defaultSettings.tileWidth;

			}
			y += WDGame.defaultSettings.tileHeight
			x = 0;
		}
		
	},
	scanForSpaces : function(){
		var tileAbove = {};
		//start with bottom row and move up
		for(var row = WDGame.defaultSettings.gameRows - 1; row > -1; row--){
			totalAcross = 0;
			for(var col = 0; col < WDGame.defaultSettings.columns; col++){
				var _gameTile = this.gameBoard[col][row];
				totalAcross += _gameTile.val;

				if(_gameTile.val===0) { //lookup
					tileAbove = WD.Location.TransformLocation({ x : col, y : row },WD.Location.MoveDirection.UP)
					
					if(this.gameBoard[tileAbove.x][tileAbove.y].val>0){ //this is a floating block
						this.gameBoard[col][row] = this.gameBoard[tileAbove.x][tileAbove.y]; //clone?
						this.gameBoard[tileAbove.x][tileAbove.y] = { val : 0, active : false }
					}
				}
			}
			//console.info('row' + row + ' total :' + totalAcross);
			if(totalAcross===0)
				break;
		}
	}


});

//some static constants
WDGame.defaultSettings =  { 
						columns : 9,						
						tileWidth : 50,
						tileHeight : 50,
						populatedRows : 2,
						gameRows: 10,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)'
					}

WDGame.debugBehavior = 0x1;
WDGame.debugMovement = 0x2;
WDGame.debugScore = 0x4;
WDGame.debugTransition = 0x8;
WDGame.debugDrawing = 0x10;

return WDGame;


});