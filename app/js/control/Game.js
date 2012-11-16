define(['util/AssetLoader',
		'drawableElements/GameTile',
		'drawableElements/ScoreTracker',
		'control/Behavior',
		'control/Animation',
		'control/Location',
		'view/CanvasManager',
		],function(){});

var Game = Class.create({
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

		Event.observe(window,'assetLoader:done',this.loadTitleScreen.bind(this));
		AssetLoader.loadAssets();

		//additional game events
		
		Event.observe(window,'WD:gameover',this.endGame.bind(this));
    	//$(this._canvas).observe('mousemove',this.mouseMoveHandler.bind(this));
    	$(this._canvas).observe('mousemove',this.mouseMoveHandler.bind(this));
    	$(this._canvas).observe('click',this.mouseClickHandler.bind(this));

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

  		  if(CanvasManager.MouseReact(x,y,this.currentScreen,this)){
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
		this.currentScreen = CanvasManager.Screen(CanvasManager.SCREENS.TITLE, this);
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

		CanvasManager.DrawCanvasBackground(this._canvasBufferContext);

		//starting piece
		var startingPiece = (this.settings && this.settings.startingPiece !== undefined) ? this.settings.startingPiece : 1;
	 	startingPiecePositionX = (this.settings && this.settings.startingPiecePosition) ? this.settings.startingPiecePosition.x : 4;
		startingPiecePositionY = (this.settings && this.settings.startingPiecePosition) ? this.settings.startingPiecePosition.y : 2;
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY,startingPiece);
		this.DrawGameTiles();

		this.scoretracker = new ScoreTracker; //temp
		this.scoretracker.drawScoreBoard(this._canvasBufferContext);
		

		this.Draw();

		//this.PrintGameBoardtoConsole();
		if(this.debugWindow) {
			var _this = this;
			Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);
			window.debugger = new Debugger();
		}
		//register events
		$(document).observe('keydown',this.KeyGrab.bind(this));

		
		this.timerID = setInterval(this.AutoMove.bind(this),1000);
		
	},
	endGame : function(){
		clearInterval(this.timerID);
		CanvasManager.Screen(CanvasManager.SCREENS.GAMEOVER, this);
	},
	AutoMove : function(){
		if(typeof(this.actionTile)==='object'){
			this.actionTile.move(Location.MoveDirection.DOWN);
		}
	},
	/**
	* @return void
	* @description - Completely refreshes and updates the canvas to the current state of the game.  To simply add to the canvas, use Draw()
	**/
	Update : function(){
		this.ClearCanvas();

		CanvasManager.DrawCanvasBackground(this._canvasBufferContext);

		if(this.showTestGrid)
			this.GenerateTestGrid();
		
		this.DrawGameTiles();
		this.Draw();	

		if(this.debugWindow)
			Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);

	},
	DrawCanvasBackground : function(){
		var my_gradient = this._canvasBufferContext.createLinearGradient(0,0,0,this._canvas.height-50);
		my_gradient.addColorStop(0,'rgb(68,134,146)');
		my_gradient.addColorStop(.75,'rgb(34,128,69)');
		my_gradient.addColorStop(1,'rgb(92,100,38)');
		
		this._canvasBufferContext.fillStyle = my_gradient;//this.backgroundColor;
		this._canvasBufferContext.fillRect(0,0,this._canvas.width,this._canvas.height-50);
	},
	/**
	* @return void
	* @description - Updates the canvas.  Call this directly when doing additive updates to the canvas and don't need to clear anything, otherwise use Update();
	**/
	Draw : function(){
		this._canvasContext.drawImage(this._canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		this._canvasContext.clearRect(0,0,this._canvas.width,this._canvas.height-ScoreTracker.prototype.height); //minus scoreboard
		this._canvasBufferContext.clearRect(0,0,this._canvasBuffer.width,this._canvasBuffer.height-ScoreTracker.prototype.height);
	},
	CreateTileMap : function(){
			this.gameBoard = new Array(Game.defaultSettings.columns);
			for(var i = 0; i < this.gameBoard.length; i++){
					this.gameBoard[i] = new Array(Game.defaultSettings.gameRows);
					for (var j = 0; j < this.gameBoard[i].length; j++){
						this.gameBoard[i][j] = { val : 0, active : false };
					}


			}
			//console.info(gameBoard.length)
	},
	DrawGameTiles : function(){
		
		var coordX = 0;
		var coordY = 0;

		for(var col = 0; col < Game.defaultSettings.columns;col++){
			for(var row = 0; row < Game.defaultSettings.gameRows;row++){
				if(this.gameBoard[col][row].val > 0){
					var _gameTile = new GameTile({ xMap : col, yMap : row });
					_gameTile.setHeight(Game.defaultSettings.tileHeight);
					_gameTile.setWidth(Game.defaultSettings.tileWidth);
					_gameTile.setValue(this.gameBoard[col][row].val);

					if(this.gameBoard[col][row].active) {
						_gameTile.setStroke(Game.defaultSettings.actionTileStroke);
						_gameTile.setFill(Game.defaultSettings.actionTileFill);
					}
					
					_gameTile.render(this._canvasBufferContext,this.gameBoard[col][row].active);
				}

				coordY += Game.defaultSettings.tileHeight;
			}

			coordY = 0;
			coordX += Game.defaultSettings.tileWidth;
		}

		//update the canvas
		this.Draw();

	},
	CreateActionPiece : function(x,y,val) {
		if(this.constantPiece)
			val = this.constantPiece;

		this.actionTile = new GameTile({ xMap : x, yMap : y})
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(GameTile.currencyValues.length-1));
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
					this.actionTile.move(Location.MoveDirection.EXPRESS);
				break;
				case 83 : //S
					this.actionTile.move(Location.MoveDirection.DOWN);
				break;
				case 40: //down arrow
					this.actionTile.move(Location.MoveDirection.DOWN);
				break; 
				case 65: //A
					this.actionTile.move(Location.MoveDirection.LEFT);
				break;
				case 37: //left arrow
					this.actionTile.move(Location.MoveDirection.LEFT);
				break;
				case 68: //D
					this.actionTile.move(Location.MoveDirection.RIGHT);
				break;
				case 39: //right arrow
					this.actionTile.move(Location.MoveDirection.RIGHT);
				break;
			}

			//start moving again
			this.timerID = setInterval(this.AutoMove.bind(this),1000);
		} else if(event.keyCode === 80) {
			(this.paused) ? this.timerID = setInterval(this.AutoMove.bind(this),1000) : clearInterval(this.timerID);
			this.paused = !this.paused;

			if(this.paused){
				CanvasManager.Screen(CanvasManager.SCREENS.PAUSE,this);
				this.Draw();
			} else {
				this.Update();
			}
			
		}
		
		//console.info(event);
	},
	Reactive : function(_gameTile){
		
		var searchVectors = Array(Location.MoveDirection.LEFT,Location.MoveDirection.DOWN,Location.MoveDirection.RIGHT);
		
		this.actionBehavior = new Behavior(_gameTile);
		
		for(var i = 0; i < searchVectors.length; i++){

			//Skip looking LEFT if tile is on left most column
			if((_gameTile.getMapLocation().x == 0) && 
				searchVectors[i] == Location.MoveDirection.LEFT)
				i++;

			//Skip looking DOWN if tile is on bottom row
			if((Game.defaultSettings.gameRows-1 == _gameTile.getMapLocation().y) && 
				searchVectors[i] == Location.MoveDirection.DOWN)
				i++;
			
			//Skip looking RIGHT if tile is on right most column
			if((_gameTile.getMapLocation().x == Game.defaultSettings.columns - 1) && 
				searchVectors[i] == Location.MoveDirection.RIGHT)
				break;

			if(this.debugFlags & Game.debugBehavior)
				console.info('[BEHAVIOR] Checking:' + Location.MoveDescription[searchVectors[i]]);

			var nextLocation = Location.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
			var nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
			var nextLocationPosition = Location.FindPhysicalLocation(nextLocation);
			var nextTileParams = { xPos : nextLocationPosition.x,
									yPos : nextLocationPosition.y,
									xMap : nextLocation.x,
									yMap : nextLocation.y,
									val : nextLocationVal
								};
								
								
			while(Location.LegalRealm(nextLocation) &&  //next tile is in legal space
					nextLocationVal > 0 &&  //next tile isn't air
					this.actionBehavior.hasReaction(new GameTile(nextTileParams)) && //next tile has reaction
					this.actionBehavior.getAnimationStart() != true) //that next tile didn't start an instant reaction
				{
				
				nextLocation = Location.TransformLocation(nextLocation,searchVectors[i]);
				
				if(Location.LegalRealm(nextLocation)) {
					nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
					nextLocationCurrencyVal = GameTile.currencyValues[nextLocationVal];
					nextLocationPosition = Location.FindPhysicalLocation(nextLocation);

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
		if(this.debugFlags & Game.debugTransition)
				console.info('[TRANSITION] Starting Transition');

		var tileGroup = this.actionBehavior.getChain();
		
		//lock keys
		this.keysLocked = true;

		if(this.debugFlags & Game.debugTransition) {
			for(var i = 0; i < tileGroup.length; i++){
				console.info('[TRANSITION] tile ' + i + ' : ' + tileGroup[i].toString());
			}
		}
		
		for(i = tileGroup.length - 1; i >= 0; i--){
			//console.info('zeroing out tiles index: x ' + tileGroup[i].getMapLocation().x + ' y ' + tileGroup[i].getMapLocation().y);
			this.gameBoard[tileGroup[i].getMapLocation().x][tileGroup[i].getMapLocation().y] = { val : 0, active : false }; //for now just make them disappear - we'll add fancy animation later
		}


		/**
		Normally, the first tile in the group (index[0]) will get upgraded, as the remaining tiles in the chain animate into it, but
		for vertical matches, the last tile in the array should get upgraded, since the first tile will drop to the last tile position
		**/
		var tileUpgradeIndex = (tileGroup[1].getDirection() === WDAnimation.DIRECTION.UP) ? tileGroup.length - 1 : 0; 
		
		if(this.actionBehavior.getUpgradedValue() === 5){
			this.score += 1;
			this.scoretracker.updateScore(this.score,this._canvasBufferContext);
			this.Draw();
		} else {
			upgradedValue = this.actionBehavior.getUpgradedValue();
		}

		if(this.actionBehavior.getUpgradedValue()>0 && this.actionBehavior.getUpgradedValue()<5){
			this.gameBoard[tileGroup[tileUpgradeIndex].getMapLocation().x][tileGroup[tileUpgradeIndex].getMapLocation().y] = { val : this.actionBehavior.getUpgradedValue(), active : false };
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
		
		//console.info(this.chainMemberIndex);
		if(this.chainMemberIndex>1){
			var _options = { animationType : WDAnimation.TYPE.SLIDE, 
								direction : tileGroup[--this.chainMemberIndex].getDirection(), 
								pixelSpeed : 40,  
								endEvent : 'WD::tileFinished' 
							};

			var animObject = new WDAnimation(_options);
			animObject.animateBlock(tileGroup[this.chainMemberIndex]);
		} else { 
			if(tileGroup[0].getMapLocation().y < (Game.defaultSettings.gameRows - 1)){ //move this only if tile is in the air (gravity move)
					var _options = { animationType : WDAnimation.TYPE.MOVE, 
								endX : tileGroup[tileGroup.length-1].getCanvasLocation().x, 
								endY : tileGroup[tileGroup.length-1].getCanvasLocation().y, 
								speed : 100, 
								pixelSpeed : 100, 
								endEvent : 'WD::animationFinished'
							};

					//animate action block
					//var _options = { animationType : WDAnimation.TYPE.MOVE, startX : 0, startY : 0, endX : 0, endY : 0, speed : 100,  endEvent : 'WD::animationFinished' };
					var animObject = new WDAnimation(_options);

					animObject.animateBlock(tileGroup[0]);
			} else {
				//console.info('calling animation Finished');
				this.animationFinished();
			}
			
		}
	},
	animationFinished : function(){
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
		for(var i = 0; i < (Game.defaultSettings.gameRows); i++){
			for(var j = 0;j < Game.defaultSettings.columns; j++){
				this._canvasContext.strokeStyle = testGrid;
				this._canvasContext.lineWidth = 1;
				this._canvasContext.strokeRect(x,y,Game.defaultSettings.tileWidth,Game.defaultSettings.tileHeight);

				//draw coords
				this._canvasContext.fillStyle = testColor;
				this._canvasContext.font = "bold 10px sans-serif";
				this._canvasContext.textBaseline = 'top';
				this._canvasContext.fillText(j + "," + i, x + 3,y + 3);


				x += Game.defaultSettings.tileWidth;

			}
			y += Game.defaultSettings.tileHeight
			x = 0;
		}
		
	},
	scanForSpaces : function(){
		var tileAbove = {};
		//start with bottom row and move up
		for(var row = Game.defaultSettings.gameRows - 1; row > -1; row--){
			totalAcross = 0;
			for(var col = 0; col < Game.defaultSettings.columns; col++){
				var _gameTile = this.gameBoard[col][row];
				totalAcross += _gameTile.val;

				if(_gameTile.val===0) { //lookup
					tileAbove = Location.TransformLocation({ x : col, y : row },Location.MoveDirection.UP)
					
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


Game.defaultSettings =  { 
						columns : 9,						
						tileWidth : 50,
						tileHeight : 50,
						populatedRows : 2,
						gameRows: 10,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)'
					}

Game.debugBehavior = 0x1;
Game.debugMovement = 0x2;
Game.debugScore = 0x4;
Game.debugTransition = 0x8;