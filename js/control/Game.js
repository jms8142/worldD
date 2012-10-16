var Game = Class.create({
	/** all references to these members need to have a this prefix **/
	_canvas : null,
	_canvasBuffer : null,
	_canvasBufferContext : null,
	defaultSettings : { 
						columns : 9,						
						tileWidth : 50,
						tileHeight : 50,
						populatedRows : 2,
						gameRows: 10,
						actionTileFill: 'rgb(251,182,182)',
						actionTileStroke: 'rgb(255,0,0)'
					},
	gameBoard : null,
	lastgameBoard : [],
	lastTest : 0,
	actionTile : null,
	MoveDescription : ["Left","Down","Right"], //for debugging
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
	_location : null, //Location object
	initialize : function (opts){

		this._location = new Location();
		
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
			this.PrintGameBoardtoDebugWindow();
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
		//window.debugger.PrintGameBoardtoConsole(this.defaultSettings.gameRows,this.defaultSettings.columns,this.gameBoard);

		if(this.debugWindow)
			this.PrintGameBoardtoDebugWindow();

	},

	Draw : function(){
		_canvasContext.drawImage(_canvasBuffer, 0, 0);
	},
	ClearCanvas : function(){
		_canvasContext.clearRect(0,0,this._canvas.width,this._canvas.height-ScoreTracker.prototype.height); //minus scoreboard
		_canvasBufferContext.clearRect(0,0,_canvasBuffer.width,_canvasBuffer.height-ScoreTracker.prototype.height);
	},
	CreateTileMap : function(){
			this.gameBoard = new Array(this.defaultSettings.columns);
			for(var i = 0; i < this.gameBoard.length; i++){
					this.gameBoard[i] = new Array(this.defaultSettings.gameRows);
					for (var j = 0; j < this.gameBoard[i].length; j++){
						//pick random game tile value from currencyValues
						//if(j < (this.defaultSettings.gameRows - this.defaultSettings.populatedRows)){
							this.gameBoard[i][j] = { val : 0, active : false };
						//} else {
						//	var randomVal = Math.floor(Math.random()*(this.defaultSettings.currencyValues.length-1));	
						//	gameBoard[i][j] = { val : (randomVal + 1), active : false };
						//}
						
					}


			}
			//console.info(gameBoard.length)
	},
	DrawGameTiles : function(){
		var coordX = 0;
		var coordY = 0;
		

		for(var col = 0; col < this.defaultSettings.columns;col++){
			for(var row = 0; row < this.defaultSettings.gameRows;row++){
				if(this.gameBoard[col][row].val > 0){
					var _gameTile = new GameTile({ xPos : coordX, yPos : coordY, mapX : col, mapY : row });
					_gameTile.setHeight(this.defaultSettings.tileHeight);
					_gameTile.setWidth(this.defaultSettings.tileWidth);
					_gameTile.setValue(this.gameBoard[col][row].val);

					if(this.gameBoard[col][row].active) {
						_gameTile.setStroke(this.defaultSettings.actionTileStroke);
						_gameTile.setFill(this.defaultSettings.actionTileFill);
					}

					_gameTile.render(_canvasBufferContext);
				}

				coordY += this.defaultSettings.tileHeight;
			}

			coordY = 0;
			coordX += this.defaultSettings.tileWidth;
		}

		//update the canvas
		this.Draw();

	},
	CreateActionPiece : function(x,y,val) {
		//console.info(x);
		if(this.constantPiece)
			val = this.constantPiece;

		actionTile = new GameTile(this.LocationMapper({ xPos : x, yPos : y, mapX : x, mapY : y}));
		if(val === undefined) 
			var singlePieceVal = Math.floor(Math.random()*(GameTile.prototype.currencyValues.length-1));
		else
			var singlePieceVal = val;

		actionTile.setValue(singlePieceVal+1);	
		this.gameBoard[x][y] = { val : actionTile.getValue(), active : true };
	},
	LocationMapper : function(MapCoordinates) {
		MapCoordinates.x *= this.defaultSettings.tileWidth;
		MapCoordinates.y *= this.defaultSettings.tileHeight;
		return MapCoordinates;
	},
	KeyGrab : function(event){
		if(!this.keysLocked){
			var keyID = event.keyCode;
			switch (keyID) {
				case 83 : //S
					this.Move(this._location.MoveDirection.DOWN);
				break;
				case 40: //down arrow
					this.Move(this._location.MoveDirection.DOWN);
				break; 
				case 65: //A
					this.Move(this._location.MoveDirection.LEFT);
				break;
				case 37: //left arrow
					this.Move(this._location.MoveDirection.LEFT);
				break;
				case 68: //D
					this.Move(this._location.MoveDirection.RIGHT);
				break;
				case 39: //right arrow
					this.Move(this._location.MoveDirection.RIGHT);
				break;
			}
		}
		
		//console.info(event);
	},
	Move : function(direction){
			
		//this.lastgameBoard = jQuery.extend(true, {}, this.gameBoard);
		this.lastgameBoard.push(jQuery.extend(true, {}, this.gameBoard));
		window.debugger.updateSnapshotText(this.lastgameBoard.length);

		if(this.ValidateMove(actionTile.getMapLocation(),direction)){

			//console.clear();
			
			this.lastTest = 1;
			//window.debugger.PrintGameBoardtoConsole(this.defaultSettings.gameRows,this.defaultSettings.columns,this.gameBoard);
			//console.info('-')
		
			this.gameBoard[actionTile.getMapLocation().x][actionTile.getMapLocation().y] = { val : 0, active : false };
			//console.info('ok to move!')
			var newLocation = this._location.TransformLocation(actionTile.getMapLocation(),direction);

			//console.info('new location');
			//console.info(newLocation);
			this.gameBoard[newLocation.x][newLocation.y] = { val : actionTile.getValue(), active : true };
			actionTile.setMapLocation(newLocation);
			//this.PrintGameBoardtoConsole();
			this.Update();
			
			if(this.debugFlags & Game.debugMovement)
				console.info('[MOVEMENT] Action Tile:' + actionTile.toString());

		} 

		
		//if tile has reached another tile (or bottom) - freeze and create a new one
		if(this.LookAhead(actionTile.getMapLocation())){
			if(this.Reactive(actionTile)){ //A reaction has been detected - start cleaning up tiles
				this.StartBoardTransition();
			} else {
				this.gameBoard[actionTile.getMapLocation().x][actionTile.getMapLocation().y].active = false;
				this.CreateActionPiece(startingPiecePositionX,startingPiecePositionY);
				this.Update();
			}
			
		}
		
	},
	ValidateMove : function(currentLocation,direction){
		var newLocation = this._location.TransformLocation(currentLocation,direction);

		if(!(this.LegalRealm(newLocation)) ||
			this.gameBoard[newLocation.x][newLocation.y].val > 0
			) {
			return false;
		}

		return true;

	},
	LegalRealm : function(coords){
		return (coords.x < this.defaultSettings.columns &&
				coords.x >= 0 &&
				coords.y < this.defaultSettings.gameRows &&
				coords.y >= 0);
	},
	LookAhead : function(currentLocation){
		var LookAheadLocation = this._location.TransformLocation(currentLocation,this._location.MoveDirection.DOWN);
		//console.info(LookAheadLocation);
		//console.info(this.LegalRealm(LookAheadLocation));
		if(!this.LegalRealm(LookAheadLocation) || this.gameBoard[LookAheadLocation.x][LookAheadLocation.y].val > 0)
			return true;

		return false;
	},
	Reactive : function(_gameTile){
		
		//console.info(_gameTile.toString());
		//console.clear();
		//console.info(_gameTile.currentLocation);
		var searchVectors = Array(this._location.MoveDirection.LEFT,this._location.MoveDirection.DOWN,this._location.MoveDirection.RIGHT);
		//var actionValue = this.gameBoard[_gameTile.getMapLocation().y][_gameTile.getMapLocation().x].val;
		
		//console.info('actionValue ' + actionValue);
		//console.info('game actionValue ' + _gameTile.getValue());

		//console.info('this location:');
		//console.info(currentLocation);
		//console.info('current val: ' + this.defaultSettings.currencyValues[this.gameBoard[currentLocation.y][currentLocation.x].val]);
		//this.actionBehavior = new Behavior(this.defaultSettings.currencyValues[actionValue],_gameTile);
		this.actionBehavior = new Behavior(_gameTile);
		
		for(var i = 0; i < searchVectors.length; i++){

			//Skip looking LEFT if tile is on left most column
			if((_gameTile.getMapLocation().x == 0) && 
				searchVectors[i] == this._location.MoveDirection.LEFT)
				i++;

			//Skip looking DOWN if tile is on bottom row
			if((this.defaultSettings.gameRows-1 == _gameTile.getMapLocation().y) && 
				searchVectors[i] == this._location.MoveDirection.DOWN)
				i++;
			
			//Skip looking RIGHT if tile is on right most column
			if((_gameTile.getMapLocation().x == this.defaultSettings.columns - 1) && 
				searchVectors[i] == this._location.MoveDirection.RIGHT)
				break;

			if(this.debugFlags & Game.debugBehavior)
				console.info('[BEHAVIOR] Checking:' + this.MoveDescription[searchVectors[i]]);

			var nextLocation = this._location.TransformLocation(_gameTile.getMapLocation(),searchVectors[i]);
			var nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
			//var nextLocationCurrencyVal = this.defaultSettings.currencyValues[nextLocationVal];
			var nextLocationPosition = this._location.FindPhysicalLocation(nextLocation);
			var nextTileParams = { xPos : nextLocationPosition.x,
									yPos : nextLocationPosition.y,
									mapX : nextLocation.x,
									mapY : nextLocation.y,
									val : nextLocationVal
									//curVal : nextLocationCurrencyVal
								};
								
								
			while(this.LegalRealm(nextLocation) &&  //next tile is in legal space
					nextLocationVal > 0 &&  //next tile isn't air
					this.actionBehavior.hasReaction(new GameTile(nextTileParams)) && //next tile has reaction
					this.actionBehavior.getAnimationStart() != true) //that next tile didn't start an instant reaction
				{
				
				nextLocation = this._location.TransformLocation(nextLocation,searchVectors[i]);
				
				if(this.LegalRealm(nextLocation)) {
					nextLocationVal = this.gameBoard[nextLocation.x][nextLocation.y].val;
					nextLocationCurrencyVal = GameTile.prototype.currencyValues[nextLocationVal];
					nextLocationPosition = this._location.FindPhysicalLocation(nextLocation);
					nextLocationCurrencyVal = GameTile.prototype.currencyValues[nextLocationVal];

					nextTileParams = { x : nextLocationPosition.x,
									y : nextLocationPosition.y,
									mapX : nextLocation.x,
									mapY : nextLocation.y,
									curVal : nextLocationCurrencyVal
								};
				}
				
			}
		}

		if(_gameTile.getQuad()){ //check if this is in a box configuration (e.g. 4 quarters)
			//return this.actionBehavior.runBoxCheck()
			this.actionBehavior.runBoxCheck(_gameTile);
		}

		return this.actionBehavior.getAnimationStart();
	},
	StartBoardTransition : function(){
		if(this.debugFlags & Game.debugTransition)
				console.info('[TRANSITION] Starting Transition');

		var tileGroup = this.actionBehavior.getChain();
		//console.info(tileGroup[0]);
		//console.info(tileGroup[0].getMapLocation());
		
		//lock keys
		this.keysLocked = true;
		//this.PrintGameBoardtoConsole();
		//console.info(tileGroup.length);
		if(this.debugFlags & Game.debugTransition) {
			for(var i = 0; i < tileGroup.length; i++){
				console.info('[TRANSITION] tile ' + i + ' : ' + tileGroup[i].toString());
			}
		}
		
		//console.info(tileGroup.length);
		for(i = tileGroup.length - 1; i >= 0; i--){
			//console.info('zeroing out tiles index: x ' + tileGroup[i].getMapLocation().x + ' y ' + tileGroup[i].getMapLocation().y);
			this.gameBoard[tileGroup[i].getMapLocation().x][tileGroup[i].getMapLocation().y] = { val : 0, active : false }; //for now just make them disappear - we'll add fancy animation later
		}

		//this.PrintGameBoardtoConsole();
		//console.info(tileGroup[0].getMapLocation().y);
		
		//console.info(tileGroup[0].getMapLocation().x);
		//this.gameBoard[tileGroup[tileGroup.length-1].getMapLocation().x][tileGroup[tileGroup.length-1].getMapLocation().y] = { val : this.actionBehavior.getUpgradedValue(), active : false };
		//console.info('setting tile index: x ' + tileGroup[0].getMapLocation().x + ' y ' + tileGroup[0].getMapLocation().y + ' to ' + this.actionBehavior.getUpgradedValue());
		
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
		//this.PrintGameBoardtoConsole();
		//this.PrintGameBoardtoConsole('clear');
		//now check for any suspended tiles - right now just deal with the action (this may be all we need)
		//console.info('lookAhead' + this.LookAhead(actionTile.getMapLocation()));
		//if(!this.LookAhead(actionTile.getMapLocation())){
		this.chainMemberIndex = tileGroup.length;
		
		document.observe('WD::tileFinished',this.RunChainAnimation.bind(this));
		document.observe('WD::animationFinished',this.animationFinished.bind(this));

		if(this.showTransition){
			this.RunChainAnimation();
		} else {
			this.animationFinished();
			//console.clear();
		}
			
		//}
				
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
			console.info('ready for freddy');
			if(tileGroup[0].getMapLocation().y < (this.defaultSettings.gameRows - 1)){ //move this only if tile is in the air (gravity move)
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
		//this.PrintGameBoardtoConsole();
		//console.info('animation finished!');
	},
	/* */
	// Debugging and Testing Functions 
	GenerateTestGrid : function(){

		var x = 0;
		var y = 0;
		var testGrid = 'rgb(234,234,234)';
		var testColor = 'rgb(128,128,128)';
		for(var i = 0; i < (this.defaultSettings.gameRows); i++){
			for(var j = 0;j < this.defaultSettings.columns; j++){
				_canvasContext.strokeStyle = testGrid;
				_canvasContext.lineWidth = 1;
				_canvasContext.strokeRect(x,y,this.defaultSettings.tileWidth,this.defaultSettings.tileHeight);

				//draw coords
				_canvasContext.fillStyle = testColor;
				_canvasContext.font = "bold 10px sans-serif";
				_canvasContext.textBaseline = 'top';
				_canvasContext.fillText(j + "," + i, x + 3,y + 3);


				x += this.defaultSettings.tileWidth;

			}
			y += this.defaultSettings.tileHeight
			x = 0;
		}
		
	},
	scanForSpaces : function(){
		var tileAbove = {};
		//start with bottom row and move up
		for(var row = this.defaultSettings.gameRows - 1; row > -1; row--){
			totalAcross = 0;
			for(var col = 0; col < this.defaultSettings.columns; col++){
				var _gameTile = this.gameBoard[col][row];
				totalAcross += _gameTile.val;

				if(_gameTile.val===0) { //lookup
					tileAbove = this._location.TransformLocation({ x : col, y : row },this._location.MoveDirection.UP)
					
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
	},
	PrintGameBoardtoDebugWindow : function(){
		var HTMLout = '';
		for(var row = 0; row < this.defaultSettings.gameRows; row++){
			HTMLout += '<tr>';
			for(var col = 0;col < this.defaultSettings.columns; col++){
				var displayVal = (this.gameBoard[col][row].val === 0) ? '-' : GameTile.prototype.currencyValues[this.gameBoard[col][row].val];
				HTMLout += '<td>' + displayVal + '</td>';
			}
			HTMLout += '</tr>\n';
			//console.info(row);
			jQuery('.debugWindow').html("<table class='gameMap'>" + HTMLout + "</table>");
		}	

	}/**/
});

Game.debugBehavior = 0x1;
Game.debugMovement = 0x2;
Game.debugScore = 0x4;
Game.debugTransition = 0x8;