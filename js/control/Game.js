var Game = Class.create({
	_canvas : null,
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
	settings : null,
	initialize : function (opts){
		this.settings = opts;

		
		if(opts && opts.constantPiece)
			this.constantPiece = opts.constantPiece;

		if(opts && opts.debugShow)
			this.debugFlags = opts.debugShow;

		this._canvas = document.getElementById('wdCanvas');
		if (this._canvas && this._canvas.getContext) {
			_canvasContext = this._canvas.getContext('2d'); //_canvasContext gets attached to window by ref here
			_canvasBuffer = document.createElement('canvas');
			_canvasBuffer.width = this._canvas.width;
			_canvasBuffer.height = this._canvas.height;
			_canvasBufferContext = _canvasBuffer.getContext('2d');
		}
		
		
		if(opts && opts.gameBoard)
			this.gameBoard = opts.gameBoard;
		else
			this.CreateTileMap();

		
		//debug window
		if(opts && opts.debugWindow)
			this.debugWindow = true;

		//show transition - debugging
		this.showTransition = (opts.showTransition !== undefined) ? opts.showTransition : true;

		//show test grig
		this.showTestGrid = (opts.showTestGrid !== undefined) ? opts.showTestGrid : false;

		if(this.showTestGrid)
			this.GenerateTestGrid();

		//starting piece
		var startingPiece = (opts && opts.startingPiece !== undefined) ? opts.startingPiece : 1;
	 	startingPiecePositionX = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.x : 4;
		startingPiecePositionY = (opts && opts.startingPiecePosition) ? opts.startingPiecePosition.y : 2;
		this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY,startingPiece);
		this.DrawGameTiles();

		this.scoretracker = new ScoreTracker; //temp
		this.scoretracker.drawScoreBoard(_canvasBufferContext);
		

		this.Draw();
		//this.PrintGameBoardtoConsole();
		if(this.debugWindow) {
			var _this = this;
			Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);
			window.debugger = new Debugger();
		}
		//register events
		$(document).observe('keydown',this.KeyGrab.bind(this));
		
	},

	Update : function(){
		this.ClearCanvas();
		if(this.showTestGrid)
			this.GenerateTestGrid();
		
		this.DrawGameTiles();
		this.Draw();	

		if(this.debugWindow)
			Debugger.PrintGameBoardtoDebugWindow(this.gameBoard);

	},

	Draw : function(){
		_canvasContext.drawImage(_canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		_canvasContext.clearRect(0,0,this._canvas.width,this._canvas.height-ScoreTracker.prototype.height); //minus scoreboard
		_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height-ScoreTracker.prototype.height);
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
					var _gameTile = new GameTile({ xPos : coordX, yPos : coordY, mapX : col, mapY : row });
					_gameTile.setHeight(Game.defaultSettings.tileHeight);
					_gameTile.setWidth(Game.defaultSettings.tileWidth);
					_gameTile.setValue(this.gameBoard[col][row].val);

					if(this.gameBoard[col][row].active) {
						_gameTile.setStroke(Game.defaultSettings.actionTileStroke);
						_gameTile.setFill(Game.defaultSettings.actionTileFill);
					}
					//console.info('rendering game tile');
					_gameTile.render(_canvasBufferContext,this.gameBoard[col][row].active);
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

		actionTile = new GameTile({ mapX : x, mapY : y});
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(GameTile.currencyValues.length-1));
		else
			var singlePieceVal = val;

		actionTile.setValue(singlePieceVal+1);	
		this.gameBoard[x][y] = { val : actionTile.getValue(), active : true };
	},
	KeyGrab : function(event){
		if(!this.keysLocked){
			var keyID = event.keyCode;
			
			switch (keyID) {
				case 32 : //Space
					actionTile.move(Location.MoveDirection.EXPRESS);
				break;
				case 83 : //S
					actionTile.move(Location.MoveDirection.DOWN);
				break;
				case 40: //down arrow
					actionTile.move(Location.MoveDirection.DOWN);
				break; 
				case 65: //A
					actionTile.move(Location.MoveDirection.LEFT);
				break;
				case 37: //left arrow
					actionTile.move(Location.MoveDirection.LEFT);
				break;
				case 68: //D
					actionTile.move(Location.MoveDirection.RIGHT);
				break;
				case 39: //right arrow
					actionTile.move(Location.MoveDirection.RIGHT);
				break;
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
									mapX : nextLocation.x,
									mapY : nextLocation.y,
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
									mapX : nextLocation.x,
									mapY : nextLocation.y,
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
			this.scoretracker.updateScore(this.score,_canvasBufferContext);
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
				_canvasContext.strokeStyle = testGrid;
				_canvasContext.lineWidth = 1;
				_canvasContext.strokeRect(x,y,Game.defaultSettings.tileWidth,Game.defaultSettings.tileHeight);

				//draw coords
				_canvasContext.fillStyle = testColor;
				_canvasContext.font = "bold 10px sans-serif";
				_canvasContext.textBaseline = 'top';
				_canvasContext.fillText(j + "," + i, x + 3,y + 3);


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